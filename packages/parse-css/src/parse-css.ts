import css from 'css'

import { ElementNode, Specificity } from '@mini-browser/shared'

export const cssType = css

export function parseCSS(
  code: string,
  options?: css.ParserOptions
): css.Stylesheet {
  return css.parse(code, options)
}

export interface Style {
  [property: string]: {
    value: unknown
    specificity: Specificity
  }
}

export class CssParser {
  private rules: css.Rule[] = []

  options?: css.ParserOptions | null = null

  constructor(options?: css.ParserOptions) {
    this.options = options
  }

  public parseCSS(code: string, options?: css.ParserOptions): css.Rule[] {
    const ast = css.parse(code, options)
    this.rules.push(...(ast?.stylesheet?.rules || []))
    return ast?.stylesheet?.rules as css.Rule[]
  }

  public computedCSS(element: ElementNode) {
    const computedStyle: Style = {}

    for (const rule of this.rules) {
      // css 库会将选择器列表拆开，用一个数组 selectors 存储
      const { selectors = [], declarations = [] } = rule
      for (const complexSelector of selectors) {
        if (match(element, complexSelector)) {
          const sp = getSpecificity(complexSelector)
          for (const declaration of declarations) {
            // 专驼峰命名：flex-wrap --> flexWrap
            const property =
              (declaration as css.Declaration).property?.replace(
                /-([a-z])/g,
                (_: any, char: string) => char.toUpperCase()
              ) || ''
            if (
              !computedStyle[property]?.specificity ||
              compare(computedStyle[property].specificity, sp) < 0
            ) {
              computedStyle[property] = {
                value: (declaration as css.Declaration).value,
                specificity: sp,
              }
            }
          }
        }
      }
    }

    return computedStyle
  }
}

const attrValueComparator = {
  '=': (attrValue: string, value: string) => attrValue === value,
  '~=': (attrValue: string, value: string) =>
    attrValue.split(/\s+/g).includes(value),
  '|=': (attrValue: string, value: string) =>
    attrValue === value || attrValue.startsWith(`${value}-`),
  '^=': (attrValue: string, value: string) => attrValue.startsWith(value),
  '$=': (attrValue: string, value: string) => attrValue.endsWith(value),
  '*=': (attrValue: string, value: string) => attrValue.includes(value),
}

function match(element: ElementNode, complexSelector: string) {
  if (!complexSelector || !element.attributes) return false

  // 去掉各种空格，combination 前后都可以插入各种空格
  // body        #id        > .cls      +   [id=id]:not(.c1)
  // body #id>.cls+[id=id]:not(.c1)
  // 将 combination 符号放到父元素、兄长元素去，方便后续决定匹配方式
  const compoundSelectors = complexSelector
    .trim()
    .replace(/\s+(?=[ ~+>])/g, '') // 去除 combination 前空格
    .replace(/(?<=[~+>])\s+/g, '') // 去除 combination 后空格
    .split(/(?<=[ ~+>])/g) // 以 combination 进行拆分，得到复合选择器

  let curElement: ElementNode | null = element
  while (curElement && compoundSelectors.length) {
    // 从后向前匹配
    curElement = foundMatchedElement(curElement, compoundSelectors.pop())
  }

  return !!curElement
}

function foundMatchedElement(
  element: ElementNode,
  compoundSelector: string | undefined
) {
  if (!element || !compoundSelector) return null

  let curElement: ElementNode | null = element

  if (compoundSelector.endsWith(' ')) {
    // 后代选择器
    const selector = compoundSelector.replace(' ', '')
    do {
      curElement = element.parent as ElementNode
    } while (element && !matchByCompoundSelector(curElement, selector))
  } else if (compoundSelector.endsWith('>')) {
    // 儿子选择器
    const selector = compoundSelector.replace('>', '')
    curElement = curElement.parent as ElementNode
    if (!matchByCompoundSelector(curElement, selector)) {
      curElement = null
    }
  } else if (compoundSelector.endsWith('~')) {
    // 通用兄弟选择器
    const selector = compoundSelector.replace('~', '')
    do {
      curElement = curElement.prev as ElementNode
    } while (curElement && !matchByCompoundSelector(curElement, selector))
  } else if (compoundSelector.endsWith('+')) {
    // 相邻兄弟选择器
    const selector = compoundSelector.replace('+', '')
    curElement = element.prev as ElementNode
    if (!matchByCompoundSelector(curElement, selector)) {
      curElement = null
    }
  }
  // 普通的复合选择器
  if (!matchByCompoundSelector(curElement, compoundSelector)) {
    curElement = null
  }
  return curElement || null
}

