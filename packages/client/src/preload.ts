// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { fakeHttp } from '@mini-browser/network'
import HTMLParser from '@mini-browser/parse-html'
// import render from './modules/render'

window.addEventListener('DOMContentLoaded', () => {
  const go = document.getElementById('go')
  const app = document.getElementById('app')
  const browserContent = document.createElement('canvas')
  browserContent.id = 'browser-content'
  browserContent.width = 600
  browserContent.height = 600
  app?.appendChild(browserContent)

  console.log('xxxxxx')

  go?.addEventListener('click', async () => {
    alert('xxxxxx')
    browserContent
      ?.getContext('2d')
      ?.clearRect(0, 0, browserContent.width, browserContent.height)
    const urlInput = document.getElementById('url-input')
    const url = (urlInput as HTMLInputElement).value
    console.log('click', url)
    const response = await fakeHttp('http://www.baidu.com', {
      headers: {
        host: 'www.baidu.com',
        Connection: 'close',
      },
    })
    console.log('html:', response)
    const { dom } = new HTMLParser({}).parse(response.messageBody.toString())
    console.log('DOM:', dom)
    // render(browserContent, DOM)
  })
})
