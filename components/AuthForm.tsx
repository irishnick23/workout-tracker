'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

type AuthMode = 'email' | 'phone';

export default function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, sendMagicLink, sendPhoneOtp, verifyPhoneOtp } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!showOtpInput) {
        // Send OTP
        await sendPhoneOtp(phone);
        setSuccess('OTP sent to your phone!');
        setShowOtpInput(true);
      } else {
        // Verify OTP
        await verifyPhoneOtp(phone, otp);
        setSuccess('Successfully logged in!');
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

  const resetPhoneFlow = () => {
    setShowOtpInput(false);
    setOtp('');
    setError('');
    setSuccess('');
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setSuccess('');
    setShowOtpInput(false);
    setOtp('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white p-5">
      <div className="w-full max-w-md">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Workout Tracker
        </h2>

        {/* Auth Mode Toggle */}
        <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchAuthMode('email')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              authMode === 'email'
                ? 'bg-white text-black shadow'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              authMode === 'phone'
                ? 'bg-white text-black shadow'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email Authentication */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:border-black focus:outline-none"
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
        )}

        {/* Phone Authentication */}
        {authMode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <input
                type="tel"
                placeholder="Phone Number (e.g., +1234567890)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:border-black focus:outline-none"
                required
                disabled={showOtpInput}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            {showOtpInput && (
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-md border-2 border-gray-200 px-4 py-3 text-base text-center tracking-widest focus:border-black focus:outline-none"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (showOtpInput && otp.length !== 6)}
              className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? 'Loading...'
                : showOtpInput
                ? 'Verify Code'
                : 'Send Code'}
            </button>

            {showOtpInput && (
              <div className="text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={resetPhoneFlow}
                  disabled={loading}
                  className="font-medium text-black underline disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            )}
          </form>
        )}

        {/* Error and Success Messages */}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        {success && (
          <p className="mt-4 text-center text-sm text-green-600">{success}</p>
        )}
      </div>
    </div>
  );
}
