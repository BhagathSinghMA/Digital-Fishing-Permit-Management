export function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return 'N/A';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateOnly(dateStr?: string | Date | null): string {
  if (!dateStr) return 'N/A';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function formatPermitId(id: number | string): string {
  if (typeof id === 'string' && id.startsWith('TN-')) return id;
  const num = typeof id === 'string' ? parseInt(id, 10) || 1 : id;
  return `TN-FP-2026-${String(num).padStart(6, '0')}`;
}

export function calculateTimeRemaining(expiryStr?: string | null): { text: string; isExpired: boolean } {
  if (!expiryStr) return { text: 'N/A', isExpired: false };
  const expiry = new Date(expiryStr);
  if (isNaN(expiry.getTime())) return { text: expiryStr, isExpired: false };

  const diffMs = expiry.getTime() - Date.now();
  if (diffMs <= 0) return { text: 'Expired', isExpired: true };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    text: `${hours}h ${minutes}m remaining`,
    isExpired: false,
  };
}
