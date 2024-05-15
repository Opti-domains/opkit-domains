import { ISocialOracleState } from "src/context/SocialOracleContext";
import ActionButton from "../ActionButton";
import telegramIcon from "src/assets/social-button/telegram.png";

export default function TelegramButton(props: any) {
  const state = props.state.find((x: ISocialOracleState) => x.provider == 'org.telegram')

  return (
    <ActionButton color="white" background="#229ED9" icon={telegramIcon} checked={!!state} {...props}>
      {state?.displayName ?? 'Login with Telegram'}
    </ActionButton>
  );
}
