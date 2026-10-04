import type { Expense } from './expenses'
import type { ParticipantDraft } from './participants'

export type ParticipantBalance = {
  participantId: number
  paidCents: number
  shareCents: number
  netCents: number
}

export type SuggestedTransfer = {
  fromId: number
  toId: number
  amountCents: number
}

export type SettlementSummary = {
  balances: ParticipantBalance[]
  transfers: SuggestedTransfer[]
  totalCents: number
}

export function calculateSettlement(
  participants: ParticipantDraft[],
  expenses: Expense[],
): SettlementSummary {
  const balances = new Map<number, ParticipantBalance>(
    participants.map((participant) => [
      participant.id,
      { participantId: participant.id, paidCents: 0, shareCents: 0, netCents: 0 },
    ] as const),
  )
  const participantOrder = new Map(
    participants.map((participant, index) => [participant.id, index] as const),
  )
  let totalCents = 0

  for (const expense of expenses) {
    const payerBalance = balances.get(expense.payerId)
    if (!payerBalance) continue

    payerBalance.paidCents += expense.amountCents
    totalCents += expense.amountCents

    const splitParticipants = expense.participantIds
      .filter((id) => balances.has(id))
      .sort((firstId, secondId) =>
        (participantOrder.get(firstId) ?? 0) - (participantOrder.get(secondId) ?? 0),
      )
    if (splitParticipants.length === 0) continue

    const baseShare = Math.floor(expense.amountCents / splitParticipants.length)
    const extraCents = expense.amountCents % splitParticipants.length

    splitParticipants.forEach((participantId, index) => {
      const balance = balances.get(participantId)
      if (balance) balance.shareCents += baseShare + (index < extraCents ? 1 : 0)
    })
  }

  const participantBalances = participants.map((participant) => {
    const balance = balances.get(participant.id)!
    balance.netCents = balance.paidCents - balance.shareCents
    return balance
  })

  const debtors = participantBalances
    .filter((balance) => balance.netCents < 0)
    .map((balance) => ({ id: balance.participantId, remainingCents: -balance.netCents }))
  const creditors = participantBalances
    .filter((balance) => balance.netCents > 0)
    .map((balance) => ({ id: balance.participantId, remainingCents: balance.netCents }))
  const transfers: SuggestedTransfer[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    if (!debtor || !creditor) break

    const amountCents = Math.min(debtor.remainingCents, creditor.remainingCents)
    transfers.push({ fromId: debtor.id, toId: creditor.id, amountCents })
    debtor.remainingCents -= amountCents
    creditor.remainingCents -= amountCents

    if (debtor.remainingCents === 0) debtorIndex += 1
    if (creditor.remainingCents === 0) creditorIndex += 1
  }

  return { balances: participantBalances, transfers, totalCents }
}
