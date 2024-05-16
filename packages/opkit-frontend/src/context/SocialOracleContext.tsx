import { createContext } from "react";

export interface ISocialOracleState {
  provider: string;
  identity: string;
  displayName: string;
  refUid: string;
}

export const SocialOracleContext = createContext<any>({});

export const socialOracleReducer = (
  state: ISocialOracleState[],
  action: any
) => {
  switch (action.type) {
    case "CALLBACK":
      const existingIndex = state.findIndex(
        (s) => s.provider == action.provider
      );

      console.log('CALLBACK', state, action)

      if (existingIndex != -1) {
        return state.map((s) => {
          if (s.provider === action.provider) {
            return {
              ...s,
              identity: action.identity,
              displayName: action.displayName,
              refUid: action.refUid,
            };
          } else {
            return s;
          }
        });
      } else {
        return [
          ...state,
          {
            provider: action.provider,
            identity: action.identity,
            displayName: action.displayName,
            refUid: action.refUid,
          },
        ];
      }

    case "RESET":
      return [];

    case "LOAD":
      console.log('LOAD', action.data)
      if (action.data.length == 0) return state
      return action.data as ISocialOracleState[];

    default:
      return state;
  }
};
