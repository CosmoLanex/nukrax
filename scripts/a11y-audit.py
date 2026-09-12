#!/usr/bin/env python3
"""
Read-only WCAG contrast + basic accessibility audit tool for NUKRAX.

Renders pages with a real browser (Playwright/Chromium), walks visible text
elements, computes effective foreground/background colors (walking up the
DOM for the background when an element itself is transparent), and checks
the WCAG 2.1 relative-luminance contrast ratio against the AA thresholds
(4.5:1 normal text, 3:1 large text >=24px or >=18.66px+bold).

This is a practical heuristic, not a certified WCAG compliance tool:
- Elements whose effective background comes from a CSS gradient/image
  (background-image != none) are flagged as "needs manual check" rather
  than measured, since a single flat color can't represent a gradient.
- Elements with zero rendered size, zero opacity, or empty text are skipped.
- Results are deduplicated by (tag, class, color, background) per page+theme
  so a repeated table row only produces one finding.

Usage:
    python3 scripts/a11y-audit.py
Reads PAGES/THEMES/VIEWPORTS below. Prints a findings report to stdout.
Does not modify any files.
"""
import json
import os
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

PORT = 8901
BASE = f"http://127.0.0.1:{PORT}"
ROOT = "/home/claude/work"

PAGES = [
    "index.html",
    "dashboard.html",
    "marketplace.html",
    "settings.html",
    "feedback.html",
    "community.html",
    "tr.html",
    "develop/ea.html",
    "develop/automation.html",
    "docs/introduction.html",
    "docs/accessibility.html",
]

VIEWPORTS = {
    "desktop": {"width": 1556, "height": 1024},
    "mobile": {"width": 390, "height": 844},
}

THEMES = ["dark", "light"]

MOCK_SUPABASE_JS = """
const FAKE_USER = { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com', user_metadata: { username: 'TestUser' } };
const FAKE_SESSION = { user: FAKE_USER, access_token: 'fake' };
function chain() {
  const c = {
    select(){return c}, eq(){return c}, maybeSingle(){return Promise.resolve({data:{settings:{}},error:null})},
    order(){return c}, limit(){return c}, single(){return Promise.resolve({data:null,error:null})},
    update(){ return { eq: async () => ({data:null,error:null}) }; },
    insert(){return Promise.resolve({data:{id:'x'},error:null})},
    delete(){return c},
    then(res){res({data:[],error:null});}
  };
  return c;
}
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: FAKE_SESSION }, error: null }),
      getUser: async () => ({ data: { user: FAKE_USER }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
      signOut: async () => ({ error: null }),
    },
    from(table) { return chain(); },
    channel(){ return { on(){return this}, subscribe(){return this} }; },
    removeChannel(){},
  };
}
"""

