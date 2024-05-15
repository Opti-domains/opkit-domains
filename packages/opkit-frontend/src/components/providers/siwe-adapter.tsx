import { AuthenticationStatus, RainbowKitAuthenticationProvider, createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { createContext, useCallback, useEffect, useState } from 'react';
import { SiweMessage } from 'src/utils/SiweMessage';
import { useChainId, useNetwork, useSwitchNetwork } from 'wagmi';
import { useAccount } from 'wagmi';

export const SiweAuthContext = createContext("unauthenticated")

export function SiweAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();
  const { chains, chain } = useNetwork()

  const [status, setStatus] = useState<AuthenticationStatus>("loading")
  const { switchNetwork } = useSwitchNetwork()

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/nonce', {
        credentials: 'include',
      });
      return await response.text();
    },
  
    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to .town by Opti.Domains',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
  
    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },
  
    verify: async ({ message, signature }) => {
      console.log(chains.find(x => x.id == chain?.id))
      if (!chains.find(x => x.id == chain?.id)) {
        window.alert('Please switch network to Base or Optimism')
        switchNetwork?.(parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!))
        return false
      }

      let referral = window.localStorage.getItem("OPTIDOMAINS_REFERRER")

      if (referral) {
        try {
          ethers.utils.namehash(referral)
        } catch (err) {
          console.error(err)
          referral = null
        }
      }

      let referralObj = referral ? { referral } : {}

      const verifyRes = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/verify?testnet=' + import.meta.env.VITE_DEV_MODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, ...referralObj }),
        credentials: 'include',
      });
  
      if (verifyRes.ok) {
        setStatus("authenticated")
        return true
      } else {
        setStatus("unauthenticated")

        try {
          const data = await verifyRes.json();

          if (data.message) {
            window.alert(data.message)
          }
        } finally {
          return false
        }
      }
    },
  
    signOut: async () => {
      await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setStatus("unauthenticated")
    },
  });

  const refreshMe = useCallback(async () => {
    try {
      if (!isConnected) {
        setStatus('unauthenticated')
        return
      }
  
      const response = await fetch(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/siwe/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json()
        const nowPlus1day = new Date()
        nowPlus1day.setDate(nowPlus1day.getDate() + 1)
        
        if (
          data.address?.toLowerCase() == address?.toLowerCase() && 
          data.chainId == chain?.id &&
          (!data.expirationTime || nowPlus1day < new Date(data.expirationTime))
        ) {
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
        }
      } else {
        setStatus('unauthenticated')
      }
    } catch (err) {
      console.error(err)
      setStatus('unauthenticated')
    }
  }, [address, chain, isConnected])

  useEffect(() => {
    refreshMe()
  }, [address, chain, isConnected])

  return (
    <SiweAuthContext.Provider value={status}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={status}
      >
        {children}
      </RainbowKitAuthenticationProvider>
    </SiweAuthContext.Provider>
  )
}