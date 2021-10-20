import { IGeneralHeader, IRequestHeader, IEntityHeader } from './header'
import RequestLine, { Method } from './request-line'
import { urlParse } from './url'

export interface IHeader extends IGeneralHeader, IRequestHeader, IEntityHeader {
  [headerName: string]: string | undefined
}

export type requestOptional = {
  method?: string
  headers?: IHeader
  body?: string
}

export class Request {
  requestLine: RequestLine

  headers: IHeader | undefined

  messageBody: string | undefined

  constructor(url: string, init?: requestOptional) {
    const { method = 'GET', headers = {}, body = '' } = init || {}

    const urlObj = urlParse(url)
    this.requestLine = new RequestLine(method as Method, {
      host: urlObj.host || 'localhost',
      port: Number(urlObj.port) || 80,
      path: urlObj.pathname || '/',
    })
    this.headers = headers || {}
    this.messageBody = body || ''

    // TODO: this need add some header for init time
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
