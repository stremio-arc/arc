const fs = require('node:fs')
const path = require('node:path')
const { URL } = require('node:url')

const { addStream, parseFlags } = require('./util')

const regex = /href="(([^"]+)?(S(\d+)(\s+)?E(\d+)|(\d+)x(\d+))([^"]+)?(1080p)?([^"]+)?\.(mkv|mp4))"/gm

const start = async () => {
  try {
    const flags = parseFlags()

    let contents
    let baseUrl

    // read source if available
    if (flags.source) {
      const sourceFile = path.join(__dirname, flags.source)
      contents = fs.readFileSync(sourceFile)

      baseUrl = new URL(flags.url)
    } else if (flags.url) {
      const response = await fetch(flags.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' // Add a user agent to avoid 403 errors
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      contents = await response.text()
      baseUrl = new URL(flags.url)
    }

    const matches = contents.matchAll(regex)

    let source = 'unknown'

    const host = Buffer.from(baseUrl.host).toString('base64')

    if (host === 'ZGwyLnNlcm1vdmllZG93bi5wdw==') source = 'smd'
    if (host === 'YXJjaGl2ZS5vcmc=') source = 'iao'

    for (const match of matches) {
      const filename = encodeURI(match[1])

      let season
      if (match[4] !== undefined) season = parseInt(match[4])
      if (match[7] !== undefined) season = parseInt(match[7])

      let episode
      if (match[6] !== undefined) episode = parseInt(match[6])
      if (match[8] !== undefined) episode = parseInt(match[8])

      const extension = match[12]

      addStream({
        type: 'series',
        id: flags.id,
        season,
        episode,
        resolution: match[11],
        source,
        extension,
        url: `${baseUrl}/${filename}`
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

start()
