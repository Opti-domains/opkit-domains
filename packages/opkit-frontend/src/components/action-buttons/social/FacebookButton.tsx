import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import facebookIcon from "src/assets/social-button/facebook.png";

export default function FacebookButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'com.facebook')

  return (
    <ActionButton color="white" background="#1679F1" icon={facebookIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Login with Facebook'}
    </ActionButton>
  );
}
