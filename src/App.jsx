import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'fit-progress-pwa-v1'

const WORKOUT_DAYS = {
  lunes: {
    name: 'Lunes',
    focus: 'Empuje',
    subtitle: 'Pecho, Hombros, Tríceps',
    exercises: [
      'Press de banca',
      'Press militar sentado',
      'Cruces en polea',
      'Elevaciones laterales',
      'Extensión de tríceps en polea',
    ],
  },
  martes: {
    name: 'Martes',
    focus: 'Tirón',
    subtitle: 'Espalda, Bíceps',
    exercises: [
      'Jalón al pecho',
      'Remo con barra',
      'Pullover en polea alta',
      'Curl de bíceps con barra',
      'Curl de bíceps martillo',
    ],
  },
  miercoles: {
    name: 'Miércoles',
    focus: 'Piernas',
    subtitle: 'Cuádriceps, Femorales',
    exercises: [
      'Sentadillas',
      'Prensa de piernas',
      'Peso muerto rumano',
      'Curl femoral en máquina',
      'Elevación de talones',
    ],
  },
  jueves: {
    name: 'Jueves',
    focus: 'Torso',
    subtitle: 'Pecho y Espalda',
    exercises: [
      'Press inclinado con mancuernas',
      'Remo con mancuerna a una mano',
      'Máquina contractora',
      'Jalón con agarre estrecho',
      'Elevaciones laterales en polea',
    ],
  },
  viernes: {
    name: 'Viernes',
    focus: 'Piernas y Core',
    subtitle: 'Glúteo, Core',
    exercises: [
      'Zancadas',
      'Extensión de cuádriceps',
      'Hip Thrust',
      'Plancha abdominal',
      'Crunches en polea',
    ],
  },
}

const DAY_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

function createId() {
  return `${Date.now()}-${Math.random()}`
}

