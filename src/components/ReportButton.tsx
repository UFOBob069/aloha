'use client';

import { useState } from 'react';
import Button from './Button';
import Textarea from './Textarea';

interface ReportButtonProps {
  memberId?: string;
  groupId?: string;
  memberName?: string;
  groupName?: string;
}

const REPORT_REASONS = [
  'Harassment or bullying',
  'Spam or commercial solicitation',
  'Inappropriate content',
  'Impersonation or fake account',
  'Privacy violation',
  'Other',
];

export default function ReportButton({ memberId, groupId, memberName, groupName }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedMemberId: memberId,
          reportedGroupId: groupId,
          reason,
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const entityName = memberName || groupName;
  const entityType = memberId ? 'member' : 'group';

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        <p className="font-medium">Report submitted</p>
        <p className="text-sm mt-1">Thank you for helping keep our community safe. We will review your report.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Report
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Report {entityType}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                You are reporting {entityName}. Please select a reason and provide any additional details.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for report</label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label key={r} className="flex items-center">
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="mr-3 text-teal-600 focus:ring-teal-500"
                          required
                        />
                        <span className="text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Additional details (optional)"
                  name="description"
                  placeholder="Please provide any additional context that would help us review this report..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={isLoading}>
                    Submit Report
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
