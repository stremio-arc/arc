const fs = require('node:fs')
const process = require('node:process')
const path = require('node:path')

const seriesDirectory = path.join(__dirname, '../addon/stream/series')

const generateEpisodes = (id, description, season, startEpisode, endEpisode) => {
  // Input validation
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('Error: ID must be a non-empty string.')
    return
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    console.error('Error: Description must be a non-empty string.')
    return
  }
  if (!season || isNaN(parseInt(season)) || parseInt(season) <= 0) {
    console.error('Error: Season must be a positive integer.')
    return
  }
  if (!startEpisode || isNaN(parseInt(startEpisode)) || parseInt(startEpisode) <= 0) {
    console.error('Error: Start episode must be a positive integer.')
    return
  }
  if (!endEpisode || isNaN(parseInt(endEpisode)) || parseInt(endEpisode) <= 0 || parseInt(endEpisode) < parseInt(startEpisode)) {
    console.error('Error: End episode must be a positive integer greater than or equal to the start episode.')
    return
  }

  for (let i = parseInt(startEpisode); i <= parseInt(endEpisode); i++) {
    const episodeData = {
      streams: [
        {
          name: 'ARC',
          description,
          url: ''
        }
      ]
    }

    const fileName = `${id}:${season}:${i}.json`
    fs.writeFileSync(`${seriesDirectory}/${fileName}`, JSON.stringify(episodeData, null, 2))
    console.log(`Generated ${fileName}`)
  }
}

const id = process.argv[2]
const description = process.argv[3]
const season = process.argv[4]
const startEpisode = process.argv[5]
const endEpisode = process.argv[6]

generateEpisodes(id, description, season, startEpisode, endEpisode)
