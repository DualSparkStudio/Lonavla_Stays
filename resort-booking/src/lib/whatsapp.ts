export function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizeWhatsAppNumber(phone);
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildPropertyEnquiryMessage(propertyTitle: string): string {
  return `Hi, I am interested in purchasing "${propertyTitle}". Please share more details.`;
}
