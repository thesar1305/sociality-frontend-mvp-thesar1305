'use client';

import { useEffect } from 'react';

import { getAccessToken } from '@/lib/auth/storage';
import { hydrateSession } from '@/lib/store/auth-slice';
import { useAppDispatch } from '@/lib/store/hooks';

export function SessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateSession(getAccessToken()));
  }, [dispatch]);

  return null;
}
