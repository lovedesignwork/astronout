'use client';

import type { BlockProps } from './registry';

interface MapContent {
  latitude?: number;
  longitude?: number;
  address?: string;
  meetingPoint?: string;
  embedUrl?: string;
  zoom?: number;
}

export function MapBlock({ block }: BlockProps) {
  const content = block.content as MapContent;

  // Generate Google Maps embed URL if coordinates provided
  const getMapUrl = () => {
    if (content.embedUrl) return content.embedUrl;
    if (content.latitude && content.longitude) {
      const zoom = content.zoom || 15;
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${content.longitude}!3d${content.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${zoom}!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1600000000000!5m2!1sen!2s`;
    }
    return null;
  };

  const mapUrl = getMapUrl();

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {block.title && (
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">{block.title}</h2>
        </div>
      )}

      {/* Map */}
      {mapUrl ? (
        <div className="aspect-video w-full">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Tour Location Map"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="mt-2 text-sm">Map not available</p>
          </div>
        </div>
      )}

      {/* Location Details */}
      {(content.address || content.meetingPoint) && (
        <div className="border-t border-gray-100 p-4">
          {content.meetingPoint && (
            <div className="mb-3">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-4 w-4" style={{ color: '#0033FF' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Meeting Point
              </h3>
              <p className="text-sm text-gray-600">{content.meetingPoint}</p>
            </div>
          )}

          {content.address && (
            <div>
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <svg
                  className="h-4 w-4" style={{ color: '#0033FF' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Address
              </h3>
              <p className="text-sm text-gray-600">{content.address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
