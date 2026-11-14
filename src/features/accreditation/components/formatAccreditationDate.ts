export function formatAccreditationDate(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'long',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(value))
}
