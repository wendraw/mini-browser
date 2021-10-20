import http from 'http'
import { fakeHttp } from '../src/index'

test('baidu.com home html plain text', async () => {
  // 'http://bpic.588ku.com/element_banner/20/21/08/9c7f05640f77c3cb2f9ffade8cb444b2.png',
  // 'http://nodejs.org/static/images/logo.svg',
  const url = 'http://www.baidu.com'
  const responseWithFakeHttp = await fakeHttp(url, {
    headers: {
      Host: 'www.baidu.com',
      Connection: 'close',
    },
  })
  const responseWithHTTP: httpResponse = await httpRequest(url)
  expect(JSON.stringify(responseWithFakeHttp.statusLine)).toBe(
    JSON.stringify(responseWithHTTP.statusLine)
  )
  expect(JSON.stringify(responseWithHTTP.headers)).toBe(
    JSON.stringify(responseWithHTTP.headers)
  )
  expect(responseWithFakeHttp.messageBody).toBe(responseWithHTTP.body)
})

type httpResponse = {
  statusLine: {
    httpVersion: string
    statusCode: string
    reasonPhrase: string
  }
  headers: Object
  body: string
}
function httpRequest(url: string) {
  return new Promise<httpResponse>((resolve, reject) => {
    const req = http.request(url, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk: any) => {
        body += chunk
      })
      res.on('end', () => {
        resolve({
          statusLine: {
            httpVersion: `HTTP/${res.httpVersion}`,
            statusCode: res.statusCode?.toString() as string,
            reasonPhrase: res.statusMessage as string,
          },
          headers: res.headers,
          body,
        })
      })
    })
    req.on('error', (e: any) => {
      reject(new Error(`problem with request: ${e.message}`))
    })
    req.write('')
    req.end()
  })
}
