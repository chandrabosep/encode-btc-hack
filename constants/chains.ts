import { defineChain } from "thirdweb";

export const rootstackTestnetChain = defineChain({
  id: 31,
  testnet: true,
  name: "Rootstock Testnet",
  nativeCurrency: {
    name: "Testnet Smart Bitcoin",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://public-node.testnet.rsk.co"] },
  },
  blockExplorers: {
    default: {
      name: "Rootstock explorer",
      url: "https://explorer.testnet.rootstock.io/",
    },
  },
});
