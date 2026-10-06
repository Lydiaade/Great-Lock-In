import { useState } from 'react'
import { fmtRange } from '../challenge'
import { TEMPLATES } from '../presets'

export function ThemePicker({ pref, setPref }) {
  return (
    <div className="gli-seg">
      {[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => (
        <button key={k} className={pref === k ? 'active' : ''} onClick={() => setPref(k)}>{l}</button>
      ))}
    </div>
  )
}

export function TemplatePicker({ onPick }) {
  return TEMPLATES.map((t) => (
    <button key={t.key} className="gli-chcard pick" onClick={() => onPick(t.make())}>
      <div className="t">{t.label}</div>
      <div className="s">{t.desc}</div>
    </button>
  ))
}

export default function SettingsView({ challenges, active, setActive, onEdit, onNew, deleteChallenge, resetAll, themePref, setThemePref, openGuide }) {
  const [picking, setPicking] = useState(false)
  // Inline two-step confirms: { kind: 'delete' | 'reset', id }
  const [confirm, setConfirm] = useState(null)

  return (
    <>
      <button className="gli-chcard pick gli-guidecard" onClick={openGuide}>
        <div className="t">❓ How it works</div>
        <div className="s">Rewards, streaks, rest days and holidays explained for this challenge</div>
      </button>

      <div className="gli-label">Appearance</div>
      <ThemePicker pref={themePref} setPref={setThemePref} />

      <div className="gli-label">Challenges</div>
      {challenges.map((c) => {
        const isActive = c.id === active.id
        return (
          <div className={'gli-chcard' + (isActive ? ' active' : '')} key={c.id}>
            <div className="hd">
              <div>
                <div className="t">{c.name}</div>
                <div className="s">{fmtRange(c)} · {c.rewardMode === 'money' ? `${c.currency} rewards` : 'Streak & prize'}</div>
              </div>
              {isActive && <span className="gli-badge">Active</span>}
            </div>
            {confirm?.id === c.id ? (
              <div className="gli-btnrow">
                <span className="gli-confirm-text">
                  {confirm.kind === 'delete' ? 'Delete this challenge and all its data?' : 'Clear all logged days and measurements?'}
                </span>
                <button className="gli-btn" onClick={() => setConfirm(null)}>Cancel</button>
                <button className="gli-btn danger" onClick={() => {
                  if (confirm.kind === 'delete') deleteChallenge(c.id); else resetAll()
                  setConfirm(null)
                }}>{confirm.kind === 'delete' ? 'Delete' : 'Clear'}</button>
              </div>
            ) : (
              <div className="gli-btnrow">
                {!isActive && <button className="gli-btn primary" onClick={() => setActive(c.id)}>Switch to</button>}
                <button className="gli-btn" onClick={() => onEdit(c)}>Edit</button>
                <button className="gli-btn" onClick={() => onNew({ ...c, name: c.name + ' (copy)' })}>Duplicate</button>
                {isActive && <button className="gli-btn" onClick={() => setConfirm({ kind: 'reset', id: c.id })}>Reset data</button>}
                <button className="gli-btn danger" onClick={() => setConfirm({ kind: 'delete', id: c.id })}>Delete</button>
              </div>
            )}
          </div>
        )
      })}

      {picking ? (
        <>
          <div className="gli-label">Start from…</div>
          <TemplatePicker onPick={(cfg) => { setPicking(false); onNew(cfg) }} />
          <button className="gli-reset" onClick={() => setPicking(false)}>Cancel</button>
        </>
      ) : (
        <button className="gli-btn primary block" onClick={() => setPicking(true)}>+ New challenge</button>
      )}

      <div className="gli-note">
        Your data is stored only on this device. Each challenge keeps its own days and measurements.
      </div>
    </>
  )
}
