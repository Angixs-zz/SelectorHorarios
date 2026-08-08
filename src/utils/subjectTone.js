export function getSubjectTone(subjectId) {
  let hash = 0
  for (const character of subjectId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash % 5 + 1
}
