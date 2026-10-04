export type ParticipantDraft = {
  id: number
  name: string
}

export function getNameError(
  id: number,
  name: string,
  participants: ParticipantDraft[],
) {
  const normalizedName = name.trim().toLocaleLowerCase()

  if (!normalizedName) return 'Enter a name.'

  const hasDuplicate = participants.some(
    (participant) =>
      participant.id !== id &&
      participant.name.trim().toLocaleLowerCase() === normalizedName,
  )

  return hasDuplicate ? 'Each person needs a unique name.' : ''
}
