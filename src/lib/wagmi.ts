import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  polygon,
  polygonAmoy,
  base,
  baseSepolia,
  localhost,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "DpappFans Web3",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [
    polygon,
    polygonAmoy,
    base,
    baseSepolia,
    ...(process.env.NODE_ENV === "development" ? [localhost] : []),
  ],
  ssr: true,
});
