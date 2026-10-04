import ExpenseSection from './ExpenseSection'
import type { Expense } from './expenses'
import type { ParticipantDraft } from '../participants/participants'
import './ExpenseEntry.css'

type ExpenseEntryProps = {
  participants: ParticipantDraft[]
  expenses: Expense[]
  onSave: (expense: Omit<Expense, 'id'> & { id?: number }) => void
  onRemove: (id: number) => void
  onReview: () => void
}

function ExpenseEntry({ participants, expenses, onSave, onRemove, onReview }: ExpenseEntryProps) {
  return (
    <div className="expense-workspace">
      <div className="expense-page-heading">
        <div className="step-indicator">
          <span className="step-dot" /> STEP 2 OF 3
        </div>
        <h1 id="expenses-title">Add your expenses</h1>
        <p>Choose who paid, then select everyone sharing that expense.</p>
        <div className="participant-pills" aria-label="People in this bill">
          {participants.map((participant, index) => (
            <span className="participant-pill" key={participant.id}>
              <span className={`pill-avatar avatar-tone-${index % 4}`} aria-hidden="true">
                {participant.name.charAt(0).toLocaleUpperCase()}
              </span>
              {participant.name}
            </span>
          ))}
        </div>
      </div>

      <div className="expense-sections">
        {participants.map((participant) => (
          <ExpenseSection
            key={participant.id}
            participant={participant}
            participants={participants}
            expenses={expenses.filter((expense) => expense.payerId === participant.id)}
            onSave={onSave}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="expense-next-step">
        <div className="expense-next-copy">
          <span aria-hidden="true">✳</span>
          <p><strong>Ready to settle up?</strong><br />Review everyone’s balance and suggested transfers.</p>
        </div>
        <button className="review-balances-button" type="button" onClick={onReview}>
          Review balances <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

export default ExpenseEntry
