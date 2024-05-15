import { Skeleton } from "antd";
import { useEffect, useState } from "react";
import { SocialProfileSimple } from "src/utils/social-oracle";
import { SocialConfig, getSocialConfig } from "src/utils/social-oracle-config";

interface DomainSocialRecordProps extends SocialConfig {
  provider: string;
  identity?: string;
  displayName?: string;
}

export function RecordSocialDomain(props: DomainSocialRecordProps) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={
          "mr-2 flex-shrink-0 flex gap-3 " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        <img
          src={"/images/twitter.svg"}
          className="rounded-full"
          style={{ height: 24 }}
        />
        <div>Twitter</div>
      </div>

      <div
        className={
          "mr-3 truncate " +
          (!props.displayName && !props.identity ? "opacity-50" : "")
        }
      >
        {props.displayName || props.identity || "Not Set"}
      </div>
    </div>
  );
}

interface DomainSocialRecordFromProfilesProps {
  provider: string;
  profiles: SocialProfileSimple[];
  loading: boolean;
}

export function RecordSocialDomainFromProfiles({
  provider,
  profiles,
  loading,
}: DomainSocialRecordFromProfilesProps) {
  const profile = profiles.find(
    (x: SocialProfileSimple) => x.provider == provider
  );
  const [config, setConfig] = useState<SocialConfig>();

  useEffect(() => {
    getSocialConfig(provider).then((result) => setConfig(result));
  }, []);

  if (loading || !config) {
    return (
      <div>
        <Skeleton.Input size="small" active={true} />
      </div>
    );
  }

  return (
    <RecordSocialDomain
      {...config}
      provider={provider}
      identity={profile?.identity}
      displayName={profile?.displayName}
    />
  );
}
