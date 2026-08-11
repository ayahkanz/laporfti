export function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
  return `LH-${year}${month}${date}-${randomDigits}`;
}
