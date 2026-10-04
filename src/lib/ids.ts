export function nextAvailableId(items: { id: number }[]) {
  const usedIds = new Set(items.map((item) => item.id))
  let id = 1

  while (usedIds.has(id)) id += 1

  return id
}
