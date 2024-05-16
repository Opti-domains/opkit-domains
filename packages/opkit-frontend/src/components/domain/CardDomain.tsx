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
import { ChainChip } from "../common/ChainChip";
import { RecordSocialDomainFromProfiles } from "./RecordSocialDomain";
import { WalletDomainRecordFromProfiles } from "./WalletDomainRecord";

interface DomainCardProps {
  domainName: string;
  domainDisplayName: string;
  domainChainId: number;
  inputProfiles?: SocialProfileSimple[];
  oneColumn?: boolean;
  className?: string;
  evmAttest: () => void;
  opAmount: number;
  opBaseAmount: number;
  isOP: boolean;
  followed: boolean;
  baseMinted: boolean;
}

export function CardDomain({
  domainName,
  domainDisplayName,
  domainChainId,
  inputProfiles,
  oneColumn = false,
  className = "",
  opAmount = 4,
  opBaseAmount = 4,
  isOP,
  evmAttest,
  followed,
  baseMinted,
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

  const isBeforeBonusCutoff = new Date().getTime() <= 1714608000000;

  let rpgf4bonus = isOP ? opBaseAmount * 50 : 50;

  if (!isBeforeBonusCutoff) {
    if (isOP) {
      rpgf4bonus = 10;
    } else {
      rpgf4bonus = 20;
    }
  }

  return (
    <div
      className={
        "bg-white h-auto rounded-xl p-6 flex flex-col gap-5" +
        (primaryDomain == domainName ? " glowing-btn glowing-red" : "") +
        " " +
        className
      }
    >
      <h4 className="text-[#667085] text-2xl font-bold">
        {domainDisplayName} <span className="text-[#101828]">.tia.id</span>
      </h4>
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
          <div className="text-[#101828]">
            {chains.find((x) => x.id == domainChainId)?.name}
          </div>
        </div>
        <div className="text-[#101828]">
          Expire: {new Date(1735689600000).toLocaleString()}
        </div>
      </div>
      <hr className="border-[#D0D5DD]" />
      <div className={"grid gap-4" + (oneColumn ? "" : " sm:grid-cols-2")}>
        <div className="text-xs font-normal text-[#667085]">
          Social Profiles
        </div>
        <div>
          <div className="mb-2">
            <RecordSocialDomainFromProfiles
              provider={"com.twitter"}
              profiles={socialProfiles}
              loading={loading}
            />
          </div>
          <div className="mb-2">
            <RecordSocialDomainFromProfiles
              provider={"com.discord"}
              profiles={socialProfiles}
              loading={loading}
            />
          </div>
          <div className="mb-2">
            <RecordSocialDomainFromProfiles
              provider={"com.github"}
              profiles={socialProfiles}
              loading={loading}
            />
          </div>
        </div>
        <div className="text-xs font-medium text-[#667085]">Wallets</div>
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

        {(opAmount > 0 || !isOP) && (
          <>
            <hr className="border-[#333741] border-dashed" />
            <div className="flex gap-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 22V17M4.5 7V2M2 4.5H7M2 19.5H7M13 3L11.2658 7.50886C10.9838 8.24209 10.8428 8.60871 10.6235 8.91709C10.4292 9.1904 10.1904 9.42919 9.91709 9.62353C9.60871 9.84281 9.24209 9.98381 8.50886 10.2658L4 12L8.50886 13.7342C9.24209 14.0162 9.60871 14.1572 9.91709 14.3765C10.1904 14.5708 10.4292 14.8096 10.6235 15.0829C10.8428 15.3913 10.9838 15.7579 11.2658 16.4911L13 21L14.7342 16.4911C15.0162 15.7579 15.1572 15.3913 15.3765 15.0829C15.5708 14.8096 15.8096 14.5708 16.0829 14.3765C16.3913 14.1572 16.7579 14.0162 17.4911 13.7342L22 12L17.4911 10.2658C16.7579 9.98381 16.3913 9.8428 16.0829 9.62353C15.8096 9.42919 15.5708 9.1904 15.3765 8.91709C15.1572 8.60871 15.0162 8.24209 14.7342 7.50886L13 3Z"
                  stroke="url(#paint0_linear_10783_18394)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_10783_18394"
                    x1="1.99969"
                    y1="21.9999"
                    x2="21.9998"
                    y2="1.99976"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#39A0FF" />
                    <stop offset="1" stop-color="#8FFF85" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-gradient">Reward</div>
            </div>
            <div className="flex">
              {opAmount > 0 && <ChainChip amount={opAmount} />}

              {(!isOP || opBaseAmount > 0) && (
                <div className="pl-1.5 pr-3 py-1 bg-[#161B26] border border-[#333741] flex gap-1.5 rounded-full items-center ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0 6.00001C0 7.10457 0.895428 8 1.99999 8C3.10456 8 3.99998 7.10457 3.99998 6.00001C3.99998 4.89545 3.10456 4.00002 1.99999 4.00002C0.895428 4.00002 0 4.89545 0 6.00001Z"
                      fill="#EB001A"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M7.99998 16H4V12H7.99998V16Z"
                      fill="white"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M7.99998 7.99992H10C11.0921 7.99992 12 7.09208 12 5.99998C12 4.90788 11.0921 3.99994 10 3.99994H7.99998H4V-4.76837e-05H10C13.3 -4.76837e-05 16 2.69998 16 5.99998C16 9.29997 13.3 12 10 12H7.99998V7.99992Z"
                      fill="white"
                    />
                  </svg>

                  <div className="text-[#101828] text-sm">
                    +{rpgf4bonus}% RPGF4
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <hr className="border-[#1F242F]" />
        <button
          className="font-semibold bg-[#111] rounded-lg px-4 py-2.5 shadow-sm glowing-btn"
          onClick={evmAttest}
          disabled={!baseMinted || !followed}
          style={{ opacity: baseMinted && followed ? 1 : 0.5 }}
        >
          {!baseMinted
            ? "Please mint on BASE first"
            : !followed
            ? "Follow and join us first"
            : !isOP
            ? "Register for RPGF4 Bonus"
            : `Register ${opAmount ? `and Claim ${opAmount} OP` : ""}`.trim()}
        </button>
      </div>
    </div>
  );
}
