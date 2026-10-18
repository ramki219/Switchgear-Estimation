// ============================================================================
// API CLIENT (Multi-Tenant HTTP Service with Token Injection & Error Handling)
// ============================================================================

import { auth } from '../lib/firebase';

async function getAuthHeader(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (e) {
      console.warn('Could not get Firebase ID token:', e);
    }
  }
  return {
    'Content-Type': 'application/json',
  };
}

export const apiClient = {
  async get(url: string) {
    const headers = await getAuthHeader();
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async post(url: string, body: any) {
    const headers = await getAuthHeader();
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async put(url: string, body: any) {
    const headers = await getAuthHeader();
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async delete(url: string) {
    const headers = await getAuthHeader();
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },
};
