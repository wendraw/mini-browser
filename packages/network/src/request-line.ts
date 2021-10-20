export default class RequestLine {
  method: Method

  requestURI: RequestURI

  httpVersion: string

  constructor(
    method: Method,
    requestURI: RequestURI,
    httpVersion: string = 'HTTP/1.1'
  ) {
    this.method = method
    this.requestURI = requestURI
    this.httpVersion = httpVersion
  }

  toString() {
    return `${this.method} ${this.requestURI.path || '/'} ${this.httpVersion}`
  }
}

export type Method =
  | 'OPTIONS'
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'TRACE'
  | 'CONNECT'

type RequestURI = {
  host: string
  port: number
  path?: string
}
