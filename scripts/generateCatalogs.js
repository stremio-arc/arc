const { getManifest, getMetasWithGenre, addCatalog } = require('./util')

const start = async () => {
  try {
    const { catalogs } = getManifest()

    for (const catalog of catalogs) {
      for (const extra of catalog?.extra) {
        for (const option of extra?.options) {
          const metas = getMetasWithGenre(catalog.type, option)

          addCatalog(catalog.type, catalog.id, `genre=${option}.json`, metas)
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

start()
