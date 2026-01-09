// Simple local user helper used for local development when no auth provider is configured.
// In production, replace this with real authentication (e.g. Supabase, Auth0).

export function getLocalUserId() {
  if (typeof window === 'undefined') return 'anonymous';
  let id = localStorage.getItem('overflow-user-id');
  if (!id) {
    id = `local-${Date.now()}`;
    localStorage.setItem('overflow-user-id', id);
  }
  return id;
}

export function getLocalUserProfile() {
  if (typeof window === 'undefined') return { id: 'anonymous', name: 'Guest' };
  const id = getLocalUserId();
  const name = localStorage.getItem('overflow-user-name') || 'Guest';
  return { id, name };
}
