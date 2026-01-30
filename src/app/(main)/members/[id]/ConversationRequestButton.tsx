'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Textarea from '@/components/Textarea';

interface ConversationRequestButtonProps {
  memberId: string;
  memberName: string;
  existingRequest?: {
    id: string;
    status: string;
    from_member_id: string;
  };
  currentUserId: string;
}

export default function ConversationRequestButton({
  memberId,
  memberName,
  existingRequest,
  currentUserId,
}: ConversationRequestButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toMemberId: memberId,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send request');
      }

      setSuccess(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // If there's already a pending or accepted request
  if (existingRequest || success) {
    const status = success ? 'pending' : existingRequest?.status;
    const isFromMe = success || existingRequest?.from_member_id === currentUserId;

    if (status === 'pending') {
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800">
            {isFromMe
              ? `Your conversation request is pending. ${memberName.split(' ')[0]} will be notified.`
              : `${memberName.split(' ')[0]} has requested a conversation with you.`}
          </p>
        </div>
      );
    }

    if (status === 'accepted') {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            You are connected with {memberName.split(' ')[0]}. Reach out to start a conversation!
          </p>
        </div>
      );
    }
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Request a Conversation</h3>
        <p className="text-gray-600 text-sm">
          Introduce yourself and let {memberName.split(' ')[0]} know why you would like to connect.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Your Message (optional)"
            name="message"
            placeholder={`Hi ${memberName.split(' ')[0]}, I would like to connect because...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading}>
              Send Request
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Button onClick={() => setShowForm(true)}>
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Request a Conversation
    </Button>
  );
}
