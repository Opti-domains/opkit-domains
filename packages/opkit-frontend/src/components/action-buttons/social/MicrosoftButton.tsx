import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import microsoftIcon from "src/assets/social-button/microsoft.png";

export default function MicrosoftButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'com.microsoft')

  return (
    <ActionButton color="black" background="white" icon={microsoftIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Microsoft'}
    </ActionButton>
  );
}