function getTodaysDayKey() {
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const today = new Date().getDay()
  const key = daysOfWeek[today]
  // Si es fin de semana, retornar lunes por defecto
  return key === 'domingo' || key === 'sabado' ? 'lunes' : key
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

export default function App() {
  const [selectedDay, setSelectedDay] = useState(getTodaysDayKey())
  const [view, setView] = useState('register')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [history, setHistory] = useState(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
      return Array.isArray(parsed.history) ? parsed.history : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ history }))
  }, [history])

  function saveSet(exerciseName, setNumber, weight, reps, customDate = null) {
    const dateToUse = customDate || new Date()
    const dateString = dateToUse.toLocaleDateString('es-ES')
    
    setHistory((prev) => [
      {
        id: createId(),
        day: selectedDay,
        exerciseName,
        setNumber,
        weight,
        reps,
        date: dateString,
        timestamp: dateToUse.getTime(),
      },
      ...prev,
    ])
  }

  function getSetData(exerciseName, setNumber, day) {
    const filtered = history.filter(
      (h) => h.exerciseName === exerciseName && h.day === day && h.setNumber === setNumber
    )
    return filtered[filtered.length - 1]
  }

  function deleteHistoryEntry(id) {
    setHistory((prev) => prev.filter((entry) => entry.id !== id))
  }

  const dayData = WORKOUT_DAYS[selectedDay]

  return (
    <main className="app-shell">
      <header className="top-header">
        <h1 className="app-title">Vigor</h1>
      </header>

      {view === 'register' && (
        <>
          <div className="day-selector-horizontal">
            {DAY_KEYS.map((dayKey) => {
              const day = WORKOUT_DAYS[dayKey]
              return (
                <button
                  key={dayKey}
                  className={`day-tab ${selectedDay === dayKey ? 'active' : ''}`}
                  onClick={() => setSelectedDay(dayKey)}
                >
                  {day.name.substring(0, 3)}
                </button>
              )
            })}
          </div>

          <div className="content">
            <div className="day-header">
              <h2 className="day-title">{dayData.name} - {dayData.focus}</h2>
              <p className="day-subtitle">{dayData.subtitle}</p>
            </div>

            <div className="exercises-container">
              {dayData.exercises.map((exerciseName) => (
                <ExerciseCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  selectedDay={selectedDay}
                  onSave={saveSet}
                  getSetData={getSetData}
                  onDelete={deleteHistoryEntry}
                  history={history}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'progress' && <ProgressView history={history} onDelete={deleteHistoryEntry} />}

      {view === 'calendar' && (
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onSave={saveSet}
          getSetData={getSetData}
          onDelete={deleteHistoryEntry}
          history={history}
        />
      )}

      <footer className="bottom-nav">
        <button
          className={`nav-button ${view === 'register' ? 'active' : ''}`}
          onClick={() => setView('register')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span className="nav-label">Registro</span>
        </button>
        <button
          className={`nav-button ${view === 'progress' ? 'active' : ''}`}
          onClick={() => setView('progress')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          <span className="nav-label">Progreso</span>
        </button>
        <button
          className={`nav-button ${view === 'calendar' ? 'active' : ''}`}
          onClick={() => setView('calendar')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="nav-label">Calendario</span>
        </button>
      </footer>
    </main>
  )
}

function ExerciseCard({ exerciseName, selectedDay, onSave, getSetData, onDelete, history }) {
  const [sets, setSets] = useState([
    { kg: '', reps: '' },
    { kg: '', reps: '' },
    { kg: '', reps: '' },
  ])

  function addSet() {
    setSets([...sets, { kg: '', reps: '' }])
  }

  useEffect(() => {
    const newSets = [1, 2, 3].map((setNum) => {
      const saved = getSetData(exerciseName, setNum, selectedDay)
      return saved ? { kg: saved.weight, reps: saved.reps } : { kg: '', reps: '' }
    })
    setSets(newSets)
  }, [exerciseName, selectedDay, getSetData])

  function handleInputChange(setIndex, field, value) {
    const newSets = [...sets]
    newSets[setIndex][field] = value
    setSets(newSets)
  }

  function handleSave(setIndex) {
    const set = sets[setIndex]
    const weight = parseFloat(set.kg)
    const reps = parseInt(set.reps, 10)
    if (weight && reps) {
      onSave(exerciseName, setIndex + 1, weight, reps)
    }
  }

  function handleDeleteSet(setNumber) {
    const entry = getSetData(exerciseName, setNumber, selectedDay)
    if (entry) {
      onDelete(entry.id)
    }
  }

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <h3 className="exercise-title">{exerciseName}</h3>
        <button className="add-set-button" onClick={addSet} title="Añadir serie">+</button>
      </div>

      <div className="sets-table">
        <div className="sets-header">
          <div className="col-set">SET</div>
          <div className="col-kg">KG</div>
          <div className="col-reps">REPS</div>
          <div className="col-actions">ACCIONES</div>
        </div>

        {sets.map((set, index) => {
          const savedEntry = getSetData(exerciseName, index + 1, selectedDay)
          return (
            <div key={index} className="set-row">
              <div className="col-set">{index + 1}</div>
              <div className="col-kg">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="--"
                  value={set.kg}
                  onChange={(e) => handleInputChange(index, 'kg', e.target.value)}
                  className="set-input"
                />
              </div>
              <div className="col-reps">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="--"
                  value={set.reps}
                  onChange={(e) => handleInputChange(index, 'reps', e.target.value)}
                  className="set-input"
                />
              </div>
              <div className="col-actions">
                <div className="action-buttons">
                  <button
                    className="check-button"
                    onClick={() => handleSave(index)}
                    disabled={!set.kg || !set.reps}
                    title="Guardar registro"
                  >
                    ✓
                  </button>
                  {savedEntry && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteSet(index + 1)}
                      title="Eliminar registro"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressView({ history, onDelete }) {
  const currentDate = new Date()
  const currentWeek = getWeekNumber(currentDate)
  const currentYear = currentDate.getFullYear()

  // Agrupar historial por semana
  const weekData = {}
  history.forEach((entry) => {
    const entryDate = new Date(entry.timestamp)
    const week = getWeekNumber(entryDate)
    const year = entryDate.getFullYear()
    const key = `${year}-W${week}`

    if (!weekData[key]) {
      weekData[key] = { week, year, entries: [] }
    }
    weekData[key].entries.push(entry)
  })

  const weeks = Object.values(weekData).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.week - a.week
  })

  const thisWeek = weeks.find((w) => w.week === currentWeek && w.year === currentYear)

  return (
    <div className="progress-view">
      <div className="progress-header">
        <h2 className="progress-title">Progreso</h2>
      </div>

      {thisWeek && (
        <div className="current-week-section">
          <h3 className="section-title">Semana Actual (Semana {currentWeek})</h3>
          <WeekSummary entries={thisWeek.entries} onDelete={onDelete} />
        </div>
      )}

      <div className="history-weeks">
        <h3 className="section-title">Historial de Semanas</h3>
        {weeks.length === 0 ? (
          <p className="empty-message">Sin registros aún</p>
        ) : (
          weeks.map((weekEntry) => (
            <div key={`${weekEntry.year}-W${weekEntry.week}`} className="week-card">
              <div className="week-card-header">
                <h4>Semana {weekEntry.week} - {weekEntry.year}</h4>
                <span className="entry-count">{weekEntry.entries.length} registros</span>
              </div>
              <WeekSummary entries={weekEntry.entries} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function WeekSummary({ entries, onDelete }) {
  const exerciseData = {}

  entries.forEach((entry) => {
    if (!exerciseData[entry.exerciseName]) {
      exerciseData[entry.exerciseName] = {
        count: 0,
        maxWeight: 0,
        records: [],
      }
    }
    exerciseData[entry.exerciseName].count += 1
    exerciseData[entry.exerciseName].maxWeight = Math.max(
      exerciseData[entry.exerciseName].maxWeight,
      entry.weight
    )
    exerciseData[entry.exerciseName].records.push(entry)
  })

  // Ordenar records por peso descendente para mostrar primero los de máximo peso
  Object.values(exerciseData).forEach((data) => {
    data.records.sort((a, b) => b.weight - a.weight)
  })

  return (
    <div className="week-summary">
      {Object.entries(exerciseData).map(([exercise, data]) => (
        <div key={exercise} className="exercise-summary-card">
          <div className="exercise-summary-header">
            <div className="summary-left">
              <h4 className="exercise-name">{exercise}</h4>
              <p className="summary-stat">Series: {data.count}</p>
            </div>
            <div className="summary-right">
              <div className="summary-item">
                <span className="label">MAX</span>
                <span className="value">{data.maxWeight}kg</span>
              </div>
            </div>
          </div>
          
          <div className="records-list">
            {data.records
              .filter((record) => record.weight === data.maxWeight)
              .map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-details">
                    <span className="record-set">Set {record.setNumber}</span>
                    <span className="record-data">{record.weight}kg × {record.reps}</span>
                    <span className="record-time">{record.date}</span>
                  </div>
                  <button
                    className="delete-record-button"
                    onClick={() => onDelete(record.id)}
                    title="Eliminar registro"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CalendarView({ selectedDate, onSelectDate, onSave, getSetData, onDelete, history }) {
  const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  
  // Obtener primer día del mes y cantidad de días
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  // Crear grid del calendario
  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  function goToPreviousMonth() {
    onSelectDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    onSelectDate(new Date(year, month + 1, 1))
  }

  function selectDay(day) {
    if (day) {
      onSelectDate(new Date(year, month, day))
    }
  }

  const currentDateString = selectedDate.toLocaleDateString('es-ES')
  const dayOfWeekIndex = selectedDate.getDay()
  const dayOfWeek = DAYS_OF_WEEK[dayOfWeekIndex]
  
  // Obtener exercises del día de la semana
  const dayKey = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][dayOfWeekIndex]
  const dayExercises = dayKey === 'domingo' || dayKey === 'sabado' ? [] : WORKOUT_DAYS[dayKey]?.exercises || []
  
  const isToday = new Date().toLocaleDateString('es-ES') === currentDateString

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2 className="calendar-title">Calendario</h2>
      </div>

      <div className="calendar-picker">
        <button className="calendar-nav-button" onClick={goToPreviousMonth}>←</button>
        <div className="calendar-month-year">
          <h3>{MONTHS[month]} {year}</h3>
        </div>
        <button className="calendar-nav-button" onClick={goToNextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="calendar-weekday-header">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="calendar-day empty"></div>
            }
            const dateStr = new Date(year, month, day).toLocaleDateString('es-ES')
            const isSelected = dateStr === currentDateString
            const isCurrentDay = dateStr === new Date().toLocaleDateString('es-ES')
            
            return (
              <button
                key={day}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
                onClick={() => selectDay(day)}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {dayExercises.length > 0 && (
        <>
          <div className="calendar-date-header">
            <h3 className="calendar-selected-date">{dayOfWeek}, {currentDateString}</h3>
            {isToday && <span className="today-label">Hoy</span>}
          </div>

          <div className="exercises-container">
            {dayExercises.map((exerciseName) => (
              <CalendarExerciseCard
                key={exerciseName}
                exerciseName={exerciseName}
                selectedDate={selectedDate}
                onSave={onSave}
                getSetData={getSetData}
                onDelete={onDelete}
                history={history}
              />
            ))}
          </div>
        </>
      )}

      {dayExercises.length === 0 && (
        <div className="no-workout-day">
          <p>No hay entrenamiento programado para {dayOfWeek}</p>
        </div>
      )}
    </div>
  )
}

function CalendarExerciseCard({ exerciseName, selectedDate, onSave, getSetData, onDelete, history }) {
  const [sets, setSets] = useState([
    { kg: '', reps: '' },
    { kg: '', reps: '' },
    { kg: '', reps: '' },
  ])

  const dateString = selectedDate.toLocaleDateString('es-ES')

  // Cargar sets guardados para esta fecha
  useEffect(() => {
    const daySets = history.filter(
      (h) => h.exerciseName === exerciseName && h.date === dateString
    )
    
    if (daySets.length > 0) {
      const newSets = [1, 2, 3].map((setNum) => {
        const found = daySets.find((s) => s.setNumber === setNum)
        return found ? { kg: found.weight, reps: found.reps } : { kg: '', reps: '' }
      })
      setSets(newSets)
    } else {
      setSets([
        { kg: '', reps: '' },
        { kg: '', reps: '' },
        { kg: '', reps: '' },
      ])
    }
  }, [dateString, exerciseName, history])

  function handleInputChange(setIndex, field, value) {
    const newSets = [...sets]
    newSets[setIndex][field] = value
    setSets(newSets)
  }

  function handleSave(setIndex) {
    const set = sets[setIndex]
    const weight = parseFloat(set.kg)
    const reps = parseInt(set.reps, 10)
    if (weight && reps) {
      onSave(exerciseName, setIndex + 1, weight, reps, selectedDate)
    }
  }

  function handleDeleteSet(setNumber) {
    const entry = history.find(
      (h) => h.exerciseName === exerciseName && h.setNumber === setNumber && h.date === dateString
    )
    if (entry) {
      onDelete(entry.id)
    }
  }

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <h3 className="exercise-title">{exerciseName}</h3>
      </div>

      <div className="sets-table">
        <div className="sets-header">
          <div className="col-set">SET</div>
          <div className="col-kg">KG</div>
          <div className="col-reps">REPS</div>
          <div className="col-actions">ACCIONES</div>
        </div>

        {sets.map((set, index) => {
          const savedEntry = history.find(
            (h) => h.exerciseName === exerciseName && h.setNumber === index + 1 && h.date === dateString
          )
          return (
            <div key={index} className="set-row">
              <div className="col-set">{index + 1}</div>
              <div className="col-kg">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="--"
                  value={set.kg}
                  onChange={(e) => handleInputChange(index, 'kg', e.target.value)}
                  className="set-input"
                />
              </div>
              <div className="col-reps">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="--"
                  value={set.reps}
                  onChange={(e) => handleInputChange(index, 'reps', e.target.value)}
                  className="set-input"
                />
              </div>
              <div className="col-actions">
                <div className="action-buttons">
                  <button
                    className="check-button"
                    onClick={() => handleSave(index)}
                    disabled={!set.kg || !set.reps}
                    title="Guardar registro"
                  >
                    ✓
                  </button>
                  {savedEntry && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteSet(index + 1)}
                      title="Eliminar registro"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
