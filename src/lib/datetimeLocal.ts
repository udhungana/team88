/** Value for `<input type="datetime-local" />` — ~45 minutes from now. */
export function defaultReminderDatetime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 45);
  d.setSeconds(0, 0);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${mi}`;
}
