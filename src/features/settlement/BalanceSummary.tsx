import type { ParticipantDraft } from '../participants/participants'
import type { SettlementSummary } from './settlement'
import './BalanceSummary.css'

type BalanceSummaryProps = {
  participants: ParticipantDraft[]
  summary: SettlementSummary
  expenseCount: number
  onBack: () => void
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2)
}

function BalanceSummary({ participants, summary, expenseCount, onBack }: BalanceSummaryProps) {
  const participantById = new Map(
    participants.map((participant) => [participant.id, participant] as const),
  )

  return (
    <div className="balance-workspace">
      <div className="balance-heading">
        <div className="step-indicator">
          <span className="step-dot" /> STEP 3 OF 3
        </div>
        <h1 id="balances-title">Settle up</h1>
        <p>
          {expenseCount === 1 ? '1 expense' : `${expenseCount} expenses`} · Total {formatAmount(summary.totalCents)}
        </p>
      </div>

      <section className="balance-panel" aria-labelledby="balances-section-title">
        <div className="balance-panel-heading">
          <div>
            <h2 id="balances-section-title">Everyone’s balance</h2>
            <p>Paid compared with each person’s share.</p>
          </div>
          <span className="currency-note">Currency-neutral</span>
        </div>

        <div className="balance-list">
          {participants.map((participant, index) => {
            const balance = summary.balances.find((item) => item.participantId === participant.id)
            const netCents = balance?.netCents ?? 0
            const balanceLabel = netCents > 0
              ? 'gets back'
              : netCents < 0
                ? 'owes'
                : 'settled'

            return (
              <article className="balance-person" key={participant.id}>
                <div className="balance-person-identity">
                  <span className={`balance-avatar avatar-tone-${index % 4}`} aria-hidden="true">
                    {participant.name.charAt(0).toLocaleUpperCase()}
                  </span>
                  <span className="balance-person-name">{participant.name}</span>
                </div>
                <div className="balance-figures">
                  <div>
                    <span className="figure-label">Paid</span>
                    <span className="figure-amount">{formatAmount(balance?.paidCents ?? 0)}</span>
                  </div>
                  <div>
                    <span className="figure-label">Share</span>
                    <span className="figure-amount">{formatAmount(balance?.shareCents ?? 0)}</span>
                  </div>
                </div>
                <div className={`net-balance ${netCents > 0 ? 'net-positive' : netCents < 0 ? 'net-negative' : ''}`}>
                  <span className="figure-label">{balanceLabel}</span>
                  <span className="figure-amount">
                    {formatAmount(Math.abs(netCents))}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="settlement-panel" aria-labelledby="settlement-title">
        <div className="settlement-panel-heading">
          <span className="settlement-icon" aria-hidden="true">↗</span>
          <div>
            <h2 id="settlement-title">Suggested transfers</h2>
            <p>A simple way to settle everyone’s balance.</p>
          </div>
        </div>

        {expenseCount === 0 ? (
          <p className="settlement-empty">Add an expense to see how the group can settle up.</p>
        ) : summary.transfers.length === 0 ? (
          <p className="settlement-empty">Everyone is settled up.</p>
        ) : (
          <ol className="transfer-list">
            {summary.transfers.map((transfer, index) => {
              const from = participantById.get(transfer.fromId)
              const to = participantById.get(transfer.toId)
              if (!from || !to) return null

              return (
                <li className="transfer-item" key={`${transfer.fromId}-${transfer.toId}-${index}`}>
                  <span className="transfer-person">{from.name}</span>
                  <span className="transfer-arrow" aria-label="pays">→</span>
                  <span className="transfer-person">{to.name}</span>
                  <span className="transfer-amount">{formatAmount(transfer.amountCents)}</span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="balance-actions">
        <button className="back-to-expenses-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to expenses
        </button>
        <p>Split remainders are assigned one cent at a time in participant order.</p>
      </div>
    </div>
  )
}

export default BalanceSummary
