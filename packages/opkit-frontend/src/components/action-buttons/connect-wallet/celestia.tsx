import { WalletName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Divider, Input, Modal, Typography, message } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
const { Text } = Typography;

import { StyleProvider } from "@ant-design/cssinjs";
import { addressEllipsis } from "@suiet/wallet-kit";
import axios from "axios";
import freedomWalletGuide from "src/assets/guide/freedomwallet.jpg";
import { ChainChip } from "src/components/common/ChainChip";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import { ISocialOracleState } from "src/context/SocialOracleContext";
import { generateSignMessage } from "src/utils/signMessage";
import styled from "styled-components";
import { useSocialState } from "src/hooks/useSocialState";

const truncateAddress = (address: string | undefined) => {
  if (!address) return;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
};

function CelestiaButtonUnstyled(props: any) {
  // const { domainName, state, dispatch } = useContext(DomainConnectContext);
  const { domainName, state, dispatch } = props
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const { connect, disconnect, account, wallets, connected, signMessage } =
    useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unlinked, setUnlinked] = useState(false)

  const walletState = !unlinked && state.find(
    (x: ISocialOracleState) =>
      x.provider == "wallet:celestia"
  );

  const onWalletButtonClick = () => {
    if (connected) {
      disconnect();
    } else {
      setWalletSelectorModalOpen(true);
    }
  };

  const onWalletSelected = (wallet: WalletName) => {
    connect(wallet);
    setWalletSelectorModalOpen(false);
  };

  const handleSignMsg = useCallback(async () => {
    if (!domainName) {
      message.error("Please connect your twitter first");
      window.alert("Please connect your twitter first");
      disconnect();
      return;
    }

    try {
      setSubmitting(true);
      // const timestamp = Math.floor(Date.now() / 1000);

      // console.log(
      //   generateSignMessage(
      //     domainName,
      //     "celestia",
      //     637,
      //     account?.address as string,
      //     timestamp
      //   )
      // );

      // const payload = {
      //   message: generateSignMessage(
      //     domainName,
      //     "celestia",
      //     637,
      //     account?.address as string,
      //     timestamp
      //   ),
      //   nonce: "opti.domains",
      // };

      // let signResponse = await signMessage(payload);
      // console.log("response", signResponse);

      // if (signResponse && !signResponse.signature) {
      //   signResponse = (signResponse as any).result;
      // }

      // console.log(account?.address, account?.publicKey)

      // Generate attestation
      // const response = await axios.post(
      //   import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
      //     "/wallet/freedom-wallet/verify",
      //   {
      //     domainName,
      //     walletAddress,
      //     timestamp,
      //     signature: "0x",
      //   },
      //   {
      //     withCredentials: true,
      //   }
      // );

      dispatch({
        provider: "wallet:celestia",
        identity: walletAddress,
        displayName: walletAddress,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      });

      setWalletSelectorModalOpen(false);
      setUnlinked(false)
    } catch (error: any) {
      console.log("error", error);
      message.error("Sign message failed!");
      disconnect();
    } finally {
      setSubmitting(false)
    }
  }, [account, domainName, walletAddress]);

  useEffect(() => {
    if (connected) {
      handleSignMsg();
    }
  }, [connected]);

  return (
    <div {...props}>
      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-2 w-64">
          <div>
            <img src="/images/celestia.svg" className="w-10 h-10" alt="" />
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <div className="font-medium text-[#101828]">Celestia</div>
              {walletState && (
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <rect width="16" height="16" rx="8" fill="#DCFAE6" />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M11.3977 4.9271L6.62434 9.53377L5.35767 8.18043C5.12434 7.96043 4.75767 7.9471 4.491 8.13377C4.231 8.3271 4.15767 8.6671 4.31767 8.94043L5.81767 11.3804C5.96434 11.6071 6.21767 11.7471 6.50434 11.7471C6.77767 11.7471 7.03767 11.6071 7.18434 11.3804C7.42434 11.0671 12.0043 5.6071 12.0043 5.6071C12.6043 4.99376 11.8777 4.45377 11.3977 4.92043V4.9271Z"
                      fill="#17B26A"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="mt-1 text-[#667085] text-xs">
              {walletState
                ? `Linked as: ${walletState.displayName.substring(0, 16)}...`

                : "Not linked"}
            </div>
          </div>
        </div>

        {props.opAmount ? <ChainChip amount={props.opAmount} /> : <></>}

        {walletState ? (
          <button
            className="py-2.5 px-3.5 bg-white border border-[#FDA29B] text-[#B42318] rounded-lg flex justify-center gap-1"
            onClick={() => setUnlinked(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g clip-path="url(#clip0_11110_4845)">
                <path
                  d="M7.50033 3.33268V1.66602M12.5003 16.666V18.3327M3.33366 7.49935H1.66699M16.667 12.4993H18.3337M4.0955 4.09453L2.91699 2.91602M15.9051 15.9042L17.0837 17.0827M10.0003 14.7134L8.23256 16.4812C6.93081 17.7829 4.82026 17.7829 3.51851 16.4812C2.21677 15.1794 2.21677 13.0689 3.51851 11.7671L5.28628 9.99935M14.7144 9.99935L16.4821 8.23158C17.7839 6.92983 17.7839 4.81928 16.4821 3.51754C15.1804 2.21579 13.0698 2.21579 11.7681 3.51754L10.0003 5.2853"
                  stroke="#B42318"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_11110_4845">
                  <rect width="20" height="20" fill="#B42318" />
                </clipPath>
              </defs>
            </svg>
            Unlink
          </button>
        ) : (
          <button
            className="py-2.5 px-3.5 bg-white border border-[#232B5C] text-[#101828] rounded-lg flex justify-center gap-1"
            onClick={() => onWalletButtonClick()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g clip-path="url(#clip0_11110_7199)">
                <path
                  d="M8.3335 10.834C8.69138 11.3124 9.14796 11.7083 9.67229 11.9947C10.1966 12.2812 10.7764 12.4516 11.3724 12.4942C11.9683 12.5369 12.5665 12.4509 13.1263 12.2421C13.6861 12.0333 14.1944 11.7065 14.6168 11.284L17.1168 8.78396C17.8758 7.99811 18.2958 6.9456 18.2863 5.85312C18.2768 4.76063 17.8386 3.71558 17.0661 2.94304C16.2935 2.17051 15.2485 1.73231 14.156 1.72281C13.0635 1.71332 12.011 2.1333 11.2252 2.89229L9.79183 4.31729M11.6668 9.16729C11.309 8.68885 10.8524 8.29297 10.328 8.00651C9.80371 7.72004 9.22391 7.54969 8.62796 7.50701C8.032 7.46433 7.43384 7.55032 6.87405 7.75914C6.31425 7.96796 5.8059 8.29473 5.3835 8.71729L2.8835 11.2173C2.12451 12.0031 1.70453 13.0556 1.71402 14.1481C1.72352 15.2406 2.16172 16.2857 2.93426 17.0582C3.70679 17.8307 4.75184 18.2689 5.84433 18.2784C6.93681 18.2879 7.98932 17.8679 8.77517 17.109L10.2002 15.684"
                  stroke="#232B5C"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_11110_7199">
                  <rect width="20" height="20" fill="#101828" />
                </clipPath>
              </defs>
            </svg>
            Link Celestia wallet
          </button>
        )}
      </div>
      <StyleProvider hashPriority="high">
        <Modal
          title={"Celestia Wallet"}
          open={walletSelectorModalOpen}
          confirmLoading={submitting}
          onCancel={() => setWalletSelectorModalOpen(false)}
          onOk={() => handleSignMsg()}
        >
          <div className="mb-2 text-black">Please enter your wallet address here</div>
          <Input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="celestia1g2hrwevvqnm0mcux859mmzcznevx3wh6yvprux"
          />
        </Modal>
      </StyleProvider>
    </div>
  );
}

export default styled(CelestiaButtonUnstyled)`
  .ant-menu {
    border: none !important;
  }

  .ant-menu-item {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 15px;
    height: auto !important;
    margin-bottom: 10px !important;
  }

  .ant-menu-item-selected {
    background-color: rgba(0, 0, 0, 0.06) !important;
    color: black !important;
  }

  .wallet-selector-text {
    font-size: 14px;
  }

  .wallet-connect-button-text {
    color: white;
  }

  .wallet-menu-wrapper {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
  }

  .wallet-name-wrapper {
    display: flex;
    align-items: center;
  }

  .wallet-connect-button {
    align-self: center;
    background-color: #3f67ff;
    height: auto;
  }

  .wallet-connect-install {
    align-self: center;
    color: #3f67ff;
    padding-right: 15px;
    font-size: 16px;
    padding-top: 3px;
    padding-bottom: 3px;
  }

  .wallet-button {
    padding: 10px 20px;
    height: auto;
    font-size: 16px;
    background-color: #3f67ff;
    color: white;
  }

  .wallet-modal-title {
    text-align: center;
    font-size: 2rem;
  }
`;

// export default function CelestiaButton() {
//   return (
//     <ActionButton color="white" background="black" icon={CelestiaIcon}>
//       Connect Celestia Wallet
//     </ActionButton>
//   );
// }
