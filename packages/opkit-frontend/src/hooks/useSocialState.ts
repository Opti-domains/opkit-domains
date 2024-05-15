import { useEffect, useReducer } from "react";
import { ISocialOracleState, socialOracleReducer } from "src/context/SocialOracleContext";
import useSessionId from "./useSessionId";

export function useSocialState(): [ISocialOracleState[], React.Dispatch<any>, string] {
  const [state, dispatch] = useReducer(socialOracleReducer, []);
  const [sessionId, inputSessionId] = useSessionId();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    // Try to load session saved data from session storage
    const session = sessionStorage.getItem('TOWN_DOMAINS_SESSION:' + sessionId)
    if (session) {
      dispatch({
        type: "LOAD",
        data: JSON.parse(session),
      })
    }

    // Get input from social oracle callback
    const dataRaw = urlParams.get('callback');

    if (dataRaw) {
      const data = JSON.parse(decodeURIComponent(atob(dataRaw)));
      console.log(data)
      dispatch({
        ...data,
        refUid: import.meta.env.VITE_SOCIAL_REF_ID,
        type: "CALLBACK",
      })
    }
  }, [sessionId, dispatch])

  useEffect(() => {
    sessionStorage.setItem('TOWN_DOMAINS_SESSION:' + sessionId, JSON.stringify(state))
  }, [sessionId, state])

  useEffect(() => {
    if (sessionId != inputSessionId) {
      console.log('RESET', sessionId, inputSessionId)
      dispatch({
        type: "RESET",
      })
    }
  }, [sessionId, inputSessionId])

  console.log(state)

  return [ state, dispatch, sessionId ]
}