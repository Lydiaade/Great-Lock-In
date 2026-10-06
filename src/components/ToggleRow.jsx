export default function ToggleRow({ on, label, sub, onClick, variant }) {
  const cls = ['gli-row', on ? 'on' : '', variant ? `gli-${variant}row` : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} onClick={onClick} role="switch" aria-checked={on} tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}>
      <div className="txt">
        <div className="t">{label}</div>
        {sub ? <div className="s">{sub}</div> : null}
      </div>
      <div className="gli-switch"><div className="knob" /></div>
    </div>
  )
}
