import type { Chain } from 'wagmi';
import { mainnet, useEnsName, useNetwork, useContractRead, usePublicClient } from 'wagmi';
import packet from 'dns-packet';

// Same address across chains
const UNIVERSAL_ENS_REGISTRY = '0x8888110038E46D4c4ba75aFF88EaAC6f9aA537c1';
const UNIVERSAL_ENS_REGISTRY_OPERATOR =
  '0x888811AC3DC01628eBD22b1Aa01a35825aD997e8';

const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'getReverseUniversalResolver',
    outputs: [
      {
        internalType: 'contract UniversalResolverTemplate',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'getRegistryByName',
    outputs: [
      {
        internalType: 'contract ENS',
        name: 'registry',
        type: 'address',
      },
      {
        internalType: 'contract UniversalResolverTemplate',
        name: 'universalResolver',
        type: 'address',
      },
      {
        internalType: 'contract Resolver',
        name: 'resolver',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'node',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'finalOffset',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

interface UseUniversalEnsReverseResolverProps {
  address?: string;
  chainId?: number;
  operator?: string;
}

export function useUniversalEnsReverseResolver({
  address,
  chainId,
  operator = UNIVERSAL_ENS_REGISTRY_OPERATOR,
}: UseUniversalEnsReverseResolverProps) {
  return useContractRead<typeof ABI, string, `0x${string}`>({
    abi: ABI,
    address: address && chainId ? UNIVERSAL_ENS_REGISTRY : undefined,
    args: [address, operator],
    chainId,
    functionName: 'getReverseUniversalResolver',
  });
}

interface UseUniversalEnsRegistryResolverProps {
  name?: string | null;
  chainId?: number;
  operator?: string;
}

export function useUniversalEnsRegistryResolver({
  chainId,
  name,
  operator = UNIVERSAL_ENS_REGISTRY_OPERATOR,
}: UseUniversalEnsRegistryResolverProps) {
  return useContractRead<
    typeof ABI,
    string,
    [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, bigint]
  >({
    abi: ABI,
    address: name && chainId ? UNIVERSAL_ENS_REGISTRY : undefined,
    args: [
      operator,
      '0x' + (packet as any).name.encode(name || '').toString('hex'),
    ],
    chainId,
    functionName: 'getRegistryByName',
  });
}


export function useMainnet() {
  const chainId = mainnet.id;

  // Because the generic for 'useProvider' is defaulting to 'unknown'
  // and the return type is being resolved as 'any', we're having to
  // manually define the Provider type, so this code is more defensive
  // than necessary in case the manual typing is ever incorrect.
  // If we're unable to resolve a list of chains, or the chains are
  // an invalid type, we'll silently bail out.
  // @ts-expect-error
  const provider = usePublicClient<{ chains?: Chain[] }>();
  const chains = Array.isArray(provider.chains) ? provider.chains : [];
  const enabled = chains?.some((chain: Chain) => chain?.id === chainId);

  return { chainId, enabled };
}


export function useMainnetEnsName(address: `0x${string}` | undefined) {
  const { chain } = useNetwork();
  const { chainId: mainnetChainId, enabled } = useMainnet();

  const {
    data: universalResolver,
    isError,
    isLoading,
  } = useUniversalEnsReverseResolver({ address, chainId: chain?.id });

  console.log(universalResolver, isError, isLoading, address, chain?.id)

  const { data: ensName } = useEnsName({
    address:
      isLoading ||
      isError ||
      !universalResolver ||
      universalResolver === '0x0000000000000000000000000000000000000000'
        ? undefined
        : address,
    chainId: chain?.id,
    // universalResolverAddress: universalResolver,
  });

  const { data: ensNameMainnet } = useEnsName({
    address,
    chainId: mainnetChainId,
    enabled,
  });

  if (isLoading) return undefined;
  if (
    isError ||
    !universalResolver ||
    universalResolver === '0x0000000000000000000000000000000000000000'
  )
    return ensNameMainnet;
  return ensName;
}
