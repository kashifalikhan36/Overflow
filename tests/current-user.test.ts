import { describe, it, expect } from 'vitest';
import { getLocalUserId, getLocalUserProfile } from '@/lib/current-user';

describe('current user helper', () => {
  it('returns a non-empty id', () => {
    const id = getLocalUserId();
    expect(id).toBeTruthy();
  });

  it('returns a profile with an id and name', () => {
    const profile = getLocalUserProfile();
    expect(profile.id).toBeTruthy();
    expect(typeof profile.name).toBe('string');
  });
});
