import fakeHttp from './http'

fakeHttp('http://www.baidu.com', {
  headers: {
    Host: 'www.baidu.com',
    Connection: 'close',
  },
})

// const http = require('http')

// const req = http.request(
//   // 'http://bpic.588ku.com/element_banner/20/21/08/9c7f05640f77c3cb2f9ffade8cb444b2.png',
//   // 'http://nodejs.org/static/images/logo.svg',
//   'http://www.baidu.com/',
//   (res: any) => {
//     console.log(`STATUS: ${res.statusCode}`)
//     console.log(`HEADERS: ${res.headers}`)
//     let body = ''
//     let count = 0
//     res.setEncoding('utf8')
//     res.on('data', (chunk: any) => {
//       body += chunk
//       count += chunk.length
//     })
//     res.on('end', () => {
//       console.log('No more data in response.')
//       console.log('-----------------', body.length, count)
//     })
//   }
// )

// req.on('error', (e: any) => {
//   console.error(`problem with request: ${e.message}`)
// })

// req.write('')
// req.end()
