import ActionButton from "../ActionButton";
import boredtownIcon from "src/assets/social-button/boredtown.png";
import QuestButton from "../QuestButton";
import { message } from "antd";

export default function BoredTownQuestButton({
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
          "/optidomains/boredtown/verify/whitelisted"
        }
        onPassed={onPassed}
        // onClick={() => window.open('https://clique.social/provenance/Optimistically-Bored-SBT')}
        onClick={() => message.info("See whitelisted collections below")}
      >
        OG / Bored Town / Tripster Holder
      </QuestButton>

      <div className="mt-2 pl-5">
        <ul className="list-disc whitelisted-collections-list">
          <li>
            Opti.domains OG
          </li>

          <li>
            <a href={"https://zonic.app/collection/boredtown"} target="_blank">
              Bored Town Genesis
            </a>
          </li>

          <li>
            <a
              href={
                "https://zonic.app/collection/zksync/0xfD41c554C471Ca9dB312373BCeB55B0317E06844"
              }
              target="_blank"
            >
              ZkAlien
            </a>
          </li>

          <li>
            <a
              href={"https://clique.social/provenance/Optimistically-Bored-SBT"}
              target="_blank"
            >
              Bored Town Clique SBT
            </a>
          </li>

          <li>
            <a
              href={"https://app.questn.com/quest/771346858070622591"}
              target="_blank"
            >
              Bored Town Artist
            </a>
          </li>

          <li>
            <a
              href={"https://opensea.io/collection/tripster-travel-pass"}
              target="_blank"
            >
              Tripster Travel Pass
            </a>
          </li>

          <li>
            <a
              href={"https://opensea.io/collection/tripsterwally-op"}
              target="_blank"
            >
              Tripster Wally Optimism
            </a>
          </li>

          <li>
            <a
              href={"https://opensea.io/collection/tripsterwally-base"}
              target="_blank"
            >
              Tripster Wally Base
            </a>
          </li>

          <li>
            <a
              href={"https://opensea.io/collection/tripster-x-wally-zora"}
              target="_blank"
            >
              Tripster Wally Zora
            </a>
          </li>

          <li>
            <a
              href={"https://zonic.app/collection/tripsterwally-zksync"}
              target="_blank"
            >
              Tripster Wally ZkSync
            </a>
          </li>

          <li>More collections coming soon in waves...</li>
        </ul>
      </div>
    </>
  );
}