EXTRACT_JS = r"""
() => {
  function parseColor(str) {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map(s => parseFloat(s.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  function relLum({r,g,b}) {
    const chan = v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126*chan(r) + 0.7152*chan(g) + 0.0722*chan(b);
  }
  function contrast(c1, c2) {
    const l1 = relLum(c1), l2 = relLum(c2);
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  // Alpha-composite `top` (rgba) over `bottom` (opaque rgb) -> opaque rgb.
  function compositeOver(top, bottom) {
    const a = top.a;
    return {
      r: top.r * a + bottom.r * (1 - a),
      g: top.g * a + bottom.g * (1 - a),
      b: top.b * a + bottom.b * (1 - a),
    };
  }
  // Walk from the element up to <html>, collect every layer with its own
  // background-color/background-image, then composite them outer-to-inner
  // (alpha blending) into one effective opaque color. A gradient layer
  // can't be flattened to one color, so its presence anywhere in the
  // stack marks the whole result as "needs manual check" -- but we still
  // return the best-effort composite up to (and including) that layer so
  // the printed value is informative rather than blank.
  function effectiveBg(el) {
    const layers = [];
    let node = el;
    let depth = 0;
    while (node && depth < 14) {
      const cs = getComputedStyle(node);
      const bgImg = cs.backgroundImage;
      const bg = parseColor(cs.backgroundColor);
      if (bgImg && bgImg !== 'none') {
        layers.push({ gradient: true, css: bgImg });
      } else if (bg && bg.a > 0.001) {
        layers.push({ color: bg });
      }
      node = node.parentElement;
      depth++;
    }
    // layers[] is innermost-first; reverse to composite outer->inner.
    layers.reverse();
    let composite = { r: 255, g: 255, b: 255 }; // fallback canvas: white
    let hasGradient = false;
    for (const layer of layers) {
      if (layer.gradient) { hasGradient = true; continue; }
      composite = compositeOver(layer.color, composite);
    }
    return { color: composite, hasGradient };
  }

  const results = [];
  const seen = new Set();
  const selector = 'p,span,div,h1,h2,h3,h4,h5,h6,a,button,label,td,th,li,strong,em,small,input,textarea,select,summary';
  const nodes = document.querySelectorAll(selector);

  for (const el of nodes) {
    // Only elements whose OWN direct text (not from children) is non-empty,
    // to avoid measuring the same text at every ancestor level.
    let ownText = '';
    for (const child of el.childNodes) {
      if (child.nodeType === 3) ownText += child.textContent;
    }
    const isFormEl = ['INPUT','TEXTAREA'].includes(el.tagName);
    const placeholderText = isFormEl ? (el.getAttribute('placeholder') || '') : '';
    const textToCheck = (ownText.trim() || placeholderText.trim());
    if (!textToCheck) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) < 0.2) continue;

    let fgColorStr = cs.color;
    if (isFormEl && placeholderText && !ownText.trim()) {
      // Approximate: can't read ::placeholder computed style directly in all browsers,
      // but Chromium exposes it via a pseudo-element query.
      fgColorStr = cs.color; // best-effort fallback
    }
    const fg = parseColor(fgColorStr);
    if (!fg) continue;

    const bgResult = effectiveBg(el);
    const fontSize = parseFloat(cs.fontSize);
    const fontWeight = parseInt(cs.fontWeight) || 400;
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
    const threshold = isLarge ? 3.0 : 4.5;

    let ratio = null, bgDesc = null, needsManual = false;
    if (bgResult.hasGradient) {
      needsManual = true;
      bgDesc = `composite-with-gradient≈rgb(${Math.round(bgResult.color.r)},${Math.round(bgResult.color.g)},${Math.round(bgResult.color.b)})`;
      // Still compute a best-effort ratio against the composite so genuinely
      // obvious failures (e.g. near-invisible text) aren't silently dropped;
      // it's reported under MANUAL either way so a human re-checks it.
      ratio = Math.round(contrast(fg, bgResult.color) * 100) / 100;
    } else {
      ratio = Math.round(contrast(fg, bgResult.color) * 100) / 100;
      bgDesc = `rgb(${Math.round(bgResult.color.r)},${Math.round(bgResult.color.g)},${Math.round(bgResult.color.b)})`;
    }

    const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0,2).join('.') : '';
    const dedupKey = `${el.tagName}|${cls}|${fgColorStr}|${bgDesc}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    results.push({
      tag: el.tagName.toLowerCase(),
      cls,
      text: textToCheck.slice(0, 40),
      fg: fgColorStr,
      bg: bgDesc,
      ratio: ratio ? Math.round(ratio * 100) / 100 : null,
      threshold,
      isLarge,
      needsManual,
    });
  }
  return results;
}
"""


def main():
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1)
    all_findings = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for vp_name, vp in VIEWPORTS.items():
                for theme in THEMES:
                    for page_path in PAGES:
                        page = browser.new_page(viewport=vp)
                        page.route("https://esm.sh/**", lambda route: route.fulfill(
                            status=200, content_type="application/javascript", body=MOCK_SUPABASE_JS))
                        for pat in ["**fonts.googleapis.com**", "**fonts.gstatic.com**",
                                    "**cdn.jsdelivr.net**", "**cdnjs.cloudflare.com**",
                                    "**gold-api.com**", "**metals.live**", "**corsproxy.io**"]:
                            page.route(pat, lambda route: route.abort())
                        try:
                            page.goto(f"{BASE}/{page_path}", wait_until="load", timeout=15000)
                            page.evaluate(f"localStorage.setItem('nkx-theme','{theme}')")
                            page.reload(wait_until="load", timeout=15000)
                            page.wait_for_timeout(1200)
                            data = page.evaluate(EXTRACT_JS)
                            key = f"{page_path} | {vp_name} | {theme}"
                            all_findings[key] = data
                        except Exception as e:
                            all_findings[f"{page_path} | {vp_name} | {theme}"] = {"error": str(e)}
                        page.close()
            browser.close()
    finally:
        server.terminate()

    # Print failures only, grouped
    total_checked = 0
    total_fail = 0
    total_manual = 0
    for key, items in all_findings.items():
        if isinstance(items, dict) and "error" in items:
            print(f"ERROR loading {key}: {items['error']}")
            continue
        fails = [i for i in items if not i["needsManual"] and i["ratio"] is not None and i["ratio"] < i["threshold"]]
        manuals = [i for i in items if i["needsManual"]]
        total_checked += len(items)
        total_fail += len(fails)
        total_manual += len(manuals)
        if fails or manuals:
            print(f"\n=== {key} ===")
            for f in fails:
                print(f"  FAIL  <{f['tag']} class=\"{f['cls']}\">  \"{f['text']}\"  fg={f['fg']}  bg={f['bg']}  ratio={f['ratio']}  need>={f['threshold']}  {'(large)' if f['isLarge'] else '(normal)'}")
            for m in manuals:
                print(f"  MANUAL <{m['tag']} class=\"{m['cls']}\">  \"{m['text']}\"  fg={m['fg']}  {m['bg']}  approx_ratio={m['ratio']}  need>={m['threshold']}  (gradient in bg stack, re-check visually)")

    print(f"\n--- SUMMARY: {total_checked} elements checked, {total_fail} measured failures, {total_manual} flagged for manual gradient review ---")


if __name__ == "__main__":
    main()
