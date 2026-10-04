import { useState, type FormEvent } from 'react'
import AppHeader from './components/AppHeader'
import LockedParticipants from './components/LockedParticipants'
import PageFooter from './components/PageFooter'
import ParticipantForm from './components/ParticipantForm'
import SetupIntro from './components/SetupIntro'
import { getNameError, type ParticipantDraft } from './components/participants'
import './App.css'

function App() {
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ])
  const [nextId, setNextId] = useState(3)
  const [isLocked, setIsLocked] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const nameErrors = participants.map((participant) =>
    getNameError(participant.id, participant.name, participants),
  )
  const hasValidParticipants =
    participants.length >= 2 && nameErrors.every((error) => !error)

  function updateParticipant(id: number, name: string) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, name } : participant,
      ),
    )
  }

  function addParticipant() {
    setParticipants((current) => [...current, { id: nextId, name: '' }])
    setNextId((current) => current + 1)
  }

  function removeParticipant(id: number) {
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id),
    )
  }

  function continueToExpenses(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowErrors(true)

    if (!hasValidParticipants) return

    setParticipants((current) =>
      current.map((participant) => ({
        ...participant,
        name: participant.name.trim(),
      })),
    )
    setIsLocked(true)
  }

  return (
    <main className="app-shell">
      <AppHeader />
      <section className="setup-layout" aria-labelledby="page-title">
        <SetupIntro />
        <div className="form-panel">
          {!isLocked ? (
            <ParticipantForm
              participants={participants}
              nameErrors={nameErrors}
              showErrors={showErrors}
              onUpdate={updateParticipant}
              onAdd={addParticipant}
              onRemove={removeParticipant}
              onSubmit={continueToExpenses}
            />
          ) : (
            <LockedParticipants participants={participants} />
          )}
        </div>
      </section>
      <PageFooter />
    </main>
  )
}

export default App
