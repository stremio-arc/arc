const fs = require('node:fs')
const { URL } = require('node:url')
const path = require('node:path')

const seriesDirectory = path.join(__dirname, '../addon/stream/series')

async function fetchAndExtract (id, urlString, regex) {
  try {
    const url = new URL(urlString)
    if (!url.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol. Only http and https are supported.')
    }

    const response = await fetch(urlString, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' // Add a user agent to avoid 403 errors
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()
    const matches = data.matchAll(regex)

    for (const match of matches) {
      const data = {
        streams: [
          {
            name: 'ARC',
            description: '480p.en.iao.mp4',
            url: `${urlString}/${match[1]}`
          }
        ]
      }
      const fileName = `${id}:${parseInt(match[2])}:${parseInt(match[4])}.json` // Customize file naming as needed
      fs.writeFileSync(`${seriesDirectory}/${fileName}`, JSON.stringify(data, null, 2))
      console.log(`Generated ${fileName}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const id = process.argv[2]
const url = process.argv[3]

if (!id || !url) {
  console.error('Usage: npm run extract-regex <id> <url>')
  process.exit(1)
}

const regex = /"(.+S(\d+)(\s+)?E(\d+).+.mp4)"/gm

fetchAndExtract(id, url, regex)
