import { Component } from 'final-server'
import { database } from './config'
import t from 'flow-runtime'
import { parse } from 'feedparser-promised'
import StoryComponent from './Story'

const RssSchema = t.type('Rss',
  t.object(
    t.property('title', t.string()),
    t.property('description', t.string(), true),
    t.property('link', t.string()),
    t.property('lastBuildDate', t.string(), true),
    t.property('pubDate', t.string(), true)
  )
)

const Story = new StoryComponent()

@database({
  collection: 'Feeds'
})
export default class Feed extends Component {
  path = '/feed/:feed?'
  schema = RssSchema
  uniques = ['link']

  async getFeeds () {
    const feeds = await this.find({ limit: 100 })
    return feeds
  }

  async get () {
    if (!this.props.params.feed) {
      const response = await this.getFeeds()
      return { data: response }
    }
  }

  async post () {
    const parsedXml = await parse(this.props.body.url, {
      addmeta: true
    })

    const { title, description, link, lastBuildDate, pubDate } = parsedXml[0].meta

    const savedRss = await this.save({
      title,
      description,
      link,
      lastBuildDate,
      pubDate: typeof pubDate === 'object' ? pubDate.toISOString() : pubDate
    })

    this.savedRss = savedRss
    this.parsedXml = parsedXml

    return { data: savedRss }
  }

  async delete () {
    try {
      await this.remove(this.props.params.feed)
      return 'ok'
    } catch (e) {
      console.error(e)
    }
  }

  async responseDidEnd () {
    this.props.response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    this.props.response.end(JSON.stringify(this.state))

    await Promise.all(this.parsedXml.map(async ({ title, description, summary, link, date }) => {
      try {
        await Story.save({
          feed: this.savedRss._id,
          title,
          description,
          summary,
          link,
          date: date.toISOString()
        })
      } catch (e) {
        console.error(e.message)
      }

      return
    }))

    return
  }
}
