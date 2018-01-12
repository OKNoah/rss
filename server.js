import { createServer } from 'final-server'
import Feed from './src/Feed'
import Story from './src/Story'

createServer({
  components: [Feed, Story],
  port: 3001
})
