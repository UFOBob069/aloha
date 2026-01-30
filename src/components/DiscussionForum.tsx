'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from './Button';
import Textarea from './Textarea';
import Input from './Input';

interface Discussion {
  id: string;
  groupId: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  title: string;
  content: string;
  replyCount: number;
  createdAt: string;
}

interface DiscussionForumProps {
  groupId: string;
  canPost?: boolean;
}

export default function DiscussionForum({ groupId, canPost = true }: DiscussionForumProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [groupId]);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(`/api/discussions?groupId=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPosting(true);
    setError('');

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          title: newTitle,
          content: newContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create discussion');
      }

      setNewTitle('');
      setNewContent('');
      setShowNewPost(false);
      fetchDiscussions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Post Button/Form */}
      {canPost && (
        <div>
          {showNewPost ? (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Start a Discussion</h3>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What would you like to discuss?"
                required
              />

              <Textarea
                label="Content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts..."
                required
              />

              <div className="flex gap-2">
                <Button type="submit" isLoading={isPosting}>
                  Post Discussion
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewPost(false);
                    setNewTitle('');
                    setNewContent('');
                    setError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewPost(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start a Discussion
            </button>
          )}
        </div>
      )}

      {/* Discussion List */}
      {discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/groups/${groupId}/discussions/${discussion.id}`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{discussion.title}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{discussion.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {discussion.replyCount} replies
                </span>
                <span>{formatTimeAgo(discussion.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No discussions yet</p>
          <p className="text-sm mt-1">Be the first to start a conversation!</p>
        </div>
      )}
    </div>
  );
}
