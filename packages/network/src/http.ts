import net from 'net'
import { Request, RequestOptional } from './request'
import { Response } from './response'

let client: net.Socket | null

/**
 * 仿 http 的接口
 * @param url 请求地址
 * @param init 请求可选的参数
 * @returns Promise<Response>
 */
export default function fakeHttp(url: string, init?: RequestOptional) {
  return new Promise<Response>((resolve, reject) => {
    const req = new Request(url, init)
    let responseData = Buffer.alloc(0)
    if (client && client.connecting) {
      // TCP connecting
      client.write(req.toString())
    } else if (client) {
      // TCP close
      client.connect(
        {
          host: req.requestLine.requestURI.host,
          port: req.requestLine.requestURI.port,
        },
        () => {
          client?.write(req.toString())
        }
      )
    } else {
      // TCP client not exist
      client = net.createConnection(
        {
          host: req.requestLine.requestURI.host,
          port: req.requestLine.requestURI.port,
        },
        () => {
          client?.write(req.toString())
        }
      )
    }
    client.on('data', (data) => {
      responseData = Buffer.concat([responseData, data])
    })
    client.on('end', () => {
      const response = new Response(responseData)
      resolve(response)
    })
    client.on('error', (err) => {
      client = null
      reject(err)
    })
  })
}
