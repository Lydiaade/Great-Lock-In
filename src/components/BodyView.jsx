import { bodyCheckpoints } from '../challenge'

const FIELDS = [['weight', 'kg'], ['waist', 'cm'], ['hips', 'cm'], ['chest', 'cm'], ['thighs', 'cm'], ['arms', 'cm']]

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
              {FIELDS.map(([field, unit]) => (
                <div className="gli-field" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)} ({unit})</label>
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
