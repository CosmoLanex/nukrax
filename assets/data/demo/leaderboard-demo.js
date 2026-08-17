// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/demo/leaderboard-demo.js
// CLEARLY LABELLED PLACEHOLDER DATA — every entry has `isDemo: true` and
// the leaderboard UI tags each one visibly as "Demo". This exists purely
// so the Top 28 leaderboard has something to show during development
// before enough real users have points/rank data. leaderboard.html always
// queries real Supabase profiles FIRST — demo rows only fill in whatever
// slots real data doesn't cover, and disappear on their own as real users
// climb the board. Nothing here is presented as real.
// ═══════════════════════════════════════════════════════════════════════

const DEMO_NAMES = [
  'quantforge', 'nightsession', 'liquidityhunter', 'orderblockop', 'fvg_trader',
  'pipstacker', 'silverbullet_', 'structurebreak', 'goldrunner', 'chochmaster',
  'sweepandgo', 'apexfollower', 'aurumlabs', 'ictdisciple', 'smcscout',
  'riskfirst', 'trendweaver', 'kill_zone', 'candleforge', 'levelreader',
  'volumeprofile', 'sessionopen', 'bosbreaker', 'inducement_', 'premiumzone',
  'discountbuyer', 'daytrade_dev', 'nukraxfan01',
];

export const DEMO_LEADERBOARD = Object.freeze(
  DEMO_NAMES.map((username, i) => {
    const rankNumber = i + 1;
    const tier = rankNumber <= 3 ? 'advanced' : rankNumber <= 10 ? 'pro' : 'free';
    return Object.freeze({
      isDemo: true,
      username,
      display_name: username,
      rank_number: rankNumber,
      level: Math.max(1, 30 - i),
      points: Math.max(50, 3000 - i * 95),
      membership_tier: tier,
      badge_keys: rankNumber === 1 ? ['elite', 'top-ranked'] : rankNumber <= 3 ? ['top-ranked'] : [],
    });
  })
);
