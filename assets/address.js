// ═══════════════════════════════════════════════════════════════
// nukrax.cr — Deposit Addresses
// ═══════════════════════════════════════════════════════════════
//
// Edit YOUR receiving addresses here. This is the ONLY file you
// need to touch to change where deposits are sent.
//
// Structure:
//   DEPOSIT_ADDRESSES.<COIN>["<Network Name>"] = {
//     address: "...",   <- the wallet address shown to the user
//     memo:    "..."    <- optional, only for coins that require a memo/tag
//   }
//
// The "<Network Name>" strings MUST match the network names defined
// in data.js exactly (they are already matched below). If you add a
// new network in data.js, add a matching entry here with the same name.
//
// This file must load BEFORE data.js in every HTML page.
// ═══════════════════════════════════════════════════════════════

const DEPOSIT_ADDRESSES = {

  // ─────────────────────────────────────────────
  // XRP (XRP)
  // ─────────────────────────────────────────────
  XRP: {
    "XRP Ledger": { address: "rU1HVivNon69SYwPkEVJXGt12yQKJtguqJ" },
    "XRP (XRP)": { address: "rNgJhLjpyNbr7g6M2WquSWsiV8LGNC9DtD" },
    "BNB Smart Chain (BEP20)": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" },
    "XRP Ledger + MEMO": { address: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV", memo: "437079162" },
    "BNB Smart Chain (BEP20) #2": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Ethereum (ERC20) — Wrapped XRP": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  },

  // ─────────────────────────────────────────────
  // Solana (SOL)
  // ─────────────────────────────────────────────
  SOL: {
    "Solana (SOL)": { address: "Dp5YavkzJ5Chtq6rFKnim7WR3xXksJVKg5iTKZjZZH7W" },
    "Solana (SOL) #2": { address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE" },
    "SOL Solana": { address: "ANCQ6Dj2mxRpSuAXd1ZADCQpMTnNehxEyToCVBdNfug5" },
    "BSC — BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  },

  // ─────────────────────────────────────────────
  // USDT (Tether) (USDT)
  // ─────────────────────────────────────────────
  USDT: {
    "TRC20 (Tron)": { address: "TJynZUP3AdMDQEzsvpWKsMkSXDBQf2Yrpt" },
    "BSC — BNB Smart Chain (BEP20)": { address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7" },
    "SOL — Solana": { address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE" },
    "Polygon POS": { address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7" },
    "APT Aptos": { address: "0x4926e80c1bdfb8b9068638657fa4d432ae60dfb341853d11415d30f048cfe6c4" },
    "Bridged Tether (BASE)": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" },
    "TRC20 (Tron) #2": { address: "TR3VgpXVS2rDMNwwCeR4DPdre5URfC9cQo" },
    "BSC — BEP20 #2": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "SOL — Solana #2": { address: "ANCQ6Dj2mxRpSuAXd1ZADCQpMTnNehxEyToCVBdNfug5" },
    "Polygon POS #2": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "APT Aptos #2": { address: "0x40d1e5bae378778043641e26d347554f5fa59616c5467b32a8b79a0021d33fa8" },
    "Plasma": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  },

  // ─────────────────────────────────────────────
  // USDC (Circle) (USDC)
  // ─────────────────────────────────────────────
  USDC: {
    "Solana (SPL) — USD Coin": { address: "AY5hcenQD5hL9AAmZeG3Nu9mBg5AsW9djCP1onXCPCCE" },
    "BSC — BNB Smart Chain (BEP20)": { address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7" },
    "BASE": { address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7" },
    "Polygon": { address: "0xc9eec2bda7c0f7d769c7f85b2cbf2ba92baaa5d7" }
  },

  // ─────────────────────────────────────────────
  // Bitcoin (BTC)
  // ─────────────────────────────────────────────
  BTC: {
    "BTC Bitcoin": { address: "bc1qk2t0uvv4j7kfzpn8mvt8uxtt6cq0dnkp4dgeas" },
    "Bitcoin (BTC)": { address: "bc1q7hc2j0vccnalg908n5a3pehtuxrhrnzn3r450f" },
    "Bitcoin (BTC) — Legacy": { address: "1Le79aX5JycCDKrY22hpVKAxukRNMai8AR" },
    "BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Ethereum (ERC20) — Wrapped BTC": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "BTC SegWit (SEGWITBTC)": { address: "bc1qjum56r23mqgvec0c7679d5l0z5gdu33npw7jx7" }
  },

  // ─────────────────────────────────────────────
  // Ethereum (ETH)
  // ─────────────────────────────────────────────
  ETH: {
    "Ethereum (ETH)": { address: "0x0F50eeb9F646f1A67c68e571BDe22C4426edaeB6" },
    "Ethereum (ETH) #2": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" },
    "Ethereum (ERC20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "BASE": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Arbitrum One": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Optimism": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "zkSync Era": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Scroll": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Manta Network": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "Starknet": { address: "0x038549eeb7b53f83bfd92eab567e3577816e6324cbe776a3900abada68c7da3a" }
  },

  // ─────────────────────────────────────────────
  // Polygon (MATIC)
  // ─────────────────────────────────────────────
  MATIC: {
    "Polygon (POL)": { address: "0x0F50eeb9F646f1A67c68e571BDe22C4426edaeB6" },
    "Polygon (POL) #2": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" }
  },

  // ─────────────────────────────────────────────
  // BNB (BNB)
  // ─────────────────────────────────────────────
  BNB: {
    "BNB Smart Chain (BNB)": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" },
    "BSC — BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" },
    "opBNB": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  },

  // ─────────────────────────────────────────────
  // Tron (TRX)
  // ─────────────────────────────────────────────
  TRX: {
    "Tron (TRC20) / TRX": { address: "TJynZUP3AdMDQEzsvpWKsMkSXDBQf2Yrpt" },
    "Tron (TRC20) #2": { address: "TR3VgpXVS2rDMNwwCeR4DPdre5URfC9cQo" },
    "BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  },

  // ─────────────────────────────────────────────
  // Trust Wallet Token (TWT)
  // ─────────────────────────────────────────────
  TWT: {
    "Trust Wallet (BEP20)": { address: "0xc9eeC2BDa7C0F7D769C7f85B2CBF2BA92BaaA5d7" }
  },

  // ─────────────────────────────────────────────
  // Cardano (ADA)
  // ─────────────────────────────────────────────
  ADA: {
    "Cardano (ADA)": { address: "addr1q8cuylnzpprt9x2e76y2aa3d4aug593ylgawp5ha603r2des8qnd60k0zgxs459u2t26m2dk4l6gp6tt57zmu9sv2x3qcyer9f" },
    "Cardano (ADA) #2": { address: "addr1vyfny5p3rjeyzpr4mr29cs7hwyv75w2cu05xevdfgvmezwgvy2e6v" },
    "BSC — BNB Smart Chain (BEP20)": { address: "0x3391cc7250b2b035f38259cb2b49d2ad014d718b" }
  }
};
