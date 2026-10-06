import { useState } from 'react'
import './App.css'
import { ALL_DATES, fmtISO, challengeStats } from './challenge'
import { useTrackerData } from './useTrackerData'
import Hero from './components/Hero'
import NavBar from './components/NavBar'
import TodayView from './components/TodayView'
import WeekView from './components/WeekView'
import TotalsView from './components/TotalsView'
import BodyView from './components/BodyView'

const todayIdxDefault = (() => {
  const idx = ALL_DATES.indexOf(fmtISO(new Date()))
  return idx >= 0 ? idx : 0
})()

export default function App() {
  const [tab, setTab] = useState('today')
  const [dayIdx, setDayIdx] = useState(todayIdxDefault)
  const [weekIdx, setWeekIdx] = useState(Math.floor(todayIdxDefault / 7))
  const { body, getDay, toggleDayField, setDayNotes, setBodyField, resetAll, saveState } = useTrackerData()

  const stats = challengeStats(getDay)

  return (
    <div className="gli-app">
      <Hero stats={stats} saveState={saveState} />
      <div className="gli-view">
        {tab === 'today' && (
          <TodayView dayIdx={dayIdx} setDayIdx={setDayIdx} getDay={getDay}
                     toggleDayField={toggleDayField} setDayNotes={setDayNotes} />
        )}
        {tab === 'week' && (
          <WeekView weekIdx={weekIdx} setWeekIdx={setWeekIdx} getDay={getDay} />
        )}
        {tab === 'totals' && (
          <TotalsView getDay={getDay} resetAll={resetAll} />
        )}
        {tab === 'body' && (
          <BodyView body={body} setBodyField={setBodyField} />
        )}
      </div>
      <NavBar tab={tab} setTab={setTab} />
    </div>
  )
}
