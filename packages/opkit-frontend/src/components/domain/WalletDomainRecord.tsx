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

export function WalletDomainRecord(props: DomainWalletRecordProps) {
  const { coinType } = props;

  return (
    <div className="flex items-center justify-between">
      <div
        className={
          "mr-2 flex-shrink-0 flex gap-3 items-center " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        <img src={props.icon} className="rounded-full" style={{ height: 24 }} />
        <div className="text-[#101828]">
          {coinType === "60" && "EVM"}
          {coinType === "637" && "Celestia"}
          {coinType === "784" && "Rollkit"}
          {coinType === "celestia" && "Celestia"}
          {coinType === "opkit" && "Rollkit"}
        </div>
      </div>

      <div
        className={
          "mr-3 truncate text-[#667085] " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        {(props.displayName || props.identity || "Not Set").substring(0, 16)}{props.displayName ? '...' : ''}
      </div>
    </div>
  );
}

interface DomainWalletRecordFromProfilesProps {
  coinType: string;
  profiles: SocialProfileSimple[];
  loading: boolean;
}

export function WalletDomainRecordFromProfiles({
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
    <WalletDomainRecord
      {...config}
      coinType={coinType}
      identity={profile?.identity}
      displayName={profile?.displayName}
    ></WalletDomainRecord>
  );
}
