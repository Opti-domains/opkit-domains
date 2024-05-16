import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import App from "./App.tsx";

import "@rainbow-me/rainbowkit/styles.css";

import "./index.css";
import "./preflight.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";

import { WalletProvider as SuiWalletProvider } from "@suiet/wallet-kit";

import { ConfigProvider, theme } from "antd";
import { base, baseGoerli, optimism, optimismGoerli } from "viem/chains";
import { publicProvider } from "wagmi/providers/public";
import { AntdAlertProvider } from "./components/providers/antd-alert.tsx";
import { AptosProvider } from "./components/providers/aptos-adapter.tsx";
import PrimaryDomainProvider from "./components/providers/primary-domain.tsx";
import { SiweAuthProvider } from "./components/providers/siwe-adapter.tsx";
import SocialOracleCallback from "./social-oracle-callback.tsx";
// import { SolanaProvider } from "./components/providers/solana-adapter.tsx";

import "./polyfills.ts";

import * as Sentry from "@sentry/react";
import ClaimDomain from "./pages/claim-domain.tsx";
import ExplorerPage from "./pages/explorer.tsx";
import { defineChain } from "viem";

const modeTestnet = {
  id: 919,
  name: "Mode Testnet",
  network: "mode-testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.mode.network"],
    },
    public: {
      http: ["https://sepolia.mode.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia.explorer.mode.network/",
    },
  },
  contracts: {
    // multicall3: {
    //   address: "0xca11bde05977b3631167028862be2a173976ca11",
    //   blockCreated: 49461,
    // },
  },
  testnet: true,
};

const opkit = defineChain(
  {
    id: 5057,
    name: 'OPKit Conduit',
    network: 'opkit',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://rpc-opkit-domains-jlpe79dzdp.t.conduit.xyz'],
      },
      public: {
        http: ['https://rpc-opkit-domains-jlpe79dzdp.t.conduit.xyz'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://explorerl2new-opkit-domains-jlpe79dzdp.t.conduit.xyz',
      },
    },
  },
)

const chain_configs = [opkit]

const { chains, publicClient } = configureChains(chain_configs as any, [
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: ".town by Opti.Domains",
  projectId: "dd2a5d8744a5d72247899ef644bf8e1e",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/explorer",
    element: <ExplorerPage />,
  },
  {
    path: "/social-oracle-callback",
    element: <SocialOracleCallback />,
  },
  {
    path: "/claim",
    element: <ClaimDomain />,
  },
]);

Sentry.init({
  dsn: "https://242d0e9ee40b9cd9d1a3943b9664c7eb@o4505696313802752.ingest.sentry.io/4505696315441152",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost",
        "127.0.0.1",
        /^https:\/\/social-oracle(.*)\.opti\.domains/,
      ],
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <WagmiConfig config={wagmiConfig}>
        <SiweAuthProvider>
          <RainbowKitProvider chains={chains}>
            <AptosProvider>
              <SuiWalletProvider autoConnect={false}>
                {/* <SolanaProvider> */}
                <AntdAlertProvider>
                  <PrimaryDomainProvider>
                    <div id="app">
                      <RouterProvider router={router} />
                    </div>
                  </PrimaryDomainProvider>
                </AntdAlertProvider>
                {/* </SolanaProvider> */}
              </SuiWalletProvider>
            </AptosProvider>
          </RainbowKitProvider>
        </SiweAuthProvider>
      </WagmiConfig>
    </ConfigProvider>
  </React.StrictMode>
);
