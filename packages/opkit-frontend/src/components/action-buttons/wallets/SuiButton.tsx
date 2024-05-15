import ActionButton from "../ActionButton";
import suiIcon from "src/assets/social-button/sui.png";
import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
  formatSUI,
  addressEllipsis,
  ConnectModal
} from "@suiet/wallet-kit";
import '@suiet/wallet-kit/style.css';
import { message } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { generateSignMessage } from "src/utils/signMessage";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import axios from "axios"
import { ISocialOracleState } from "src/context/SocialOracleContext";
import { CheckCircleTwoTone, CheckCircleOutlined } from '@ant-design/icons'

export default function SuiButton({ variant = "button" }) {
  const [ loading, setLoading ] = useState(false);
  const { domainName, state, dispatch } = useContext(DomainConnectContext)

  console.log(domainName)

  const [showModal, setShowModal] = useState(false)
  const wallet = useWallet()

  const walletState = state.find((x: ISocialOracleState) => x.provider == 'wallet:784')

  const handleSignMsg = useCallback(async () => {
    setShowModal(false)

    if (!domainName) {
      message.error("Please connect your twitter first")
      window.alert("Please connect your twitter first")
      wallet.disconnect();
      return
    }

    try {
      setLoading(true)

      const timestamp = Math.floor(Date.now() / 1000)
      const msg = generateSignMessage(domainName, 'sui', 784, wallet.account?.address as string, timestamp)
      const msgBytes = new TextEncoder().encode(msg)
      const result: any = await wallet.signMessage({
        message: msgBytes
      })

      console.log(result)

      if (!result) {
        message.error('Sign message failed!')
        wallet.disconnect();
        return;
      }

      // Generate attestation
      const response = await axios.post(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/wallet/sui/verify', {
        domainName,
        walletAddress: wallet.account?.address as string,
        timestamp,
        signature: result.signature,
      }, {
        withCredentials: true,
      })

      dispatch({
        provider: 'wallet:784',
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      })

      wallet.disconnect()

      // const verifyResult = wallet.verifySignedMessage(result)
      // console.log('verify signedMessage', verifyResult)
      // if (!verifyResult) {
      //   alert(`signMessage succeed, but verify signedMessage failed`)
      // } else {
      //   alert(`signMessage succeed, and verify signedMessage succeed!`)
      // }
    } catch (e) {
      console.error('signMessage failed', e)
      wallet.disconnect();
      message.error('Sign message failed! Please check if your wallet need to be updated.')
    } finally {
      setLoading(false)
    }
  }, [domainName, wallet])

  useEffect(() => {
    if (wallet.connected) {
      handleSignMsg();
    }
  }, [wallet.connected])

  return (
    <ConnectModal
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open)
      }}
      onConnectError={(error) => {
        if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
          message.warning('User rejected the connection request')
        } else {
          console.error(error)
          message.error('Unknown connect error')
        }
      }}
    >
      <ActionButton color="white" background="#0080ff" icon={suiIcon} checked={!!walletState} onClick={() => setShowModal(true)} variant={variant}>
        {walletState ? addressEllipsis(walletState.displayName) : "Sui"}
      </ActionButton>
    </ConnectModal>
  )

  return (
    <>
      <div className={(walletState ? '' : 'opacity-60') + ' hover:cursor-pointer hover:opacity-80 transition'}>
        <div className="sui-connect-button flex justify-center">
          <ConnectButton
            style={{
              borderRadius: 9999
            }}
            onConnectError={(error) => {
              if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
                message.warning('User rejected the connection request')
              } else {
                console.error(error)
                message.error('Unknown connect error')
              }
            }}
          >
            {variant == "circle" && (
              <div className="rounded-full flex items-center">
                <div className="">
                  <img src={suiIcon} style={{ height: 40 }} />
                </div>
              </div>
            )}
            {variant == "button" && (
              <div className="w-full flex items-center">
                <div className="mr-3">
                  <img src={suiIcon} style={{ height: 28 }} />
                </div>
                <div className="truncate flex grow font-normal">
                  {walletState ? addressEllipsis(walletState.displayName) : "Connect Sui Wallet"}
                </div>
                {walletState &&
                  <div className='ml-3'><CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} /></div>
                }
              </div>
            )}
          </ConnectButton>
        </div>

        <div className='truncate text-center mt-2'>
          {walletState && <CheckCircleOutlined style={{color: '#7FFFD4'}} />} {walletState ? addressEllipsis(walletState.displayName) : "Sui"}
        </div>
      </div>

      {/* <div className="mt-1 text-sm">
        <div>Tested on Suiet and Martian Wallet.</div>
        <div>Some wallet such as Sui Wallet are not supported.</div>
      </div> */}
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
