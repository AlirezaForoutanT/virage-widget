// src/utils/guest.ts
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate or retrieve a guest ID for anonymous users.
 * Stored in localStorage under 'virage_guest_id'.
 */
export function getGuestId(): string {
  if (typeof window === 'undefined') {
    // Server-side, return a placeholder
    return 'guest-server';
  }

  const storageKey = 'virage_guest_id';
  let id = localStorage.getItem(storageKey);
  if (!id) {
    id = `guest-${uuidv4()}`;
    localStorage.setItem(storageKey, id);
  }
  return id;
}
