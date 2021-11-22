export function splitWith(source: Buffer, pattern: string) {
  return split(source, Buffer.from(pattern))
}

export function split(source: Buffer, pattern: Buffer): Array<Buffer> {
  const res: Buffer[] = []
  if (source.length < pattern.length || pattern.length === 0) return [source]

  const getNext = (p: Buffer): Buffer => {
    const next = Buffer.alloc(p.length).fill(0)
    let j = 0 // 最长可匹配前缀子串的下一个位置
    // i 是已匹配前缀的下一个位置
    for (let i = 1; i < pattern.length; i++) {
      while (j !== 0 && pattern[j] !== pattern[i - 1]) {
        j = next[i]
      }
      if (j !== i - 1 && pattern[j] === pattern[i - 1]) j++
      next[i] = j
    }
    return next
  }

  const next = getNext(pattern)
  let matched = 0 // 已经匹配的长度
  let start = 0
  for (let i = 0; i < source.length; i++) {
    while (matched > 0 && source[i] !== pattern[matched]) {
      // 遇到坏字符时，查询 next 数组并改变模式串的起点
      matched = next[matched]
    }
    if (source[i] === pattern[matched]) matched++
    if (matched === pattern.length) {
      // 去除前面的空串
      if (start < i - matched + 1) {
        res.push(source.slice(start, i - matched + 1))
      }
      start = i + 1
      matched = 0
    }
  }
  // 去除后面的空串
  if (start < source.length) {
    res.push(source.slice(start))
  }
  return res
}
