import { Skeleton } from "antd"
import React, { useEffect, useState } from "react"
import { DomainMetadata, changeTld, getDomainList } from "src/utils/domain"
import { useNetwork } from "wagmi"
import { DomainCard } from "./DomainCard"

interface DomainListProps {
  domainList: DomainMetadata[]
  loading: boolean
  tld: string
  formattedTld: string
}

export default function DomainList({ domainList, loading, tld, formattedTld }: DomainListProps) {
  // const { chains } = useNetwork();

  if (loading) {
    return <Skeleton active={true} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {domainList.map(domain => (
        <DomainCard
          domainName={domain.name}
          domainDisplayName={changeTld(domain.name, tld, formattedTld)}
          domainChainId={parseInt(domain.chain.split('_')[1])}
          key={domain.node + "_" + domain.chain}
        ></DomainCard>
      ))}
    </div>
  )
}