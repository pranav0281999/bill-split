import { useState } from 'react'
import ExpenseForm from './ExpenseForm'
import type { Expense } from './expenses'
import type { ParticipantDraft } from '../participants/participants'
import './ExpenseSection.css'

type ExpenseSectionProps = {
  participant: ParticipantDraft
  participants: ParticipantDraft[]
  expenses: Expense[]
  onSave: (expense: Omit<Expense, 'id'> & { id?: number }) => void
  onRemove: (id: number) => void
}

function ExpenseSection({ participant, participants, expenses, onSave, onRemove }: ExpenseSectionProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | 'new' | null>(null)

  function startNewExpense() {
    setEditingExpense('new')
  }

  function saveExpense(expense: Omit<Expense, 'id'> & { id?: number }) {
    onSave(expense)
    setEditingExpense(null)
  }

  return (
    <article className="expense-section">
      <div className="expense-section-heading">
        <span className="expense-payer-avatar" aria-hidden="true">
          {participant.name.charAt(0).toLocaleUpperCase()}
        </span>
        <div className="expense-payer-copy">
          <h2>{participant.name}</h2>
          <p>{expenses.length === 1 ? '1 expense paid' : `${expenses.length} expenses paid`}</p>
        </div>
        {!editingExpense && (
          <button className="section-add-button" type="button" onClick={startNewExpense}>
            <span aria-hidden="true">+</span> Add expense
          </button>
        )}
      </div>

      {expenses.length > 0 && (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li className="expense-item" key={expense.id}>
              <div className="expense-item-main">
                <span className="expense-item-icon" aria-hidden="true">↗</span>
                <div>
                  <p className="expense-description">{expense.description}</p>
                  <p className="expense-share-summary">
                    Split with {expense.participantIds
                      .map((id) => participants.find((person) => person.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
              <span className="expense-amount">{(expense.amountCents / 100).toFixed(2)}</span>
              <div className="expense-item-actions">
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setEditingExpense(expense)}
                  aria-label={`Edit ${expense.description}`}
                >Edit</button>
                <button
                  type="button"
                  className="text-action delete-action"
                  onClick={() => onRemove(expense.id)}
                  aria-label={`Remove ${expense.description}`}
                >Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {expenses.length === 0 && !editingExpense && (
        <p className="expense-empty">No expenses added for {participant.name} yet.</p>
      )}

      {editingExpense && (
        <ExpenseForm
          key={editingExpense === 'new' ? `new-${participant.id}` : editingExpense.id}
          payer={participant}
          participants={participants}
          expense={editingExpense === 'new' ? undefined : editingExpense}
          onSave={saveExpense}
          onCancel={() => setEditingExpense(null)}
        />
      )}
    </article>
  )
}

export default ExpenseSection
