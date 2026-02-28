export type DownloadMirror = {
  label: string
  url: string
}

export type DownloadLinkMap = Record<string, DownloadMirror[]>

function uniqByUrl(list: DownloadMirror[]) {
  const seen = new Set<string>()
  const out: DownloadMirror[] = []
  for (const item of list) {
    if (seen.has(item.url)) continue
    seen.add(item.url)
    out.push(item)
  }
  return out
}

function labelForUrl(_url: string, index: number) {
  return `Option ${index + 1}`
}

function isConsoleBuild(url: string): boolean {
  const lower = url.toLowerCase()
  return /[_\-.]ps4[_\-./]/.test(lower)
    || /[_\-.]ps5[_\-./]/.test(lower)
    || /[_\-.]xbox[_\-./]/.test(lower)
    || /[_\-.]switch[_\-./]/.test(lower)
    || lower.includes('_ps4')
    || lower.includes('_ps5')
    || lower.includes('_xbox')
}

export function scrapeLinksFromReadmeMarkdown(markdown: string): DownloadLinkMap {
  const out: DownloadLinkMap = {}

  const re = /(?:^|[\s|(<])(https?:\/\/[^\s|)>]+)/gm

  const urls: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown))) {
    urls.push(m[1].replace(/\|$/, ''))
  }

  for (const url of urls) {
    if (isConsoleBuild(url)) continue
    const keys = keysFromUrl(url)
    for (const key of keys) {
      out[key] ||= []
      out[key].push({ label: '', url })
    }
  }

  for (const k of Object.keys(out)) {
    const cleaned = uniqByUrl(out[k])
    out[k] = cleaned.map((x, i) => ({ ...x, label: labelForUrl(x.url, i) }))
  }

  return out
}

/**
 * Extract one or more lookup keys from a download URL.
 * Returns multiple keys so we can match from different angles.
 */
export function keysFromUrl(url: string): string[] {
  const last = (() => {
    try {
      const u = new URL(url)
      const seg = u.pathname.split('/').filter(Boolean).pop()
      return seg || null
    } catch {
      return null
    }
  })()

  if (!last) return []

  const filename = decodeURIComponent(last)
  const noQuery = filename.split('?')[0]
  const base = noQuery.replace(/\.(zip|rar|7z)$/i, '')
  const keys: string[] = []

  // "4.10-CL-4053532" → "4.10"
  // "11.00-CL-9562734" → "11.00"
  // "v35.00-CL-41994699" → "35.00"
  const clMatch = base.match(/v?(\d+\.\d+(?:\.\d+)?)-CL-\d+/)
  if (clMatch) {
    keys.push(clMatch[1].toLowerCase())
  }

  // "FortniteClient-6.20-CL-4497486" → "6.20"
  // "FortniteClient-11.10-CL-9901083" → "11.10"
  const fcMatch = base.match(/FortniteClient-(\d+\.\d+(?:\.\d+)?)/i)
  if (fcMatch) {
    keys.push(fcMatch[1].toLowerCase())
  }

  // "Fortnite 12.41" or "Fortnite v3.6" → "12.41" or "3.6"
  const fnMatch = base.match(/[Ff]ortnite\s+v?(\d+\.\d+(?:\.\d+)?)/)
  if (fnMatch) {
    keys.push(fnMatch[1].toLowerCase())
  }

  // "fortnite_v1.2" → "1.2"
  const fvMatch = base.match(/fortnite[_\s]+v(\d+\.\d+(?:\.\d+)?)/i)
  if (fvMatch) {
    keys.push(fvMatch[1].toLowerCase())
  }

  // "OT0.6.5" → "ot0.6.5" AND "ot6.5"
  const otMatch = base.match(/^OT(\d[\d.]*)/i)
  if (otMatch) {
    keys.push('ot' + otMatch[1].toLowerCase())
    const stripped = otMatch[1].replace(/^0\./, '')
    keys.push('ot' + stripped.toLowerCase())
  }

  // "fortnite_ot11_pc" → "ot11"
  const ot2Match = base.match(/fortnite[_\s]+ot(\d+)/i)
  if (ot2Match) {
    keys.push('ot' + ot2Match[1].toLowerCase())
  }

  // Plain version number: "5.00", "1.8.1", "8.51", "10.000"
  const plainMatch = base.match(/^v?(\d+\.\d+(?:\.\d+)?)$/)
  if (plainMatch) {
    keys.push(plainMatch[1].toLowerCase())
  }

  if (/^QAGame$/i.test(base)) {
    keys.push('qagame')
  }

  if (keys.length === 0) {
    keys.push(base.toLowerCase())
  }

  return [...new Set(keys)]
}

/**
 * Given a version's displayName, return all possible keys to look up in the link map.
 * Tries multiple variations so we don't rely on a single fragile mapping.
 */
export function getKeysForVersion(displayName: string): string[] {
  const v = displayName.trim()
  const vl = v.toLowerCase()
  const keys = [vl]

  // "5.00" → also try "5.0"
  if (/^\d+\.00$/.test(v)) {
    keys.push(v.replace(/\.00$/, '.0').toLowerCase())
  }

  // "3.0" → also try "3.00"
  if (/^\d+\.\d$/.test(v)) {
    keys.push(v + '0')
  }

  // "1.8.0" → also try "1.8"
  if (/^\d+\.\d+\.0$/.test(v)) {
    keys.push(v.replace(/\.0$/, '').toLowerCase())
  }

  // "1.8" → also try "1.8.0"
  if (/^\d+\.\d$/.test(v)) {
    keys.push(v + '.0')
  }

  // "OT6.5" → "ot6.5" and "ot0.6.5"
  if (/^OT/i.test(v)) {
    const num = v.replace(/^OT/i, '')
    keys.push('ot' + num.toLowerCase())
    keys.push('ot0.' + num.toLowerCase())
  }

  // "Cert" → "cert"
  if (/^cert$/i.test(v)) {
    keys.push('cert')
    keys.push('fortnite')
  }

  // "1.2.0" → "1.2"
  if (/^\d+\.\d+\.0$/.test(v)) {
    keys.push(v.slice(0, -2).toLowerCase())
  }

  // "QAGame UE4.11" or "QAGame UE5.2"
  if (/^QAGame/i.test(v)) {
    keys.push('qagame')
  }

  // "Main-CL-21452241"
  const mainMatch = v.match(/^Main-CL-(\d+)$/i)
  if (mainMatch) {
    keys.push('++fortnite+main-cl-' + mainMatch[1] + '-pf-ed8a')
    keys.push(vl)
  }

  // "10.31" → also try "10.31"
  // "6.01.1" → also try "6.1.1" (some URLs use 6.1.1 instead of 6.01.1)
  const dotParts = v.split('.')
  if (dotParts.length >= 2 && /^0\d$/.test(dotParts[1])) {
    const alt = [dotParts[0], dotParts[1].replace(/^0/, ''), ...dotParts.slice(2)].join('.')
    keys.push(alt.toLowerCase())
  }

  return [...new Set(keys)]
}

export function readmeKeyForVersionDisplayName(displayName: string): string {
  return getKeysForVersion(displayName)[0]
}
