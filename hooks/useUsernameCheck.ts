// Debounced async username check that ignores stale responses and cancels on unmount.
'use client';

import { useEffect, useState } from 'react';
import { checkUsername } from '@/lib/api';

type Result = { name: string; status: 'available' | 'taken' | 'failed' };

const DEBOUNCE_MS = 500;

const messages = {
  idle: '',
  checking: 'Checking availability…',
  available: '✓ Username is available',
  taken: 'This username is already taken',
  failed: 'Could not check the username. Edit it to try again.',
};

export function useUsernameCheck(username: string, enabled: boolean) {
  const [result, setResult] = useState<Result | null>(null);
  const name = username.trim();
  const active = enabled && name !== '';

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const id = setTimeout(() => {
      checkUsername(name)
        .then((ok): Result => ({ name, status: ok ? 'available' : 'taken' }))
        .catch((): Result => ({ name, status: 'failed' }))
        .then((r) => {
          if (!cancelled) setResult(r);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [active, name]);

  const status = !active ? 'idle' : result?.name === name ? result.status : 'checking';
  return { status, message: messages[status] };
}