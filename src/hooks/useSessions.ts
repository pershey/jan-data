import { useState, useCallback } from 'react';
import { useSessionRepository } from '@/repositories/session-repository';
import type { Session } from '@/types';

export function useSessions() {
  const repo = useSessionRepository();
  const [sessions, setSessions] = useState<Session[]>([]);

  const reload = useCallback(async () => {
    const data = await repo.getAll();
    setSessions(data);
  }, []);

  return { sessions, reload };
}
