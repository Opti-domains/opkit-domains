import { ethers } from "ethers";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  ISocialOracleState,
  socialOracleReducer,
} from "src/context/SocialOracleContext";
import { v4 as uuid } from "uuid";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Modal, Spin, message } from "antd";
import axios from "axios";
import questNLogo from "src/assets/social-button/questn.png";
import { DomainConnectContext } from "src/context/DomainConnectContext";
import useAccountSiwe from "src/hooks/useAccountSiwe";
import { CONTRACTS } from "src/utils/contracts";
import { IS_DEV } from "src/utils/env";
import { calculateRefDomain, isWhitelistedCampaign } from "src/utils/marketing";
import { refreshQuests } from "src/utils/quests";
import { generateSignMessage } from "src/utils/signMessage";
import { wait } from "src/utils/wait";
import { formatEther, namehash } from "viem";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import ActionButton from "../action-buttons/ActionButton";
import BoredTownQuestButton from "../action-buttons/quests/BoredTownQuestButton";
import DiscordJoinQuestButton from "../action-buttons/quests/DiscordJoinQuestButton";
import TownHolderQuestButton from "../action-buttons/quests/TownHolderQuestButton";
import TwitterFollowQuestButton from "../action-buttons/quests/TwitterFollowQuestButton";
import DiscordButton from "../action-buttons/social/DiscordButton";
import GithubButton from "../action-buttons/social/GithubButton";
import GoogleButton from "../action-buttons/social/GoogleButton";
import LineButton from "../action-buttons/social/LineButton";
import LinkedInButton from "../action-buttons/social/LinkedInButton";
import MicrosoftButton from "../action-buttons/social/MicrosoftButton";
import TwitterButton from "../action-buttons/social/TwitterButton";
import AptosButton from "../action-buttons/wallets/AptosButton";
import FreedomWalletButton from "../action-buttons/wallets/FreedomWalletButton";
import SuiButton from "../action-buttons/wallets/SuiButton";
import ReferralTwitterShareButton from "../marketing/ReferralTwitterShareButton";
import { DomainCard } from "./DomainCard";
import RegisterConfirmationDialog from "./RegisterConfirmationDialog";

