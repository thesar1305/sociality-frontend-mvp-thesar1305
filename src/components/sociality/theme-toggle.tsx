'use client';

import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';

const THEME_STORAGE_KEY = 'sociality:theme';
const THEME_UPDATED_EVENT = 'sociality:theme-updated';

type Theme = 'light' | 'dark';

function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener(THEME_UPDATED_EVENT, callback);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getServerThemeSnapshot(): Theme {
  return 'light';
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  function handleToggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.classList.toggle('dark', nextTheme === 'dark');

    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      onClick={handleToggleTheme}
    >
      {isDark ? 'Terang' : 'Gelap'}
    </Button>
  );
}
