export interface IGeneralHeader {
  'Cache-Control'?: string
  Connection?: string
  Date?: string
  Pragma?: string
  Trailer?: string
  'Transfer-Encoding'?: string
  Upgrade?: string
  Via?: string
  Warning?: string
}

export interface IRequestHeader {
  Accept?: string
  'Accept-Charset'?: string
  'Accept-Encoding'?: string
  'Accept-Language'?: string
  Authorization?: string
  Expect?: string
  From?: string
  Host?: string
  'If-Match'?: string
  'If-Modified-Since'?: string
  'If-None-Match'?: string
  'If-Range'?: string
  'If-Unmodified-Since'?: string
  'Max-Forwards'?: string
  'Proxy-Authorization'?: string
  Range?: string
  Referer?: string
  TE?: string
  'User-Agent'?: string
}

export interface IResponseHeader {
  'Accept-Ranges'?: string
  Age?: string
  ETag?: string
  Location?: string
  'Proxy-Authenticate'?: string
  'Retry-After'?: string
  Server?: string
  Vary?: string
  'WWW-Authenticate'?: string
}

export interface IEntityHeader {
  Allow?: string
  'Content-Encoding'?: string
  'Content-Language'?: string
  'Content-Length'?: string
  'Content-Location'?: string
  'Content-MD5'?: string
  'Content-Range'?: string
  'Content-Type'?: string
  Expires?: string
  'Last-Modified'?: string
}
