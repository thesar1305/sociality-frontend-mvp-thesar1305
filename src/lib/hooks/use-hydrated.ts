'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 * Use it to keep the first client render identical to the server HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
