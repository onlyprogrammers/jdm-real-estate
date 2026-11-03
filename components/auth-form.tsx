'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((event.nativeEvent as SubmitEvent & { isComposing?: boolean }).isComposing) return
    setLoading(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const result = mode === 'sign-up'
        ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
        : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
      if (result.error) {
        setError('Unable to complete this request. Check your details and try again.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('We couldn’t reach the sign-in service. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }
  const field = 'min-h-12 rounded-sm border border-[#deddd3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#839242] focus:ring-2 focus:ring-[#e8edd5]'
  return <form onSubmit={submit} className="flex flex-col gap-4">
    {mode === 'sign-up' && <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#58665e]">Full name<input name="name" autoComplete="name" required placeholder="Your name" className={field} /></label>}
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#58665e]">Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={field} /></label>
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#58665e]">Password<input name="password" type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" className={field} /></label>
    {error && <p role="alert" className="rounded-sm border border-[#f0d8d0] bg-[#fff7f4] px-3 py-2 text-xs text-[#923d32]">{error}</p>}
    <button disabled={loading} className="mt-1 min-h-12 bg-[#214b38] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(33,75,56,.14)] transition hover:bg-[#2b5a42] disabled:cursor-wait disabled:opacity-60">{loading ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
  </form>
}
