'use client';

import { useState, useRef } from 'react';

interface ProfilePhotoUploadProps {
  currentPhotoURL?: string;
  userName: string;
  onPhotoUpdated: (photoURL: string) => void;
}

export default function ProfilePhotoUpload({ currentPhotoURL, userName, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload photo');
      }

      const { photoURL } = await response.json();
      onPhotoUpdated(photoURL);
      setPreviewURL(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      setPreviewURL(null);
    } finally {
      setIsUploading(false);
    }
  };

  const displayURL = previewURL || currentPhotoURL;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {displayURL ? (
          <img
            src={displayURL}
            alt={userName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-2xl border-4 border-white shadow-lg">
            {initials}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : currentPhotoURL ? 'Change Photo' : 'Upload Photo'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
