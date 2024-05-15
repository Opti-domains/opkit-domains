import { DomainMetadata } from "./domain";


export function calculateRefDomain(primaryDomain: string, domainList: DomainMetadata[]): string {
  let refDomain = primaryDomain || (domainList[0] && domainList[0].name);

  if (!refDomain) return ""

  // Town domains special case
  if (refDomain.endsWith('.town') && refDomain.indexOf('.') == refDomain.length - 5) {
    refDomain = refDomain.substring(0, refDomain.length - 5)
  }

  return refDomain
}

export function isWhitelistedCampaign(campaign?: string): boolean {
  if (!campaign) {
    const urlParams = new URLSearchParams(window.location.search);
    const campaign = urlParams.get('campaign');

    if (!campaign) return false;

    return isWhitelistedCampaign(campaign)
  }

  return campaign == 'raffle1' || campaign == 'oppodcast'
}