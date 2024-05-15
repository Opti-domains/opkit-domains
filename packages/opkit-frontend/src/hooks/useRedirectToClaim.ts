import { useAccount, useContractRead } from "wagmi";
import OPTownAirdropABI from "../abi/OPTownAirdrop.json";
import { useEffect } from "react";

const OPTownAirdropAddress = "0x2b091f2cac357613F3887eB49B84142993ad8376";

export default function useRedirectToClaim() {
  const { address } = useAccount()

  const { data: amount, isLoading }: any = useContractRead({
    address: OPTownAirdropAddress,
    abi: OPTownAirdropABI,
    functionName: "addressDistributed",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (false && address && !isLoading) {
      if (amount == 0n) {
        if (window.location.pathname != '/claim') {
          window.location.href = "/claim"
        }
      }
    }
  }, [address, amount, isLoading])
}