import dotenv from 'dotenv'
import Twitter from 'twitter'

export interface Options {
  twitterUserId?: string
  twitterConsumerKey?: string
  twitterConsumerSecret?: string
  twitterAccessTokenKey?: string
  twitterAccessTokenSecret?: string
}

export interface IsAliveResult {
  isAlive: boolean
  sources: Source[]
}

export interface Source {
  type: SourceType
  isAlive: boolean
  message: string
}

export type SourceType = 'twitter'

export async function main({
  twitterUserId,
  twitterConsumerKey,
  twitterConsumerSecret,
  twitterAccessTokenKey,
  twitterAccessTokenSecret,
}: Options): Promise<IsAliveResult> {
  const sources: Source[] = []

  if (
    twitterUserId &&
    twitterConsumerKey &&
    twitterConsumerSecret &&
    twitterAccessTokenKey &&
    twitterAccessTokenSecret
  ) {
    const client = new Twitter({
      consumer_key: twitterConsumerKey,
      consumer_secret: twitterConsumerSecret,
      access_token_key: twitterAccessTokenKey,
      access_token_secret: twitterAccessTokenSecret,
    })

    const dates: Date[] = (
      await client.get('statuses/user_timeline', { user_id: twitterUserId })
    ).map((s: Twitter.ResponseData) => new Date(s.created_at))

    const isAlive = dates.some(
      d => d.getTime() > Date.now() - 24 * 60 * 60 * 1000
    )

    sources.push({
      type: 'twitter',
      isAlive,
      message: isAlive
        ? 'It tweeted once or more in past 24 hours.'
        : 'It posted no tweets in past 24 hours.',
    })
  }

  const isAlive = sources.some(s => s.isAlive)

  return {
    isAlive,
    sources,
  }
}

if (require.main === module) {
  dotenv.config()

  main({
    twitterUserId: process.env.IA_TWITTER_USER_ID,
    twitterConsumerKey: process.env.IA_TWITTER_CONSUMER_KEY,
    twitterConsumerSecret: process.env.IA_TWITTER_CONSUMER_SECRET,
    twitterAccessTokenKey: process.env.IA_TWITTER_ACCESS_TOKEN_KEY,
    twitterAccessTokenSecret: process.env.IA_TWITTER_ACCESS_TOKEN_SECRET,
  }).then(result => process.stdout.write(JSON.stringify(result, null, 2)))
}
