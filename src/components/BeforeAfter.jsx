import { useEffect, useState } from 'react'
import { PHASES, VIEWS } from '../photoStore'
import { buildBeforeAfterSet, saveImages, viewsWithPhotos } from '../beforeAfterImage'
import { challengeSummary, fmtShort, endDate } from '../challenge'

// Start / end progress photos (front, side, back) and the generated before & after images.
export default function BeforeAfter({ c, getDay, photos }) {
  const { urls, busy, error, setPhoto, removePhoto } = photos
  const [results, setResults] = useState(null) // [{ view, blob, url, filename }]
  const [making, setMaking] = useState(false)
  const [msg, setMsg] = useState('')
  const canMake = viewsWithPhotos(urls).length > 0

  // Release preview URLs when they're replaced or the view closes.
  useEffect(() => () => { results?.forEach((r) => URL.revokeObjectURL(r.url)) }, [results])

  const slug = c.name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'challenge'
  const make = async () => {
    setMaking(true); setMsg('')
    try {
      const set = await buildBeforeAfterSet(c, urls, challengeSummary(c, getDay))
      setResults(set.map(({ view, blob }) => ({
        view, blob, url: URL.createObjectURL(blob), filename: `${slug}-${view.key}-before-after.jpg`,
      })))
    } catch (e) {
      setMsg(e.message)
    } finally {
      setMaking(false)
    }
  }

  const save = async (items) => {
    const how = await saveImages(items)
    if (how === 'downloaded') setMsg('Downloaded. You can also press and hold an image to save it.')
  }

  return (
    <div id="before-after">
      <div className="gli-label">Before &amp; after photos</div>
      <div className="gli-hint">
        Add front, side and back photos at the start and again at the end, then create a before &amp; after image
        for each view to save or share. Photos stay on this device.
      </div>

      {PHASES.map((p) => (
        <div className="gli-card" key={p.key}>
          <div className="gli-photohead">
            <b>{p.key === 'start' ? 'Start' : 'End'}</b>
            <span>{p.key === 'start' ? fmtShort(c.startDate) : fmtShort(endDate(c))}</span>
          </div>
          <div className="gli-photogrid">
            {VIEWS.map((v) => {
              const slot = `${p.key}:${v.key}`
              const url = urls[slot]
              return (
                <div className="gli-photoslot" key={v.key}>
                  <label className={'tile' + (url ? ' has' : '')}>
                    {url ? <img src={url} alt={`${p.label} ${v.label}`} /> : <span className="plus">+</span>}
                    {busy === slot && <span className="busy">Saving…</span>}
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (f) setPhoto(p.key, v.key, f)
                    }} />
                  </label>
                  <div className="cap">
                    {v.label}
                    {url && <button className="gli-linkbtn" onClick={() => removePhoto(p.key, v.key)}>Remove</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {error && <div className="gli-error">{error}</div>}

      <button className="gli-btn primary block" disabled={!canMake || making} onClick={make}>
        {making ? 'Creating…' : results ? 'Re-create before & after images' : 'Create before & after images'}
      </button>
      {!canMake && <div className="gli-hint center">Add at least one photo to create the images.</div>}
      {msg && <div className="gli-hint center">{msg}</div>}

      {results && (
        <div className="gli-baresult">
          {results.length > 1 && (
            <button className="gli-btn primary block" onClick={() => save(results)}>
              Save all {results.length} images
            </button>
          )}
          {results.map((r) => (
            <div className="item" key={r.view.key}>
              <div className="gli-label">{r.view.label}</div>
              <img src={r.url} alt={`${r.view.label} before and after`} />
              <button className="gli-btn block" onClick={() => save([r])}>Save / Share {r.view.label.toLowerCase()} image</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
