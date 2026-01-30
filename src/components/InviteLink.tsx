'use client';

import { useState, useEffect } from 'react';

interface InvitedMember {
  id: string;
  name: string;
  joinedAt: string;
}

export default function InviteLink() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInvited, setShowInvited] = useState(false);

  useEffect(() => {
    async function fetchInviteInfo() {
      try {
        const response = await fetch('/api/invite');
        if (response.ok) {
          const data = await response.json();
          setInviteCode(data.inviteCode);
          setInviteCount(data.inviteCount);
          setInvitedMembers(data.invitedMembers || []);
        }
      } catch (error) {
        console.error('Error fetching invite info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInviteInfo();
  }, []);

  const inviteUrl = inviteCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${inviteCode}`
    : '';

  const handleCopy = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Invite Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 px-4 py-2.5 text-gray-900 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-1.5 text-sm text-gray-500">
          Share this link to invite friends to join Aloha Rising
        </p>
      </div>

      {/* Invite Stats */}
      <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
        <div>
          <p className="text-sm text-teal-600 font-medium">Members Invited</p>
          <p className="text-2xl font-bold text-teal-700">{inviteCount}</p>
        </div>
        {inviteCount > 0 && (
          <button
            onClick={() => setShowInvited(!showInvited)}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            {showInvited ? 'Hide' : 'View'}
          </button>
        )}
      </div>

      {/* Invited Members List */}
      {showInvited && invitedMembers.length > 0 && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {invitedMembers.map((member) => (
            <div key={member.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{member.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
