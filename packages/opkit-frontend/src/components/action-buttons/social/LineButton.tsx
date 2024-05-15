import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import lineIcon from "src/assets/social-button/line.png";

export default function LineButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'me.line')

  return (
    <ActionButton color="white" background="#22BA4F" icon={lineIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Line'}
    </ActionButton>
  );
}
