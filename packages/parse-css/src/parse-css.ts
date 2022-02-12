import css from 'css'

export default function parseCSS(code: string, options?: css.ParserOptions) {
  return css.parse(code, options)
}
