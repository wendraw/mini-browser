import http from 'http'
import { RequestHeader, RequestOptional } from '../src/index'

export type httpResponse = {
  statusLine: {
    httpVersion: string
    statusCode: string
    reasonPhrase: string
  }
  headers: http.OutgoingHttpHeaders
  body: Buffer | string
}

export function httpRequest(url: string, options: RequestOptional) {
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
