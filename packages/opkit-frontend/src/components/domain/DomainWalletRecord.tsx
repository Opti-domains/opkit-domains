import { addressEllipsis } from "@suiet/wallet-kit";
import { Skeleton } from "antd";
import { useEffect, useState } from "react";
import { SocialProfileSimple } from "src/utils/social-oracle";
import {
  SocialConfig,
  WalletConfig,
  getWalletConfig,
} from "src/utils/social-oracle-config";

interface DomainWalletRecordProps extends SocialConfig {
  coinType: string;
  Component: React.ComponentType;
  identity?: string;
  displayName?: string;
}

export function DomainWalletRecord(props: DomainWalletRecordProps) {
  return (
    <div className="flex items-center">
      <div
        className={
          "mr-2 flex-shrink-0 " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        <img
          src={props.icon}
          className="rounded-full"
          style={{ height: 24 }}
        ></img>
      </div>

      <div
        className={
          "mr-3 truncate " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        {addressEllipsis(props.displayName || props.identity || "Not Set")}
      </div>

      {/* Edit button */}
      {/* <div className='cursor-pointer hover:opacity-90'>
        <img src="/images/edit-64px.png" style={{ height: 18 }}></img>
      </div> */}
    </div>
  );
}

interface DomainWalletRecordFromProfilesProps {
  coinType: string;
  profiles: SocialProfileSimple[];
  loading: boolean;
}

export function DomainWalletRecordFromProfiles({
  coinType,
  profiles,
  loading,
}: DomainWalletRecordFromProfilesProps) {
  // console.log(profiles)
  const profile = profiles.find(
    (x: SocialProfileSimple) => x.provider == "wallet:" + coinType
  );
  const [config, setConfig] = useState<WalletConfig>();

  useEffect(() => {
    getWalletConfig(coinType).then((result) => setConfig(result));
  }, []);

  if (loading || !config) {
    return (
      <div>
        <Skeleton.Input size="small" active={true} />
      </div>
    );
  }

  return (
    <DomainWalletRecord
      {...config}
      coinType={coinType}
      identity={profile?.identity}
      displayName={profile?.displayName}
    ></DomainWalletRecord>
  );
}
