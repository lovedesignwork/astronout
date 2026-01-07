'use client';

import { useState } from 'react';

interface SafetyInfoSectionProps {
  tourId: string;
  enabled: boolean;
  items: string[];
  restrictions: string[];
  onUpdate: (data: { safety_info_enabled?: boolean; items?: string[]; restrictions?: string[] }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function SafetyInfoSection({
  tourId,
  enabled,
  items: initialItems,
  restrictions: initialRestrictions,
  onUpdate,
  onMessage,
}: SafetyInfoSectionProps) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [restrictions, setRestrictions] = useState<string[]>(initialRestrictions);
  const [newItem, setNewItem] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safety_info_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ safety_info_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddRestriction = () => {
    if (!newRestriction.trim()) return;
    setRestrictions([...restrictions, newRestriction.trim()]);
    setNewRestriction('');
  };

  const handleRemoveRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update safety_info block
      const blocksRes = await fetch(`/api/admin/tours/${tourId}/blocks`);
      const blocksData = await blocksRes.json();
      
      if (blocksData.success) {
        const safetyBlock = blocksData.blocks?.find((b: { block_type: string }) => b.block_type === 'safety_info');
        if (safetyBlock) {
          await fetch(`/api/admin/tours/${tourId}/blocks/${safetyBlock.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: { items, restrictions },
              language: 'en',
            }),
          });
        }
      }

      onUpdate({ items, restrictions });
      onMessage('success', 'Safety info saved');
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
          <h2 className="text-lg font-semibold text-gray-900">Safety Information</h2>
          <p className="mt-1 text-sm text-gray-500">Safety guidelines and restrictions</p>
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
        {/* Safety Guidelines */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Safety Guidelines
          </label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
              className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Add safety guideline..."
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="h-9 rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Restrictions */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Restrictions
          </label>
          <div className="space-y-2">
            {restrictions.map((restriction, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="flex-1 text-sm text-gray-700">{restriction}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRestriction(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRestriction())}
              className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="Add restriction..."
            />
            <button
              type="button"
              onClick={handleAddRestriction}
              className="h-9 rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
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
                Save Safety Info
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
