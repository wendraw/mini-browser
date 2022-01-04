import HTMLParser from '../src/index'

test('single tag', async () => {
  const { dom } = new HTMLParser({}).parse('<div></div>')
  removeProps(dom, ['parent', 'prev', 'next'])

  expect(dom).toEqual({
    type: 'document',
    tagName: 'document',
    children: [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [],
      },
    ],
  })
})

test('self close tag', async () => {
  const { dom } = new HTMLParser({}).parse('<div />')
  removeProps(dom, ['parent', 'prev', 'next'])

  expect(dom).toEqual({
    type: 'document',
    tagName: 'document',
    children: [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [],
      },
    ],
  })
})

test('children tag', async () => {
  const { dom } = new HTMLParser({}).parse('<div>1234<span></span></div>')
  removeProps(dom, ['parent', 'prev', 'next'])

  expect(dom).toEqual({
    type: 'document',
    tagName: 'document',
    children: [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [
          {
            type: 'text',
            content: '1234',
          },
          {
            type: 'element',
            tagName: 'span',
            attributes: {},
            children: [],
          },
        ],
      },
    ],
  })
})

function removeProps(obj: any, props: string[]): void {
  for (const key of Object.keys(obj)) {
    if (props.includes(key)) {
      // eslint-disable-next-line no-param-reassign
      delete obj[key]
    }
    if (obj.children) {
      for (const child of obj.children) {
        removeProps(child, props)
      }
    }
  }
}
