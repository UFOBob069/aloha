'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  can_help_with: string;
  looking_for: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/members/me');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsFetching(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile((prev) => (prev ? { ...prev, [e.target.name]: e.target.value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/members/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          location: profile.location,
          bio: profile.bio,
          can_help_with: profile.can_help_with,
          looking_for: profile.looking_for,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-gray-600">
          Help others get to know you by sharing a bit about yourself.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>This information will be visible to other members.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Name"
              name="name"
              type="text"
              value={profile.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Location"
              name="location"
              type="text"
              placeholder="City, State or Country"
              value={profile.location || ''}
              onChange={handleChange}
            />

            <Textarea
              label="About You"
              name="bio"
              placeholder="Tell others a bit about yourself, your background, and your journey..."
              value={profile.bio || ''}
              onChange={handleChange}
              helperText="A short bio helps others understand who you are"
            />

            <Textarea
              label="I Can Help With..."
              name="can_help_with"
              placeholder="Share your areas of expertise, experience, or what you can offer to others..."
              value={profile.can_help_with || ''}
              onChange={handleChange}
              helperText="What wisdom or experience can you share with the community?"
            />

            <Textarea
              label="I Am Looking For..."
              name="looking_for"
              placeholder="What kind of connections, guidance, or support are you seeking?"
              value={profile.looking_for || ''}
              onChange={handleChange}
              helperText="Help others understand how they might help you"
            />

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
