

// TODO: Move social oracle integration logic to this for better seperation

import axios from "axios"
import { ethers } from "ethers"
import { request, gql } from 'graphql-request'

export interface SocialProfileSimple {
  node: string
  provider: string
  identity: string
  displayName: string
  chainId: number
  uid: string
}

const SPECIAL_WALLET_MAPPING: {[x: string]: string} = {
  '0x580f5c6bb93ccbed18513291617ba35c42e29dfa5b656dc8c4f79b1264ba20f5': 'freedom.temporary.wallet.op',
}

const SOCIAL_PROFILE_QUERY = gql`
  query OptiDomainsText($walletAddress: String) {
    attestations(
      where: {
        schemaId: {
          equals: "0x761c866d6c1cbdf2d58693047f65c5be130449c850640449a84c5962b34b397b",
        },
        attester: {
          equals: "0x8888119526F2AAE3525a3820F8893424E74E7af2"
        },
        recipient: {
          equals: $walletAddress
        },
        revoked: {
          equals: false
        }
      },
      orderBy: {
        time: asc
      }
    ) {
      id
      attester
      recipient
      time
      decodedDataJson
    }
  }

`

export async function getAssociatedSocialProfiles(walletAddress: string, node: string, chainId: number): Promise<SocialProfileSimple[]> {
  // Try fetching data from on-chain attestations first

  try {
    const finalResponse: SocialProfileSimple[] = []

    const gqlResponse: any = await request({
      url: import.meta.env.VITE_EAS_SCAN + "/graphql",
      document: SOCIAL_PROFILE_QUERY,
      variables: {
        walletAddress,
      }
    })
  
    console.log(gqlResponse)
  
    for (let attestation of gqlResponse.attestations) {
      const data = JSON.parse(attestation.decodedDataJson)
  
      if (data[0].value.value == node) {
        finalResponse.push({
          node,
          provider: data[1].value.value,
          identity: data[2].value.value,
          displayName: data[2].value.value,
          chainId,
          uid: attestation.id
        })
      }
  
    }

    console.log(finalResponse)

    // This need merging display name for better UX
    try {
      const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/attestation/social', {
        params: {
          node,
          chainId,
          simple: 1,
          isTestnet: import.meta.env.VITE_DEV_MODE,
        }
      })

      const oracleRecords: SocialProfileSimple[] = response.data;

      for (const record of oracleRecords) {
        const matchedRecord = finalResponse.find(x => x.node == record.node && x.identity == record.identity && x.provider == record.provider)

        if (matchedRecord) {
          matchedRecord.displayName = record.displayName
        } else {
          finalResponse.push(record)
        }
      }
    } catch (err) {
      console.error(err)
    }
  
    return finalResponse
  } catch (err) {
    console.error(err)

    const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/attestation/social', {
      params: {
        node,
        chainId,
        simple: 1,
        isTestnet: import.meta.env.VITE_DEV_MODE,
      }
    })
  
    return response.data
  }
}

const SOCIAL_WALLET_QUERY = gql`
  query OptiDomainsText($walletAddress: String) {
    attestations(
      where: {
        schemaId: {
          equals: "0xf5a986ee06d4fbace843ad0a2c02c7fd87153db91e5a8e8d6ec413480121e6da",
        },
        attester: {
          equals: "0x8888119526F2AAE3525a3820F8893424E74E7af2"
        },
        recipient: {
          equals: $walletAddress
        },
        revoked: {
          equals: false
        }
      },
      orderBy: {
        time: asc
      }
    ) {
      id
      attester
      recipient
      time
      decodedDataJson
    }
  }

`

export async function getAssociatedWallets(walletAddress: string, node: string, chainId: number): Promise<SocialProfileSimple[]> {
  try {
    const finalResponse: SocialProfileSimple[] = []

    const gqlResponse: any = await request({
      url: import.meta.env.VITE_EAS_SCAN + "/graphql",
      document: SOCIAL_WALLET_QUERY,
      variables: {
        walletAddress,
      }
    })
  
    console.log(gqlResponse)
  
    for (let attestation of gqlResponse.attestations) {
      const data = JSON.parse(attestation.decodedDataJson)
  
      if (data[0].value.value == node) {
        finalResponse.push({
          node,
          provider: `wallet:${SPECIAL_WALLET_MAPPING[data[1].value.value.hex] || parseInt(data[1].value.value.hex, 16)}`,
          identity: data[2].value.value,
          displayName: data[2].value.value,
          chainId,
          uid: attestation.id
        })
      }
  
    }

    console.log(finalResponse)
  
    return finalResponse
  } catch (err) {
    console.error(err)

    const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/attestation/wallet', {
      params: {
        node,
        chainId,
        simple: 1,
        isTestnet: import.meta.env.VITE_DEV_MODE,
      }
    })

    return response.data
  }
}

export function coinTypeFromDomain(domain: string): string {
  const namehash = ethers.utils.namehash(domain)
  return ethers.BigNumber.from(namehash).toString()
}