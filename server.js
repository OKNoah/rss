import { createServer } from 'final-server'
import Feed from './src/Feed'

createServer({
  components: [Feed],
  port: 3001
})
