import React, { useContext, useState } from "react"
import { PrimaryDomainContext } from "src/context/DomainConnectContext";
import { DomainMetadata } from "src/utils/domain";
import { calculateRefDomain } from "src/utils/marketing";
import { CopyOutlined } from '@ant-design/icons';
import ReferralTwitterShareButton from "./ReferralTwitterShareButton";
import { Tooltip } from "antd";
import { IS_DEV } from "src/utils/env";

export default function ReferralLink({ domainList }: { domainList: DomainMetadata[] }) {
  const [ copied, setCopied ] = useState(false)
  const primaryDomain = useContext(PrimaryDomainContext)
  const refDomain = calculateRefDomain(primaryDomain, domainList)
  const refLink = IS_DEV ? 'https://town-testnet.opti.domains' : `https://town.opti.domains/#${refDomain}`

  const copyText = () => {
    // Get the text field
    var copyText: any = document.getElementById("referral-link");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    setCopied(true)
  }

  return (
    <div className="rounded-xl bg-red-950 p-4 shadow-lg flex flex-col md:flex-row justify-between">
      <div>
        <div className="text-xl text-amber-200">Referral Link</div>

        <div className="flex mt-1">
          <div className="truncate">
            <input 
              className="bg-transparent pr-1" 
              id='referral-link' 
              type="text" 
              value={refLink}
              style={{
                width: 210 + refDomain.length * 8,
                maxWidth: '100%',
              }}
            />
          </div>
          <div className="hover:cursor-pointer hover:opacity-90">
            <Tooltip title={copied ? "Copied" : "Copy"} onOpenChange={(visible) => !visible ? setCopied(false) : undefined}>
              <CopyOutlined onClick={() => copyText()} />
            </Tooltip>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mt-3 md:mt-0">
        <div className="text-xl text-amber-200 mr-3">Share to &gt;&gt;</div>
        <div>
          <ReferralTwitterShareButton link={refLink} />
        </div>
      </div>
    </div>
  )
}