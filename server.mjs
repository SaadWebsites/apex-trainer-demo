import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
}

const server = createServer(async (req, res) => {
  let pathname = '/'
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    /* keep default */
  }
  if (pathname.endsWith('/')) pathname += 'index.html'

  const filePath = normalize(join(root, pathname))
  if (!filePath.startsWith(root)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  try {
    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': TYPES[extname(filePath)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>404 — Not found</h1>')
  }
})

const PORTS = [4173, 4174, 4175, 4176, 4180]

function listen(index) {
  if (index >= PORTS.length) {
    console.error('No free port found')
    process.exit(1)
  }
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') listen(index + 1)
    else throw err
  })
  server.listen(PORTS[index], () => {
    console.log(`APEX trainer site running at http://localhost:${PORTS[index]}`)
  })
}

listen(0)
