import { useState, type FormEvent } from 'react'
import type { Expense } from './expenses'
import type { ParticipantDraft } from '../participants/participants'
import './ExpenseForm.css'

type ExpenseFormProps = {
  payer: ParticipantDraft
  participants: ParticipantDraft[]
  expense?: Expense
  onSave: (expense: Omit<Expense, 'id'> & { id?: number }) => void
  onCancel: () => void
}

function ExpenseForm({ payer, participants, expense, onSave, onCancel }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(
    expense ? (expense.amountCents / 100).toFixed(2) : '',
  )
  const [participantIds, setParticipantIds] = useState(
    expense?.participantIds ?? participants.map((participant) => participant.id),
  )
  const [showErrors, setShowErrors] = useState(false)

  const trimmedDescription = description.trim()
  const parsedAmount = Number(amount.trim())
  const amountCents = Math.round(parsedAmount * 100)
  const amountIsValid =
    /^\d+(\.\d{0,2})?$/.test(amount.trim()) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isSafeInteger(amountCents)
  const descriptionError = showErrors && !trimmedDescription
  const amountError = showErrors && !amountIsValid
  const participantsError = showErrors && participantIds.length === 0

  function toggleParticipant(id: number) {
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((participantId) => participantId !== id)
        : [...current, id],
    )
  }

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowErrors(true)

    if (!trimmedDescription || !amountIsValid || participantIds.length === 0) return

    onSave({
      id: expense?.id,
      payerId: payer.id,
      description: trimmedDescription,
      amountCents,
      participantIds,
    })
  }

  return (
    <form className="expense-form" onSubmit={submitExpense} noValidate>
      <div className="expense-form-heading">
        <div>
          <h3>{expense ? 'Edit expense' : 'New expense'}</h3>
          <p>Paid by {payer.name}</p>
        </div>
        <button className="form-close-button" type="button" onClick={onCancel} aria-label="Cancel expense">
          ×
        </button>
      </div>

      <label className="expense-field">
        <span>Description</span>
        <input
          autoFocus
          maxLength={80}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Groceries, dinner"
          aria-invalid={Boolean(descriptionError)}
        />
        {descriptionError && <span className="expense-field-error" role="alert">Add a description.</span>}
      </label>

      <label className="expense-field amount-field">
        <span>Amount</span>
        <div className="amount-input-wrap">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(amountError)}
          />
        </div>
        {amountError && <span className="expense-field-error" role="alert">Enter an amount greater than 0 with up to 2 decimal places.</span>}
      </label>

      <fieldset className="split-participants">
        <legend>Split between</legend>
        <p>Select everyone who shares this expense. The amount is split equally.</p>
        <div className="split-participant-options">
          {participants.map((participant) => (
            <label className="split-option" key={participant.id}>
              <input
                type="checkbox"
                checked={participantIds.includes(participant.id)}
                onChange={() => toggleParticipant(participant.id)}
              />
              <span className="split-option-check" aria-hidden="true">✓</span>
              <span>{participant.name}</span>
            </label>
          ))}
        </div>
        {participantsError && <span className="expense-field-error" role="alert">Choose at least one person to split this expense.</span>}
      </fieldset>

      <div className="expense-form-actions">
        <button className="cancel-button" type="button" onClick={onCancel}>Cancel</button>
        <button className="save-expense-button" type="submit">
          {expense ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
