// TODO: this should be custom
export function urlParse(
  url: string | URL,
  baseUrl?: string | URL | undefined
): URL {
  return new URL(url, baseUrl)
}
