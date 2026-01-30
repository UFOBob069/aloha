'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    eventType: 'online',
    meetingLink: '',
    location: '',
    groupId: groupId || '',
  });

  useEffect(() => {
    if (groupId) {
      setFormData((prev) => ({ ...prev, groupId }));
    }
  }, [groupId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          eventDate: eventDateTime.toISOString(),
          eventType: formData.eventType,
          meetingLink: formData.meetingLink,
          location: formData.location,
          groupId: formData.groupId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Event Title"
        name="title"
        type="text"
        placeholder="e.g., Weekly Check-In, Guest Speaker Session"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <Textarea
        label="Description"
        name="description"
        placeholder="What will happen at this event? What should attendees expect?"
        value={formData.description}
        onChange={handleChange}
        helperText="Optional but helpful for attendees"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          name="eventDate"
          type="date"
          min={today}
          value={formData.eventDate}
          onChange={handleChange}
          required
        />
        <Input
          label="Time"
          name="eventTime"
          type="time"
          value={formData.eventTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type</label>
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className="w-full px-4 py-2.5 text-gray-900 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
        >
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
        </select>
      </div>

      {formData.eventType === 'online' && (
        <Input
          label="Meeting Link"
          name="meetingLink"
          type="url"
          placeholder="https://meet.google.com/... or https://zoom.us/..."
          value={formData.meetingLink}
          onChange={handleChange}
          helperText="Zoom, Google Meet, or other video call link"
        />
      )}

      {formData.eventType === 'in-person' && (
        <Input
          label="Location"
          name="location"
          type="text"
          placeholder="Address or venue name"
          value={formData.location}
          onChange={handleChange}
        />
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Link
          href="/events"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={isLoading}>
          Create Event
        </Button>
      </div>
    </form>
  );
}

export default function NewEventPage() {
  const [error, setError] = useState('');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create a New Event</h1>
        <p className="mt-1 text-gray-600">Schedule a gathering for the community.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Set up your event for community members to join.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <Suspense fallback={<div>Loading...</div>}>
            <NewEventForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
