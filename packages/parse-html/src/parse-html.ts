import { Parser } from 'htmlparser2'

type DOMType = 'document' | 'element' | 'text'

interface DOMNode {
  type: DOMType
  tagName?: string
  attributes?: { name?: string }
  content?: string
  parent?: DOMNode | null
  children?: DOMNode[]
  prev?: DOMNode | null
  next?: DOMNode | null
}

export interface Handle {
  onScriptCallback?: (scriptNode: DOMNode) => void
  onStyleCallback?: (styleNode: DOMNode) => void
}

export default class HTMLParser {
  public dom: DOMNode

  private stack: DOMNode[]

  private parser: Parser

  private callback: Handle

  constructor(callback: Handle) {
    this.dom = {
      type: 'document',
      tagName: 'document',
      children: [],
    }
    this.stack = [this.dom]
    this.parser = new Parser(
      {
        onopentag: this.onOpenTag.bind(this),
        ontext: this.onText.bind(this),
        onclosetag: this.onCloseTag.bind(this),
      },
      {
        recognizeSelfClosing: true,
      }
    )
    this.callback = callback
  }

  parse(text: string) {
    this.parser.write(text)
    this.parser.end()
    return this
  }

  private onOpenTag(
    name: string,
    attributes: {
      [s: string]: string
    },
    isImplied: boolean
  ) {
    const top = this.stack[this.stack.length - 1]
    const element: DOMNode = {
      type: 'element',
      tagName: name,
      attributes,
      parent: top,
      children: [],
    }
    if (!top.children) {
      top.children = []
    }
    if (top.children.length) {
      const lastChild = top.children[top.children.length - 1]
      lastChild.next = element
      element.prev = lastChild
    }
    top.children.push(element)
    this.stack.push(element)
  }

  private onText(content: string) {
    const top = this.stack[this.stack.length - 1]
    const text = content.replace(/\s+/g, ' ')
    if (text === ' ') return
    const textNode: DOMNode = {
      type: 'text',
      content: text,
      parent: top,
    }
    if (!top.children) {
      top.children = []
    }
    if (top.children.length) {
      const lastChild = top.children[top.children.length - 1]
      lastChild.next = textNode
      textNode.prev = lastChild
    }
    top.children.push(textNode)
  }

  private onCloseTag(name: string, isImplied: boolean) {
    if (name === 'script') {
      if (this.stack.length) {
        const scriptNode = this.stack[this.stack.length - 1]
        if (this.callback?.onScriptCallback) {
          this.callback?.onScriptCallback(scriptNode)
        }
      }
    }

    if (name === 'style') {
      if (this.stack.length) {
        const styleNode = this.stack[this.stack.length - 1]
        if (this.callback?.onStyleCallback) {
          this.callback?.onStyleCallback(styleNode)
        }
      }
    }
    this.stack.pop()
  }
}
