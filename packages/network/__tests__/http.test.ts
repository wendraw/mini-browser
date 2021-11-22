import http from 'http'
import {
  fakeHttp,
  Response,
  RequestHeader,
  ResponseHeader,
  RequestOptional,
} from '../src/index'

// eslint-disable-next-line jest/expect-expect
test('GET: baidu.com home html plain text', () =>
  compareHTTPResponse(
    'http://www.baidu.com',
    {
      host: 'www.baidu.com',
      Connection: 'close',
    },
    ['cookie', 'traceid']
  ))

// eslint-disable-next-line jest/expect-expect
test('GET: image', () =>
  compareHTTPResponse(
    'http://bpic.588ku.com/element_banner/20/21/08/9c7f05640f77c3cb2f9ffade8cb444b2.png',
    {
      host: 'bpic.588ku.com',
      Connection: 'close',
      'Accept-Encoding': 'binary',
    },
    ['X-Request-Id', 'Via', 'Date', 'Expires', 'Age']
  ))

async function compareHTTPResponse(
  url: string,
  headers: RequestHeader = {},
  filterHeaderNames: string[] = [],
  compareMessageBody?: CompareFunction
) {
  const responseWithFakeHttp: Response = await fakeHttp(url, { headers })
  const responseWithNodeHttp: httpResponse = await httpRequest(url, { headers })

  expect(JSON.stringify(responseWithFakeHttp.statusLine)).toBe(
    JSON.stringify(responseWithNodeHttp.statusLine)
  )

  const responseHeaders: ResponseHeader = responseWithFakeHttp.headers

  expect(Object.keys(responseWithFakeHttp.headers).length).toBe(
    Object.keys(responseWithNodeHttp.headers).length
  )

  for (const headerName of Object.keys(responseHeaders)) {
    if (filterHeaderNames.some((name) => RegExp(name, 'i').test(headerName))) {
      continue
    }
    let headerValueWithFakeHttp =
      responseWithFakeHttp.headers[headerName as keyof ResponseHeader]
    let headerValueWithNodeHttp =
      responseWithNodeHttp.headers[headerName.toLowerCase()]
    if (headerValueWithFakeHttp instanceof Array) {
      headerValueWithFakeHttp = headerValueWithFakeHttp.join(', ')
    }
    if (headerValueWithNodeHttp instanceof Array) {
      headerValueWithNodeHttp = headerValueWithNodeHttp.join(', ')
    }
    expect(headerValueWithFakeHttp).toBe(headerValueWithNodeHttp)
  }

  if (compareMessageBody) {
    compareMessageBody(responseWithFakeHttp, responseWithNodeHttp)
  } else {
    expect(responseWithFakeHttp.messageBody).toStrictEqual(
      responseWithNodeHttp.body
    )
  }
}

// eslint-disable-next-line no-unused-vars
type CompareFunction = (response1: Response, response2: httpResponse) => void

type httpResponse = {
  statusLine: {
    httpVersion: string
    statusCode: string
    reasonPhrase: string
  }
  headers: http.OutgoingHttpHeaders
  body: Buffer | string
}

function httpRequest(url: string, options: RequestOptional) {
  return new Promise<httpResponse>((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body: Buffer | string = Buffer.alloc(0)
      res.on('data', (chunk) => {
        body = Buffer.concat([body, chunk])
      })
      res.on('end', () => {
        const contentType = res.headers['content-type']
        if (contentType && /^text/.test(contentType)) {
          body = body.toString('utf-8')
        }
        resolve({
          statusLine: {
            httpVersion: `HTTP/${res.httpVersion}`,
            statusCode: res.statusCode?.toString() as string,
            reasonPhrase: res.statusMessage as string,
          },
          headers: res.headers as RequestHeader,
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