function matchByCompoundSelector(
  element: ElementNode | null,
  compoundSelector: string
): boolean {
  if (!element || !compoundSelector) return false

  // 将「以 # . [ 开头」或者「以 : 开头 ) 结尾」的字符串切分出来
  // "a#id.link[src^="https"]:not(#id[src$='.pdf'])" 变成 ==>
  // ["a", "#id", ".link", "[src^="https"]", ":not(#id[src$='.pdf'])"]
  const simpleSelectors = compoundSelector.split(/(?<!\([^)]*)(?=[#.[:])/g)
  return simpleSelectors.every((simpleSelector) =>
    matchBySimpleSelector(element, simpleSelector)
  )
}

function matchBySimpleSelector(element: ElementNode, simpleSelector: string) {
  if (!element || !simpleSelector) return false

  if (simpleSelector === '*') {
    return true
  }
  if (simpleSelector.startsWith('#')) {
    // id selector
    const attr = element.attributes.filter((att) => att.name === 'id')[0]
    return !!attr && attr.value === simpleSelector.replace('#', '')
  }
  if (simpleSelector.startsWith('.')) {
    // class selector
    const attr = element.attributes.filter((att) => att.name === 'class')[0]
    return (
      !!attr &&
      attr.value.split(/\s+/g).includes(simpleSelector.replace('.', ''))
    )
  }
  if (simpleSelector.match(/^\[(.+?)\]$/)) {
    // attribute selector
    // (.+?) 把属性选择器的中间部分取出来了

    const matched = /([\w-]+)\s*(?:([~|^$*]?=)\s*(\S+))?/.exec(RegExp.$1)
    if (!matched) return false
    const name = matched[1]
    // 比较符：有 =、~=、|=、^=、$=、*=
    const comparator = matched[2] as '=' | '~=' | '|=' | '^=' | '$=' | '*='
    const value = matched[3] && matched[3].replace(/["']/g, '') // 去掉 value 的引号
    // 属性名比较
    const attr = element.attributes.find((att) => att.name === name)
    if (!attr) return false
    // 没有比较符号就没有属性值的比较
    if (!comparator) return true
    return attrValueComparator[comparator](attr.value, value)
  }
  if (simpleSelector.match(/^:not\((.+)\)/)) {
    // negation selector
    const compoundSelector = RegExp.$1.replace(/:not\(.*?\)/, '')
    return !matchByCompoundSelector(element, compoundSelector)
  }
  // tag selector
  return element.tagName === simpleSelector
}

function getSpecificity(complexSelector: string) {
  const specificity: Specificity = [0, 0, 0, 0]
  // 去除:not()，去除~+>，拆分复杂选择器
  complexSelector
    .replace(/:not\((.+?)\)/, ' $1')
    .replace(/[~+>]/g, ' ')
    .split(/\s+/g)
    .forEach((selector) => {
      // 拆分简单选择器
      selector.split(/(?<=[\w\]])(?=[#.:[])/).forEach((part) => {
        if (part.startsWith('#')) {
          specificity[1] += 1
        } else if (part.startsWith('.')) {
          specificity[2] += 1
        } else {
          specificity[3] += 1
        }
      })
    })
  return specificity
}

// 比较优先级
function compare(sp1: Specificity, sp2: Specificity) {
  if (sp1[0] - sp2[0]) return sp1[0] - sp2[0]
  if (sp1[1] - sp2[1]) return sp1[1] - sp2[1]
  if (sp1[2] - sp2[2]) return sp1[2] - sp2[2]
  return sp1[3] - sp2[3]
}
