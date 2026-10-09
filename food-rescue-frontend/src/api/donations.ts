import { api } from './client'
export const categories = {
  FRESH_PRODUCE: 'Fresh produce', BAKERY: 'Bakery', DAIRY: 'Dairy',
  MEAT_AND_SEAFOOD: 'Meat and seafood', PANTRY_AND_DRY_GOODS: 'Pantry and dry goods',
  PREPARED_MEALS: 'Prepared meals', BEVERAGES: 'Beverages', OTHER: 'Other',
} as const
export type Category = keyof typeof categories
export type Donation = {
  id: number; donorId: number; donorName: string; title: string; description: string | null
  category: Category; quantity: number; quantityUnit: string; dietaryInfo: string | null
  storageInfo: string | null; expiryDateTime: string; collectionDeadline: string
  pickupAddress: string | null; status: string; createdAt: string; updatedAt: string
}
export function getAvailableDonations(signal?: AbortSignal) {
  return api<Donation[]>('/donations/available', { signal })
}

