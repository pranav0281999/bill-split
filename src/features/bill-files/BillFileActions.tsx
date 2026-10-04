import { useRef, useState } from 'react'
import type { Expense } from '../expenses/expenses'
import { createBillJson, parseBillJson, type BillFile } from './billFile'
import type { ParticipantDraft } from '../participants/participants'
import './BillFileActions.css'

type BillFileActionsProps = {
  participants: ParticipantDraft[]
  expenses: Expense[]
  canExport: boolean
  onImport: (bill: BillFile) => void
}

function BillFileActions({ participants, expenses, canExport, onImport }: BillFileActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function exportBill() {
    const file = new Blob([createBillJson(participants, expenses)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bill-split.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setMessage({ type: 'success', text: 'Bill downloaded as JSON.' })
  }

  async function importBill(file: File | undefined) {
    if (!file) return

    try {
      const bill = parseBillJson(await file.text())
      onImport(bill)
      setMessage({ type: 'success', text: 'Bill imported. The open bill was replaced.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not read this bill file.',
      })
    }
  }

  return (
    <div className="bill-file-toolbar">
      <div className="bill-file-copy">
        <span className="file-icon" aria-hidden="true">↥</span>
        <span>
          {canExport
            ? 'Carry a bill between devices with JSON'
            : 'Add at least two unique names to enable export'}
        </span>
      </div>
      <div className="bill-file-controls">
        <input
          ref={fileInputRef}
          className="visually-hidden-file-input"
          type="file"
          accept=".json,application/json"
          aria-label="Choose a bill JSON file to import"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            void importBill(file)
          }}
        />
        <button
          className="file-action-button import-file-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        <button
          className="file-action-button export-file-button"
          type="button"
          disabled={!canExport}
          title={canExport ? undefined : 'Add at least two unique names before exporting.'}
          onClick={exportBill}
        >
          Export JSON
        </button>
      </div>
      {message && (
        <p className={`bill-file-message message-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}
    </div>
  )
}

export default BillFileActions
