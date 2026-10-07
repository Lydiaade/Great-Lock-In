import { useEffect, useRef } from 'react'
import { challengeSummary, bodyChanges } from '../challenge'

const COLORS = ['#3FA772', '#D3A75B', '#6FA3D6', '#EDEAE0', '#D9705F', '#9B7BD6']

// Full-screen confetti + "challenge complete" card.
export default function Celebration({ c, getDay, body, onClose, onPhotos }) {
  const canvasRef = useRef(null)
  const s = challengeSummary(c, getDay)
  const changes = bodyChanges(c, body)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => window.innerWidth, h = () => window.innerHeight
    const burst = (n, x, y) => Array.from({ length: n }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
      const v = 7 + Math.random() * 9
      return {
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        size: 6 + Math.random() * 6, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: Math.random() < 0.3 ? 'circle' : 'rect',
      }
    })
    let parts = [...burst(90, w() * 0.2, h() * 0.75), ...burst(90, w() * 0.8, h() * 0.75)]
    const start = performance.now()
    let frame, lastBurst = start

    const tick = (t) => {
      // A couple of extra bursts for the first few seconds.
      if (t - start < 2600 && t - lastBurst > 900) {
        parts = parts.concat(burst(60, w() * (0.3 + Math.random() * 0.4), h() * 0.6))
        lastBurst = t
      }
      ctx.clearRect(0, 0, w(), h())
      parts.forEach((p) => {
        p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill() }
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      })
      parts = parts.filter((p) => p.y < h() + 40)
      if (parts.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="gli-celebrate" role="dialog" aria-modal="true" aria-label="Challenge complete">
      <canvas ref={canvasRef} className="confetti" aria-hidden="true" />
      <div className="card">
        <div className="trophy" aria-hidden="true">🎉</div>
        <div className="t">Challenge complete!</div>
        <div className="name">{c.name}</div>
        <div className="headline gli-mono">{s.headline}</div>
        {s.lines.slice(1).map((l) => <div className="line" key={l}>{l}</div>)}
        {s.prizeWon && <div className="prize won">🏆 You&rsquo;ve won: <b>{s.prizeWon}</b></div>}
        {s.prizeMissed && <div className="prize">So close — the prize ({s.prizeMissed}) stayed locked this time, but you made it to the end.</div>}
        {changes.rows.length > 0 && <BodyChanges changes={changes} />}
        <button className="gli-btn primary block" onClick={onPhotos}>Make my before &amp; after images</button>
        <button className="gli-btn block" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

const fmtNum = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

function Delta({ diff, unit }) {
  if (diff === 0) return <span className="delta same">no change</span>
  return (
    <span className={'delta ' + (diff < 0 ? 'down' : 'up')}>
      {diff < 0 ? '↓' : '↑'} {fmtNum(Math.abs(diff))} {unit}
    </span>
  )
}

function BodyChanges({ changes }) {
  const { rows, totalCm } = changes
  // Only label the span when every row compares the same two check-ins.
  const sameSpan = rows.every((r) => r.fromLabel === rows[0].fromLabel && r.toLabel === rows[0].toLabel)
  const span = sameSpan ? `${rows[0].fromLabel} → ${rows[0].toLabel}` : ''
  return (
    <div className="gli-bodychanges">
      <div className="hd">Body changes <span>{span}</span></div>
      {rows.map((r) => (
        <div className="row" key={r.key}>
          <span className="l">{r.label}</span>
          <span className="v gli-mono">{fmtNum(r.from)} → {fmtNum(r.to)} {r.unit}</span>
          <Delta diff={r.diff} unit={r.unit} />
        </div>
      ))}
      {totalCm !== null && (
        <div className="row total">
          <span className="l">All measurements</span>
          <span className="v" />
          <Delta diff={totalCm} unit="cm" />
        </div>
      )}
    </div>
  )
}
