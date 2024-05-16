import { StyleProvider } from "@ant-design/cssinjs";
import { addressEllipsis } from "@suiet/wallet-kit";
import { Divider, Input, Modal, message } from "antd";
import axios from "axios";
import { useContext, useState } from "react";
import freedomWalletGuide from "src/assets/guide/freedomwallet.jpg";
import freedomWalletIcon from "src/assets/social-button/freedom.png";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";

export default function FreedomWallet({ variant = "button" }) {
  const { domainName, state, dispatch } = useContext(DomainConnectContext);

  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const walletState = state.find(
    (x: ISocialOracleState) =>
      x.provider == "wallet:freedom.temporary.wallet.op"
  );

  async function handleSignMsg() {
    if (!domainName) {
      message.error("Please connect your twitter first");
      window.alert("Please connect your twitter first");
      return;
    }

    try {
      setSubmitting(true);

      const timestamp = Math.floor(Date.now() / 1000);

      // Generate attestation
      const response = await axios.post(
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
          "/wallet/freedom-wallet/verify",
        {
          domainName,
          walletAddress,
          timestamp,
          signature: "0x",
        },
        {
          withCredentials: true,
        }
      );

      dispatch({
        provider: "wallet:freedom.temporary.wallet.op",
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      });

      // const verifyResult = wallet.verifySignedMessage(result)
      // console.log('verify signedMessage', verifyResult)
      // if (!verifyResult) {
      //   alert(`signMessage succeed, but verify signedMessage failed`)
      // } else {
      //   alert(`signMessage succeed, and verify signedMessage succeed!`)
      // }

      setShowModal(false);
    } catch (e) {
      console.error(e);
      message.error("Unknown Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ActionButton
        color="white"
        background="#1139C2"
        icon={freedomWalletIcon}
        onClick={() => setShowModal(true)}
        checked={!!walletState}
        variant={variant}
      >
        {walletState
          ? addressEllipsis(walletState.displayName)
          : "Freedom Wallet"}
      </ActionButton>

      <StyleProvider hashPriority="high">
        <Modal
          title={"Freedom Wallet for $BED airdrop"}
          open={showModal}
          confirmLoading={submitting}
          onCancel={() => setShowModal(false)}
          onOk={() => handleSignMsg()}
        >
          <div className="flex justify-center my-4">
            <img src={freedomWalletGuide} style={{ width: 300 }} />
          </div>

          <div>
            Follow this guideline to obtain your Freedom Wallet address:
          </div>

          <ol className="list-decimal pl-6">
            <li>
              Download, install and open{" "}
              <a
                className="underline hover:underline text-yellow-100 hover:text-yellow-300"
                href="https://play.google.com/store/apps/details?id=com.bitazza.freedom.wallet"
                target="_blank"
              >
                Freedom Wallet
              </a>
              .
            </li>

            <li>Create a new wallet (If you haven't created yet).</li>
            <li>Enter your pin to unlock your wallet.</li>
            <li>Go to accounts page from the bottom navigation bar.</li>
            <li>
              Copy your wallet address shown next to your name and avatar.
            </li>
            <li>Paste your wallet address below.</li>
          </ol>

          <Divider />

          <div className="mb-2">Please enter your wallet address here</div>
          <Input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x03BDCCB6Ce67B617D0Dae050D82c70F18c095BD0"
          />

          <div className="text-xs mt-3">
            <i>
              Note: Freedom Wallet address isn't verified by our social oracle.
              This value may used to airdrop holder benefit to freedom wallet
              but shouldn't be used to airdrop back to Optimism, Ethereum and
              any other domain linked wallet and social identities.
            </i>
          </div>
        </Modal>
      </StyleProvider>
    </>
  );
}

// export default function SuiButton() {
//   return (
//     <ActionButton color="white" background="#4CA3FF" icon={suiIcon}>
//       Connect Sui Wallet
//     </ActionButton>
//   );
// }
