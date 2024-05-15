import ActionButton from "../ActionButton";
import guildIcon from "src/assets/social-button/guildxyz.jpg";
import QuestButton from "../QuestButton";

export default function GuildXYZQuestButton({
  node,
  onPassed,
}: {
  node: string;
  onPassed: () => any;
}) {
  return (
    <QuestButton
      color="white"
      background="#2F2F32"
      icon={guildIcon}
      endpoint={
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
        "/optidomains/discord/" +
        node +
        "/verify/joined/optidomains_xyz"
      }
      onPassed={onPassed}
      onClick={() => window.open('https://guild.xyz/optidomains')}
    >
      Get "Town Fans" role
    </QuestButton>
  );
}
