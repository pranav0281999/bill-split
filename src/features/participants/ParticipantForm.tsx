import type { FormEventHandler } from 'react'
import type { ParticipantDraft } from './participants'
import './ParticipantForm.css'

type ParticipantFormProps = {
  participants: ParticipantDraft[]
  nameErrors: string[]
  showErrors: boolean
  onUpdate: (id: number, name: string) => void
  onAdd: () => void
  onRemove: (id: number) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

function ParticipantForm({
  participants,
  nameErrors,
  showErrors,
  onUpdate,
  onAdd,
  onRemove,
  onSubmit,
}: ParticipantFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
                  onChange={(event) => onUpdate(participant.id, event.target.value)}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? errorId : undefined}
                />
                {nameError && <span className="field-error" id={errorId}>{nameError}</span>}
              </div>
              {participants.length > 2 && (
                <button
                  className="remove-button"
                  type="button"
                  onClick={() => onRemove(participant.id)}
                  aria-label={`Remove ${participant.name || `person ${index + 1}`}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      <button className="add-button" type="button" onClick={onAdd}>
        <span aria-hidden="true">+</span> Add another person
      </button>

      <div className="form-footer">
        <span className="privacy-note"><span aria-hidden="true">♧</span> Just for this bill</span>
        <button className="primary-button" type="submit">
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default ParticipantForm
