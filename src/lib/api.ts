const BASE = 'http://localhost:3001'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request gagal')
  return data
}

export const api = {
  getMe: () => req<{ user: AuthUser }>('/api/auth/me'),
  login: (email: string, password: string) =>
    req<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, name: string, password: string) =>
    req<{ user: AuthUser }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password }) }),
  loginGoogle: (idToken: string) =>
    req<{ user: AuthUser }>('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  logout: () => req<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  getPackages: () => req<{ packages: CreditPackage[] }>('/api/payment/packages'),
  createPayment: (packageId: string) =>
    req<{ token: string; redirectUrl: string; orderId: string }>('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    }),
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  creditBalance: number
  plan: 'FREE' | 'STARTER' | 'PRO' | 'UNLIMITED'
  freeUsed?: number
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  priceIdr: number
}
