'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

export default function NewGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    description: '',
    cadence: '',
    maxSize: '20',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          purpose: formData.purpose,
          description: formData.description,
          cadence: formData.cadence,
          maxSize: parseInt(formData.maxSize, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      router.push(`/groups/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/groups" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Groups
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create a New Group</h1>
        <p className="mt-1 text-gray-600">Start a new community for people to connect and grow together.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
          <CardDescription>Define the purpose and structure of your group.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Group Name"
              name="name"
              type="text"
              placeholder="e.g., Life After Retirement"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Purpose"
              name="purpose"
              placeholder="What is this group about? What will members gain from joining?"
              value={formData.purpose}
              onChange={handleChange}
              required
              helperText="A clear, concise statement of the group's purpose"
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Provide more details about the group, what to expect, and who should join..."
              value={formData.description}
              onChange={handleChange}
              helperText="Optional longer description"
            />

            <Input
              label="Meeting Cadence"
              name="cadence"
              type="text"
              placeholder="e.g., Weekly on Thursdays, Bi-weekly on Tuesdays"
              value={formData.cadence}
              onChange={handleChange}
              helperText="How often does the group meet?"
            />

            <Input
              label="Maximum Size"
              name="maxSize"
              type="number"
              min="2"
              max="100"
              value={formData.maxSize}
              onChange={handleChange}
              helperText="Recommended: 8-20 for meaningful interaction"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/groups"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <Button type="submit" isLoading={isLoading}>
                Create Group
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
