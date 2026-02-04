/**
 * Pitch Deck File Type Constants
 * Shared across entity, service, and controller layers
 */

export type MimeType =
  | 'application/pdf'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const ALLOWED_MIMES: readonly MimeType[] = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Map MIME types to safe file extensions (prevents path traversal)
export const MIME_TO_EXT: Record<MimeType, string> = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

/**
 * Upload limits shared across service and controller
 */
export const MAX_FILES_PER_DECK = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total per deck

/**
 * Type guard to validate MIME type strings
 * Usage: if (isValidMimeType(mime)) { const ext = MIME_TO_EXT[mime]; }
 */
export function isValidMimeType(mime: string): mime is MimeType {
  return ALLOWED_MIMES.includes(mime as MimeType);
}
