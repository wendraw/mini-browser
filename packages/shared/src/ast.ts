export enum NodeTypes {
  DOCUMENT,
  ELEMENT,
  TEXT,
}

export interface Node {
  type: NodeTypes
}

export interface DocumentNode extends Node {
  type: NodeTypes.DOCUMENT
  children?: (ElementNode | TextNode)[]
}

export interface ElementNode extends Node {
  type: NodeTypes.ELEMENT
  attributes: Attribute[]
  tagName: string
  parent?: ElementNode | DocumentNode | null
  children?: (ElementNode | TextNode)[]
  prev?: ElementNode | TextNode | null
  next?: ElementNode | TextNode | null
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT
  content: string
  parent?: ElementNode | DocumentNode | null
  prev?: ElementNode | TextNode | null
  next?: ElementNode | TextNode | null
}

export interface Attribute {
  name: string
  value: string
  specificity?: Specificity
}

export type Specificity = [number, number, number, number]
