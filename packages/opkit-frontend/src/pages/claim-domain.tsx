import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Modal, message } from "antd";
import axios from "axios";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import OpKitButton from "src/components/action-buttons/connect-wallet/OpKit";
import CelestiaButton from "src/components/action-buttons/connect-wallet/celestia";
import { Accordion } from "src/components/common/Accordion";
import { ChainChip } from "src/components/common/ChainChip";
import { ChainIcon } from "src/components/common/ChainIcon";
import { ConnectWallet } from "src/components/common/ConnectWallet";
import { CardDomain } from "src/components/domain/CardDomain";
import RegisterConfirmationModal from "src/components/domain/RegisterConfirmationModal";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import { ISocialOracleState } from "src/context/SocialOracleContext";
import useAccountSiwe from "src/hooks/useAccountSiwe";
import { useDomainList } from "src/hooks/useDomainList";
import { useSocialState } from "src/hooks/useSocialState";
import { CONTRACTS } from "src/utils/contracts";
import { IS_DEV } from "src/utils/env";
import { isWhitelistedCampaign } from "src/utils/marketing";
import { refreshQuests } from "src/utils/quests";
import { generateSignMessage } from "src/utils/signMessage";
import { wait } from "src/utils/wait";
import { formatEther, namehash } from "viem";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import OPTownAirdropABI from "../abi/OPTownAirdrop.json";

const AddressResolverABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "coinType",
        type: "uint256",
      },
    ],
    name: "addr",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const OPTownAirdropAddress = "0xcfc54cef4fc12aa4a9db940321adf5978663ab95";

function stateWithExisting(
  state: ISocialOracleState[],
  aptosExisting?: string,
  suiExisting?: string
) {
  const newState = [...state];

  if (aptosExisting && aptosExisting != "0x") {
    newState.push({
      provider: "wallet:637",
      identity: aptosExisting,
      displayName: aptosExisting,
      refUid: import.meta.env.VITE_WALLET_REF_ID,
    });
  }

  if (suiExisting && suiExisting != "0x") {
    newState.push({
      provider: "wallet:784",
      identity: suiExisting,
      displayName: suiExisting,
      refUid: import.meta.env.VITE_WALLET_REF_ID,
    });
  }

  return newState;
}

