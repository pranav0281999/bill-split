import { useState, type FormEvent } from 'react'
import AppHeader from './components/layout/AppHeader'
import PageFooter from './components/layout/PageFooter'
import BillFileActions from './features/bill-files/BillFileActions'
import type { BillFile } from './features/bill-files/billFile'
import ExpenseEntry from './features/expenses/ExpenseEntry'
import type { Expense } from './features/expenses/expenses'
import ParticipantForm from './features/participants/ParticipantForm'
import SetupIntro from './features/participants/SetupIntro'
import { getNameError, type ParticipantDraft } from './features/participants/participants'
import BalanceSummary from './features/settlement/BalanceSummary'
import { calculateSettlement } from './features/settlement/settlement'
import { nextAvailableId } from './lib/ids'
import './App.css'

function App() {
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ])
  const [isLocked, setIsLocked] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showBalances, setShowBalances] = useState(false)
  const [billRevision, setBillRevision] = useState(0)

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
    setParticipants((current) => [
      ...current,
      { id: nextAvailableId(current), name: '' },
    ])
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
      setExpenses((current) => [
        ...current,
        { ...expense, id: nextAvailableId(current) },
      ])
      return
    }

    setExpenses((current) =>
      current.map((item) => item.id === expense.id ? { ...expense, id: item.id } : item),
    )
  }

  function removeExpense(id: number) {
    setExpenses((current) => current.filter((expense) => expense.id !== id))
  }

  function replaceBill(bill: BillFile) {
    setParticipants(bill.participants)
    setExpenses(bill.expenses)
    setShowErrors(false)
    setIsLocked(true)
    setShowBalances(false)
    setBillRevision((current) => current + 1)
  }

  return (
    <main className="app-shell">
      <AppHeader />
      <BillFileActions
        participants={participants}
        expenses={expenses}
        canExport={isLocked || hasValidParticipants}
        onImport={replaceBill}
      />
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
        <>
          <section className="expense-layout" aria-labelledby="expenses-title" hidden={showBalances}>
            <ExpenseEntry
              key={billRevision}
              participants={participants}
              expenses={expenses}
              onSave={saveExpense}
              onRemove={removeExpense}
              onReview={() => setShowBalances(true)}
            />
          </section>
          {showBalances && (
            <section className="expense-layout" aria-labelledby="balances-title">
              <BalanceSummary
                participants={participants}
                summary={calculateSettlement(participants, expenses)}
                expenseCount={expenses.length}
                onBack={() => setShowBalances(false)}
              />
            </section>
          )}
        </>
      )}
      <PageFooter />
    </main>
  )
}

export default App
