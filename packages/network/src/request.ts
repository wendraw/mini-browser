import { IGeneralHeader, IRequestHeader, IEntityHeader } from './header'
import RequestLine, { Method } from './request-line'
import { urlParse } from './url'

export interface IHeader extends IGeneralHeader, IRequestHeader, IEntityHeader {
  [headerName: string]: string | string[] | undefined
}

export type RequestOptional = {
  method?: string
  headers?: IHeader
  body?: string
}

const defaultHeaders: IHeader = {
  Connection: 'keep-alive',
  'Content-Type': 'application/x-www-from-urlencoded',
}

export class Request {
  requestLine: RequestLine

  headers: IHeader

  messageBody: string | undefined

  constructor(url: string, init?: RequestOptional) {
    const { method = 'GET', headers = {}, body = '' } = init || {}

    const urlObj = urlParse(url)
    this.requestLine = new RequestLine(method as Method, {
      host: urlObj.hostname || 'localhost',
      port: Number(urlObj.port) || 80,
      path: urlObj.pathname || '/',
    })
    this.headers = { ...defaultHeaders, ...headers }
    this.messageBody = body || ''
    this.headers.Host = urlObj.hostname || 'localhost'
    if (this.messageBody) {
      this.headers['Content-Length'] = this.messageBody.length.toString()
    }
  }

  toString() {
    let headerStr = ''
    if (this.headers) {
      headerStr = Object.entries(this.headers)
        .map(([key, val]) => `${key}: ${val}`)
        .join('\r\n')
    }
    return `${this.requestLine.toString()}\r\n${headerStr}\r\n\r\n${
      this.messageBody
    }`
  }
}
