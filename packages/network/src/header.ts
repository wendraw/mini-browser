export interface IGeneralHeader {
  'Cache-Control'?: string | string[]
  Connection?: string | string[]
  Date?: string | string[]
  Pragma?: string | string[]
  Trailer?: string | string[]
  'Transfer-Encoding'?: string | string[]
  Upgrade?: string | string[]
  Via?: string | string[]
  Warning?: string | string[]
}

export interface IRequestHeader {
  Accept?: string | string[]
  'Accept-Charset'?: string | string[]
  'Accept-Encoding'?: string | string[]
  'Accept-Language'?: string | string[]
  Authorization?: string | string[]
  Expect?: string | string[]
  From?: string | string[]
  Host?: string | string[]
  'If-Match'?: string | string[]
  'If-Modified-Since'?: string | string[]
  'If-None-Match'?: string | string[]
  'If-Range'?: string | string[]
  'If-Unmodified-Since'?: string | string[]
  'Max-Forwards'?: string | string[]
  'Proxy-Authorization'?: string | string[]
  Range?: string | string[]
  Referer?: string | string[]
  TE?: string | string[]
  'User-Agent'?: string | string[]
}

export interface IResponseHeader {
  'Accept-Ranges'?: string | string[]
  Age?: string | string[]
  ETag?: string | string[]
  Location?: string | string[]
  'Proxy-Authenticate'?: string | string[]
  'Retry-After'?: string | string[]
  Server?: string | string[]
  Vary?: string | string[]
  'WWW-Authenticate'?: string | string[]
}

export interface IEntityHeader {
  Allow?: string | string[]
  'Content-Encoding'?: string | string[]
  'Content-Language'?: string | string[]
  'Content-Length'?: string | string[]
  'Content-Location'?: string | string[]
  'Content-MD5'?: string | string[]
  'Content-Range'?: string | string[]
  'Content-Type'?: string | string[]
  Expires?: string | string[]
  'Last-Modified'?: string | string[]
}
