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
import { RecordSocialDomainFromProfiles } from "./RecordSocialDomain";
import { WalletDomainRecordFromProfiles } from "./WalletDomainRecord";

interface confirmRegistationDomainCardProps {
  domainName: string;
  domainDisplayName: string;
  domainChainId: number;
  inputProfiles?: SocialProfileSimple[];
  oneColumn?: boolean;
  className?: string;
  evmAttest?: () => void;
  opAmount?: number;
  isOP?: boolean;
}

export const ConfirmRegistationDomainCard = ({
  domainName,
  domainDisplayName,
  domainChainId,
  inputProfiles,
  oneColumn = false,
  className = "",
  opAmount = 4,
  isOP,
  evmAttest,
}: confirmRegistationDomainCardProps) => {
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
  // console.log("Primary Domain", primaryDomain);

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
    // "60",
    "637",
    "784",
    // '501',

    // "freedom.temporary.wallet.op",
  ];

  const isBeforeBonusCutoff = new Date().getTime() <= 1714521600000;

  return (
    <div
      className={
        "bg-[#161B26] h-auto rounded-xl p-6 flex flex-col gap-5 border border-[#333741]" +
        (primaryDomain == domainName ? " glowing-btn glowing-red" : "") +
        " " +
        className
      }
    >
      <h4 className="text-[#F5F5F6] text-2xl font-bold">{domainDisplayName}</h4>
      <div className="flex gap-5 justify-between">
        <div className="flex gap-3 items-center text-base font-medium">
          <img
            src={
              chains.find((x) => x.id == domainChainId)?.name === "Base"
                ? "/images/chains/base.png"
                : "/images/chains/op.png"
            }
            className="w-6 h-6"
            alt=""
          />
          <div className="text-[#F5F5F6]">
            {chains.find((x) => x.id == domainChainId)?.name}
          </div>
        </div>
        <div className="text-[#F5F5F6]">
          Expire: {new Date(1735689600000).toLocaleString()}
        </div>
      </div>
      <hr className="border-[#333741]" />
      <div className={"grid gap-4" + (oneColumn ? "" : " sm:grid-cols-2")}>
        <div className="text-xs font-medium">Social Profiles</div>
        <div>
          <div className="mb-2">
            <RecordSocialDomainFromProfiles
              provider={"com.twitter"}
              profiles={socialProfiles}
              loading={loading}
            />
          </div>
        </div>
        <div className="text-xs font-medium">Wallets</div>
        <div>
          {walletProviderList.map(
            (coinType) =>
              coinType !== "freedom.temporary.wallet.op" && (
                <div className="mb-2" key={coinType}>
                  <WalletDomainRecordFromProfiles
                    coinType={coinType}
                    profiles={wallets}
                    loading={loading}
                  />
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};
