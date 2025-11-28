'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, sendMagicLink } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess('');
        }, 2000);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await sendMagicLink(email);
      setSuccess('Check your email for the magic link!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white p-5">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          💪 Workout Tracker
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-2 border-gray-200 px-4 py-3 text-base focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-2 border-gray-200 px-4 py-3 text-base focus:border-black focus:outline-none"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="text-center text-sm text-green-600">{success}</p>
          )}

          <div className="text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="font-medium text-black underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="font-medium text-black underline disabled:opacity-50"
            >
              Send Magic Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
