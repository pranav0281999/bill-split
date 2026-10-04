import { useState, type FormEvent } from 'react'
import './App.css'

type ParticipantDraft = {
  id: number
  name: string
}

function getNameError(
  id: number,
  name: string,
  participants: ParticipantDraft[],
) {
  const normalizedName = name.trim().toLocaleLowerCase()

  if (!normalizedName) return 'Enter a name.'

  const hasDuplicate = participants.some(
    (participant) =>
      participant.id !== id &&
      participant.name.trim().toLocaleLowerCase() === normalizedName,
  )

  return hasDuplicate ? 'Each person needs a unique name.' : ''
}

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
      <header className="topbar">
        <a className="brand" href="/" aria-label="Bill Split home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>bill <span className="brand-accent">split</span></span>
        </a>
        <span className="topbar-note">A clearer way to settle up</span>
      </header>

      <section className="setup-layout" aria-labelledby="page-title">
        <div className="intro">
          <div className="step-indicator">
            <span className="step-dot" /> STEP 1 OF 3
          </div>
          <h1 id="page-title">Who’s sharing<br />this bill?</h1>
          <p className="intro-copy">
            Add everyone joining in. You can split each expense between just
            the people it belongs to.
          </p>

          <div className="note-card">
            <span className="note-icon" aria-hidden="true">✳</span>
            <p><strong>Good to know</strong><br />Names can’t be changed after you continue.</p>
          </div>
          <div className="decorative-circle circle-one" aria-hidden="true" />
          <div className="decorative-circle circle-two" aria-hidden="true" />
        </div>

        <div className="form-panel">
          {!isLocked ? (
            <form onSubmit={continueToExpenses} noValidate>
              <div className="form-heading">
                <div>
                  <h2>Add your people</h2>
                  <p>At least two people to get started</p>
                </div>
                <span className="people-count">{participants.length} people</span>
              </div>

              <div className="participant-list">
                {participants.map((participant, index) => {
                  const nameError = showErrors ? nameErrors[index] : ''
                  const inputId = `participant-${participant.id}`
                  const errorId = `${inputId}-error`

                  return (
                    <div className="participant-row" key={participant.id}>
                      <label className="participant-number" htmlFor={inputId}>
                        {String(index + 1).padStart(2, '0')}
                      </label>
                      <div className="participant-input-wrap">
                        <input
                          autoComplete="off"
                          id={inputId}
                          name={`participant-${participant.id}`}
                          placeholder={`Person ${index + 1}`}
                          value={participant.name}
                          onChange={(event) => updateParticipant(participant.id, event.target.value)}
                          aria-invalid={Boolean(nameError)}
                          aria-describedby={nameError ? errorId : undefined}
                        />
                        {nameError && <span className="field-error" id={errorId}>{nameError}</span>}
                      </div>
                      {participants.length > 2 && (
                        <button
                          className="remove-button"
                          type="button"
                          onClick={() => removeParticipant(participant.id)}
                          aria-label={`Remove ${participant.name || `person ${index + 1}`}`}
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button className="add-button" type="button" onClick={addParticipant}>
                <span aria-hidden="true">+</span> Add another person
              </button>

              {showErrors && participants.length < 2 && (
                <p className="form-error" role="alert">Add at least two people to continue.</p>
              )}

              <div className="form-footer">
                <span className="privacy-note"><span aria-hidden="true">♧</span> Just for this bill</span>
                <button className="primary-button" type="submit">
                  Continue <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="locked-state" aria-live="polite">
              <span className="success-mark" aria-hidden="true">✓</span>
              <h2>You’re all set</h2>
              <p className="locked-copy">These people are in this bill:</p>
              <ul className="locked-list">
                {participants.map((participant) => (
                  <li key={participant.id}>
                    <span className="person-avatar" aria-hidden="true">
                      {participant.name.charAt(0).toLocaleUpperCase()}
                    </span>
                    {participant.name}
                    <span className="locked-check" aria-hidden="true">✓</span>
                  </li>
                ))}
              </ul>
              <div className="next-step-card">
                <span className="next-step-number">NEXT UP</span>
                <p>Add expenses and choose who shares each one.</p>
              </div>
              <p className="locked-footnote">Your participant list is locked for this bill.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="page-footer">
        <span>MADE FOR SHARING</span>
        <span className="footer-divider" aria-hidden="true" />
        <span>LESS MATH, MORE MEMORY MAKING</span>
      </footer>
    </main>
  )
}

export default App
