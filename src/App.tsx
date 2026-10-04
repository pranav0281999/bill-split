import { useState, type FormEvent } from 'react'
import AppHeader from './components/AppHeader'
import ExpenseEntry from './components/ExpenseEntry'
import PageFooter from './components/PageFooter'
import ParticipantForm from './components/ParticipantForm'
import SetupIntro from './components/SetupIntro'
import { getNameError, type ParticipantDraft } from './components/participants'
import type { Expense } from './components/expenses'
import './App.css'

function App() {
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ])
  const [nextId, setNextId] = useState(3)
  const [isLocked, setIsLocked] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [nextExpenseId, setNextExpenseId] = useState(1)

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

  function saveExpense(expense: Omit<Expense, 'id'> & { id?: number }) {
    if (expense.id === undefined) {
      setExpenses((current) => [...current, { ...expense, id: nextExpenseId }])
      setNextExpenseId((current) => current + 1)
      return
    }

    setExpenses((current) =>
      current.map((item) => item.id === expense.id ? { ...expense, id: item.id } : item),
    )
  }

  function removeExpense(id: number) {
    setExpenses((current) => current.filter((expense) => expense.id !== id))
  }

  return (
    <main className="app-shell">
      <AppHeader />
      {!isLocked ? (
        <section className="setup-layout" aria-labelledby="page-title">
          <SetupIntro />
          <div className="form-panel">
            <ParticipantForm
              participants={participants}
              nameErrors={nameErrors}
              showErrors={showErrors}
              onUpdate={updateParticipant}
              onAdd={addParticipant}
              onRemove={removeParticipant}
              onSubmit={continueToExpenses}
            />
          </div>
        </section>
      ) : (
        <section className="expense-layout" aria-labelledby="expenses-title">
          <ExpenseEntry
            participants={participants}
            expenses={expenses}
            onSave={saveExpense}
            onRemove={removeExpense}
          />
        </section>
      )}
      <PageFooter />
    </main>
  )
}

export default App
