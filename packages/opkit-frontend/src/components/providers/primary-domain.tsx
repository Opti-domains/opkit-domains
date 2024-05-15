import { ethers } from "ethers";
import { CONTRACTS } from "src/utils/contracts";
import { useAccount, useContractRead } from "wagmi";
import PublicResolverFacetABI from "../../abi/PublicResolverFacet.json";
import { PrimaryDomainContext } from "src/context/DomainConnectContext";
import { ReactNode } from "react";

export default function PrimaryDomainProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { address, isConnected } = useAccount();

  const node = ethers.utils.namehash(
    (
      (address && isConnected ? address.substring(2) + "." : "") + "addr.reverse"
    ).toLowerCase()
  );

  const {
    data: resolver,
    isError: isResolverError,
    isLoading: isResolverLoading,
  } = useContractRead({
    address: address && isConnected ? CONTRACTS.ENSRegistry.address : undefined,
    abi: CONTRACTS.ENSRegistry.abi,
    functionName: "resolver",
    args: [node],
  });

  const {
    data: primaryDomain,
    isError,
    isLoading,
  } = useContractRead({
    address:
      address &&
      isConnected &&
      !isResolverError &&
      !isResolverLoading &&
      (resolver as any) != "0x0000000000000000000000000000000000000000"
        ? (resolver as any)
        : undefined,
    abi: PublicResolverFacetABI,
    functionName: "name",
    args: [node],
  });

  return (
    <PrimaryDomainContext.Provider value={(primaryDomain as string) || null}>
      {children}
    </PrimaryDomainContext.Provider>
  );
}
