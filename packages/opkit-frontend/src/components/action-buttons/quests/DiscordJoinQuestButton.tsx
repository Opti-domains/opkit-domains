import ActionButton from "../ActionButton";
import discordIcon from "src/assets/social-button/discord.png";
import QuestButton from "../QuestButton";

export default function DiscordJoinQuestButton({
  node,
  onPassed,
}: {
  node: string;
  onPassed: () => any;
}) {
  return (
    <QuestButton
      color="white"
      background="#5B68F4"
      icon={discordIcon}
      endpoint={
        import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
        "/optidomains/discord/" +
        node +
        "/verify/joined/optidomains"
      }
      onPassed={onPassed}
      onClick={() => window.open('https://discord.gg/vahBFJUekh')}
    >
      Join Opti.Domains
    </QuestButton>
  );
}
