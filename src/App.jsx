import { useState } from 'react'
import { useDashboardData } from './hooks/useDashboardData'
import { Wordmark } from './components/Wordmark'
import GeneralTab from './tabs/GeneralTab'
import ClassTab from './tabs/ClassTab'
import './index.css'

const CLASS_LABELS = {
  'sanidad-emocional': 'Sanidad Emocional',
  'sanidad-relaciones': 'Sanidad en Relaciones',
}

function classLabel(id) { return CLASS_LABELS[id] || id }

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function seasonLabel(s) {
  if (!s) return ''
  return `${MONTHS_ES[s.month - 1] || ''} ${s.year}`
}

export default function App() {
  const { data, loading, error, seasons, selectedSeasonId, setSelectedSeasonId } = useDashboardData()
  const [activeTab, setActiveTab] = useState('general')

  const tabs = ['general', ...(data?.classIds || [])]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Wordmark size={28} />
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <div>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-light)',
                lineHeight: 1,
              }}>Dashboard</p>
              <p style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 11,
                color: 'var(--text-light)',
                marginTop: 2,
                lineHeight: 1,
              }}>by Guillermo Velazquez</p>
            </div>
          </div>

          {/* Season selector */}
          {seasons.length > 0 && (
            <select
              value={selectedSeasonId || ''}
              onChange={e => { setSelectedSeasonId(e.target.value); setActiveTab('general') }}
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--text)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {seasons.map(s => (
                <option key={s.id} value={s.id}>
                  {seasonLabel(s)}{s.active ? ' ·  activa' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 4,
          paddingBottom: 1,
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                padding: '10px 16px',
                cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '0.06em',
                color: activeTab === tab ? 'var(--gold)' : 'var(--text-light)',
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'general' ? 'General' : classLabel(tab)}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
        {loading && <div className="spinner" />}

        {error && (
          <div style={{
            background: 'var(--alert-bg)',
            border: '1px solid var(--alert)',
            borderRadius: 12,
            padding: '16px 24px',
            color: 'var(--alert)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
          }}>
            Error al cargar datos: {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {activeTab === 'general' && <GeneralTab data={data} />}
            {data.classIds?.map(classId => (
              activeTab === classId && (
                <ClassTab
                  key={classId}
                  classData={data.byClass[classId]}
                  circles={data.byCircle}
                />
              )
            ))}
          </>
        )}

        {!loading && !error && !data && (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: 60, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 18 }}>
            No hay temporadas registradas aún.
          </p>
        )}
      </main>
    </div>
  )
}
