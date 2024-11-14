const { parseFlags, addTVMeta, addTVStream } = require('./util')

const start = async () => {
  try {
    const flags = parseFlags()

    const { id } = flags

    if (id) {
      const meta = {
        meta: {
          id: `arc-${id}`,
          type: 'tv',
          name: '',
          poster: '',
          posterShape: 'square',
          logo: '',
          description: '',
          genres: [
            'English',
            'United States'
          ]
        }
      }

      const stream = {
        streams: [
          {
            name: 'ARC',
            description: '720p.eng.m3u8',
            url: ''
          }
        ]
      }

      addTVMeta(id, meta)
      addTVStream(id, stream)
    } else {
      console.log('id is missing')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

start()
