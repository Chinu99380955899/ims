/**
 * Centralized invoice status definitions.
 */

export const STATUSES = [
  'UPLOADED',
  'PROCESSING',
  'AUTO_APPROVED',
  'REVIEW_REQUIRED',
  'APPROVED',
  'POSTED',
  'REJECTED',
  'FAILED',
];

export const STATUS_LABELS = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  AUTO_APPROVED: 'Auto Approved',
  REVIEW_REQUIRED: 'Review Required',
  APPROVED: 'Approved',
  POSTED: 'Posted',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

export const STATUS_COLORS = {
  UPLOADED: '#64748b',         // grey
  PROCESSING: '#7c3aed',       // purple/blue
  AUTO_APPROVED: '#16a34a',    // green
  REVIEW_REQUIRED: '#ca8a04',  // yellow
  APPROVED: '#22c55e',         // light green
  POSTED: '#0c4a6e',           // dark blue
  REJECTED: '#dc2626',         // red
  FAILED: '#991b1b',           // dark red
};

export const VIEW_STATUSES = ['APPROVED', 'POSTED'];

export const REVIEW_STATUSES = ['PROCESSING', 'REVIEW_REQUIRED', 'FAILED', 'REJECTED'];

export function routeForInvoice(inv) {
  return `/invoices/${inv.id}`;
}