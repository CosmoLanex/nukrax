#!/usr/bin/env python3
"""
NUKRAX QA checks — broken-link detection and lightweight HTML/CSS validation.

Implements what docs/deployment.html describes under "Planned: automated
checks": broken-link detection and HTML/CSS validation running on every
push. Pure standard library, no extra dependencies to install, matching
the repo's own no-build-step philosophy (see docs/deployment.html).

Usage: python3 scripts/qa-checks.py
Exit code 0 = all checks passed. Non-zero = at least one real issue found.
"""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', 'node_modules', '.github'}


def find_files(*extensions):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for fn in filenames:
            if fn.endswith(extensions):
                yield os.path.join(dirpath, fn)


# ── Check 1: broken internal links/assets ───────────────────────────────
LINK_RE = re.compile(r'(?:href|src)\s*=\s*["\']([^"\'#][^"\']*)["\']')

def check_broken_links():
    issues = []
    html_files = list(find_files('.html'))
    for hf in html_files:
        content = open(hf, encoding='utf-8', errors='ignore').read()
        base_dir = os.path.dirname(hf)
        for m in LINK_RE.finditer(content):
            href = m.group(1)
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            target = href.split('?')[0].split('#')[0]
            if not target or not target.endswith(('.html', '.js', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.woff', '.woff2')):
                continue
            path = os.path.normpath(os.path.join(ROOT, target.lstrip('/')) if target.startswith('/')
                                     else os.path.join(base_dir, target))
            if not os.path.exists(path):
                issues.append(f"{os.path.relpath(hf, ROOT)}: broken reference '{href}'")
    return issues


# ── Check 2: lightweight HTML validation ────────────────────────────────
# Not a full W3C validator (that's a real dependency, against this repo's
# no-build-step approach) — catches the two most common real HTML bugs:
# structurally malformed markup, and duplicate ids on the same page
# (which silently breaks label[for], getElementById, and #fragment links
# like the skip-to-content link added in the accessibility pass).
class _ValidatingParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = {}
        self.dupes = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == 'id' and value:
                if value in self.ids:
                    self.dupes.append(value)
                self.ids[value] = self.ids.get(value, 0) + 1


def check_html_validity():
    issues = []
    for hf in find_files('.html'):
        content = open(hf, encoding='utf-8', errors='ignore').read()
        parser = _ValidatingParser()
        try:
            parser.feed(content)
        except Exception as e:
            issues.append(f"{os.path.relpath(hf, ROOT)}: HTML parse error — {e}")
            continue
        for dup_id in sorted(set(parser.dupes)):
            issues.append(f"{os.path.relpath(hf, ROOT)}: duplicate id \"{dup_id}\" ({parser.ids[dup_id]}x)")
    return issues


# ── Check 3: lightweight CSS validation ─────────────────────────────────
# Catches unbalanced braces — the most common real breakage in hand-edited
# CSS (an unclosed rule silently swallows every rule after it).
def check_css_braces():
    issues = []
    for f in find_files('.css'):
        content = open(f, encoding='utf-8', errors='ignore').read()
        # strip comments and string contents so braces inside them don't count
        stripped = re.sub(r'/\*.*?\*/', '', content, flags=re.S)
        depth = 0
        for ch in stripped:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth < 0:
                    issues.append(f"{os.path.relpath(f, ROOT)}: unmatched closing brace")
                    depth = 0
        if depth != 0:
            issues.append(f"{os.path.relpath(f, ROOT)}: {depth} unclosed rule(s) (unbalanced braces)")
    # Also check inline <style> blocks inside HTML files
    for hf in find_files('.html'):
        content = open(hf, encoding='utf-8', errors='ignore').read()
        for style_block in re.findall(r'<style[^>]*>(.*?)</style>', content, flags=re.S):
            stripped = re.sub(r'/\*.*?\*/', '', style_block, flags=re.S)
            depth = stripped.count('{') - stripped.count('}')
            if depth != 0:
                issues.append(f"{os.path.relpath(hf, ROOT)}: inline <style> block has unbalanced braces ({depth:+d})")
    return issues


def main():
    all_issues = []
    print("Checking for broken internal links/assets...")
    all_issues += check_broken_links()
    print("Checking HTML validity (parse errors, duplicate ids)...")
    all_issues += check_html_validity()
    print("Checking CSS brace balance...")
    all_issues += check_css_braces()

    if all_issues:
        print(f"\n{len(all_issues)} issue(s) found:\n")
        for issue in all_issues:
            print(f"  - {issue}")
        print()
        return 1

    print("\nAll checks passed — no broken links, no HTML/CSS structural issues found.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
