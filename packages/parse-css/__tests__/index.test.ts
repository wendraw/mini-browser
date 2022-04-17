import { NodeTypes, ElementNode } from '@mini-browser/shared'
import { CssParser } from '../src'

test('sample selector', () => {
  const parser = new CssParser()
  parser.parseCSS('.a{color: red}')
  const dom: ElementNode = {
    type: NodeTypes.ELEMENT,
    tagName: 'div',
    attributes: [{ name: 'class', value: 'a' }],
  }
  const computedStyle = parser.computedCSS(dom)
  expect(computedStyle).toEqual({
    color: { value: 'red', specificity: [0, 0, 1, 0] },
  })
})
