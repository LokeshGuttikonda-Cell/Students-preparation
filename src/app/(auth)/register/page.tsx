'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginAsDemoStudent } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-md bg-[#0a0f1d]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Neon Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lime-400 via-cyan-400 to-lime-400 opacity-90 shadow-[0_0_12px_rgba(163,230,53,0.8)]" />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">
            Start your interview & placement preparation journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl">
              {error}
            </div>
          )}

          <Field label="Full Name" htmlFor="name" required>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

          <Field label="Email Address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            hint="Must be at least 8 characters"
            required
          >
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_20px_rgba(163,230,53,0.3)] border-0 rounded-xl cursor-pointer"
              isLoading={isLoading}
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full py-2.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white rounded-xl cursor-pointer transition-all"
              onClick={() => {
                loginAsDemoStudent();
                router.push('/dashboard');
              }}
            >
              One-Click Demo Student Instant Access
            </Button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-lime-400 hover:text-lime-300 font-bold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
