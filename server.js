import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const port = parseInt(process.env.PORT || '3000', 10)
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Server listening on http://0.0.0.0:${port}`)
  })

  // Keep the process alive
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err)
  })

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
  })
})
