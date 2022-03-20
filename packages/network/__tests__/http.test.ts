/* eslint-disable jest/expect-expect */
import { fakeHttp, Response, RequestHeader, ResponseHeader } from '../src/index'
import { httpRequest, httpResponse } from './httpRequest'

test('GET: baidu.com home html plain text', async () => {
  await compareHTTPResponse(
    'http://www.baidu.com',
    {
      host: 'www.baidu.com',
      Connection: 'close',
    },
    ['cookie', 'traceid']
  )
})

test('GET: image', async () => {
  await compareHTTPResponse(
    'http://bpic.588ku.com/element_banner/20/21/08/9c7f05640f77c3cb2f9ffade8cb444b2.png',
    {
      host: 'bpic.588ku.com',
      Connection: 'close',
      'Accept-Encoding': 'binary',
    },
    ['X-Request-Id', 'Via', 'Date', 'Expires', 'Age']
  )
})

async function compareHTTPResponse(
  url: string,
  headers: RequestHeader = {},
  filterHeaderNames: string[] = [],
  compareMessageBody?: CompareFunction
) {
  const responseWithFakeHttp: Response = await fakeHttp(url, { headers })
  const responseWithNodeHttp: httpResponse = await httpRequest(url, { headers })

  // compare response status line
  expect(JSON.stringify(responseWithFakeHttp.statusLine)).toBe(
    JSON.stringify(responseWithNodeHttp.statusLine)
  )

  // compare response headers
  expect(Object.keys(responseWithFakeHttp.headers).length).toBe(
    Object.keys(responseWithNodeHttp.headers).length
  )
  const responseHeaders: ResponseHeader = responseWithFakeHttp.headers
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

  // compare response body
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
