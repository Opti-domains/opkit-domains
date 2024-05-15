import ActionButton from "../ActionButton";
import twitterIcon from "src/assets/social-button/twitter.png";
import QuestButton from "../QuestButton";

export default function TwitterFollowQuestButton({
  username,
  node,
  // onPassed,
}: {
  username: string;
  node: string;
  // onPassed: () => any;
}) {
  return (
    <ActionButton 
      color="white" 
      background="#3198D5" 
      icon={twitterIcon} 
      checked={false}
      onClick={() => window.open('https://twitter.com/intent/follow?screen_name=' + username)}
    >
      Follow @{username}
    </ActionButton>
  )

  // return (
  //   <QuestButton
  //     color="white"
  //     background="#3198D5"
  //     icon={twitterIcon}
  //     endpoint={
  //       import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
  //       "/optidomains/twitter/" +
  //       node +
  //       "/verify/follow/" +
  //       username.toLowerCase()
  //     }
  //     onPassed={onPassed}
  //     onClick={() => window.open('https://twitter.com/intent/follow?screen_name=' + username)}
  //   >
  //     Follow @{username}
  //   </QuestButton>
  // );
}
