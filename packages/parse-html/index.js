/* eslint-disable global-require */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/parse-html.cjs.prod')
} else {
  module.exports = require('./dist/parse-html.cjs')
}
