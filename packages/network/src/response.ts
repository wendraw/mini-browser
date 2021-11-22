import { IGeneralHeader, IResponseHeader, IEntityHeader } from './header'
import { splitWith } from './utils'

export class Response {
  statusLine: StatusLine

  headers: IHeader

  messageBody: string | Buffer

  constructor(responseBuffer: Buffer) {
    this.statusLine = {
      httpVersion: '',
      statusCode: '',
      reasonPhrase: '',
    }
    this.headers = {}
    this.messageBody = ''

    const { statusLine, headers, messageBody } = parseHTTP(responseBuffer)
    this.statusLine = statusLine
    this.headers = headers
    this.messageBody = messageBody
  }
}

function parseHTTP(responseBuffer: Buffer) {
  // message body may be has \r\n\r\n
  const [headerBuffer, ...bodys] = splitWith(responseBuffer, '\r\n\r\n')
  const bodyBuffer = Buffer.concat(bodys)
  const headerStr = headerBuffer.toString('utf-8')
  const [statusLineStr, ...headerArr] = headerStr.split('\r\n')
  const [httpVersion, statusCode, reasonPhrase] = statusLineStr.split(/\s/)

  // parse header
  const headers: IHeader = {}
  for (const header of headerArr) {
    const [headerName, headerValue] = header.split(/:\s+/)
    const value = headers[headerName]
    if (value) {
      if (value instanceof Array) {
        headers[headerName] = [...value, headerValue]
      } else {
        headers[headerName] = [value, headerValue]
      }
    } else {
      headers[headerName] = headerValue
    }
  }

  // parse body
  const contentType = headers['Content-Type'] || 'text/plain'
  const contentLength = headers['Content-Length']
  const transferEncoding = headers['Transfer-Encoding']
  if (!contentLength && !transferEncoding) {
    // 实际情况是很多网站的响应体中 Content-Type 和 Transfer-Encoding 都没有
    throw new Error('The format of the response message is incorrect')
  }
  let messageBody: Buffer | string = bodyBuffer

  if (transferEncoding === 'chunked') {
    messageBody = parseChunkBody(bodyBuffer.toString('utf-8'))
  } else if (/^text/.test(contentType)) {
    messageBody = bodyBuffer.toString('utf-8')
  } else if (/^image|video|audio/.test(contentType)) {
    messageBody = bodyBuffer
  } else if (/^application/.test(contentType)) {
    messageBody = bodyBuffer.toString('utf-8')
  }

  return {
    statusLine: {
      httpVersion,
      statusCode,
      reasonPhrase,
    },
    headers,
    messageBody,
  }
}

/**
 * parse body string when Transfer-Encoding = "chunked" type
 * @param body message body string
 */
function parseChunkBody(body: string): string {
  let length = 0
  const content: string[] = []

  const waitingLength = (c: string) => {
    if (c === '\r') {
      return waitingLengthEnd
    }
    length *= 16
    length += parseInt(c, 16)
    return waitingLength
  }

  const waitingLengthEnd = (c: string) => {
    if (c === '\n') {
      return readChunk
    }
    throw new Error('The format of the response message is incorrect')
  }

  const readChunk = (c: string) => {
    if (length === 0) {
      return waitingNewLine
    }
    content.push(c)
    length -= Buffer.from(c).byteLength
    return readChunk
  }

  const waitingNewLine = (c: string) => {
    if (c === '\r') {
      return waitingNewLineEnd
    }
    throw new Error('The format of the response message is incorrect')
  }

  const waitingNewLineEnd = (c: string) => {
    if (c === '\n') {
      return waitingLength
    }
    throw new Error('The format of the response message is incorrect')
  }

  let state = waitingLength

  for (const c of body) {
    state = state(c)
  }

  return content.join('')
}

export interface IHeader
  extends IGeneralHeader,
    IResponseHeader,
    IEntityHeader {
  [headerName: string]: string | string[] | undefined
}

interface StatusLine {
  httpVersion: string
  statusCode: string
  reasonPhrase: string
}
