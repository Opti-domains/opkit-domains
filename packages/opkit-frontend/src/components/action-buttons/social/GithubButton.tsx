import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import githubIcon from "src/assets/social-button/github.png";

export default function GithubButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'com.github')

  return (
    <ActionButton color="white" background="#161B22" icon={githubIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Github'}
    </ActionButton>
  );
}
