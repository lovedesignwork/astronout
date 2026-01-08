'use client';

import { useState } from 'react';
import type { TourPackage, PackageUpsell, PackagePricingType, CalendarConfig } from '@/types';

interface PackagesSectionProps {
  tourId: string;
  enabled: boolean;
  packages: TourPackage[];
  onUpdate: (data: { packages_enabled?: boolean; packages?: TourPackage[] }) => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export function PackagesSection({
  tourId,
  enabled,
  packages: initialPackages,
  onUpdate,
  onMessage,
}: PackagesSectionProps) {
  const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages_enabled: newEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ packages_enabled: newEnabled });
      }
    } catch {
      onMessage('error', 'Failed to update');
    }
  };

  const handleAddPackage = () => {
    const newPackage: TourPackage = {
      id: `new-${Date.now()}`,
      tour_id: tourId,
      title: 'New Package',
      description: null,
      pricing_type: 'per_person',
      pricing_config: {
        retail_price: 0,
        net_price: 0,
        currency: 'THB',
      },
      included_items: [],
      calendar_enabled: false,
      calendar_config: {},
      pickup_enabled: false,
      order: packages.length,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upsells: [],
    };
    setPackages([...packages, newPackage]);
    setExpandedPackage(newPackage.id);
  };

  const handleUpdatePackage = (id: string, updates: Partial<TourPackage>) => {
    setPackages(packages.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/packages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state with saved packages (which have real IDs from database)
        setPackages(data.packages || packages);
        onUpdate({ packages: data.packages || packages });
        if (data.warnings && data.warnings.length > 0) {
          onMessage('error', `Saved with warnings: ${data.warnings.join(', ')}`);
        } else {
          onMessage('success', 'Packages saved');
        }
      } else {
        console.error('Failed to save packages:', data.error);
        onMessage('error', data.error || 'Failed to save packages');
      }
    } catch (err) {
      console.error('Error saving packages:', err);
      onMessage('error', 'An error occurred while saving packages');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tour Packages</h2>
          <p className="mt-1 text-sm text-gray-500">Pricing options and configurations</p>
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

      <div className="space-y-4">
        {/* Package List */}
        {packages.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            index={index}
            isExpanded={expandedPackage === pkg.id}
            onToggleExpand={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
            onUpdate={(updates) => handleUpdatePackage(pkg.id, updates)}
            onDelete={() => handleDeletePackage(pkg.id)}
          />
        ))}

        {/* Add Package Button */}
        <button
          type="button"
          onClick={handleAddPackage}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Package
        </button>

        {/* Save Button */}
        {packages.length > 0 && (
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
                  Save Packages
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Package Card Component
interface PackageCardProps {
  package: TourPackage;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<TourPackage>) => void;
  onDelete: () => void;
}

function PackageCard({ package: pkg, index, isExpanded, onToggleExpand, onUpdate, onDelete }: PackageCardProps) {
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [showUpsellForm, setShowUpsellForm] = useState(false);

  const pricingTypes: { value: PackagePricingType; label: string }[] = [
    { value: 'per_person', label: 'Per Person' },
    { value: 'adult_child', label: 'Adult & Child' },
    { value: 'per_seat', label: 'Per Seat' },
    { value: 'per_ticket', label: 'Per Ticket' },
  ];

  const handleAddIncludedItem = () => {
    if (!newIncludedItem.trim()) return;
    onUpdate({
      included_items: [...pkg.included_items, newIncludedItem.trim()],
    });
    setNewIncludedItem('');
  };

  const handleRemoveIncludedItem = (idx: number) => {
    onUpdate({
      included_items: pkg.included_items.filter((_, i) => i !== idx),
    });
  };

  const handleAddUpsell = (upsell: Omit<PackageUpsell, 'id' | 'package_id' | 'created_at' | 'updated_at'>) => {
    const newUpsell: PackageUpsell = {
      id: `upsell-${Date.now()}`,
      package_id: pkg.id,
      ...upsell,
    };
    onUpdate({
      upsells: [...(pkg.upsells || []), newUpsell],
    });
    setShowUpsellForm(false);
  };

  const handleRemoveUpsell = (upsellId: string) => {
    onUpdate({
      upsells: (pkg.upsells || []).filter(u => u.id !== upsellId),
    });
  };

  const handleCalendarConfigChange = (config: Partial<CalendarConfig>) => {
    onUpdate({
      calendar_config: { ...pkg.calendar_config, ...config },
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {index + 1}
          </span>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{pkg.title || 'Untitled Package'}</h4>
            <p className="text-xs text-gray-400">{pricingTypes.find(t => t.value === pkg.pricing_type)?.label}</p>
          </div>
          <svg
            className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="ml-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ enabled: !pkg.enabled })}
            className={`relative h-5 w-9 rounded-full transition-colors ${pkg.enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${pkg.enabled ? 'translate-x-4' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-5 border-t border-gray-100 px-4 py-4">
          {/* Package Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Package Title</label>
            <input
              type="text"
              value={pkg.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="e.g., Standard Package"
            />
          </div>

          {/* Pricing Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Pricing Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pricingTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onUpdate({ pricing_type: type.value })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    pkg.pricing_type === type.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Fields */}
          <PricingFields
            pricingType={pkg.pricing_type}
            config={pkg.pricing_config}
            onChange={(config) => onUpdate({ pricing_config: config })}
          />

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Package Description</label>
            <textarea
              value={pkg.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="What's included in this package..."
            />
          </div>

          {/* Included Items */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">What's Included</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {pkg.included_items.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveIncludedItem(idx)}
                    className="ml-1 text-emerald-500 hover:text-emerald-700"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIncludedItem}
                onChange={(e) => setNewIncludedItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIncludedItem())}
                className="h-8 flex-1 rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Add included item..."
              />
              <button
                type="button"
                onClick={handleAddIncludedItem}
                className="h-8 rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Calendar Settings */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Calendar</h5>
                <p className="text-xs text-gray-400">Enable date selection for this package</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ calendar_enabled: !pkg.calendar_enabled })}
                className={`relative h-5 w-9 rounded-full transition-colors ${pkg.calendar_enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${pkg.calendar_enabled ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            
            {pkg.calendar_enabled && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                {/* Weekend Only */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pkg.calendar_config.weekend_only || false}
                    onChange={(e) => handleCalendarConfigChange({ weekend_only: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Weekend only (Sat/Sun)</span>
                </label>
                
                {/* Blocked Dates */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Blocked Dates</label>
                  <input
                    type="text"
                    value={(pkg.calendar_config.blocked_dates || []).join(', ')}
                    onChange={(e) => handleCalendarConfigChange({
                      blocked_dates: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    })}
                    className="h-8 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
                    placeholder="2024-12-25, 2024-12-31"
                  />
                  <p className="mt-1 text-xs text-gray-400">Comma-separated dates (YYYY-MM-DD)</p>
                </div>
              </div>
            )}
          </div>

          {/* Upsells */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Package Upsells</h5>
                <p className="text-xs text-gray-400">Additional options for this package</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpsellForm(true)}
                className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </button>
            </div>
            
            {(pkg.upsells || []).length > 0 && (
              <div className="space-y-2">
                {(pkg.upsells || []).map(upsell => (
                  <div key={upsell.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{upsell.title}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {upsell.price} THB / {upsell.pricing_type === 'per_person' ? 'person' : 'booking'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUpsell(upsell.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showUpsellForm && (
              <UpsellForm
                onAdd={handleAddUpsell}
                onCancel={() => setShowUpsellForm(false)}
              />
            )}
          </div>

          {/* Pickup */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Include Pickup</h5>
              <p className="text-xs text-gray-400">Show pickup address field after contact info</p>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ pickup_enabled: !pkg.pickup_enabled })}
              className={`relative h-5 w-9 rounded-full transition-colors ${pkg.pickup_enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${pkg.pickup_enabled ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Pricing Fields Component
interface PricingFieldsProps {
  pricingType: PackagePricingType;
  config: TourPackage['pricing_config'];
  onChange: (config: TourPackage['pricing_config']) => void;
}

function PricingFields({ pricingType, config, onChange }: PricingFieldsProps) {
  const updateConfig = (updates: Partial<TourPackage['pricing_config']>) => {
    onChange({ ...config, ...updates });
  };

  if (pricingType === 'per_person' || pricingType === 'per_ticket') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Retail Price (THB)</label>
          <input
            type="number"
            value={config.retail_price || 0}
            onChange={(e) => updateConfig({ retail_price: Number(e.target.value) })}
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Net Price (Cost)</label>
          <input
            type="number"
            value={config.net_price || 0}
            onChange={(e) => updateConfig({ net_price: Number(e.target.value) })}
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (pricingType === 'adult_child') {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Adult Retail (THB)</label>
            <input
              type="number"
              value={config.adult_retail_price || 0}
              onChange={(e) => updateConfig({ adult_retail_price: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Adult Net (Cost)</label>
            <input
              type="number"
              value={config.adult_net_price || 0}
              onChange={(e) => updateConfig({ adult_net_price: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Child Retail (THB)</label>
            <input
              type="number"
              value={config.child_retail_price || 0}
              onChange={(e) => updateConfig({ child_retail_price: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Child Net (Cost)</label>
            <input
              type="number"
              value={config.child_net_price || 0}
              onChange={(e) => updateConfig({ child_net_price: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Child Max Age</label>
          <input
            type="number"
            value={config.child_age_max || 11}
            onChange={(e) => updateConfig({ child_age_max: Number(e.target.value) })}
            className="h-9 w-32 rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (pricingType === 'per_seat') {
    const seats = config.seats || [];
    return (
      <div className="space-y-3">
        {seats.map((seat, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Seat Type</label>
              <input
                type="text"
                value={seat.seat_type}
                onChange={(e) => {
                  const updated = [...seats];
                  updated[idx] = { ...seat, seat_type: e.target.value };
                  updateConfig({ seats: updated });
                }}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="VIP, Standard..."
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-gray-600">Retail</label>
              <input
                type="number"
                value={seat.retail_price}
                onChange={(e) => {
                  const updated = [...seats];
                  updated[idx] = { ...seat, retail_price: Number(e.target.value) };
                  updateConfig({ seats: updated });
                }}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-gray-600">Net</label>
              <input
                type="number"
                value={seat.net_price}
                onChange={(e) => {
                  const updated = [...seats];
                  updated[idx] = { ...seat, net_price: Number(e.target.value) };
                  updateConfig({ seats: updated });
                }}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => updateConfig({ seats: seats.filter((_, i) => i !== idx) })}
              className="h-9 rounded-lg border border-red-200 px-2 text-red-500 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => updateConfig({ seats: [...seats, { seat_type: '', retail_price: 0, net_price: 0 }] })}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add seat type
        </button>
      </div>
    );
  }

  return null;
}

// Upsell Form Component
interface UpsellFormProps {
  onAdd: (upsell: Omit<PackageUpsell, 'id' | 'package_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

function UpsellForm({ onAdd, onCancel }: UpsellFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [pricingType, setPricingType] = useState<'per_booking' | 'per_person'>('per_person');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || null,
      price,
      pricing_type: pricingType,
      order: 0,
      enabled: true,
    });
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
        placeholder="Upsell title"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-8 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
        placeholder="Description (optional)"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="h-8 w-28 rounded-lg border border-gray-200 px-3 text-sm focus:border-gray-400 focus:outline-none"
          placeholder="Price"
        />
        <select
          value={pricingType}
          onChange={(e) => setPricingType(e.target.value as 'per_booking' | 'per_person')}
          className="h-8 rounded-lg border border-gray-200 px-2 text-sm focus:border-gray-400 focus:outline-none"
        >
          <option value="per_person">Per Person</option>
          <option value="per_booking">Per Booking</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-lg px-3 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="h-8 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add Upsell
        </button>
      </div>
    </div>
  );
}
