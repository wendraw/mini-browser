import fs from 'fs'
import http from 'http'
import path from 'path'

const server = http.createServer((req, res) => {
  console.log('request receive')
  res.setHeader('Content-Type', 'text/html') // html 格式浏览器会直接解析
  res.setHeader('X-Foo', 'bar')
  res.writeHead(200, { 'Content-Type': 'text/html' }) // plain 则只会认为是字符串
  // 同步读取
  const data = fs.readFileSync(path.resolve(__dirname, '../src/index.html'))
  res.end(data.toString())
})

server.listen(8088)
console.log('localhost:8088')
