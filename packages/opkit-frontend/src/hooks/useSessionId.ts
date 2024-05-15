import { useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useAccount } from "wagmi";
import useAccountSiwe from "./useAccountSiwe";

export default function useSessionId(): [string, string] {
  const { address } = useAccountSiwe();

  const urlParams = new URLSearchParams(window.location.search);
  const s = urlParams.get('s') || '';

  const newSessionId = useMemo(() => uuid(), []);
  const sessionId = useMemo(() => s && (!address || s.indexOf(address) != -1) ? s : newSessionId + "-" + address, [ address, newSessionId ])

  return [sessionId, s]
}