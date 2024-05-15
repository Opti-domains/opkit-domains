import { useState, useEffect } from "react"
import { DomainMetadata, getDomainList } from "src/utils/domain"

export function useDomainList(owner: string, tld: string, chain: string): [DomainMetadata[], boolean] {
  const [loading, setLoading] = useState(true)
  const [domainList, setDomainList] = useState<DomainMetadata[]>([])

  useEffect(() => {
    if (owner) {
      setLoading(true)

      const promises = []
  
      promises.push(getDomainList(owner, tld, chain).then(x => setDomainList(x)))
  
      Promise.all(promises).then(() => {
        setLoading(false)
      })
    }
  }, [owner])

  return [domainList, loading]
}