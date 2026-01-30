'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    whatBringsYou: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createSession = async (idToken: string, isNewUser: boolean, displayName?: string, photoURL?: string) => {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        isNewUser,
        displayName: formData.name || displayName,
        photoURL,
        location: formData.location,
        whatBringsYou: formData.whatBringsYou,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create session');
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signUpWithEmail(formData.email, formData.password, formData.name);
      const idToken = await userCredential.getIdToken();
      await createSession(idToken, true, formData.name);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(firebaseError.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const userCredential = await signInWithGoogle();
      const idToken = await userCredential.getIdToken();

      // Check if this is the first time (by checking if metadata is recent)
      const isNewUser =
        userCredential.metadata.creationTime === userCredential.metadata.lastSignInTime;

      // Set name from Google profile
      setFormData((prev) => ({
        ...prev,
        name: userCredential.displayName || '',
      }));

      if (isNewUser) {
        // Show profile completion step
        setStep('profile');
        setIsGoogleLoading(false);
      } else {
        // Existing user, create session and redirect
        await createSession(idToken, false, userCredential.displayName || undefined, userCredential.photoURL || undefined);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
      } else {
        setError(firebaseError.message || 'Something went wrong');
      }
      setIsGoogleLoading(false);
    }
  };

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const idToken = await user.getIdToken();
      await createSession(idToken, true, user.displayName || formData.name, user.photoURL || undefined);
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Profile completion step (after Google auth)
  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-teal-600">Aloha</span>
              <span className="text-2xl font-light text-gray-600">Rising</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                <p className="mt-2 text-gray-600">Tell us a bit about yourself</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileComplete} className="space-y-5">
                <Input
                  label="Location (optional)"
                  name="location"
                  type="text"
                  placeholder="City, State or Country"
                  value={formData.location}
                  onChange={handleChange}
                />

                <Textarea
                  label="What brings you here?"
                  name="whatBringsYou"
                  placeholder="Tell us a little about yourself and what you are looking for..."
                  value={formData.whatBringsYou}
                  onChange={handleChange}
                  helperText="This helps us connect you with the right people and groups"
                />

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Continue to Dashboard
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-teal-600">Aloha</span>
            <span className="text-2xl font-light text-gray-600">Rising</span>
          </Link>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Join the Community</h1>
              <p className="mt-2 text-gray-600">Start your journey to meaningful connection</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-5">
              <Input
                label="Your Name"
                name="name"
                type="text"
                placeholder="What should we call you?"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />

              <Input
                label="Location (optional)"
                name="location"
                type="text"
                placeholder="City, State or Country"
                value={formData.location}
                onChange={handleChange}
              />

              <Textarea
                label="What brings you here?"
                name="whatBringsYou"
                placeholder="Tell us a little about yourself and what you are looking for..."
                value={formData.whatBringsYou}
                onChange={handleChange}
                helperText="This helps us connect you with the right people and groups"
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Join Aloha Rising
              </Button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already a member?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 px-4">
            By joining, you agree to our{' '}
            <Link href="/code-of-conduct" className="text-teal-600 hover:underline">
              Code of Conduct
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-teal-600 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
