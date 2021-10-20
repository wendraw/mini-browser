import net from 'net'
import { Request, requestOptional } from './request'
import { Response } from './response'

let client: net.Socket

export default async function fakeHttp(url: string, init?: requestOptional) {
  return new Promise((resolve, reject) => {
    const req = new Request(url, init)
    let responseData = Buffer.alloc(0)
    if (client) {
      client.write(req.toString())
    } else {
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
      console.log(response.statusLine, response.header)
      console.log('================', Buffer.from(response.messageBody).length)
    })
    client.on('error', (err) => {
      reject(err)
    })
  })
}
