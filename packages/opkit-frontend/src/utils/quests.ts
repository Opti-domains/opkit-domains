import axios from "axios";

export interface OptiDomainsQuest {
  testnetOg: boolean;
  mainnetOg: boolean;
  townFollowers: boolean;

  mintDomain: boolean;
  reverseRecord: boolean;

  mintBeforeAMA: boolean;
  mintOnBase: number;
  mintId: number;

  connectAptos: boolean;
  connectSui: boolean;
  connectFreedomWallet: boolean;

  connectTwitter: boolean;
  connectDiscord: boolean;
  connectGithub: boolean;
  connectGoogle: boolean;
  connectMicrosoft: boolean;
  connectLinkedIn: boolean;

  referral: number;
}

export interface IQuest {
  node: string;
  walletAddress: string;

  optidomains: OptiDomainsQuest;

  createdAt?: Date;
  updatedAt?: Date;
}

export async function fetchQuests(domainName: string) {
  const response = await axios.get(
    import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT + "/quest/" + domainName,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function refreshQuests(domainName: string, namespace: string) {
  const response = await axios.post(
    import.meta.env.VITE_SOCIAL_ORACLE_ENDPOINT +
      "/quest/" +
      domainName +
      "/refresh/" +
      namespace,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
}
