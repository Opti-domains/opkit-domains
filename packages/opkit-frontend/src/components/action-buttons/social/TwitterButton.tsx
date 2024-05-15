import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import twitterIcon from "src/assets/social-button/twitter.png";

export default function TwitterButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'com.twitter')

  return (
    <ActionButton color="white" background="#3198D5" icon={twitterIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Twitter'}
    </ActionButton>
  );
}
