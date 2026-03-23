import app from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'

const startServer = async () => {
  await connectDatabase()

  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server')
  console.error(error)
  process.exit(1)
})
