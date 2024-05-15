import React, { useCallback, useContext, useEffect, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import RetroPGFIcon from "../../assets/infinity-op-circle.png";
import { PrimaryDomainContext } from "src/context/DomainConnectContext";
import OpacityCheck from "../action-buttons/OpacityCheck";
import { IQuest, fetchQuests, refreshQuests } from "src/utils/quests";
import { message } from "antd";
import { useAccount } from "wagmi";
import ReferralTwitterShareButton from "../marketing/ReferralTwitterShareButton";
import { calculateRefDomain } from "src/utils/marketing";
import useAccountSiwe from "src/hooks/useAccountSiwe";

export default function RetroPGF3TaskCard() {
  const { address, isConnected } = useAccountSiwe()
  const primaryDomain = useContext(PrimaryDomainContext)

  const [loading, setLoading] = useState(false)
  const [quests, setQuests] = useState<IQuest>()

  const loadQuests = useCallback(async (fromRefresh = false) => {
    try {
      setLoading(true)

      if (primaryDomain) {
        const data = await fetchQuests(primaryDomain)

        if (data.optidomains) {
          setQuests(data)
        } else {
          await refreshQuestsAction();
        }
      } else {
        if (fromRefresh) {
          message.error("Please Mint & Setup a primary domain name first")
        }
      }
    } finally {
      setLoading(false)
    }
  }, [primaryDomain, setLoading, setQuests])

  const refreshQuestsAction = useCallback(async () => {
    try {
      setLoading(true)

      if (primaryDomain) {
        await refreshQuests(primaryDomain, 'retropgf3')
        await loadQuests(true)
        message.success("Task progress refreshed!")
      } else {
        message.error("Please Mint & Setup a primary domain name first")
      }
    } finally {
      setLoading(false)
    }
  }, [loadQuests])

  useEffect(() => {
    console.log(address, primaryDomain, isConnected)
    if (address && primaryDomain && isConnected) {
      setQuests(undefined)
      loadQuests()
    }
  }, [address, primaryDomain, isConnected])

  if (!address || !isConnected) {
    return (<div></div>)
  }

  return (
    <div
      className={"rounded-xl bg-red-950 p-4 shadow-lg glowing-btn glowing-red"}
    >
      <div className="flex flex-col sm:flex-row items-center">
        <div className="mr-3 flex-shrink-0">
          <img src={RetroPGFIcon} style={{ width: 64, height: 64 }} />
        </div>

        <div className="flex-grow mt-2 sm:mt-0">
          <div className="text-lg sm:text-xl text-center sm:text-left text-amber-200">Bored Town Domains Tasks</div>

          <div className="text-2xl">
            Earn Future Rewards
            {/* <span className="text-amber-200 text-center sm:text-left">30M OP</span> RetroPGF3 event */}
          </div>
        </div>

        <div className="hidden md:block">
          <div
            className={"px-6 py-2 text-black bg-white rounded text-lg text-center transition-all hover:cursor-pointer hover:scale-105 " + (loading ? 'opacity-60 pointer-events-none' : '')}
            onClick={() => refreshQuestsAction()}
          >
            <ReloadOutlined spin={loading} /> &nbsp;{loading ? 'Refreshing...' : 'Refresh Tasks'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-lg font-bold mb-1 text-amber-200">
            <OpacityCheck active={Boolean(primaryDomain) && isConnected && quests?.optidomains?.townFollowers}>Prerequisites</OpacityCheck>
          </div>

          <div className="">
            <OpacityCheck active={Boolean(primaryDomain) && isConnected}>Mint & Setup a primary domain name</OpacityCheck>
            {/* <OpacityCheck active={quests?.optidomains?.townFollowers}>Complete <a href="https://app.questn.com/event/804598462480871856" target="_blank" className="underline">".town Followers" Quest (Click)</a></OpacityCheck> */}
          </div>
        </div>

        <div>
          <div className="text-lg font-bold mb-1 text-amber-200">
            <OpacityCheck active={Boolean(quests?.optidomains?.mintId) && quests?.optidomains.mintId! <= 2500 && quests?.optidomains?.connectAptos && quests?.optidomains?.connectSui}>Earn 4 OP on approx June 2024</OpacityCheck>
          </div>

          <div className="">
            <OpacityCheck active={Boolean(quests?.optidomains?.mintId) && quests?.optidomains.mintId! <= 2500}>First 2,500 minter</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectAptos && quests?.optidomains?.connectSui}>Connect Aptos & Sui Wallet</OpacityCheck>
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="text-lg font-bold mb-1 text-amber-200">
            Opti.domains
          </div>
          <div className="">
            <OpacityCheck active={quests?.optidomains?.mainnetOg}>Mainnet OG</OpacityCheck>
            {/* <OpacityCheck active={quests?.optidomains?.mintBeforeAMA}>Mint before the first AMA</OpacityCheck> */}
            <OpacityCheck active={Boolean(quests?.optidomains?.mintOnBase)}>Mint on Base</OpacityCheck>
            {/* <OpacityCheck active={Boolean(quests?.optidomains?.mintId) && quests?.optidomains.mintId! <= 1000}>First 1,000 minter</OpacityCheck> */}
            {/* <OpacityCheck active={Boolean(quests?.optidomains?.mintId) && quests?.optidomains.mintId! <= 2500}>First 2,500 minter</OpacityCheck> */}
            <OpacityCheck active={quests?.optidomains?.connectAptos}>Connect Aptos Wallet</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectSui}>Connect Sui Wallet</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectGoogle || quests?.optidomains?.connectMicrosoft}>Connect Email</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectGithub}>Connect Github</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectLinkedIn}>Connect LinkedIn</OpacityCheck>
            <OpacityCheck active={quests?.optidomains?.connectFreedomWallet}>Connect Freedom Wallet</OpacityCheck>
          </div>
        </div>

        <div>
          <div className="text-lg font-bold mb-1 text-amber-200">
            Opti.domains Referral Program
          </div>
          <div className="">
            {/* <OpacityCheck active={false}>
              <ReferralTwitterShareButton link={primaryDomain ? `https://town.opti.domains/#${calculateRefDomain(primaryDomain, [])}` : ''} variant="quest"></ReferralTwitterShareButton>
            </OpacityCheck> */}
            <OpacityCheck active={(quests?.optidomains?.referral || 0) >= 1}>Refer a friend to mint a domain</OpacityCheck>
            <OpacityCheck active={(quests?.optidomains?.referral || 0) >= 3}>Refer 3 friends to mint a domain</OpacityCheck>
            <OpacityCheck active={(quests?.optidomains?.referral || 0) >= 10}>Refer 10 friends to mint a domain</OpacityCheck>
            <OpacityCheck active={(quests?.optidomains?.referral || 0) >= 30}>Refer 30 friends to mint a domain</OpacityCheck>
          </div>
        </div>
      </div>

      {/* <div className="text-amber-100">
        Note: Different projects have different impacts. We are actively
        onboarding new projects for this RetroPGF3 event.
      </div> */}

      <div className="mt-4 md:hidden">
        <div
          className={"w-full px-6 py-2 text-black bg-white rounded text-lg text-center transition-all hover:cursor-pointer hover:scale-105 " + (loading ? 'opacity-60 pointer-events-none' : '')}
          onClick={() => refreshQuestsAction()}
        >
          <ReloadOutlined spin={loading} /> &nbsp;{loading ? 'Refreshing...' : 'Refresh Tasks'}
        </div>
      </div>
    </div>
  );
}
