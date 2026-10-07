import { bodyCheckpoints, BODY_FIELDS } from '../challenge'

export default function BodyView({ c, body, setBodyField }) {
  return (
    <>
      <div className="gli-label">Weekly weigh-in &amp; measurements</div>
      {bodyCheckpoints(c).map((cp) => {
        const b = body[cp.key] || {}
        return (
          <div className="gli-bodycard" key={cp.key}>
            <div className="hd">{cp.label} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>· {cp.date}</span></div>
            <div className="gli-fieldgrid">
              {BODY_FIELDS.map(({ key: field, label, unit }) => (
                <div className="gli-field" key={field}>
                  <label>{label} ({unit})</label>
                  <input type="text" inputMode="decimal" value={b[field] || ''}
                         onChange={(e) => setBodyField(cp.key, field, e.target.value)} />
                </div>
              ))}
            </div>
            <input className="gli-bodynotes" placeholder="Notes" value={b.notes || ''}
                   onChange={(e) => setBodyField(cp.key, 'notes', e.target.value)} />
          </div>
        )
      })}
    </>
  )
}
