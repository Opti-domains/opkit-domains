import {
  ConnectModal,
  ErrorCode,
  addressEllipsis,
  useWallet,
} from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { message } from "antd";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { ChainChip } from "src/components/common/ChainChip";
import { ChainIcon } from "src/components/common/ChainIcon";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import { ISocialOracleState } from "src/context/SocialOracleContext";
import { generateSignMessage } from "src/utils/signMessage";

export default function SuiButton({
  variant = "button",
  opAmount = 0,
  existing,
}: {
  variant?: string;
  opAmount?: number;
  existing?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { domainName, state, dispatch } = useContext(DomainConnectContext);

  const [showModal, setShowModal] = useState(false);
  const wallet = useWallet();

  let walletState =
    state && state.find((x: ISocialOracleState) => x.provider == "wallet:784");

  if (existing && existing != '0x') {
    walletState = {
      provider: "wallet:784",
      identity: existing,
      displayName: existing,
      refUid: import.meta.env.VITE_WALLET_REF_ID,
    }
  }

  const handleSignMsg = useCallback(async () => {
    setShowModal(false);

    if (!domainName) {
      message.error("Please connect your twitter first");
      window.alert("Please connect your twitter first");
      wallet.disconnect();
      return;
    }

    try {
      setLoading(true);

      const timestamp = Math.floor(Date.now() / 1000);
      const msg = generateSignMessage(
        domainName,
        "sui",
        784,
        wallet.account?.address as string,
        timestamp
      );
      const msgBytes = new TextEncoder().encode(msg);
      const result: any = await wallet.signMessage({
        message: msgBytes,
      });

      console.log(result);

      if (!result) {
        message.error("Sign message failed!");
        wallet.disconnect();
        return;
      }

      // Generate attestation
      const response = await axios.post(
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + "/wallet/sui/verify",
        {
          domainName,
          walletAddress: wallet.account?.address as string,
          timestamp,
          signature: result.signature,
        },
        {
          withCredentials: true,
        }
      );

      dispatch({
        provider: "wallet:784",
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      });

      wallet.disconnect();

      // const verifyResult = wallet.verifySignedMessage(result)
      // console.log('verify signedMessage', verifyResult)
      // if (!verifyResult) {
      //   alert(`signMessage succeed, but verify signedMessage failed`)
      // } else {
      //   alert(`signMessage succeed, and verify signedMessage succeed!`)
      // }
    } catch (e) {
      console.error("signMessage failed", e);
      wallet.disconnect();
      message.error(
        "Sign message failed! Please check if your wallet need to be updated."
      );
    } finally {
      setLoading(false);
    }
  }, [domainName, wallet]);

  useEffect(() => {
    if (wallet.connected) {
      handleSignMsg();
    }
  }, [wallet.connected]);

  return (
    <ConnectModal
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
      }}
      onConnectError={(error) => {
        if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
          message.warning("User rejected the connection request");
        } else {
          console.error(error);
          message.error("Unknown connect error");
        }
      }}
    >
      <>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 w-40">
            <div className="relative">
              <img src="/images/sui1.png" className="w-10 h-10" alt="" />
            </div>
            <div>
              <div className="font-medium text-[#F5F5F6]">Sui</div>
              <div className="mt-1 text-[#94969C] text-xs">
                {walletState
                  ? addressEllipsis(walletState.displayName)
                  : "Not linked"}
              </div>
            </div>
          </div>

          {opAmount ? <ChainChip amount={opAmount} /> : <></>}

          {walletState ? (
            <div className="flex justify-center items-center">
              <img src="/images/check.png" className="w-8 h-8"></img>
            </div>
          ) : (
            <button
              className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex justify-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <ChainIcon />
              {walletState ? "Unlink" : "Link"}
            </button>
          )}
        </div>
      </>
    </ConnectModal>
  );
}
