'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if ((event.nativeEvent as SubmitEvent & { isComposing?: boolean }).isComposing) return; setLoading(true); setError(''); const data = new FormData(event.currentTarget); const result = mode === 'sign-up' ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) }) : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) }); setLoading(false); if (result.error) setError('Unable to complete this request. Check your details and try again.'); else { router.push('/'); router.refresh() } }
  return <form onSubmit={submit} className="flex flex-col gap-4">{mode === 'sign-up' && <input name="name" required placeholder="Full name" className="rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm outline-none" />}<input name="email" type="email" required placeholder="Email address" className="rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm outline-none" /><input name="password" type="password" minLength={8} required placeholder="Password (8+ characters)" className="rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-sm outline-none" />{error && <p className="text-xs text-red-600">{error}</p>}<button disabled={loading} className="rounded-xl bg-[#174936] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button></form>
}
