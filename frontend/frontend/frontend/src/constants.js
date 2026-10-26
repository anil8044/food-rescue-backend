export const CATEGORIES = [
  { value: 'FRESH_PRODUCE', label: 'Fresh produce' },
  { value: 'BAKERY', label: 'Bakery' },
  { value: 'DAIRY', label: 'Dairy' },
  { value: 'MEAT_AND_SEAFOOD', label: 'Meat & seafood' },
  { value: 'PANTRY_AND_DRY_GOODS', label: 'Pantry & dry goods' },
  { value: 'PREPARED_MEALS', label: 'Prepared meals' },
  { value: 'BEVERAGES', label: 'Beverages' },
  { value: 'OTHER', label: 'Other' },
];

export const UNITS = ['kg', 'boxes', 'meals', 'litres', 'items'];

export const SEVERITIES = [
  { value: 'LOW', label: 'Low', help: 'Minor issue, no risk to health' },
  { value: 'MEDIUM', label: 'Medium', help: 'Possible food-safety concern, food needs to be checked or discarded' },
  { value: 'HIGH', label: 'High', help: 'Clear risk to health, or a near miss' },
];

const GREEN = '#2b8a57';
const ORANGE = '#c75d1f';
const BLUE = '#2f6fb5';
const GREY = '#6b7770';
const RED = '#c93c3c';

// Chip colours for every status value (same palette as the design's status badges)
export const STATUS_COLORS = {
  donation: { AVAILABLE: GREEN, RESERVED: ORANGE, COLLECTED: BLUE, EXPIRED: GREY, CANCELLED: GREY },
  reservation: { PENDING: ORANGE, CONFIRMED: BLUE, COLLECTED: GREEN, CANCELLED: GREY, MISSED: RED },
  incident: { OPEN: RED, UNDER_REVIEW: ORANGE, RESOLVED: GREEN },
  severity: { LOW: BLUE, MEDIUM: ORANGE, HIGH: RED },
  verification: { PENDING: ORANGE, APPROVED: GREEN, REJECTED: RED },
};

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || humanize(value);
}

// 'UNDER_REVIEW' -> 'Under review'
export function humanize(value) {
  if (!value) return '';
  const text = String(value).replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

