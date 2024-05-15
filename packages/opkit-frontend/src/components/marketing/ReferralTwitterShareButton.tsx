import twitterLogo from 'src/assets/social-button/twitter.png'
import { IS_DEV } from 'src/utils/env'
import ActionButton from '../action-buttons/ActionButton'
import { message } from 'antd'

const TWEETS = IS_DEV ? [
  "💻 Let's join .town domain testnet minting from @optidomains and the @BoredTownNFT community to get your WHITELIST spot 👉 <link>\n\n#TownTestnet",
  "💥 Here's your chance to be an early adopter of the .town domain with @optidomains and @BoredTownNFT by minting on testnet and securing your WHITELIST spot 👉 <link>\n\n#TownTestnet",
  "🔐 Secure your WHITELIST spot to mint .town domains by joining the public testnet minting 👉 <link>\n\n@optidomains @BoredTownNFT #TownTestnet",
] : [
  "🚀🪙 Get ready to ride the rocket to future rewards with .town domains from @optidomains and the @BoredTownNFT community! 🎉 Don't miss out! 👉 <link>\n<Tag 3 friends>\n#MintTown",
  "🔥 Calling all @BoredTownNFT holders! 🚀 Mint .town domains now for NFT whitelist and rewards from @BoredTownNFT x @optidomains. 🎉 Don't miss out! 👉 <link>\n<Tag 3 friends>\n#MintTown",
  "🚀 Want to be a part of 30M OP RetroPGF? Mint .town domains and complete quests from @optidomains X @BoredTownNFT and partners. 🎉 Don't miss out! <link>\n<Tag 3 friends>\n#MintTown",
  "🚀 Want to be a part of 30M OP RetroPGF? Mint .town domains and complete quests from @optidomains X @BoredTownNFT and partners. 🎉 Don't miss out! <link>\n<Tag 3 friends>\n#MintTown",
]

export default function ReferralTwitterShareButton({ link, variant = 'small' }: { link: string, variant?: string }) {
  const tweet = TWEETS[Math.floor(Math.random() * TWEETS.length)].replace('<link>', link)

  if (variant == 'large') {
    return (
      <ActionButton 
        color="white" 
        background="#3198D5" 
        icon={twitterLogo} 
        checked={false}
        onClick={() => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet))}
      >
        Spread the word!
      </ActionButton>
    )
  }

  if (variant == 'quest') {
    return (
      <div
        className="transition-all hover:cursor-pointer hover:opacity-80 underline inline"
        onClick={() => {
          if (link) {
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet))
          } else {
            message.error("Please Mint & Setup a primary domain name first")
          }
        }}
      >
        Share on Twitter (Manual Check)
      </div>
    )
  }

  return (
    <div
      className="rounded-full p-2 md:p-3 transition-all hover:cursor-pointer hover:scale-110 flex" 
      style={{ backgroundColor: "#3198D5" }}
      onClick={() => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet))}
    >
      <img className='hidden md:inline' src={twitterLogo} style={{ width: 24, height: 24 }} />
      <img className='inline md:hidden' src={twitterLogo} style={{ width: 16, height: 16 }} />
    </div>
  )
}