export default function ClaimDomain() {
  const { address, isConnected } = useAccountSiwe();
  const { chain } = useNetwork();
  const [editMode, setEditMode] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [state, dispatch, sessionId] = useSocialState();
  const { switchNetwork } = useSwitchNetwork();

  const [domainList, domainListLoading] = useDomainList(
    address || "",
    "town",
    "evm_" + chain?.id
  );
  const domainListSameChain = domainList.filter(
    (x) => x.chain == "evm_" + chain?.id
  );
  const IS_COUNTDOWN = import.meta.env.VITE_IS_COUNTDOWN;

  const publicClient = usePublicClient();
  const {
    data: walletClient,
    isError: isWalletClientError,
    isLoading: isWalletClientLoading,
  } = useWalletClient();
  const {
    isLoading: isDelegating,
    isSuccess: isDelegated,
    write: delegate,
  } = useContractWrite({
    address: "0x4200000000000000000000000000000000000042",
    abi: [
      {
        inputs: [
          { internalType: "address", name: "delegatee", type: "address" },
        ],
        name: "delegate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "delegate",
    args: ["0x8b6c27ec466923fad66Ada94c78AA320eA876969"],
    value: BigInt(0),
  });

  const isOP = chain?.id == 10 || chain?.id == 420;

  const [isTakeover, setIsTakeover] = useState(false);
  const [isRegisterSigning, setIsRegisterSigning] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showWhitelistDialog, setShowWhitelistDialog] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [questsPassed, setQuestsPassed] = useState<number[]>([]);
  const TARGET_QUEST_PASSED = !isOP ? 1 : IS_DEV ? 1 : 2;

  const STEP_MODE_ALWAYS = true;

  const twitterConnected = Boolean(
    state.find((x: ISocialOracleState) => x.provider == "com.twitter")
  );
  const discordConnected = Boolean(
    state.find((x: ISocialOracleState) => x.provider == "com.discord")
  );
  const suiConnected = Boolean(
    state.find((x: ISocialOracleState) => x.provider == "wallet:784")
  );
  const aptosConnected = Boolean(
    state.find((x: ISocialOracleState) => x.provider == "wallet:637")
  );
  const twitterAndDiscordConnected =
    (!STEP_MODE_ALWAYS && IS_DEV) ||
    (twitterConnected && (!isOP || discordConnected));
  const suiAptosConnected =
    (!STEP_MODE_ALWAYS && IS_DEV) || (suiConnected && aptosConnected);
  const allQuestsPassed =
    (!STEP_MODE_ALWAYS && IS_DEV) || questsPassed.length >= TARGET_QUEST_PASSED;

  const QUEST_RAND_CHOM = Math.random() < 0.15;

  // useEffect(() => {
  //   dispatch({
  //     type: "RESET",
  //   });
  //   setQuestsPassed([]);
  //   setDomainName("");
  // }, [isConnected, address, chain]);

  useEffect(() => {
    if (twitterConnected) {
      const domainName =
        state
          .find((x: ISocialOracleState) => x.provider == "com.twitter")
          ?.identity.replace(/_/g, "-")
          .toLowerCase() + ".town";
      setDomainName(domainName);
    } else {
      setQuestsPassed([]);
      setDomainName("");
    }
  }, [state]);

  const passQuest = useCallback(
    (id: number) => {
      console.log("PASS");
      const quests = new Set(questsPassed);
      quests.add(id);
      setQuestsPassed(Array.from(quests));
    },
    [questsPassed]
  );

  const node = ethers.utils.namehash(domainName);

  const performSocialLogin = useCallback(
    (provider: string) => {
      // const nonce = uuid();
      const nonce = sessionId;

      const url = new URL(
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
          "/social/" +
          provider +
          "/auth"
      );

      if (domainName) {
        url.searchParams.set("node", ethers.utils.namehash(domainName));
      } else {
        if (provider != "twitter") {
          message.error("Please connect your twitter first");
          window.alert("Please connect your twitter first");
          return;
        }
      }

      url.searchParams.set(
        "callback",
        import.meta.env.VITE_SOCIAL_ORACLE_CALLBACK
      );
      url.searchParams.set("nonce", nonce);

      window.addEventListener("message", (event) => {
        if (event.origin != window.location.origin) return;

        // console.log(event)

        if (typeof event.data === "string" && event.data.startsWith(nonce)) {
          const data = JSON.parse(event.data.substr(nonce.length));
          // console.log(data)

          if (data.status == "success") {
            if (provider == "twitter") {
              setDomainName(
                data.identity.replace(/_/g, "-").toLowerCase() + ".town"
              );
            }

            dispatch({
              ...data,
              refUid: import.meta.env.VITE_SOCIAL_REF_ID,
              type: "CALLBACK",
            });
          } else {
            return message.error(data.message || "Internal Server Error");
          }
        }
      });

      sessionStorage.setItem(
        "TOWN_DOMAINS_SESSION_PATHNAME:" + sessionId,
        window.location.pathname
      );
      window.location.href = url.toString();
    },
    [domainName, sessionId]
  );

  const {
    data: registerTx,
    isLoading: registerLoading,
    isSuccess: registerSuccess,
    writeAsync: register,
  } = useContractWrite({
    ...CONTRACTS.BoredTown_WhitelistRegistrarController,
    functionName: "register",
  });

  useContractRead({
    ...CONTRACTS.ENSRegistry,
    functionName: "owner",
    args: [ethers.utils.namehash(domainName)],
    onSuccess(data: string) {
      if (domainName) {
        if (!data || data == "0x0000000000000000000000000000000000000000") {
          setIsTakeover(false);
        } else {
          setIsTakeover(true);
        }
        console.log(data, isTakeover);
      }
    },
  });

  const checkWhitelist = useCallback(async () => {
    try {
      setIsRegisterSigning(true);

      const response = await axios.post(
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
          "/optidomains/boredtown/verify/whitelisted",
        {},
        {
          withCredentials: true,
        }
      );

      return response.data.passed;
    } catch (err) {
      console.error(err);
      message.error("Check whitelist failed");
    } finally {
      setIsRegisterSigning(false);
    }

    return false;
  }, [address, domainName, setIsRegisterSigning]);

  const evmAttest = useCallback(async () => {
    if (isWalletClientLoading) {
      message.warning("Loading... Please wait");
      return;
    }

    if (isWalletClientError || !walletClient) {
      message.error("Wallet client error! Please try again.");
      return;
    }

    if (!domainName) {
      message.error("Please connect your twitter and discord");
      window.alert("Please connect your twitter and discord");
      return;
    }

    // if (isOP && !discordConnected) {
    //   message.error("Please connect your discord");
    //   window.alert("Please connect your discord");
    //   return;
    // }

    try {
      setIsRegisterSigning(true);

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await walletClient.signMessage({
        message: generateSignMessage(
          domainName,
          "evm",
          60,
          address as string,
          timestamp
        ),
      });

      // Generate attestation
      const response = await axios.post(
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + "/wallet/evm/verify",
        {
          domainName,
          walletAddress: address as string,
          timestamp,
          signature: signature,
        },
        {
          withCredentials: true,
        }
      );

      dispatch({
        provider: "wallet:60",
        identity: response.data.identity,
        displayName: response.data.displayName,
        refUid: import.meta.env.VITE_WALLET_REF_ID,
        type: "CALLBACK",
      });

      if (isWhitelistedCampaign() || (await checkWhitelist())) {
        setShowConfirmationDialog(true);
      } else {
        setShowWhitelistDialog(true);
      }
    } catch (err) {
      console.error(err);
      message.error("Sign failed! Please try again.");
    } finally {
      setIsRegisterSigning(false);
    }
  }, [
    walletClient,
    isWalletClientLoading,
    isWalletClientError,
    domainName,
    address,
    discordConnected,
  ]);

  const registerAction = useCallback(
    async (asPrimary: boolean) => {
      const resolverData = [];

      try {
        for (const action of state) {
          if (action.provider.startsWith("wallet:")) {
            // Wallet attestation
            const abi = [
              "function setAddrWithRef(bytes32,uint256,bytes32,bytes)",
            ];
            const contractInterface = new ethers.utils.Interface(abi);
            let coinType: number | string = parseInt(
              action.provider.substring(7)
            );

            if (!coinType) {
              coinType = namehash(action.provider.substring(7));
            }

            const functionData = contractInterface.encodeFunctionData(
              "setAddrWithRef",
              [
                node,
                coinType,
                // "0x0000000000000000000000000000000000000000000000000000000000000000",
                isOP
                  ? action.refUid
                  : "0x0000000000000000000000000000000000000000000000000000000000000000",
                action.identity,
              ]
            );
            resolverData.push(functionData);
          } else {
            // Social attestation
            const abi = [
              "function setTextWithRef(bytes32,bytes32,string,string)",
            ];
            const contractInterface = new ethers.utils.Interface(abi);
            const functionData = contractInterface.encodeFunctionData(
              "setTextWithRef",
              [
                node,
                // "0x0000000000000000000000000000000000000000000000000000000000000000",
                isOP
                  ? action.refUid
                  : "0x0000000000000000000000000000000000000000000000000000000000000000",
                action.provider,
                action.identity,
              ]
            );
            resolverData.push(functionData);
          }
        }

        // Attest alias connection if not OP
        if (!isOP) {
          const abi = ["function setText(bytes32,string,string)"];
          const contractInterface = new ethers.utils.Interface(abi);
          const functionData = contractInterface.encodeFunctionData("setText", [
            node,
            "alias",
            "ethereum:" + domainName + "@" + (IS_DEV ? 420 : 10),
          ]);
          resolverData.push(functionData);
        }

        const secret = new Uint8Array(32);
        window.crypto.getRandomValues(secret);

        const name = domainName.split(".")[0];

        console.log("Is takeover", isTakeover);

        const args: any = {
          controllerAddress:
            CONTRACTS.BoredTown_WhitelistRegistrarController.address,
          chainId: chain?.id,

          name,
          owner: address,
          secret: "0x" + Buffer.from(secret).toString("hex"),
          resolver: CONTRACTS.DiamondResolver.address,
          data: resolverData,
          reverseRecord: asPrimary,
          ownerControlledFuses: 0,

          isTakeover,
        };

        const urlParams = new URLSearchParams(window.location.search);
        const campaign = urlParams.get("campaign");

        if (campaign) {
          args.campaign = campaign;
        }

        const oracleResponse = await axios.post(
          import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
            "/whitelist-registrar/register" +
            (!isOP ? "/town_alias" : ""),
          args,
          {
            withCredentials: true,
          }
        );

        // Hard fix gas price
        let gasPrice: bigint | undefined = undefined;

        switch (chain?.id) {
          case 10:
          case 420:
            gasPrice = BigInt("1000000");
            break;

          case 8453:
          case 84531:
            gasPrice = BigInt("10000000");
            break;

          case 919:
            gasPrice = BigInt("1100000000");
            break;
        }

        const tx = await register({
          args: [
            args.name,
            args.owner,
            oracleResponse.data.expiration,
            args.secret,
            args.resolver,
            args.data,
            args.reverseRecord,
            args.ownerControlledFuses,
            oracleResponse.data.signature,
          ],
          // gasPrice,
          value: false && isOP ? 1000000n : 0n,
        });

        try {
          setShowConfirmationDialog(false);
          setIsIndexing(true);
          await publicClient.waitForTransactionReceipt(tx);
        } catch (err) {
          console.error(err);

          setShowConfirmationDialog(true);
          setIsIndexing(false);
        }

        axios
          .post(
            import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + "/referral/register",
            {
              targetDomain: domainName,
            },
            {
              withCredentials: true,
            }
          )
          .catch((err) => console.error(err));

        if (asPrimary) {
          await refreshQuests(domainName, "retropgf3");
        }

        await wait(70000);

        // window.location.reload();
        setIsIndexed(true);
        // onCancelEdit(domainName)
      } catch (err: any) {
        console.error(err);
        if (err?.response?.data?.message) {
          message.error(err?.response?.data?.message);
        } else {
          window.alert(err.message);
          try {
            if (
              address &&
              parseFloat(
                formatEther(await publicClient.getBalance({ address }))
              ) <
                0.0015 + 0.0001 * resolverData.length
            ) {
              message.error("Out of gas. Please refill some gas!");
            } else {
              message.error(
                err.shortMessage || err.message || "Domain registration failed!"
              );
            }
          } catch (err2) {
            console.error(err2);
            message.error(
              err.shortMessage || err.message || "Domain registration failed!"
            );
          }
        }

        throw err;
      }
    },
    [domainName, node, state, address, register, isTakeover]
  );

  const [optidomainsFollowed, setOptidomainsFollowed] = useState(0);
  const [singularFollowed, setSingularFollowed] = useState(0);
  const [discordJoined, setDiscordJoined] = useState(0);

  useEffect(() => {
    if (optidomainsFollowed == 1) {
      setTimeout(() => setOptidomainsFollowed(2), 3000);
    }
  }, [optidomainsFollowed]);

  useEffect(() => {
    if (singularFollowed == 1) {
      setTimeout(() => setSingularFollowed(2), 3000);
    }
  }, [singularFollowed]);

  useEffect(() => {
    if (discordJoined == 1) {
      setTimeout(() => setDiscordJoined(2), 3000);
    }
  }, [discordJoined]);

  useEffect(() => {
    const followedRaw = sessionStorage.getItem(
      "TOWN_DOMAINS_SESSION_CLAIM_FOLLOW:" + sessionId
    );

    if (followedRaw) {
      const followed = JSON.parse(followedRaw);

      setOptidomainsFollowed(followed.optidomainsFollowed);
      setSingularFollowed(followed.singularFollowed);
      setDiscordJoined(followed.discordJoined);
    } else {
      setOptidomainsFollowed(0);
      setSingularFollowed(0);
      setDiscordJoined(0);
    }
  }, [sessionId]);

  useEffect(() => {
    if (optidomainsFollowed || singularFollowed || discordJoined) {
      sessionStorage.setItem(
        "TOWN_DOMAINS_SESSION_CLAIM_FOLLOW:" + sessionId,
        JSON.stringify({
          optidomainsFollowed,
          singularFollowed,
          discordJoined,
        })
      );
    }
  }, [sessionId, optidomainsFollowed, singularFollowed, discordJoined]);

  const { data: remainingBudgetRaw }: any = useContractRead({
    address: OPTownAirdropAddress,
    abi: OPTownAirdropABI,
    functionName: "remainingBudget",
  });

  const remainingBudget = remainingBudgetRaw
    ? parseFloat(formatEther(remainingBudgetRaw as bigint))
    : 0;
  console.log("Remaining Budget", remainingBudget);

  const { data: rewardInfo }: any = useContractRead({
    address: OPTownAirdropAddress,
    abi: OPTownAirdropABI,
    functionName: "calculateReward",
    args: domainName ? [namehash(domainName)] : undefined,
  });

  const { data: multiplierRaw }: any = useContractRead({
    address: OPTownAirdropAddress,
    abi: OPTownAirdropABI,
    functionName: "calculateMultiplier",
    args:
      domainName && rewardInfo
        ? [namehash(domainName), rewardInfo[1]]
        : undefined,
  });

  let multiplier =
    multiplierRaw == 2n ? 2 : parseFloat(formatEther(multiplierRaw || 0n));

  let airdropAmount = rewardInfo
    ? parseFloat(formatEther(rewardInfo[0] as bigint))
    : 0;

  if (multiplier > 0 && airdropAmount == 0) {
    airdropAmount =
      (1 + (suiConnected ? 0.5 : 0) + (aptosConnected ? 0.5 : 0)) * multiplier;
  }

  let airdropBaseAmount = airdropAmount;

  if (!isOP || remainingBudget == 0 /*&& rewardInfo && !rewardInfo[2]*/) {
    multiplier = 0;
    airdropAmount = 0;
  }

  console.log("Airdrop amount", airdropAmount);

  console.log("Multiplier", multiplierRaw);

  const { data: aptosExisting }: any = useContractRead({
    address: "0x888811Da0c852089cc8DFE6f3bAd190a46acaAE6",
    abi: AddressResolverABI,
    functionName: "addr",
    args: domainName ? [namehash(domainName), 637] : undefined,
  });

  const { data: suiExisting }: any = useContractRead({
    address: "0x888811Da0c852089cc8DFE6f3bAd190a46acaAE6",
    abi: AddressResolverABI,
    functionName: "addr",
    args: domainName ? [namehash(domainName), 784] : undefined,
  });

  const { data: baseOwner }: any = useContractRead({
    address: "0x888811b3DFC94566Fc8F6aC5e86069981a50B490",
    abi: [
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "node",
            type: "bytes32",
          },
        ],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "owner",
    args: domainName ? [namehash(domainName)] : undefined,
    chainId: 8453,
  });

  console.log("BASE", baseOwner);

  const baseMinted =
    !isOP ||
    (baseOwner && baseOwner != "0x0000000000000000000000000000000000000000");

  useEffect(() => {
    if (!isConnected) {
      window.scrollTo(0, 0);
    }
  }, [isConnected]);

  return (
    <DomainConnectContext.Provider value={{ domainName, state, dispatch }}>
      <div className="min-h-screen bg-white bg-[url('/images/gradient.png')] bg-cover text-white selection:bg-indigo-500 selection:text-white">
        <div className="fixed z-[100] flex w-full flex-col bg-white/50 p-2 md:p-3 backdrop-blur-xl">
          <div className="flex items-center container mx-auto">
            <div className="flex items-center flex-grow">
              <a href="/" className="flex justify-center gap-2">
                <img src={"/images/logo.svg"} style={{ height: 48 }} />
                <img src={"/images/logo-text.svg"} style={{ height: 48 }} />
              </a>
            </div>
            <ConnectWallet />
          </div>

          <div className="hidden">
            <div className="relative z-50 flex w-full flex-col space-y-4 bg-transparent px-6 pb-2 pt-8">
              <h4 className="mb-2 text-lg">Useful Links:</h4>
              <a
                className="text-gray-300 transition duration-300 hover:text-white"
                href="/#gallery"
              >
                Gallery
              </a>
              <a
                className="text-gray-300 transition duration-300 hover:text-white"
                href="/#features"
              >
                Features
              </a>
              <a
                className="text-gray-300 transition duration-300 hover:text-white"
                href="/#roadmap"
              >
                Roadmap
              </a>
              <a
                className="text-gray-300 transition duration-300 hover:text-white"
                href="/#team"
              >
                Team
              </a>
              <a
                className="text-gray-300 transition duration-300 hover:text-white"
                href="/#faq"
              >
                FAQ
              </a>
              <div className="flex items-center space-x-4">
                <a href="/#">
                  <div className="rounded-full bg-gray-500 hover:bg-gray-600 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 640 512"
                      height={28}
                      width={28}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
                    </svg>
                  </div>
                </a>
                <a href="/#">
                  <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 448 512"
                      height={28}
                      width={28}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                </a>
                <a href="/#">
                  <div className="rounded-full bg-indigo-400 hover:bg-indigo-500 p-2 shadow-lg shadow-white/10 transition duration-300 hover:scale-110">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 512 512"
                      height={28}
                      width={28}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                    </svg>
                  </div>
                </a>
              </div>
              <a href="/#">
                <div className="w-fit rounded-2xl bg-gradient-to-r from-indigo-500 via-teal-600 to-indigo-500 bg-size-200 bg-pos-0 px-4 py-2 font-semibold shadow-lg shadow-white/10 transition-all duration-300 hover:bg-pos-100">
                  View on OpenSea
                </div>
              </a>
            </div>
          </div>
        </div>
        <main className="w-full relative pb-8">
          <div className="relative pt-24 sm:pt-32 z-20">
            <div className="bg-[#161B26] border-[#333741] border rounded-xl mx-4 p-4 sm:hidden block mb-5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_10907_8667)">
                  <path
                    d="M9.99984 13.3327V9.99935M9.99984 6.66602H10.0082M18.3332 9.99935C18.3332 14.6017 14.6022 18.3327 9.99984 18.3327C5.39746 18.3327 1.6665 14.6017 1.6665 9.99935C1.6665 5.39698 5.39746 1.66602 9.99984 1.66602C14.6022 1.66602 18.3332 5.39698 18.3332 9.99935Z"
                    stroke="#F04438"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_10907_8667">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div className="mt-4">
                <div className="text-[#CECFD2] font-semibold text-sm">
                  Best Experience on Desktop
                </div>
                <div className="mt-1 text-[#94969C] font-normal text-sm">
                  For mobile, use Coinbase Wallet browser. Linking Aptos & Sui
                  wallets are desktop-only.
                </div>
              </div>
            </div>

            <div className="container mx-auto px-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-[#101828]">
                  Register .TIA.ID Domain
                </h1>
                <h5 className="text-sm font-normal mt-1 text-[#344054] mb-5">
                  To claim your .town domains, please complete these steps
                </h5>
                <div className="flex flex-col gap-6">
                  <div className="border border-[#D0D5DD]" />
                  {isConnected && address ? (
                    <ConnectWallet />
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                      <div>
                        <h4 className="text-lg font-semibold text-[#101828]">
                          Please connect wallet and verify your account
                        </h4>
                        <h5 className="text-base font-normal mt-1 text-[#344054]">
                          Sign a message in your wallet to verify that you are
                          the owner of this account.
                        </h5>
                      </div>
                      <div className="my-3">
                        <ConnectButton
                          showBalance={{
                            smallScreen: false,
                            largeScreen: true,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <Accordion
                    title="Please login with twitter and join our community"
                    subtitle={
                      isOP
                        ? "(Required) Link your Twitter."
                        : "(Required) Link your Twitter and mint .town on Base"
                    }
                    number="1"
                  >
                    <div className="my-5 flex justify-between">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.5836 36.2492C27.6742 36.2492 35.9305 23.7438 35.9305 12.9024C35.9305 12.5508 35.9227 12.1914 35.907 11.8399C37.5131 10.6784 38.8992 9.23969 40 7.59143C38.5042 8.25693 36.9161 8.69157 35.2898 8.88049C37.0021 7.85411 38.2842 6.24172 38.8984 4.34221C37.2876 5.29686 35.526 5.97029 33.6891 6.33362C32.4514 5.01854 30.815 4.14779 29.0328 3.85602C27.2506 3.56424 25.422 3.86768 23.8296 4.71943C22.2372 5.57117 20.9697 6.92378 20.2231 8.56812C19.4765 10.2125 19.2924 12.057 19.6992 13.8164C16.4375 13.6528 13.2466 12.8054 10.3333 11.3294C7.42004 9.85342 4.84949 7.78166 2.78828 5.24846C1.74067 7.05467 1.42009 9.19201 1.89172 11.2261C2.36334 13.2602 3.59177 15.0383 5.32734 16.1992C4.02438 16.1579 2.74996 15.8071 1.60938 15.1758V15.2774C1.60821 17.1729 2.2635 19.0102 3.46385 20.4772C4.6642 21.9442 6.33554 22.9502 8.19375 23.3242C6.98676 23.6545 5.71997 23.7026 4.49141 23.4649C5.01576 25.095 6.03595 26.5208 7.40962 27.5432C8.78328 28.5656 10.4419 29.1336 12.1539 29.168C9.24737 31.4511 5.65696 32.6895 1.96094 32.6836C1.30548 32.6826 0.650665 32.6424 0 32.5633C3.75476 34.9722 8.12255 36.2516 12.5836 36.2492Z"
                              fill={`${
                                state.find(
                                  (x: ISocialOracleState) =>
                                    x.provider == "com.twitter"
                                )?.displayName
                                  ? "#08a0e9"
                                  : "#98A2B3"
                              }`}
                            />
                          </svg>
                          <div>
                            <div className="font-medium text-[#101828]">
                              Twitter
                            </div>
                            <div className="text-[#667085] text-xs">
                              {state.find(
                                (x: ISocialOracleState) =>
                                  x.provider == "com.twitter"
                              )?.displayName ?? "Not linked"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.twitter"
                      ) ? (
                        <ChainChip amount={1 * multiplier}></ChainChip>
                      ) : (
                        <></>
                      )}

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.twitter"
                      ) ? (
                        <div className="flex justify-center items-center">
                          <img
                            src="/images/check.png"
                            className="w-8 h-8"
                          ></img>
                        </div>
                      ) : (
                        <button
                          className="flex gap-1 py-2.5 px-3.5 items-center rounded-lg bg-[#111111] glowing-btn text-white"
                          onClick={() => {
                            performSocialLogin("twitter");
                          }}
                        >
                          <ChainIcon />
                          Connect
                        </button>
                      )}
                    </div>

                    <div className="border-b border-dashed" />

                    <div className="my-5 flex justify-between">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="40"
                            viewBox="0 0 36 40"
                            fill="#98A2B3"
                          >
                            <path
                              d="M14.4795 16.7793C13.3395 16.7793 12.4395 17.7793 12.4395 18.9993C12.4395 20.2193 13.3595 21.2193 14.4795 21.2193C15.6195 21.2193 16.5195 20.2193 16.5195 18.9993C16.5395 17.7793 15.6195 16.7793 14.4795 16.7793ZM21.7795 16.7793C20.6395 16.7793 19.7395 17.7793 19.7395 18.9993C19.7395 20.2193 20.6595 21.2193 21.7795 21.2193C22.9195 21.2193 23.8195 20.2193 23.8195 18.9993C23.8195 17.7793 22.9195 16.7793 21.7795 16.7793Z"
                              fill="#98A2B3"
                            />
                            <path
                              d="M31.4996 0H4.69961C2.43961 0 0.599609 1.84 0.599609 4.12V31.16C0.599609 33.44 2.43961 35.28 4.69961 35.28H27.3796L26.3196 31.58L28.8796 33.96L31.2996 36.2L35.5996 40V4.12C35.5996 1.84 33.7596 0 31.4996 0ZM23.7796 26.12C23.7796 26.12 23.0596 25.26 22.4596 24.5C25.0796 23.76 26.0796 22.12 26.0796 22.12C25.2596 22.66 24.4796 23.04 23.7796 23.3C22.7796 23.72 21.8196 24 20.8796 24.16C18.9596 24.52 17.1996 24.42 15.6996 24.14C14.5596 23.92 13.5796 23.6 12.7596 23.28C12.2996 23.1 11.7996 22.88 11.2996 22.6C11.2396 22.56 11.1796 22.54 11.1196 22.5C11.0796 22.48 11.0596 22.46 11.0396 22.44C10.6796 22.24 10.4796 22.1 10.4796 22.1C10.4796 22.1 11.4396 23.7 13.9796 24.46C13.3796 25.22 12.6396 26.12 12.6396 26.12C8.21961 25.98 6.53961 23.08 6.53961 23.08C6.53961 16.64 9.41961 11.42 9.41961 11.42C12.2996 9.26 15.0396 9.32 15.0396 9.32L15.2396 9.56C11.6396 10.6 9.97961 12.18 9.97961 12.18C9.97961 12.18 10.4196 11.94 11.1596 11.6C13.2996 10.66 14.9996 10.4 15.6996 10.34C15.8196 10.32 15.9196 10.3 16.0396 10.3C17.2596 10.14 18.6396 10.1 20.0796 10.26C21.9796 10.48 24.0196 11.04 26.0996 12.18C26.0996 12.18 24.5196 10.68 21.1196 9.64L21.3996 9.32C21.3996 9.32 24.1396 9.26 27.0196 11.42C27.0196 11.42 29.8996 16.64 29.8996 23.08C29.8996 23.08 28.1996 25.98 23.7796 26.12V26.12Z"
                              fill="#98A2B3"
                            />
                          </svg>

                          <div>
                            <div className="font-medium text-[#101828]">
                              Discord
                            </div>
                            <div className="text-[#667085] text-xs">
                              {state.find(
                                (x: ISocialOracleState) =>
                                  x.provider == "com.discord"
                              )?.displayName ?? "Not linked"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.discord"
                      ) ? (
                        <ChainChip amount={1 * multiplier}></ChainChip>
                      ) : (
                        <></>
                      )}

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.discord"
                      ) ? (
                        <div className="flex justify-center items-center">
                          <img
                            src="/images/check.png"
                            className="w-8 h-8"
                          ></img>
                        </div>
                      ) : (
                        <button
                          className="flex gap-1 py-2.5 px-3.5 items-center rounded-lg bg-[#111111] glowing-btn text-white"
                          onClick={() => {
                            performSocialLogin("discord");
                          }}
                        >
                          <ChainIcon />
                          Connect
                        </button>
                      )}
                    </div>

                    <div className="border-b border-dashed" />

                    <div className="my-5 flex justify-between">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                          >
                            <g clip-path="url(#clip0_11068_47944)">
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M20 0C8.954 0 0 8.968 0 20.034C0 28.884 5.73 36.394 13.678 39.042C14.678 39.226 15.042 38.608 15.042 38.076C15.042 37.602 15.026 36.34 15.016 34.67C9.452 35.88 8.278 31.984 8.278 31.984C7.37 29.668 6.058 29.052 6.058 29.052C4.242 27.812 6.196 27.836 6.196 27.836C8.202 27.976 9.258 29.9 9.258 29.9C11.042 32.96 13.94 32.076 15.078 31.564C15.262 30.27 15.778 29.388 16.35 28.888C11.91 28.382 7.24 26.662 7.24 18.986C7.24 16.8 8.02 15.01 9.298 13.61C9.092 13.104 8.406 11.066 9.494 8.31C9.494 8.31 11.174 7.77 14.994 10.362C16.6255 9.91703 18.3089 9.69039 20 9.688C21.7 9.696 23.41 9.918 25.008 10.362C28.826 7.77 30.502 8.308 30.502 8.308C31.594 11.066 30.906 13.104 30.702 13.61C31.982 15.01 32.758 16.8 32.758 18.986C32.758 26.682 28.08 28.376 23.626 28.872C24.344 29.49 24.982 30.712 24.982 32.582C24.982 35.258 24.958 37.42 24.958 38.076C24.958 38.612 25.318 39.236 26.334 39.04C30.3166 37.7042 33.7787 35.1506 36.231 31.7401C38.6832 28.3296 40.0017 24.2346 40 20.034C40 8.968 31.044 0 20 0Z"
                                fill="#98A2B3"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_11068_47944">
                                <rect width="40" height="40" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>

                          <div>
                            <div className="font-medium text-[#101828]">
                              Github
                            </div>
                            <div className="text-[#667085] text-xs">
                              {state.find(
                                (x: ISocialOracleState) =>
                                  x.provider == "com.github"
                              )?.displayName ?? "Not linked"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.github"
                      ) ? (
                        <ChainChip amount={1 * multiplier}></ChainChip>
                      ) : (
                        <></>
                      )}

                      {state.find(
                        (x: ISocialOracleState) => x.provider == "com.github"
                      ) ? (
                        <div className="flex justify-center items-center">
                          <img
                            src="/images/check.png"
                            className="w-8 h-8"
                          ></img>
                        </div>
                      ) : (
                        <button
                          className="flex gap-1 py-2.5 px-3.5 items-center rounded-lg bg-[#111111] glowing-btn text-white"
                          onClick={() => {
                            performSocialLogin("github");
                          }}
                        >
                          <ChainIcon />
                          Connect
                        </button>
                      )}
                    </div>

                    {/* <div className="flex flex-col gap-4 text-[#F5F5F6]">
                      <div className="text-[#CECFD2] text-sm">
                        Finish all steps
                      </div>

                      {isOP && (
                        <>
                          <div className="flex justify-between items-center">
                            <div>Mint domain on BASE</div>

                            {baseMinted ? (
                              <div className="flex justify-center items-center">
                                <img
                                  src="/images/check.png"
                                  className="w-8 h-8"
                                ></img>
                              </div>
                            ) : (
                              <button
                                className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex gap-1"
                                onClick={() => switchNetwork?.(8453)}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.4258 2.5C16.3609 2.5 18.3332 5.29375 18.3332 7.9C18.3332 13.1781 10.148 17.5 9.99984 17.5C9.85169 17.5 1.6665 13.1781 1.6665 7.9C1.6665 5.29375 3.63873 2.5 6.57391 2.5C8.2591 2.5 9.36095 3.35312 9.99984 4.10312C10.6387 3.35312 11.7406 2.5 13.4258 2.5Z"
                                    stroke="#CECFD2"
                                    stroke-width="1.66667"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                                Mint
                              </button>
                            )}
                          </div>

                          <hr className="border-dashed border-[#333741]" />
                        </>
                      )}

                      <div className="flex justify-between items-center">
                        <div>Follow Opti.domains</div>

                        {optidomainsFollowed == 2 ? (
                          <div className="flex justify-center items-center">
                            <img
                              src="/images/check.png"
                              className="w-8 h-8"
                            ></img>
                          </div>
                        ) : (
                          <a
                            href="https://twitter.com/optidomains"
                            target="_blank"
                            className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex gap-1"
                            onClick={() => setOptidomainsFollowed(1)}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.4258 2.5C16.3609 2.5 18.3332 5.29375 18.3332 7.9C18.3332 13.1781 10.148 17.5 9.99984 17.5C9.85169 17.5 1.6665 13.1781 1.6665 7.9C1.6665 5.29375 3.63873 2.5 6.57391 2.5C8.2591 2.5 9.36095 3.35312 9.99984 4.10312C10.6387 3.35312 11.7406 2.5 13.4258 2.5Z"
                                stroke="#CECFD2"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            Follow
                          </a>
                        )}
                      </div>
                      <hr className="border-dashed border-[#333741]" />
                      <div className="flex justify-between items-center">
                        <div>Follow Singular domains</div>

                        {singularFollowed == 2 ? (
                          <div className="flex justify-center items-center">
                            <img
                              src="/images/check.png"
                              className="w-8 h-8"
                            ></img>
                          </div>
                        ) : (
                          <a
                            href="https://twitter.com/singulardomains"
                            target="_blank"
                            className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex gap-1"
                            onClick={() => setSingularFollowed(1)}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.4258 2.5C16.3609 2.5 18.3332 5.29375 18.3332 7.9C18.3332 13.1781 10.148 17.5 9.99984 17.5C9.85169 17.5 1.6665 13.1781 1.6665 7.9C1.6665 5.29375 3.63873 2.5 6.57391 2.5C8.2591 2.5 9.36095 3.35312 9.99984 4.10312C10.6387 3.35312 11.7406 2.5 13.4258 2.5Z"
                                stroke="#CECFD2"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            Follow
                          </a>
                        )}
                      </div>
                      <hr className="border-dashed border-[#333741]" />
                      <div className="hidden sm:flex justify-between items-center">
                        <div>Join Opti.domains Discord</div>

                        {discordJoined == 2 ? (
                          <div className="flex justify-center items-center">
                            <img
                              src="/images/check.png"
                              className="w-8 h-8"
                            ></img>
                          </div>
                        ) : (
                          <a
                            href="https://discord.com/invite/rHCZdyTBAF"
                            target="_blank"
                            className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex gap-1"
                            onClick={() => setDiscordJoined(1)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M17.5 7.5L17.5 2.5M17.5 2.5H12.5M17.5 2.5L10.8333 9.16667M8.33333 4.16667H6.5C5.09987 4.16667 4.3998 4.16667 3.86502 4.43915C3.39462 4.67883 3.01217 5.06129 2.77248 5.53169C2.5 6.06647 2.5 6.76654 2.5 8.16667V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H11.8333C13.2335 17.5 13.9335 17.5 14.4683 17.2275C14.9387 16.9878 15.3212 16.6054 15.5608 16.135C15.8333 15.6002 15.8333 14.9001 15.8333 13.5V11.6667"
                                stroke="#CECFD2"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            Join
                          </a>
                        )}
                      </div>
                      <div className="flex sm:hidden justify-between items-center">
                        <div>Follow Bored Town</div>

                        {discordJoined == 2 ? (
                          <div className="flex justify-center items-center">
                            <img
                              src="/images/check.png"
                              className="w-8 h-8"
                            ></img>
                          </div>
                        ) : (
                          <a
                            href="https://twitter.com/boredtownnft"
                            target="_blank"
                            className="py-2.5 px-3.5 bg-[#161B26] border border-[#333741] text-[#CECFD2] rounded-lg flex gap-1"
                            onClick={() => setDiscordJoined(1)}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.4258 2.5C16.3609 2.5 18.3332 5.29375 18.3332 7.9C18.3332 13.1781 10.148 17.5 9.99984 17.5C9.85169 17.5 1.6665 13.1781 1.6665 7.9C1.6665 5.29375 3.63873 2.5 6.57391 2.5C8.2591 2.5 9.36095 3.35312 9.99984 4.10312C10.6387 3.35312 11.7406 2.5 13.4258 2.5Z"
                                stroke="#CECFD2"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            Follow
                          </a>
                        )}
                      </div>
                    </div> */}
                  </Accordion>

                  {isOP ? (
                    <div className="hidden sm:block">
                      <Accordion
                        title="Link Wallets"
                        subtitle="Optionally link Aptos and Sui wallets to qualify for an OP token reward."
                        number="2"
                      >
                        <CelestiaButton
                          opAmount={0.5 * multiplier}
                          existing={aptosExisting}
                        />
                        <hr className="border-dashed border-[#333741] my-4" />
                        <OpKitButton
                          opAmount={0.5 * multiplier}
                          existing={suiExisting}
                        />
                      </Accordion>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
              <div
                className="w-full md:w-[440px]"
                // style={{
                //   visibility:
                //     isConnected &&
                //     state.find(
                //       (x: ISocialOracleState) => x.provider == "com.twitter"
                //     )
                //       ? "visible"
                //       : "hidden",
                // }}
              >
                <CardDomain
                  domainChainId={
                    chain?.id ??
                    parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!)
                  }
                  domainName={domainName}
                  domainDisplayName={domainName || "<YOURNAME>"}
                  inputProfiles={stateWithExisting(
                    state,
                    aptosExisting,
                    suiExisting
                  ).map((x: any) => ({
                    ...x,
                    node: ethers.utils.namehash(domainName),
                    chainId:
                      chain?.id ??
                      parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!),
                    uid: "",
                  }))}
                  oneColumn={true}
                  evmAttest={evmAttest}
                  opAmount={multiplier == 0 ? 0 : airdropAmount}
                  opBaseAmount={airdropBaseAmount}
                  isOP={isOP}
                  baseMinted={baseMinted}
                  followed={
                    optidomainsFollowed == 2 &&
                    singularFollowed == 2 &&
                    discordJoined == 2
                  }
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <RegisterConfirmationModal
        show={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={(asPrimary: boolean) => registerAction(asPrimary)}
        state={stateWithExisting(state, aptosExisting, suiExisting)}
        chainId={chain?.id ?? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!)}
        domainName={domainName}
        domainDisplayName={domainName || "<YOURNAME>.town"}
      ></RegisterConfirmationModal>

      <Modal
        open={isIndexing}
        onOk={() => {}}
        onCancel={() => {}}
        footer={[]}
        closable={false}
        maskClosable={false}
      >
        <div className="font-semibold text-center text-lg">
          Transaction Details
        </div>
        <div className="mt-8 space-y-4">
          <img
            src="/images/op-success.png"
            alt=""
            className="w-28 h-28 mx-auto"
          />
          <div className="text-center text-lg font-semibold text-[#F5F5F6]">
            Congratulations!{" "}
            <span className="text-[#94969C]">{domainName}</span> has been
            registered on {isOP ? "Optimism" : "Base"}.
          </div>
          {isOP && (
            <div className="text-[#94969C] text-xs text-center">
              Want to earn more reward? Mint on BASE 👇
            </div>
          )}
          {!isOP && (
            <div className="text-[#94969C] text-xs text-center">
              Want to earn more reward? Mint on OP 👇
            </div>
          )}
        </div>
        <div className="mt-5 space-y-3">
          {isOP && (
            <button
              className="font-semibold bg-[#0A59FF] rounded-lg px-4 py-2.5 shadow-sm w-full mt-5"
              onClick={() => {
                switchNetwork?.(8453);
                setIsIndexing(false);
              }}
            >
              Mint on BASE for more reward
            </button>
          )}
          {!isOP && (
            <button
              className="font-semibold bg-[#FF0420] rounded-lg px-4 py-2.5 shadow-sm w-full mt-5"
              onClick={() => {
                switchNetwork?.(10);
                setIsIndexing(false);
              }}
            >
              Mint on OP for more reward
            </button>
          )}
          <a href="/">
            <button className="font-semibold bg-[#161B26] rounded-lg px-4 py-2.5 shadow-sm w-full mt-5 border border-[#333741]">
              My domains
            </button>
          </a>
        </div>
      </Modal>
    </DomainConnectContext.Provider>
  );
}
