// Social icons
import discordIcon from "src/assets/social-button/discord.png";
import facebookIcon from "src/assets/social-button/facebook.png";
import freedomWalletIcon from "src/assets/social-button/freedom-padding.png";
import githubIcon from "src/assets/social-button/github.png";
import googleIcon from "src/assets/social-button/google.png";
import lineIcon from "src/assets/social-button/line.png";
import linkedInIcon from "src/assets/social-button/linkedin.png";
import microsoftIcon from "src/assets/social-button/microsoft.png";
import telegramIcon from "src/assets/social-button/telegram.png";
import twitterIcon from "src/assets/social-button/twitter.png";

// Wallet icons
import evmIcon from "src/assets/social-button/eth.png";
import solanaIcon from "src/assets/social-button/solana.png";
import aptosIcon from "/images/celestia.svg";
import suiIcon from "/images/opkit.svg";

// Components
import AptosButton from "src/components/action-buttons/wallets/AptosButton";
import CustomWalletButton from "src/components/action-buttons/wallets/CustomWalletButton";
import FreedomWalletButton from "src/components/action-buttons/wallets/FreedomWalletButton";
import SuiButton from "src/components/action-buttons/wallets/SuiButton";

export interface SocialConfig {
  name: string;
  color: string;
  background: string;
  icon: string;
}

export interface WalletConfig extends SocialConfig {
  Component: React.ComponentType<any>;
}

const SOCIAL_ORACLE_CONFIG: { [provider: string]: SocialConfig } = {
  "com.discord": {
    name: "Discord",
    color: "white",
    background: "#5B68F4",
    icon: discordIcon,
  },
  "com.facebook": {
    name: "Facebook",
    color: "white",
    background: "#1679F1",
    icon: facebookIcon,
  },
  "com.github": {
    name: "Github",
    color: "white",
    background: "#161B22",
    icon: githubIcon,
  },
  "com.google": {
    name: "Google",
    color: "black",
    background: "white",
    icon: googleIcon,
  },
  "me.line": {
    name: "Line",
    color: "white",
    background: "#22BA4F",
    icon: lineIcon,
  },
  "com.linkedin": {
    name: "LinkedIn",
    color: "white",
    background: "#0C64C5",
    icon: linkedInIcon,
  },
  "com.microsoft": {
    name: "Microsoft",
    color: "black",
    background: "white",
    icon: microsoftIcon,
  },
  "com.twitter": {
    name: "Twitter",
    color: "white",
    background: "#3198D5",
    icon: twitterIcon,
  },
  "org.telegram": {
    name: "Telegram",
    color: "white",
    background: "#229ED9",
    icon: telegramIcon,
  },
};

const WALLET_ORACLE_CONFIG: { [coinType: string]: WalletConfig } = {
  "60": {
    name: "EVM",
    color: "white",
    background: "black",
    icon: evmIcon,
    Component: CustomWalletButton,
  },
  "637": {
    name: "Aptos",
    color: "white",
    background: "black",
    icon: aptosIcon,
    Component: AptosButton,
  },
  "784": {
    name: "Sui",
    color: "white",
    background: "#0073e6",
    icon: suiIcon,
    Component: SuiButton,
  },
  "501": {
    name: "Solana",
    color: "white",
    background: "black",
    icon: solanaIcon,
    Component: CustomWalletButton,
  },
  "freedom.temporary.wallet.op": {
    name: "Freedom Wallet",
    color: "white",
    background: "black",
    icon: freedomWalletIcon,
    Component: FreedomWalletButton,
  },
};

export async function getSocialConfig(provider: string) {
  return SOCIAL_ORACLE_CONFIG[provider];
}

export async function getWalletConfig(coinType: string) {
  return WALLET_ORACLE_CONFIG[coinType];
}
