import { useState } from 'react'
import './App.css'
import { defaultDayIdx } from './challenge'
import { useChallenges } from './useChallenges'
import { useTrackerData } from './useTrackerData'
import { useTheme } from './useTheme'
import Hero from './components/Hero'
import NavBar from './components/NavBar'
import TodayView from './components/TodayView'
import WeekView from './components/WeekView'
import TotalsView from './components/TotalsView'
import BodyView from './components/BodyView'
import SettingsView, { TemplatePicker, ThemePicker } from './components/SettingsView'
import ChallengeEditor from './components/ChallengeEditor'

export default function App() {
  const [themePref, setThemePref] = useTheme()
  const { challenges, active, addChallenge, updateChallenge, deleteChallenge, setActive } = useChallenges()
  const [tab, setTab] = useState('today')
  // { id: string | null (new), config }
  const [editor, setEditor] = useState(null)

  if (editor) {
    return (
      <div className="gli-app">
        <ChallengeEditor
          initial={editor.config}
          isNew={!editor.id}
          onCancel={() => setEditor(null)}
          onSave={(config) => {
            if (editor.id) updateChallenge(editor.id, config)
            else { addChallenge(config); setTab('today') }
            setEditor(null)
          }}
        />
      </div>
    )
  }

  if (!active) {
    return (
      <div className="gli-app">
        <div className="gli-view gli-welcome">
          <div className="gli-hero-title big">Lock In</div>
          <p className="gli-hint">Track a daily-habit challenge — for money rewards or a streak and a prize at the end. Pick a starting point:</p>
          <TemplatePicker onPick={(config) => setEditor({ id: null, config })} />
          <div className="gli-label">Appearance</div>
          <ThemePicker pref={themePref} setPref={setThemePref} />
        </div>
      </div>
    )
  }

  return (
    <ChallengeScreen
      key={active.id}
      c={active}
      tab={tab}
      setTab={setTab}
      settingsProps={{
        challenges, active, setActive, deleteChallenge, themePref, setThemePref,
        onEdit: (c) => setEditor({ id: c.id, config: c }),
        onNew: (config) => setEditor({ id: null, config }),
      }}
    />
  )
}

function ChallengeScreen({ c, tab, setTab, settingsProps }) {
  const [dayIdx, setDayIdx] = useState(() => defaultDayIdx(c))
  const [weekIdx, setWeekIdx] = useState(() => Math.floor(defaultDayIdx(c) / 7))
  const { body, getDay, toggleDayField, setDayNotes, setBodyField, resetAll, saveState } = useTrackerData(c.id)

  // The config can change underneath (edited length, body tracking turned off).
  const di = Math.min(dayIdx, c.lengthDays - 1)
  const wi = Math.min(weekIdx, Math.ceil(c.lengthDays / 7) - 1)
  const view = tab === 'body' && !c.bodyTracking ? 'today' : tab

  return (
    <div className="gli-app">
      <Hero c={c} getDay={getDay} saveState={saveState} />
      <div className="gli-view">
        {view === 'today' && (
          <TodayView c={c} dayIdx={di} setDayIdx={setDayIdx} getDay={getDay}
                     toggleDayField={toggleDayField} setDayNotes={setDayNotes} />
        )}
        {view === 'week' && <WeekView c={c} weekIdx={wi} setWeekIdx={setWeekIdx} getDay={getDay} />}
        {view === 'totals' && <TotalsView c={c} getDay={getDay} />}
        {view === 'body' && <BodyView c={c} body={body} setBodyField={setBodyField} />}
        {view === 'settings' && <SettingsView {...settingsProps} resetAll={resetAll} />}
      </div>
      <NavBar tab={view} setTab={setTab} c={c} />
    </div>
  )
}
