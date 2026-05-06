// ─── Deployed Contract Addresses ──────────────────────────────────────────────
// Update these after running: node scripts/deploy.mjs

export const BATCH_SENDER_ADDRESS = "0x2e5e56ed0d14402ed591345d5bea90bb58bee7ca" as `0x${string}`; // TODO: fill after deploy
export const CONTACT_BOOK_ADDRESS  = "0xcdcc2875de2fcbda1b385821fb4779f1ffc7e9a3" as `0x${string}`; // TODO: fill after deploy

// ─── BatchSender ABI ──────────────────────────────────────────────────────────

export const BATCH_SENDER_ABI = [
  {
    name: "batchSendNative",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts",    type: "uint256[]" },
    ],
    outputs: [],
  },
  {
    name: "batchSendNativeEqual",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "recipients",  type: "address[]" },
      { name: "amountEach", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "batchSendERC20",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token",      type: "address"   },
      { name: "recipients", type: "address[]" },
      { name: "amounts",    type: "uint256[]" },
    ],
    outputs: [],
  },
  {
    name: "batchSendERC20Equal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token",       type: "address"   },
      { name: "recipients",  type: "address[]" },
      { name: "amountEach",  type: "uint256"   },
    ],
    outputs: [],
  },
  {
    name: "sumAmounts",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "amounts", type: "uint256[]" }],
    outputs: [{ name: "total", type: "uint256" }],
  },
  {
    name: "MAX_RECIPIENTS",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Events
  {
    name: "BatchNativeSent",
    type: "event",
    inputs: [
      { name: "sender",         type: "address", indexed: true  },
      { name: "recipientCount", type: "uint256", indexed: false },
      { name: "totalAmount",    type: "uint256", indexed: false },
    ],
  },
  {
    name: "BatchERC20Sent",
    type: "event",
    inputs: [
      { name: "sender",         type: "address", indexed: true  },
      { name: "token",          type: "address", indexed: true  },
      { name: "recipientCount", type: "uint256", indexed: false },
      { name: "totalAmount",    type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── ContactBook ABI ──────────────────────────────────────────────────────────

export const CONTACT_BOOK_ABI = [
  {
    name: "addContact",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name",   type: "string"  },
      { name: "wallet", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "updateContact",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "index",  type: "uint256" },
      { name: "name",   type: "string"  },
      { name: "wallet", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "removeContact",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getContacts",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "name",      type: "string"  },
          { name: "wallet",    type: "address" },
          { name: "createdAt", type: "uint40"  },
        ],
      },
    ],
  },
  {
    name: "getContactsOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "name",      type: "string"  },
          { name: "wallet",    type: "address" },
          { name: "createdAt", type: "uint40"  },
        ],
      },
    ],
  },
  {
    name: "contactCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "MAX_CONTACTS",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Events
  {
    name: "ContactAdded",
    type: "event",
    inputs: [
      { name: "owner",  type: "address", indexed: true  },
      { name: "index",  type: "uint256", indexed: true  },
      { name: "name",   type: "string",  indexed: false },
      { name: "wallet", type: "address", indexed: false },
    ],
  },
  {
    name: "ContactUpdated",
    type: "event",
    inputs: [
      { name: "owner",  type: "address", indexed: true  },
      { name: "index",  type: "uint256", indexed: true  },
      { name: "name",   type: "string",  indexed: false },
      { name: "wallet", type: "address", indexed: false },
    ],
  },
  {
    name: "ContactRemoved",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "index", type: "uint256", indexed: true },
    ],
  },
] as const;
