/**
 * WhatsApp integration & formatting utilities
 * Tailored for Kenyan phone numbers (+254) and WhatsApp Group Broadcasts
 */

export function cleanKenyanPhone(phone: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('0') && (digits.length === 10)) {
    // 0712345678 or 0112345678 -> 254712345678
    return '254' + digits.slice(1);
  } else if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  } else if (digits.length === 9) {
    // 712345678 -> 254712345678
    return '254' + digits;
  }
  return digits;
}

export function formatKenyanPhoneDisplay(phone: string): string {
  const cleaned = cleanKenyanPhone(phone);
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = cleanKenyanPhone(phone);
  // Valid Kenyan numbers: 254 followed by 7 or 1 and 8 digits (total 12 digits)
  return /^254[17]\d{8}$/.test(cleaned);
}

export function getWhatsAppGroupShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppDirectUrl(phone: string, text: string = ''): string {
  const cleaned = cleanKenyanPhone(phone);
  return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(text)}`;
}

export function formatClassStatusBroadcast(
  unitCode: string,
  unitTitle: string,
  lecturer: string,
  venue: string,
  day: string,
  timeSlot: string,
  status: 'confirmed' | 'cancelled' | 'rescheduled' | 'online' | 'pending',
  repNote?: string,
  repName: string = 'Class Representative'
): string {
  const statusEmoji = {
    confirmed: '✅ *[CONFIRMED]*',
    cancelled: '❌ *[CANCELLED]*',
    rescheduled: '🔄 *[RESCHEDULED]*',
    online: '🌐 *[ONLINE CLASS]*',
    pending: '⏳ *[PENDING CONFIRMATION]*'
  }[status];

  let message = `🏛️ *UNIVERSITY OF ELDORET - LECTURE ALERT*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${statusEmoji}\n`;
  message += `📚 *Unit:* ${unitCode} - ${unitTitle}\n`;
  message += `👨‍🏫 *Lecturer:* ${lecturer}\n`;
  message += `📍 *Venue:* ${venue}\n`;
  message += `📅 *Schedule:* ${day}, ${timeSlot}\n`;

  if (repNote && repNote.trim()) {
    message += `\n💬 *Rep's Note:*\n"${repNote.trim()}"\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📢 *Issued by:* ${repName} (Class Rep)\n`;
  message += `📲 *Check Timetable & Portal:* UoE Student Hub`;

  return message;
}

export function formatNotesUploadBroadcast(
  unitCode: string,
  title: string,
  category: string,
  uploadedBy: string,
  fileName: string,
  fileSize: string
): string {
  const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
  let message = `📂 *UNIVERSITY OF ELDORET - NEW NOTES UPLOADED*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📚 *Unit:* ${unitCode}\n`;
  message += `📝 *Material:* ${title}\n`;
  message += `🏷️ *Category:* ${categoryLabel}\n`;
  message += `📎 *File:* ${fileName} (${fileSize})\n`;
  message += `👤 *Uploaded by:* ${uploadedBy}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📥 *Access & Download:* Open your UoE Revision Materials Vault.\n`;
  message += `💡 Revise early and prepare for CATs!`;

  return message;
}
