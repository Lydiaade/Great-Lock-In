import { PHASES, VIEWS, loadImage } from './photoStore'
import { fmtShort, endDate, toDate } from './challenge'

// Draws the shareable before & after images: one image per view (front / side / back)
// that has at least one photo, Before on the left and After on the right.
const W = 1080, PAD = 48, GAP = 16
const CELL_W = (W - PAD * 2 - GAP) / 2
const CELL_H = Math.round(CELL_W * 4 / 3)
const COLORS = { bg: '#101613', card: '#1A2320', line: '#2C3934', ink: '#EDEAE0', dim: '#93A39B', faint: '#5E6E67', gold: '#D3A75B', green: '#3FA772' }
const SANS = "'Space Grotesk', -apple-system, 'Helvetica Neue', Arial, sans-serif"
const MONO = "'IBM Plex Mono', Menlo, monospace"

export function viewsWithPhotos(urls) {
  return VIEWS.filter((v) => PHASES.some((p) => urls[`${p.key}:${v.key}`]))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / s, sh = h / s
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h)
}

function pill(ctx, text, x, y) {
  ctx.font = `600 22px ${SANS}`
  const tw = ctx.measureText(text).width
  ctx.fillStyle = 'rgba(16,22,19,0.72)'
  roundRect(ctx, x, y, tw + 28, 40, 20)
  ctx.fill()
  ctx.fillStyle = COLORS.ink
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 14, y + 21)
  ctx.textBaseline = 'alphabetic'
}

// One image per view with photos: [{ view, blob }].
export async function buildBeforeAfterSet(c, urls, summary) {
  const views = viewsWithPhotos(urls)
  if (!views.length) throw new Error('Add at least one photo first')
  if (document.fonts?.ready) await document.fonts.ready

  const imgs = {}
  await Promise.all(Object.entries(urls).map(async ([slot, url]) => { imgs[slot] = await loadImage(url) }))
  return Promise.all(views.map(async (view) => ({ view, blob: await drawImage(c, imgs, summary, [view]) })))
}

function drawImage(c, imgs, summary, views) {
  const HEADER = 230, COLHEAD = 64, FOOTER = 110
  const H = HEADER + COLHEAD + views.length * (CELL_H + GAP) - GAP + FOOTER
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, W, H)

  // Header
  const end = endDate(c)
  ctx.fillStyle = COLORS.ink
  ctx.font = `700 58px ${SANS}`
  const title = views.length === 1 ? `${c.name} · ${views[0].label}` : c.name
  ctx.fillText(title, PAD, PAD + 56, W - PAD * 2)
  ctx.fillStyle = COLORS.dim
  ctx.font = `400 28px ${SANS}`
  ctx.fillText(`${fmtShort(c.startDate)} – ${fmtShort(end)} ${toDate(end).getFullYear()} · ${c.lengthDays} days`, PAD, PAD + 104)
  ctx.fillStyle = COLORS.gold
  ctx.font = `600 28px ${MONO}`
  ctx.fillText(summary.short, PAD, PAD + 146, W - PAD * 2)

  // Column headings
  const top = HEADER + COLHEAD
  ;[['BEFORE', fmtShort(c.startDate)], ['AFTER', fmtShort(end)]].forEach(([label, date], i) => {
    const x = PAD + i * (CELL_W + GAP)
    ctx.fillStyle = i ? COLORS.green : COLORS.ink
    ctx.font = `700 30px ${SANS}`
    ctx.fillText(label, x, top - 20)
    const lw = ctx.measureText(label + '  ').width
    ctx.fillStyle = COLORS.faint
    ctx.font = `400 26px ${SANS}`
    ctx.fillText(date, x + lw, top - 20)
  })

  // Photo grid
  views.forEach((v, row) => {
    const y = top + row * (CELL_H + GAP)
    PHASES.forEach((p, col) => {
      const x = PAD + col * (CELL_W + GAP)
      ctx.save()
      roundRect(ctx, x, y, CELL_W, CELL_H, 22)
      ctx.clip()
      const img = imgs[`${p.key}:${v.key}`]
      if (img) drawCover(ctx, img, x, y, CELL_W, CELL_H)
      else {
        ctx.fillStyle = COLORS.card
        ctx.fillRect(x, y, CELL_W, CELL_H)
        ctx.fillStyle = COLORS.faint
        ctx.font = `400 28px ${SANS}`
        ctx.textAlign = 'center'
        ctx.fillText('No photo', x + CELL_W / 2, y + CELL_H / 2)
        ctx.textAlign = 'left'
      }
      ctx.restore()
      pill(ctx, v.label, x + 16, y + 16)
    })
  })

  // Footer
  const fy = H - FOOTER + 58
  ctx.strokeStyle = COLORS.line
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(PAD, H - FOOTER + 10); ctx.lineTo(W - PAD, H - FOOTER + 10); ctx.stroke()
  ctx.fillStyle = COLORS.dim
  ctx.font = `500 26px ${SANS}`
  if (summary.prizeWon) ctx.fillText(`🏆 Prize won: ${summary.prizeWon}`, PAD, fy, W - PAD * 2 - 220)
  ctx.fillStyle = COLORS.faint
  ctx.textAlign = 'right'
  ctx.fillText('Lock In', W - PAD, fy)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/jpeg', 0.9))
}

// Save via the share sheet where supported (iPhone: "Save Image(s)" → Photos), otherwise
// fall back to regular downloads. `items`: [{ blob, filename }].
export async function saveImages(items) {
  const files = items.map(({ blob, filename }) => new File([blob], filename, { type: blob.type }))
  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files })
      return 'shared'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled'
    }
  }
  items.forEach(({ blob, filename }, i) => setTimeout(() => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, i * 400)) // stagger so browsers don't drop multiple downloads
  return 'downloaded'
}
