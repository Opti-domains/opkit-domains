import { config as dotenv } from "dotenv"
dotenv()

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

const accounts = [
  process.env.PRIVATE_KEY!
]

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "shanghai",
    },
  },
  networks: {
    opkit: {
      url: 'https://rpc-opkit-domains-jlpe79dzdp.t.conduit.xyz',
      accounts,
    }
  },
  namedAccounts: {
    deployer: 0,
  },
};

export default config;
