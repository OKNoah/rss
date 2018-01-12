import test from 'tape'
import { createServer } from 'final-server'
import got from 'got'
import Feed from './Feed'

let server = undefined

test('post rss to feed', async (t) => {
  server = await createServer({
    components: [Feed],
    port: 3001
  })

  const url = 'http://images.apple.com/main/rss/hotnews/hotnews.rss'
  const rss = await got.post('http://localhost:3001/feed', {
    body: { url: url },
    json: true
  })

  t.ok(rss.body.data, 'should return rss')
  t.equal(rss.body.data.link, 'http://www.apple.com/hotnews/', 'should have proper link')
  t.end()
})

test('get and manipuate feeds', async (t) => {
  const feeds = await got.get('http://localhost:3001/feed', { json: true })
  const feed = feeds.body.data[0]._id
  const _id = encodeURIComponent(feed)
  await got.delete(`http://localhost:3001/feed/${_id}`)
  const feeds2 = await got.get('http://localhost:3001/feed', { json: true })
  const newFeeds = feeds2.body.data.map(f => f._id)
  const isDelete = !newFeeds.includes(feed)

  t.ok(Array.isArray(feeds.body.data), 'should return array')
  t.ok(isDelete, 'should be deleted')
  server.close(t.end())
})
