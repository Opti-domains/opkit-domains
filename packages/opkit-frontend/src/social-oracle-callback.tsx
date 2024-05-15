import { useEffect } from "react";

let ALREADY_POST = false

export default function SocialOracleCallback() {
  useEffect(() => {
    setTimeout(() => {
      if (!ALREADY_POST) {
        ALREADY_POST = true;
  
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const sessionId = params.nonce;
    
        // console.log(params.nonce + JSON.stringify(params))

        console.log(params.nonce)
        console.log(params)
    
        if (window.opener) {
          window.opener.postMessage(params.nonce + JSON.stringify(params), window.location.origin)
          setTimeout(() => window.close(), 400);
        } else {
          const url = new URL(sessionStorage.getItem('TOWN_DOMAINS_SESSION_PATHNAME:' + sessionId) || '/', window.location.origin)
          url.searchParams.set('s', sessionId)
          url.searchParams.set('callback', btoa(encodeURIComponent(JSON.stringify(params))))
  
          window.location.href = url.toString()
        }
      }
    }, 100)
  })

  return (
    <div></div>
  )
}