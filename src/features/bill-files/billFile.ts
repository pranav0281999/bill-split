import type { Expense } from '../expenses/expenses'
import type { ParticipantDraft } from '../participants/participants'

export type BillFile = {
  schemaVersion: 1
  participants: ParticipantDraft[]
  expenses: Expense[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

export function createBillJson(
  participants: ParticipantDraft[],
  expenses: Expense[],
) {
  const bill: BillFile = {
    schemaVersion: 1,
    participants: participants.map((participant) => ({
      ...participant,
      name: participant.name.trim(),
    })),
    expenses: expenses.map((expense) => ({
      ...expense,
      participantIds: [...expense.participantIds],
    })),
  }

  return `${JSON.stringify(bill, null, 2)}\n`
}

export function parseBillJson(json: string): BillFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!isRecord(parsed)) {
    throw new Error('This file does not contain a bill object.')
  }
  if (parsed.schemaVersion !== 1) {
    throw new Error('This bill format version is not supported.')
  }
  if (!Array.isArray(parsed.participants) || parsed.participants.length < 2) {
    throw new Error('A bill must include at least two people.')
  }
  if (!Array.isArray(parsed.expenses)) {
    throw new Error('The bill expenses must be a list.')
  }

  const participants: ParticipantDraft[] = []
  const participantIdSet = new Set<number>()
  const participantNames = new Set<string>()

  for (const value of parsed.participants) {
    if (!isRecord(value) || !isValidId(value.id) || typeof value.name !== 'string') {
      throw new Error('A participant has invalid data.')
    }

    const name = value.name.trim()
    const normalizedName = name.toLocaleLowerCase()
    if (!name) throw new Error('Participant names cannot be empty.')
    if (participantIdSet.has(value.id)) throw new Error('Participant IDs must be unique.')
    if (participantNames.has(normalizedName)) {
      throw new Error('Participant names must be unique.')
    }

    participantIdSet.add(value.id)
    participantNames.add(normalizedName)
    participants.push({ id: value.id, name })
  }

  const expenses: Expense[] = []
  const expenseIds = new Set<number>()
  let totalCents = 0

  for (const value of parsed.expenses) {
    if (
      !isRecord(value) ||
      !isValidId(value.id) ||
      !isValidId(value.payerId) ||
      typeof value.description !== 'string' ||
      typeof value.amountCents !== 'number' ||
      !Number.isSafeInteger(value.amountCents) ||
      value.amountCents <= 0 ||
      !Array.isArray(value.participantIds)
    ) {
      throw new Error('An expense has invalid data.')
    }

    const description = value.description.trim()
    if (!description || description.length > 80) {
      throw new Error('Expense descriptions must be between 1 and 80 characters.')
    }
    if (expenseIds.has(value.id)) throw new Error('Expense IDs must be unique.')
    if (!participantIdSet.has(value.payerId)) {
      throw new Error('Every expense payer must be included in the bill.')
    }
    if (value.participantIds.length === 0) {
      throw new Error('Every expense must be split between at least one person.')
    }

    const splitIds = new Set<number>()
    const splitParticipantIds: number[] = []
    const rawParticipantIds: unknown[] = value.participantIds
    for (const id of rawParticipantIds) {
      if (!isValidId(id) || !participantIdSet.has(id)) {
        throw new Error('An expense split refers to an unknown person.')
      }
      if (splitIds.has(id)) throw new Error('An expense cannot include a person twice.')
      splitIds.add(id)
      splitParticipantIds.push(id)
    }

    totalCents += value.amountCents
    if (!Number.isSafeInteger(totalCents)) {
      throw new Error('The total bill amount is too large.')
    }

    expenseIds.add(value.id)
    expenses.push({
      id: value.id,
      payerId: value.payerId,
      description,
      amountCents: value.amountCents,
      participantIds: splitParticipantIds,
    })
  }

  return { schemaVersion: 1, participants, expenses }
}
