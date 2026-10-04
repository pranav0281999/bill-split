import type { ParticipantDraft } from './participants'
import './LockedParticipants.css'

type LockedParticipantsProps = {
  participants: ParticipantDraft[]
}

function LockedParticipants({ participants }: LockedParticipantsProps) {
  return (
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
  )
}

export default LockedParticipants
