import { message } from "antd";
import { ethers } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PrimaryDomainContext } from "src/context/DomainConnectContext";
import { CONTRACTS } from "src/utils/contracts";
import {
  SocialProfileSimple,
  getAssociatedSocialProfiles,
  getAssociatedWallets,
} from "src/utils/social-oracle";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePublicClient,
} from "wagmi";
import { DomainSocialRecordFromProfiles } from "./DomainSocialRecord";
import { DomainWalletRecordFromProfiles } from "./DomainWalletRecord";

interface DomainCardProps {
  domainName: string;
  domainDisplayName: string;
  domainChainId: number;
  inputProfiles?: SocialProfileSimple[];
  oneColumn?: boolean;
  className?: string;
}

export function DomainCard({
  domainName,
  domainDisplayName,
  domainChainId,
  inputProfiles,
  oneColumn = false,
  className = "",
}: DomainCardProps) {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain, chains } = useNetwork();
  const node = useMemo(() => ethers.utils.namehash(domainName), [domainName]);

  const [loading, setLoading] = useState(true);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileSimple[]>(
    []
  );
  const [wallets, setWallets] = useState<SocialProfileSimple[]>([]);

  const primaryDomain = useContext(PrimaryDomainContext);
  // console.log("Primary Domain", primaryDomain)

  const { writeAsync: setReverseName } = useContractWrite({
    ...CONTRACTS.ReverseRegistrar,
    functionName: "setName",
  });

  const setAsPrimary = useCallback(async () => {
    try {
      const tx = await setReverseName({
        args: [domainName],
      });
      await publicClient.waitForTransactionReceipt(tx);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      message.error(
        err.shortMessage || err.message || "Set primary domain failed!"
      );
    }
  }, [address, domainName, publicClient]);

  useEffect(() => {
    if (inputProfiles) {
      setSocialProfiles(
        inputProfiles.filter((x) => !x.provider.startsWith("wallet:"))
      );
      setWallets(inputProfiles.filter((x) => x.provider.startsWith("wallet:")));
      setLoading(false);
    } else {
      if (domainChainId && address) {
        const promises = [];

        promises.push(
          getAssociatedSocialProfiles(address, node, domainChainId).then(
            (profiles) => setSocialProfiles(profiles)
          )
        );
        promises.push(
          getAssociatedWallets(address, node, domainChainId).then((profiles) =>
            setWallets(profiles)
          )
        );

        Promise.all(promises).then(() => setLoading(false));
      }
    }
  }, [address, node, domainChainId, inputProfiles]);

  const socialProviderList = [
    "com.twitter",
    "com.discord",
    "com.google",
    "com.microsoft",
    "com.github",
    "com.linkedin",
    // 'com.facebook',
    "me.line",
  ];

  const walletProviderList = [
    "60",
    "637",
    "784",
    // '501',

    "freedom.temporary.wallet.op",
  ];

  return (
    <div
      className={
        "rounded-xl bg-red-950 p-4 shadow-lg" +
        (primaryDomain == domainName ? " glowing-btn glowing-red" : "") +
        " " +
        className
      }
    >
      <h4 className="text-xl text-amber-200">{domainDisplayName}</h4>
      <div className="text-sm text-gray-200">
        {chains.find((x) => x.id == domainChainId)?.name}
      </div>
      <div className="text-sm text-gray-200">
        Expire: {new Date(1735689600000).toLocaleString()}
      </div>

      <div className={"grid gap-4 mt-4" + (oneColumn ? "" : " sm:grid-cols-2")}>
        <div>
          {socialProviderList.map((provider) => (
            <div className="mb-2" key={provider}>
              <DomainSocialRecordFromProfiles
                provider={provider}
                profiles={socialProfiles}
                loading={loading}
              />
            </div>
          ))}
        </div>

        <div>
          {walletProviderList.map((coinType) => (
            <div className="mb-2" key={coinType}>
              <DomainWalletRecordFromProfiles
                coinType={coinType}
                profiles={wallets}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex">
        <div
          className="cursor-pointer text-amber-100 hover:text-amber-200 mr-4 transition"
          onClick={() => setAsPrimary()}
        >
          SET AS PRIMARY
        </div>
        {/* <div className='cursor-pointer text-amber-100 hover:text-amber-200 mr-4'>RENEW</div> */}
      </div>
    </div>
  );
}
