

// envファイルのtrueやfalseをbooleanに変換する
export default () => ({
    name: 'env-string-to-boolean',
    configResolved: config => {
      const entries = Object.entries(config.env).map(([key, value]) => {
        const target = typeof value === 'string' ? value.toLowerCase() : value
        const results = {
            true: true,
            false: false,
            null: null
        }
        return [key, results[target] === undefined ? value : results[target]]
      })
  
      config.env = Object.fromEntries(entries)
      return config
    }
})
