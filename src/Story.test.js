import test from 'tape'
import { createServer } from 'final-server'
import got from 'got'
import Story from './Story'

let server = undefined

test('get stories', async (t) => {
  server = await createServer({
    components: [Story],
    port: 3001
  })

  const stories = await got.get('http://localhost:3001/story', { json: true })

  t.ok(stories.body.data, 'should return stories')
  t.ok(Array.isArray(stories.body.data), 'should be array')
  server.close(t.end())
})
