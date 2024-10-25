// const fs = require('node:fs')
const { URL } = require('node:url')
// const path = require('node:path')

const { addStream } = require('./util')

// const seriesDirectory = path.join(__dirname, '../addon/stream/series')

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

    let source = 'unknown'

    const host = Buffer.from(url.host).toString('base64')

    if (host === 'ZGwyLnNlcm1vdmllZG93bi5wdw==') source = 'smd'
    if (host === 'YXJjaGl2ZS5vcmc=') source = 'iao'

    for (const match of matches) {
      addStream({
        type: 'series',
        id,
        season: parseInt(match[3]),
        episode: parseInt(match[5]),
        resolution: match[7],
        source,
        extension: match[8],
        url: `${urlString}/${match[1]}`
      })
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

const regex = /href="(([^"]+)?S(\d+)(\s+)?E(\d+)([^"]+)?(1080p)?[^"]+\.(mkv|mp4))"/gm

fetchAndExtract(id, url.replace(/\/+$/, ''), regex)
