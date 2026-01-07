'use client';

import { useState } from 'react';

interface VideoSectionProps {
  tourId: string;
  enabled: boolean;
  title: string;
  embedCode: string | null;
  onUpdate: (data: { video_enabled?: boolean; video_section_title?: string; video_embed_code?: string | null }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function VideoSection({
  tourId,
  enabled,
  title: initialTitle,
  embedCode: initialEmbedCode,
  onUpdate,
  onMessage,
}: VideoSectionProps) {
  const [title, setTitle] = useState(initialTitle);
  const [embedCode, setEmbedCode] = useState(initialEmbedCode || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ video_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_section_title: title,
          video_embed_code: embedCode || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ video_section_title: title, video_embed_code: embedCode || null });
        onMessage('success', 'Video settings saved');
      } else {
        onMessage('error', data.error || 'Failed to save');
      }
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Extract video ID for preview
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/)(\d+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(embedCode);
  const vimeoId = getVimeoId(embedCode);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Video</h2>
          <p className="mt-1 text-sm text-gray-500">Long-form video embed</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{enabled ? 'Enabled' : 'Disabled'}</span>
          <button
            type="button"
            onClick={() => handleToggle(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
            placeholder="Video, Watch Our Tour, etc."
          />
        </div>

        {/* Embed Code */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Video URL or Embed Code
          </label>
          <textarea
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 font-mono transition-colors focus:border-gray-400 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=... or paste embed code"
          />
          <p className="mt-1 text-xs text-gray-400">
            Paste a YouTube or Vimeo URL, or the full embed code
          </p>
        </div>

        {/* Video Preview */}
        {(youtubeId || vimeoId) && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Preview
            </label>
            <div className="aspect-video w-full max-w-lg overflow-hidden rounded-lg bg-gray-100">
              {youtubeId && (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {vimeoId && (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
