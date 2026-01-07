'use client';

import { useState } from 'react';
import { AITranslateButton } from '@/components/admin/AITranslateButton';
import type { Language } from '@/types';

interface DescriptionSectionProps {
  tourId: string;
  enabled: boolean;
  subtitle: string;
  description: string;
  onUpdate: (data: { description_enabled?: boolean; subtitle?: string; description?: string }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function DescriptionSection({
  tourId,
  enabled,
  subtitle: initialSubtitle,
  description: initialDescription,
  onUpdate,
  onMessage,
}: DescriptionSectionProps) {
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [description, setDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ description_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update hero block content with subtitle and description
      const blocksRes = await fetch(`/api/admin/tours/${tourId}/blocks`);
      const blocksData = await blocksRes.json();
      
      if (blocksData.success) {
        const heroBlock = blocksData.blocks?.find((b: { block_type: string }) => b.block_type === 'hero');
        if (heroBlock) {
          await fetch(`/api/admin/tours/${tourId}/blocks/${heroBlock.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: {
                ...heroBlock.content,
                subtitle,
                description,
              },
              language: 'en',
            }),
          });
        }
      }

      onUpdate({ subtitle, description });
      onMessage('success', 'Description saved');
    } catch {
      onMessage('error', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tour Description</h2>
          <p className="mt-1 text-sm text-gray-500">Subtitle and detailed description</p>
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
        {/* Subtitle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Subtitle
            </label>
            <AITranslateButton
              sourceText={subtitle}
              tourId={tourId}
              size="sm"
              label="Translate"
              disabled={!subtitle.trim()}
              onTranslationsComplete={() => {
                onMessage('success', 'Subtitle translated to all languages');
              }}
            />
          </div>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
            placeholder="Brief tagline or subtitle"
          />
          <p className="mt-1 text-xs text-gray-400">
            Appears below the tour title
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Full Description
            </label>
            <AITranslateButton
              sourceText={description}
              tourId={tourId}
              size="sm"
              label="Translate"
              disabled={!description.trim()}
              onTranslationsComplete={() => {
                onMessage('success', 'Description translated to all languages');
              }}
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none"
            placeholder="Detailed tour description..."
          />
          <p className="mt-1 text-xs text-gray-400">
            Full description shown in the Tour Description section
          </p>
        </div>

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
                Save Description
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
