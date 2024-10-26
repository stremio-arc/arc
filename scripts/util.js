const path = require('node:path')
const fs = require('node:fs')

const seriesDirectory = path.join(__dirname, '../addon/stream/series')

const extensionOrder = ['mp4', 'ia.mp4', 'mkv']

const getExtension = (url) => path.basename(url).split('.').splice(1).join('.')

const checkExtensionOrder = (incoming, existing) => extensionOrder.indexOf(getExtension(incoming)) > extensionOrder.indexOf(getExtension(existing))

exports.addStream = (data) => {
  try {
    //console.log(data)
    
    if (data.language === undefined) data.language = 'eng'
    if (data.resolution === undefined) data.resolution = '1080p'

    if (data.type === 'series') {
      const stream = {
        name: 'ARC',
        description: `${data.resolution}.${data.language}.${data.source}.${data.extension}`,
        url: data.url
      }

      const filename = `${data.id}:${data.season}:${data.episode}.json`
      const filepath = path.join(seriesDirectory, filename)

      if (fs.existsSync(filepath)) {
        const contents = JSON.parse(fs.readFileSync(filepath))
        const streams = contents?.streams

        // check if stream for same source exists
        // update existing or add a new one

        const existingStream = streams.find((stream) => stream.description.includes(data.source))

        if (existingStream?.description) {
          if (checkExtensionOrder(stream.url, existingStream.url)) {
            existingStream.description = stream.description
            existingStream.url = stream.url

            fs.writeFileSync(filepath, JSON.stringify(contents, null, 2))
            console.log(filename, 'updated', 'replace stream')
          } else {
            console.log(filename, 'none', 'keep stream')
          }
        } else {
          streams.push(stream)
          fs.writeFileSync(filepath, JSON.stringify(contents, null, 2))
          console.log(filename, 'updated', 'new stream')
        }
      } else {
        fs.writeFileSync(filepath, JSON.stringify({ streams: [stream] }, null, 2))
        console.log(filename, 'created')
      }
    } else {
      console.error('unknown type in data:', data.type)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const getFlag = (flag) => {
  const value = process.argv.find(arg => arg.startsWith(`${flag}=`))
  return value?.split('=')[1]
}

exports.parseFlags = () => {
  return {
    id: getFlag('id'),
    url: getFlag('url'),
    source: getFlag('source')
  }
}

const reResolution = /(2160p|1080p)/gi
exports.getResolution = (filename) => {
  const matches = filename.match(reResolution)

  return matches?.[0]
}

const reSeasonEpisode = /(s)(\d+)(\s+)?(e|ep)(\d+)|(\d+)x(\d+)/i
exports.getSeasonEpisode = (filename) => {
  const matches = filename.match(reSeasonEpisode)

  let season
  if (matches[2] !== undefined) season = parseInt(matches[2])
  if (matches[6] !== undefined) season = parseInt(matches[6])

  let episode
  if (matches[5] !== undefined) episode = parseInt(matches[5])
  if (matches[7] !== undefined) episode = parseInt(matches[7])

  return { season, episode }
}
