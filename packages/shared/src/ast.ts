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
}

export interface ElementNode extends Node {
  type: NodeTypes.ELEMENT
  attributes: Attribute[]
  tagName: string
  parent?: ElementNode | null
  children?: ElementNode[]
  prev?: ElementNode | null
  next?: ElementNode | null
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT
  content: string
}

export interface Attribute {
  name: string
  value: string
  specificity: Specificity
}

export type Specificity = [number, number, number, number]
