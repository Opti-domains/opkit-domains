import ActionButton from "../ActionButton";
import boredtownIcon from "src/assets/social-button/boredtown.png";
import QuestButton from "../QuestButton";
import { message } from "antd";

export default function TownHolderQuestButton({
  node,
  onPassed,
}: {
  node: string;
  onPassed: () => any;
}) {
  return (
    <>
      <QuestButton
        color="black"
        background="#BABABA"
        icon={boredtownIcon}
        endpoint={
          import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
          "/optidomains/boredtown/verify/town_testnet"
        }
        endpointBody={{
          namehash: node,
        }}
        onPassed={onPassed}
        onClick={() => window.open('https://town-testnet.opti.domains')}
        // onClick={() => message.info("See whitelisted collections below")}
      >
        Mint .town domain on <br className="sm:hidden"/>Optimism Goerli
      </QuestButton>
    </>
  );
}
