import { Component } from 'final-server'
import { database } from './config'
import t from 'flow-runtime'

const StorySchema = t.type('Rss',
  t.object(
    t.property('title', t.string()),
    t.property('description', t.string(), true),
    t.property('summary', t.string(), true),
    t.property('date', t.string(), true),
    t.property('link', t.string())
  )
)

@database({
  collection: 'Story'
})
export default class Story extends Component {
  path = '/story/:story?'
  schema = StorySchema
  uniques = ['link']

  async get () {
    const stories = await this.findAndCount({ limit: 10 })
    return stories
  }
}