export default function RegisterFirstDomain({
  editMode,
  onCancelEdit,
}: {
  editMode: boolean;
  onCancelEdit: () => any;
}) {
  const publicClient = usePublicClient();
  const {
    data: walletClient,
    isError: isWalletClientError,
    isLoading: isWalletClientLoading,
  } = useWalletClient();

  const { address, isConnected } = useAccountSiwe();
  const { chain } = useNetwork();

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

  const [domainName, setDomainName] = useState("");
  const [state, dispatch] = useReducer(socialOracleReducer, []);
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

  useEffect(() => {
    dispatch({
      type: "RESET",
    });
    setQuestsPassed([]);
    setDomainName("");
  }, [isConnected, address, chain]);

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
      const nonce = uuid();

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

      window.open(url);
    },
    [domainName]
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

    if (isOP && !discordConnected) {
      message.error("Please connect your discord");
      window.alert("Please connect your discord");
      return;
    }

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
        for (let action of state) {
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
          // value: false && isOP ? parseEther(`${0.0004 + 0.0001 * args.data.length}`) : 1000000n,
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

  // Testing reverse resolver
  // const testName = useMainnetEnsName('0xf01Dd015Bc442d872275A79b9caE84A6ff9B2A27')
  // console.log(testName)

  return (
    <DomainConnectContext.Provider value={{ domainName, state, dispatch }}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div style={{ maxWidth: 600 }}>
          <div>
            To {editMode ? "edit records" : "claim your .town domains"}, please
            complete these steps
          </div>
          {/* <div className="mt-3">To get started, connect your wallet</div> */}
          <div className="mt-5">
            <div>
              <ConnectButton
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
          </div>
          {isConnected && (
            <>
              <div className="mt-5 mb-2 text-xl">
                <b>Social Profiles</b>
              </div>
              <div className="">
                {isOP ? (
                  <div>
                    <div>(Required) Link your Twitter and Discord.</div>
                    <div>
                      Optionally link more social profiles for further reward!
                    </div>
                  </div>
                ) : (
                  `Connect your X or Twitter account to claim your domain name on ${chain?.name}.`
                )}
              </div>
              <div
                className={
                  isOP ? "grid gap-6 grid-cols-3 sm:grid-cols-4 my-5" : "my-5"
                }
              >
                <div className="flex justify-center">
                  <TwitterButton
                    state={state}
                    onClick={() => performSocialLogin("twitter")}
                    variant="circle"
                  />
                </div>
                {isOP && (
                  <>
                    <div className="flex justify-center">
                      <DiscordButton
                        state={state}
                        onClick={() => performSocialLogin("discord")}
                        variant="circle"
                      />
                    </div>
                    <div className="flex justify-center">
                      <GoogleButton
                        state={state}
                        onClick={() => performSocialLogin("google")}
                        variant="circle"
                      />
                    </div>
                    <div className="flex justify-center">
                      <MicrosoftButton
                        state={state}
                        onClick={() => performSocialLogin("microsoft")}
                        variant="circle"
                      />
                    </div>
                    <div className="flex justify-center">
                      <GithubButton
                        state={state}
                        onClick={() => performSocialLogin("github")}
                        variant="circle"
                      />
                    </div>
                    <div className="flex justify-center">
                      <LinkedInButton
                        state={state}
                        onClick={() => performSocialLogin("linkedin")}
                        variant="circle"
                      />
                    </div>
                    {/* <div className="flex justify-center">
                    <FacebookButton state={state} onClick={() => performSocialLogin('facebook')} variant="circle" />
                  </div> */}
                    <div className="flex justify-center">
                      <LineButton
                        state={state}
                        onClick={() => performSocialLogin("line")}
                        variant="circle"
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {false && twitterAndDiscordConnected && (
            <>
              <div className="mt-5">
                {isOP
                  ? "We kindly request you to join our discord community and follow our twitter account to mint your domain name"
                  : IS_DEV
                  ? "Mint .town on Optimism Goerli to claim another on Base Goerli"
                  : "Mint .town on Optimism to claim another on Base"}
              </div>

              {isOP ? (
                <div className="mt-5">
                  {/* <div className="mb-3">
                    <TwitterFollowQuestButton username="optidomains" />
                  </div> */}
                  {/* <div className="mb-3">
                    <TwitterFollowQuestButton node={node} username="BoredTownNFT" onPassed={() => passQuest(2)} />
                  </div> */}
                  {/* <div className="mb-3">
                    <TwitterFollowQuestButton node={node} username="optidomains" onPassed={() => passQuest(3)} />
                  </div> */}

                  <div className="mb-3">
                    <TwitterFollowQuestButton
                      username="optidomains"
                      node={node}
                    />
                  </div>

                  {IS_DEV && (
                    <>
                      <div className="mb-3">
                        <TwitterFollowQuestButton
                          username="BoredTownNFT"
                          node={node}
                        />
                      </div>
                      <div className="mb-3">
                        <TwitterFollowQuestButton
                          username="BoredTownArtist"
                          node={node}
                        />
                      </div>
                      <div className="mb-3">
                        <TwitterFollowQuestButton
                          username="towndomains"
                          node={node}
                        />
                      </div>

                      {QUEST_RAND_CHOM ? (
                        <div className="mb-3">
                          <TwitterFollowQuestButton
                            username="Chomtana"
                            node={node}
                          />
                        </div>
                      ) : (
                        <div className="mb-3">
                          <TwitterFollowQuestButton
                            username="OptiAlert"
                            node={node}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="mb-3">
                    <DiscordJoinQuestButton
                      node={node}
                      onPassed={() => passQuest(2)}
                    />
                  </div>
                  {/* <div className="mb-3">
                    <GuildXYZQuestButton node={node} onPassed={() => passQuest(3)} />
                  </div> */}

                  {!IS_DEV && (
                    <div className="mb-3">
                      <BoredTownQuestButton
                        node={node}
                        onPassed={() => passQuest(1)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5">
                  <TownHolderQuestButton
                    node={node}
                    onPassed={() => passQuest(1)}
                  />
                </div>
              )}
            </>
          )}
          {isOP && (
            <>
              <div className="mt-5 text-xl">
                <b>Wallets</b>
              </div>
              <div className="mt-2">
                <div>
                  Connect both Sui and Aptos wallets to receive 4 OP for the
                  first 2,500 minters.
                </div>
                <div>
                  Optionally connect Freedom Wallet for $BED airdrop in the
                  future.
                </div>
              </div>
              <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 my-5">
                <div className="flex justify-center">
                  <AptosButton variant="circle" />
                </div>
                <div className="flex justify-center">
                  <SuiButton variant="circle" />
                </div>
                <div className="flex justify-center">
                  <FreedomWalletButton variant="circle" />
                </div>
                {/* <div className="flex justify-center">
                  <SolanaButton variant="circle" />
                </div> */}
              </div>
            </>
          )}
          {isConnected && (
            <div className="mt-8">
              <div
                className={
                  "text-center p-4 text-lg font-bold hover:scale-105 transition rounded-xl hover:cursor-pointer glowing-btn " +
                  (isRegisterSigning ? " pointer-event-none opacity-60" : "")
                }
                onClick={() => evmAttest()}
              >
                {isRegisterSigning ? (
                  <Spin />
                ) : isOP ? (
                  "Register Domain"
                ) : (
                  "Claim Domain"
                )}
              </div>
            </div>
          )}

          {editMode && (
            <div
              className="underline hover:cursor-pointer hover:opacity-90 mt-5 text-center"
              onClick={() => onCancelEdit()}
            >
              Cancel editing records
            </div>
          )}
        </div>

        <div className="lg:flex justify-center hidden">
          <div style={{ width: "90%", maxWidth: 500 }}>
            <div style={{ position: "sticky", top: 120 }}>
              <DomainCard
                domainChainId={
                  chain?.id ?? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!)
                }
                domainName={domainName}
                domainDisplayName={domainName || "<YOURNAME>.town"}
                inputProfiles={state.map((x: any) => ({
                  ...x,
                  node: ethers.utils.namehash(domainName),
                  chainId:
                    chain?.id ??
                    parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!),
                  uid: "",
                }))}
                oneColumn={true}
              />
            </div>
          </div>
        </div>
      </div>

      <RegisterConfirmationDialog
        show={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={(asPrimary: boolean) => registerAction(asPrimary)}
        state={state}
        chainId={chain?.id ?? parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID!)}
        domainName={domainName}
        domainDisplayName={domainName || "<YOURNAME>.town"}
      ></RegisterConfirmationDialog>

      <Modal
        title="Please do one of the following tasks"
        open={showWhitelistDialog}
        onOk={() => {}}
        onCancel={() => {}}
        footer={[]}
        closable={false}
        maskClosable={false}
        style={{ top: 20 }}
      >
        <div className="mb-3 text-sm">
          <i>(After finished, press "Continue" at the bottom)</i>
        </div>

        <div className="font-bold mb-3">
          Complete ".town Followers" on QuestN
        </div>

        <div className="mb-5">
          <ActionButton
            color="black"
            background="#C8FF04"
            icon={questNLogo}
            onClick={() =>
              window.open("https://app.questn.com/quest/804569164202799460")
            }
          >
            Complete ".town Followers"
          </ActionButton>
        </div>

        <div className="font-bold">Or buy a Bored Town or Tripster NFT</div>
        <div className="text-sm text-gray-400 mb-3">
          Hint: Some NFT floor is below 0.0003 ETH
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          <a href="https://zonic.app/collection/boredtown" target="_blank">
            <img
              src={"/images/collections/boredtown.jpeg"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://zonic.app/collection/zksync/0xfD41c554C471Ca9dB312373BCeB55B0317E06844"
            target="_blank"
          >
            <img
              src={"/images/collections/zkalien.gif"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a href="https://opensea.io/collection/novanaut" target="_blank">
            <img
              src={"/images/collections/novanaut.png"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a href="https://opensea.io/collection/robonautnft" target="_blank">
            <img
              src={"/images/collections/robonaut.jpg"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a href="https://opensea.io/collection/nova-ape" target="_blank">
            <img
              src={"/images/collections/novaape.png"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://opensea.io/collection/tripster-travel-pass"
            target="_blank"
          >
            <img
              src={"/images/collections/tripster-travel-pass.png"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://opensea.io/collection/tripsterwally-op"
            target="_blank"
          >
            <img
              src={"/images/collections/tripster-wally-op.jpeg"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://opensea.io/collection/tripsterwally-base"
            target="_blank"
          >
            <img
              src={"/images/collections/tripster-wally-base.jpeg"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://opensea.io/collection/tripster-x-wally-zora"
            target="_blank"
          >
            <img
              src={"/images/collections/tripster-wally-zora.png"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>

          <a
            href="https://zonic.app/collection/tripsterwally-zksync"
            target="_blank"
          >
            <img
              src={"/images/collections/tripster-wally-zksync.jpeg"}
              className="rounded-xl hover:scale-105 transition"
            ></img>
          </a>
        </div>

        <div
          className={
            "text-center p-3 text-lg font-bold hover:scale-105 transition rounded-xl hover:cursor-pointer glowing-btn " +
            (isRegisterSigning ? " pointer-event-none opacity-60" : "")
          }
          onClick={async () => {
            const whitelisted = await checkWhitelist();
            if (whitelisted) {
              setShowWhitelistDialog(false);
              setShowConfirmationDialog(true);
            } else {
              message.error("A task is not finished yet");
            }
          }}
        >
          {isRegisterSigning ? <Spin /> : "Continue"}
        </div>
      </Modal>

      {/* TEMPORARY: Indexing Dialog */}
      <Modal
        title="Minting Rewards!"
        open={isIndexing}
        onOk={() => {}}
        onCancel={() => {}}
        footer={[]}
        closable={false}
        maskClosable={false}
      >
        <div className="flex flex-col justify-center items-center">
          {IS_DEV ? (
            <div className="my-6">
              {/* <div className="text-center mb-3 text-amber-200">
                Sorry, Testnet is temporary unavailable to prepare for mainnet.
              </div> */}

              <div className="text-center mb-3 text-amber-200">
                Don't forget to complete another QuestN quest
              </div>
              <div className="text-center">
                To get WHITELISTED to mint in the mainnet 👇
              </div>
            </div>
          ) : (
            <div className="my-6">
              <div className="text-center mb-3 text-lg text-amber-200">
                Congratulations on your minting!
              </div>
              <div className="text-center">
                If you are the the first 2500 minters, make sure to
                <br />
                connect your Sui and Aptos wallet to get
              </div>
              <div className="text-center my-1 mb-3">
                <span className="text-2xl">4 OP</span> (approx. June 2024)
              </div>
              {/* <div className="text-center mb-3">Unlock once we have received RetroPGF</div> */}
              <div className="text-center text-lg mb-1 text-amber-200">
                Want to earn more reward?
              </div>
              <div className="text-center text-amber-200">
                Spread the words by clicking the button below 👇
              </div>
            </div>
          )}

          {IS_DEV ? (
            <div className="mb-6">
              <a
                href="https://app.questn.com/quest/804569164202799460"
                target="_blank"
              >
                <div
                  className="rounded-xl px-6 py-3 text-lg text-center text-black font-bold hover:cursor-pointer hover:scale-110"
                  style={{ backgroundColor: "#CAFF04" }}
                >
                  Get WHITELIST
                </div>
              </a>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <ReferralTwitterShareButton
                  link={
                    IS_DEV
                      ? "https://town-testnet.opti.domains"
                      : `https://town.opti.domains/#${calculateRefDomain(
                          domainName,
                          []
                        )}`
                  }
                  variant="large"
                ></ReferralTwitterShareButton>
              </div>

              {/* <div className="mt-2">
              And delegate your OP to us
            </div>

            <div className="mt-3 mb-6">
              <div onClick={() => delegate()} className={"w-full text-center text-lg bg-amber-600 p-3 rounded-xl hover:cursor-pointer transition hover:scale-105" + (isDelegating || isDelegated ? " pointer-events-none opacity-80" : "")}>
                {isDelegating ? "Delegating..." : (isDelegated ? "Thank you <3" : "Delegate to Opti.Domains")}
              </div>
            </div> */}
            </>
          )}

          {isIndexed ? (
            <div
              className="text-xl underline hover:cursor-pointer hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Continue
            </div>
          ) : (
            <div className="text-xl">
              <Spin size="large" /> <span className="ml-3">Indexing...</span>
            </div>
          )}
        </div>
      </Modal>
    </DomainConnectContext.Provider>
  );
}
