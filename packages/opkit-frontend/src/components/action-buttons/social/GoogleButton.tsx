import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import googleIcon from "src/assets/social-button/google.png";

export default function GoogleButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'com.google')

  return (
    <ActionButton color="black" background="white" icon={googleIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Google'}
    </ActionButton>
  );
}
