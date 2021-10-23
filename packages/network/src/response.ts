import { IGeneralHeader, IResponseHeader, IEntityHeader } from './header'

export class Response {
  statusLine: StatusLine

  headers: IHeader

  messageBody: string

  constructor(body: string | Buffer) {
    this.statusLine = {
      httpVersion: '',
      statusCode: '',
      reasonPhrase: '',
    }
    this.headers = {}
    this.messageBody = ''

    let bodyString: string = ''
    if (body instanceof Buffer) {
      bodyString = body.toString()
    } else {
      bodyString = body
    }
    const { statusLine, headers, messageBody } = parseHTTP(bodyString)
    ;[
      this.statusLine.httpVersion,
      this.statusLine.statusCode,
      this.statusLine.reasonPhrase,
    ] = statusLine.split(/\s/)
    this.headers = headers
    this.messageBody = messageBody
  }
}

function parseHTTP(body: string) {
  let statusLine = ''
  const headers: IHeader = {}
  let headerName: keyof IHeader | '' = ''
  let headerValue = ''
  let messageBody = ''

  const waitingStatusLine = (c: string) => {
    if (c === '\r') {
      return waitingStatusLineEnd
    }
    statusLine += c
    return waitingStatusLine
  }

  const waitingStatusLineEnd = (c: string) => {
    if (c === '\n') {
      return waitingHeaderName
    }
    throw new Error('The format of the response message is incorrect')
  }

  const waitingHeaderName = (c: string) => {
    if (c === ':') {
      return waitingHeaderSpace
    }
    if (c === '\r') {
      return waitingHeaderBlockEnd
    }
    headerName += c
    return waitingHeaderName
  }

  const waitingHeaderSpace = (c: string) => {
    if (c === ' ') {
      return waitingHeaderValue
    }
    throw new Error('The format of the response message is incorrect')
  }

  const waitingHeaderValue = (c: string) => {
    if (c === '\r') {
      const value = headers[headerName as keyof IHeader]
      if (value) {
        let values: string[] = []
        if (value instanceof Array) {
          values = [...value, headerValue]
        } else if (typeof value === 'string') {
          values = [value, headerValue]
        }
        headers[headerName as keyof IHeader] = values
      } else {
        headers[headerName as keyof IHeader] = headerValue
      }
      headerName = ''
      headerValue = ''
      return waitingHeaderLineEnd
    }
    headerValue += c
    return waitingHeaderValue
  }

  const waitingHeaderLineEnd = (c: string) => {
    if (c === '\n') {
      return waitingHeaderName
    }
    throw new Error('The format of the response message is incorrect')
  }

  const waitingHeaderBlockEnd = (c: string) => {
    if (c === '\n') {
      return waitingBody
    }
    throw new Error('The format of the response message is incorrect')
  }

  const waitingBody = (c: string) => {
    messageBody += c
    return waitingBody
  }

  let state = waitingStatusLine
  for (const c of body) {
    state = state(c)
  }

  return {
    statusLine,
    headers,
    messageBody,
  }
}

export interface IHeader
  extends IGeneralHeader,
    IResponseHeader,
    IEntityHeader {}

interface StatusLine {
  httpVersion: string
  statusCode: string
  reasonPhrase: string
}
