const fs = require('node:fs')
const path = require('node:path')
const { URL } = require('node:url')

const { addStream, parseFlags, getResolution, getSeasonEpisode } = require('./util')

const reFiles = /<a (.+)?href="([^"]+)"(.+)?>([^<]+\.(mkv|mp4))<\/a>/gm

const start = async () => {
  try {
    const flags = parseFlags()

    let contents
    let baseUrl

    // read source if available
    if (flags.source) {
      const sourceFile = path.join(__dirname, flags.source)
      contents = fs.readFileSync(sourceFile, 'utf8')

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

    const matches = contents.matchAll(reFiles)

    let source = 'unknown'

    const host = Buffer.from(baseUrl.host).toString('base64')

    if (host === 'dmFkYXBhdi5tb3Y=') source = 'vdv'
    if (host === 'ZGwyLnNlcm1vdmllZG93bi5wdw==') source = 'smd'
    if (host === 'YXJjaGl2ZS5vcmc=') source = 'iao'

    for (const match of matches) {
      const ref = match[2]
      const filename = match[4]
      const extension = match[5]

      const { season, episode } = getSeasonEpisode(filename)

      let url

      if (ref.startsWith('/')) {
        url = `${baseUrl.protocol}//${baseUrl.host}${ref}`
      } else {
        url = `${baseUrl}/${ref}`
      }

      addStream({
        type: 'series',
        id: flags.id,
        season,
        episode,
        resolution: getResolution(filename),
        language: flags.language,
        source,
        extension,
        url
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

start()
