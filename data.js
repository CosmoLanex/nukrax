// ═══════════════════════════════════════════════
// nukrax.cr — Shared Crypto Data & Utilities
// ═══════════════════════════════════════════════

const CRYPTO_DATA = {
  XRP: {
    name: "XRP",
    ticker: "XRP",
    icon: "✕",
    iconSvg: `<path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.07-24l-4.574 4.523a3.556 3.556 0 01-4.996 0L8.93 8H6.035l6.02 5.957a5.621 5.621 0 007.89 0L25.961 8h-2.89zM8.895 24.563L13.504 20a3.556 3.556 0 014.996 0l4.605 4.563H26l-6.055-5.993a5.621 5.621 0 00-7.89 0L6 24.562h2.895z" fill="currentColor"/>`,
    color: "#346AA9",
    networks: [
      { name: "XRP Ledger", badge: "XRP Ledger", tag: "best", warnings: [] },
      { name: "XRP (XRP)", badge: "XRP", tag: "suggested", warnings: [] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] },
      { name: "XRP Ledger + MEMO", badge: "XRP Ledger", tag: "", warnings: ["Both a MEMO and an Address are required to successfully deposit.", "MEMO is required — without it, you will lose your coins."] },
      { name: "BNB Smart Chain (BEP20) #2", badge: "BEP20", tag: "", warnings: [] },
      { name: "Ethereum (ERC20) — Wrapped XRP", badge: "ERC20", tag: "", warnings: ["You are depositing Wrapped XRP (WXRP). Ensure the token contract address ends with 2e 1b9."] }
    ]
  },
  SOL: {
    name: "Solana",
    ticker: "SOL",
    icon: "◎",
    iconSvg: `<path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm8.706 19.517H10.34a.59.59 0 00-.415.17l-2.838 2.815a.291.291 0 00.207.498H21.66a.59.59 0 00.415-.17l2.838-2.816a.291.291 0 00-.207-.497zm-3.046-5.292H7.294l-.068.007a.291.291 0 00-.14.49l2.84 2.816.07.06c.1.07.22.11.344.11h14.366l.068-.007a.291.291 0 00.14-.49l-2.84-2.816-.07-.06a.59.59 0 00-.344-.11zM24.706 9H10.34a.59.59 0 00-.415.17l-2.838 2.816a.291.291 0 00.207.497H21.66a.59.59 0 00.415-.17l2.838-2.815A.291.291 0 0024.706 9z" fill="currentColor" fill-rule="evenodd"/>`,
    color: "#9945FF",
    networks: [
      { name: "Solana (SOL)", badge: "SOL", tag: "best", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Solana (SOL) #2", badge: "SOL", tag: "suggested", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "SOL Solana", badge: "Solana", tag: "", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] }
    ]
  },
  USDT: {
    name: "USDT",
    ticker: "USDT",
    icon: "₮",
    iconSvg: `<path fill="currentColor" fill-rule="evenodd" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm1.922-18.207v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117zm0 3.59v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657z"/>`,
    color: "#26A17B",
    networks: [
      { name: "TRC20 (Tron)", badge: "TRC20", tag: "suggested", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "suggested", warnings: [] },
      { name: "SOL — Solana", badge: "SOL", tag: "suggested", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Polygon POS", badge: "MATIC", tag: "", warnings: ["Ensure the USDT coin you deposit ends with contract address '58e8f'."] },
      { name: "APT Aptos", badge: "APTOS", tag: "", warnings: ["Ensure the USDT coin you deposit via APTOS ends with contract address '9dc2b'."] },
      { name: "Bridged Tether (BASE)", badge: "BASE", tag: "", warnings: [] },
      { name: "TRC20 (Tron) #2", badge: "TRC20", tag: "suggested", warnings: [] },
      { name: "BSC — BEP20 #2", badge: "BEP20", tag: "", warnings: [] },
      { name: "SOL — Solana #2", badge: "SOL", tag: "suggested", warnings: ["SOL addresses are case sensitive — verify carefully before sending."] },
      { name: "Polygon POS #2", badge: "MATIC", tag: "", warnings: ["Ensure the USDT coin you deposit ends with contract address '58e8f'."] },
      { name: "APT Aptos #2", badge: "APTOS", tag: "", warnings: ["Ensure the USDT coin you deposit via APTOS ends with contract address '9dc2b'."] },
      { name: "Plasma", badge: "PLASMA", tag: "", warnings: [] }
    ]
  },
  USDC: {
    name: "USDC",
    ticker: "USDC",
    icon: "◈",
    iconSvg: `<path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm3.352 5.56c-.244-.12-.488 0-.548.243-.061.061-.061.122-.061.243v.85l.01.104a.86.86 0 00.355.503c4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85l.005.088a.45.45 0 00.36.397c.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162zm-6.46-.06c-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85l-.01-.08c-.042-.169-.199-.362-.355-.466-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85l-.005-.088a.45.45 0 00-.36-.397zm3.535 3.156h-.915l-.088.008c-.2.04-.346.212-.4.478v1.396l-.207.032c-1.708.304-2.778 1.483-2.778 2.942 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036l-.079.007a.413.413 0 00-.347.418v.06l.033.18c.29 1.424 1.266 2.443 3.197 2.734v1.457l.008.088c.04.198.213.344.48.397h.914l.088-.008c.2-.04.346-.212.4-.477V21.34l.207-.04c1.713-.362 2.84-1.601 2.84-3.177 0-2.124-1.28-2.852-3.84-3.156-1.829-.243-2.194-.728-2.194-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975l.079-.006a.413.413 0 00.348-.419v-.06l-.037-.173a3.04 3.04 0 00-2.706-2.316V9.142l-.008-.088c-.04-.199-.213-.345-.48-.398z" fill="currentColor" fill-rule="evenodd"/>`,
    color: "#2775CA",
    networks: [
      { name: "Solana (SPL) — USD Coin", badge: "SOL", tag: "suggested", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] },
      { name: "BASE", badge: "BASE", tag: "", warnings: [] },
      { name: "Polygon", badge: "MATIC", tag: "", warnings: [] }
    ]
  },
  BTC: {
    name: "Bitcoin",
    ticker: "BTC",
    icon: "₿",
    iconSvg: `<path fill="currentColor" fill-rule="evenodd" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>`,
    color: "#F7931A",
    networks: [
      { name: "BTC Bitcoin", badge: "BTC", tag: "suggested", warnings: [] },
      { name: "Bitcoin (BTC)", badge: "BTC", tag: "suggested", warnings: [] },
      { name: "Bitcoin (BTC) — Legacy", badge: "BTC", tag: "", warnings: ["Supports deposits from BTC addresses starting with '1', '3', 'bc1p' and 'bc1q'."] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] },
      { name: "Ethereum (ERC20) — Wrapped BTC", badge: "ERC20", tag: "", warnings: ["You are depositing Binance Wrapped BTC (BBTC). Ensure the token contract address ends with 22541."] },
      { name: "BTC SegWit (SEGWITBTC)", badge: "SegWit", tag: "", warnings: ["Supports deposits from BTC addresses starting with '1', '3', 'bc1p' and 'bc1q'."] }
    ]
  },
  ETH: {
    name: "Ethereum",
    ticker: "ETH",
    icon: "Ξ",
    iconSvg: `<g fill="currentColor" fill-rule="evenodd"><path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z"/><g fill-rule="nonzero"><path fill-opacity=".5" d="M16.498 4v8.87l7.497 3.35z"/><path opacity=".8" d="M16.498 4L9 16.22l7.498-3.35z"/><path fill-opacity=".5" d="M16.498 21.968v6.027L24 17.616z"/><path opacity=".796" d="M16.498 27.995v-6.028L9 17.616z"/><path fill-opacity=".5" d="M9 16.22l7.498 4.353v-7.701z"/></g></g>`,
    color: "#627EEA",
    networks: [
      { name: "Ethereum (ETH)", badge: "ETH", tag: "suggested", warnings: [] },
      { name: "Ethereum (ETH) #2", badge: "ETH", tag: "suggested", warnings: [] },
      { name: "Ethereum (ERC20)", badge: "ERC20", tag: "", warnings: ["Do not send validator rewards to this deposit address — funds may be lost."] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] },
      { name: "BASE", badge: "BASE", tag: "", warnings: [] },
      { name: "Arbitrum One", badge: "ARB", tag: "", warnings: [] },
      { name: "Optimism", badge: "OP", tag: "", warnings: [] },
      { name: "zkSync Era", badge: "zkSync", tag: "", warnings: ["zkSync Era is an L2 network. After crediting, the L1 transaction needs ~24 hours to confirm."] },
      { name: "Scroll", badge: "SCROLL", tag: "", warnings: ["Scroll is an L2 network. After crediting, the L1 transaction needs ~1–2 hours to confirm."] },
      { name: "Manta Network", badge: "MANTA", tag: "", warnings: [] },
      { name: "Starknet", badge: "STARK", tag: "", warnings: [] }
    ]
  },
  MATIC: {
    name: "Polygon",
    ticker: "POL",
    icon: "⬡",
    iconSvg: `<path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm-5.13 7.662l-4.243 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409c-.37-.215-.85-.215-1.255 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0z" fill="currentColor" fill-rule="evenodd"/>`,
    color: "#8247E5",
    networks: [
      { name: "Polygon (POL)", badge: "POL", tag: "suggested", warnings: [] },
      { name: "Polygon (POL) #2", badge: "POL", tag: "", warnings: [] }
    ]
  },
  BNB: {
    name: "BNB",
    ticker: "BNB",
    icon: "◆",
    iconSvg: `<path fill="currentColor" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.884-17.596L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26 2.26L10.52 16l-2.26-2.26L6 16zm6.116 1.596l-2.263 2.257.003.003L16 26l6.146-6.146v-.001l-2.26-2.26L16 21.48l-3.884-3.884zM21.48 16l2.26 2.26L26 16l-2.26-2.26L21.48 16zm-3.188-.002h.001L16 13.706 14.305 15.4l-.195.195-.401.402-.004.003.004.003 2.29 2.291 2.294-2.293.001-.001-.002-.001z"/>`,
    color: "#F3BA2F",
    networks: [
      { name: "BNB Smart Chain (BNB)", badge: "BNB", tag: "suggested", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] },
      { name: "opBNB", badge: "opBNB", tag: "", warnings: [] }
    ]
  },
  TRX: {
    name: "Tron",
    ticker: "TRX",
    icon: "◇",
    iconSvg: `<path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zM7.5 7.257l7.595 19.112 10.583-12.894-3.746-3.562L7.5 7.257zm16.252 6.977l-7.67 9.344.983-8.133 6.687-1.21zM9.472 9.488l6.633 5.502-1.038 8.58L9.472 9.487zM21.7 11.083l2.208 2.099-6.038 1.093 3.83-3.192zM10.194 8.778l10.402 1.914-4.038 3.364-6.364-5.278z" fill="currentColor" fill-rule="evenodd"/>`,
    color: "#EB0029",
    networks: [
      { name: "Tron (TRC20) / TRX", badge: "TRC20", tag: "suggested", warnings: [] },
      { name: "Tron (TRC20) #2", badge: "TRC20", tag: "", warnings: [] },
      { name: "BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] }
    ]
  },
  TWT: {
    name: "TWT",
    ticker: "TWT",
    icon: "⬡",
    iconSvg: `<path fill="currentColor" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16z"/><path fill="currentColor" fill-opacity=".55" d="M16 7.2l6.4 2.55v4.62c0 5.1-2.98 9.86-6.4 11.43-3.42-1.57-6.4-6.33-6.4-11.43V9.75L16 7.2z"/>`,
    color: "#3375BB",
    networks: [
      { name: "Trust Wallet (BEP20)", badge: "BEP20", tag: "", warnings: [] }
    ]
  },
  ADA: {
    name: "Cardano",
    ticker: "ADA",
    icon: "₳",
    iconSvg: `<path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-.275-25.94c-.39.152-.49.707-.186.988.287.293.847.19.995-.193.255-.471-.33-1.042-.81-.796zm-5.155.546c-.405.106-.45.734-.057.884.297.16.718-.089.687-.427.03-.313-.339-.575-.63-.457zm10.558.893c.31.078.54-.17.612-.44-.05-.317-.362-.622-.701-.46-.438.142-.366.846.089.9zm-9.385 1.265c-.456.23-.519.914-.105 1.212.428.38 1.186.054 1.211-.507.075-.557-.62-1.008-1.106-.705zm7.43.322c-.271.536.276 1.15.853 1.044.435-.142.736-.659.491-1.076-.247-.536-1.127-.519-1.344.032zm-4.069 1.013c-.026.386.255.702.588.863.218.013.455.054.655-.056.438-.19.654-.762.411-1.178-.13-.3-.46-.428-.763-.488-.458.033-.896.385-.891.859zm-7.666.69c-.388.175-.442.766-.1 1.012.322.262.884.095.976-.316.169-.475-.431-.966-.876-.697zm16.462-.002c-.388.234-.345.858.067 1.04.374.22.913-.102.887-.529.045-.468-.577-.799-.954-.51zm-6.64.851c-.776.232-1.236 1.158-.92 1.898.278.827 1.377 1.211 2.13.758.725-.383.974-1.4.506-2.067-.354-.546-1.094-.81-1.716-.589zm-3.653.073c-.735.323-1.073 1.276-.692 1.978.34.725 1.33 1.023 2.032.63.701-.349 1.004-1.29.612-1.966-.333-.694-1.262-.963-1.952-.642zM9.95 12.94c-.101.514.365 1.036.898.99.484.003.837-.436.867-.885a.978.978 0 00-.87-.857c-.423.03-.842.315-.895.752zm10.802-.656c-.587.272-.63 1.172-.065 1.492.544.384 1.384-.077 1.347-.732.024-.618-.735-1.073-1.282-.76zm-8.63 2.307c-.868.206-1.376 1.256-.958 2.039.365.854 1.626 1.106 2.31.48.534-.427.674-1.236.331-1.818-.314-.578-1.045-.874-1.684-.701zm6.927-.003c-.874.235-1.336 1.325-.877 2.096.38.746 1.447.996 2.136.52.657-.411.868-1.362.426-1.999-.334-.557-1.064-.792-1.685-.617zm-11.04.726c-.53.148-.687.904-.262 1.243.363.362 1.066.18 1.203-.31.223-.539-.389-1.138-.941-.933zm14.969.782c.092.21.203.43.42.538.464.251 1.119-.112 1.084-.647.03-.406-.338-.706-.716-.765a.836.836 0 00-.788.874zM5.294 15.58c-.275.123-.394.49-.194.729.226.343.843.185.86-.226.077-.363-.334-.646-.666-.503zm20.949-.009c-.39.205-.237.912.235.87.336.05.624-.353.467-.647-.093-.269-.468-.386-.702-.223zm-12.317 1.973c-.654.14-1.158.751-1.156 1.409-.023.687.52 1.343 1.212 1.453.895.206 1.82-.587 1.763-1.482-.005-.886-.945-1.603-1.82-1.38zm3.462-.001c-.526.128-.972.555-1.088 1.08-.23.787.378 1.678 1.203 1.783.876.174 1.773-.593 1.726-1.471.014-.906-.954-1.636-1.84-1.392zm-6.676.545c-.663.066-1.013.943-.545 1.422.4.5 1.304.334 1.486-.278.249-.573-.327-1.247-.94-1.144zm10.154.027c-.661.207-.772 1.2-.165 1.536.535.376 1.365-.068 1.343-.711.042-.585-.63-1.05-1.178-.825zm2.838 2.8c.145.398.75.493 1.017.16.197-.179.148-.457.119-.69-.141-.144-.296-.315-.517-.311-.444-.073-.833.448-.619.841zm-16.268-.732c-.395.198-.409.817-.027 1.034.356.24.896-.001.945-.423.094-.477-.503-.882-.918-.61zm8.193.883c-.654.207-.752 1.193-.163 1.528.531.39 1.387-.06 1.346-.71.052-.588-.64-1.053-1.183-.818zm-3.794.871c-.326.12-.459.474-.465.791.112.291.338.598.685.605.42.062.834-.294.82-.712.042-.51-.578-.923-1.04-.684zm7.686.008c-.464.233-.516.937-.088 1.23.443.374 1.207.01 1.195-.56.045-.544-.631-.96-1.107-.67zm1.337 3.25c.217.366.85.236.891-.19.058-.316-.234-.52-.51-.575-.344.072-.593.451-.381.766zm-10.611-.273c.03.359.428.67.77.443.381-.2.252-.845-.183-.875-.299-.065-.503.183-.587.432zm5.12.287c-.153.373.213.824.618.777.218.005.387-.148.518-.3.025-.103.051-.207.08-.31-.054-.198-.116-.43-.328-.52-.32-.196-.805-.016-.889.353z" fill="currentColor"/>`,
    color: "#0033AD",
    networks: [
      { name: "Cardano (ADA)", badge: "ADA", tag: "suggested", warnings: [] },
      { name: "Cardano (ADA) #2", badge: "ADA", tag: "", warnings: [] },
      { name: "BSC — BNB Smart Chain (BEP20)", badge: "BEP20", tag: "", warnings: [] }
    ]
  }
};

// ═══════════════════════════════════════════════
// Merge deposit addresses from assets/address.js
// (that file must be loaded BEFORE this one)
// ═══════════════════════════════════════════════
if (typeof DEPOSIT_ADDRESSES !== 'undefined') {
  Object.keys(CRYPTO_DATA).forEach(coin => {
    const addrMap = DEPOSIT_ADDRESSES[coin] || {};
    CRYPTO_DATA[coin].networks.forEach(net => {
      const entry = addrMap[net.name];
      if (entry) {
        net.address = entry.address;
        if (entry.memo) net.memo = entry.memo;
      } else {
        console.warn('[nukrax.cr] No address found in assets/address.js for', coin, '→', net.name);
      }
    });
  });
} else {
  console.error('[nukrax.cr] assets/address.js was not loaded — deposit addresses are missing.');
}

// ── Audio ──
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf; src.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    src.start(); src.stop(ctx.currentTime + 0.06);
  } catch(e) {}
}

function playCopy() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.07 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.18);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.2);
    });
  } catch(e) {}
}

// ── URL params ──
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
