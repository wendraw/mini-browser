import { Parser } from 'htmlparser2'
import {
  ElementNode,
  DocumentNode,
  NodeTypes,
  Attribute,
  TextNode,
} from '@mini-browser/shared'

export interface Handle {
  onScriptCallback?: (scriptNode: ElementNode) => void
  onStyleCallback?: (styleNode: ElementNode) => void
}

export default class HTMLParser {
  public dom: DocumentNode | ElementNode

  private stack: (DocumentNode | ElementNode)[]

  private parser: Parser

  private callback: Handle

  constructor(callback: Handle) {
    this.dom = {
      type: NodeTypes.DOCUMENT,
      tagName: 'document',
      children: [],
    } as DocumentNode
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
    }
  ) {
    const top = this.stack[this.stack.length - 1]
    const attrs: Attribute[] = Object.entries(attributes).map(
      ([key, value]) => ({
        name: key,
        value,
      })
    )
    const element: ElementNode = {
      type: NodeTypes.ELEMENT,
      tagName: name,
      attributes: attrs,
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
    const textNode: TextNode = {
      type: NodeTypes.TEXT,
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

  private onCloseTag(name: string) {
    if (name === 'script') {
      if (this.stack.length) {
        const scriptNode = this.stack[this.stack.length - 1] as ElementNode
        if (this.callback?.onScriptCallback) {
          this.callback?.onScriptCallback(scriptNode)
        }
      }
    }

    if (name === 'style') {
      if (this.stack.length) {
        const styleNode = this.stack[this.stack.length - 1] as ElementNode
        if (this.callback?.onStyleCallback) {
          this.callback?.onStyleCallback(styleNode)
        }
      }
    }
    this.stack.pop()
  }
}
