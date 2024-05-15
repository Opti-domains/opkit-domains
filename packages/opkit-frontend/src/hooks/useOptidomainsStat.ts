import { message } from "antd";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export interface OptidomainsStat {
  totalAttestations: number;
  uniqueAttestors: number;
  uniqueHolders: number;
}

export function useOptidomainsStat(): [OptidomainsStat | null, boolean] {
  const [ stat, setStat ] = useState<OptidomainsStat | null>(null)

  const fetchStat = useCallback(async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + '/optidomains/stat')
      setStat(response.data)
    } catch (err) {
      console.error(err)
      message.error('Failed to fetch stat')
    }
  }, [setStat])

  useEffect(() => {
    fetchStat();
  }, [])

  return [ stat, Boolean(stat) ]
}