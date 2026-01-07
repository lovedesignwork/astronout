'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  name: string;
  url: string;
  path: string;
}

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  folder?: string;
  accept?: string;
  allowVideo?: boolean;
  compact?: boolean;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 10,
  label,
  folder = 'tours',
  accept = 'image/*',
  allowVideo = false,
  compact = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - value.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.files) {
        const newUrls = data.files.map((f: UploadedFile) => f.url);
        onChange([...value, ...newUrls]);
        
        if (data.errors && data.errors.length > 0) {
          setError(`Some files failed: ${data.errors.join(', ')}`);
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
    }

    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [folder, maxFiles, onChange, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [moved] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, moved);
    onChange(newUrls);
  };

  const acceptTypes = allowVideo ? 'image/*,video/mp4,video/webm,video/quicktime' : accept;

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-medium text-gray-600">
          {label}
          <span className="ml-2 font-normal text-gray-400">
            ({value.length}/{maxFiles})
          </span>
        </label>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          } ${compact ? 'p-3' : 'p-6'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className={`animate-spin ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className={compact ? 'text-xs' : 'text-sm'}>Uploading...</span>
            </div>
          ) : (
            <>
              <svg className={`text-gray-400 ${compact ? 'mb-1 h-5 w-5' : 'mb-2 h-8 w-8'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                {compact ? 'Upload images' : 'Click to upload or drag and drop'}
              </span>
              {!compact && (
                <span className="mt-1 text-xs text-gray-400">
                  {allowVideo ? 'PNG, JPG, WebP, MP4, WebM' : 'PNG, JPG, WebP'} (max {maxFiles - value.length} more)
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className={`grid gap-2 ${compact ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' : 'grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'}`}>
          {value.map((url, index) => (
            <div
              key={url}
              className={`group relative overflow-hidden rounded-lg bg-gray-100 ${compact ? 'aspect-square' : 'aspect-square'}`}
            >
              {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                <video
                  src={url}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              
              {/* Overlay Controls */}
              <div className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 ${compact ? 'gap-1' : 'gap-2'}`}>
                {/* Move Left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className={`flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white ${compact ? 'h-5 w-5' : 'h-8 w-8'}`}
                  >
                    <svg className={compact ? 'h-3 w-3' : 'h-4 w-4'} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className={`flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 ${compact ? 'h-5 w-5' : 'h-8 w-8'}`}
                >
                  <svg className={compact ? 'h-3 w-3' : 'h-4 w-4'} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Move Right */}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className={`flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white ${compact ? 'h-5 w-5' : 'h-8 w-8'}`}
                  >
                    <svg className={compact ? 'h-3 w-3' : 'h-4 w-4'} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Index Badge */}
              {index === 0 && !compact && (
                <span className="absolute left-2 top-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Single Image Uploader Component
interface SingleImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
  compact?: boolean;
}

export function SingleImageUploader({
  value,
  onChange,
  label,
  folder = 'tours',
  placeholder = 'Click to upload image',
  compact = false,
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.files && data.files.length > 0) {
        onChange(data.files[0].url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
    }

    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-gray-600">{label}</label>
      )}

      {value ? (
        <div className={`group relative overflow-hidden rounded-lg bg-gray-100 ${compact ? 'h-20 w-20' : 'aspect-video w-full max-w-md'}`}>
          <img
            src={value}
            alt="Upload"
            className="h-full w-full object-cover"
          />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 ${compact ? 'gap-1' : 'gap-2'}`}>
            {compact ? (
              <>
                <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </label>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Replace
                </label>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-sm font-medium text-white hover:bg-red-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 hover:bg-gray-100 ${compact ? 'h-20 w-20' : 'aspect-video w-full max-w-md'}`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className={`animate-spin ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {!compact && <span className="text-sm">Uploading...</span>}
            </div>
          ) : (
            <>
              <svg className={`text-gray-400 ${compact ? 'h-5 w-5' : 'mb-2 h-8 w-8'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {!compact && <span className="text-sm text-gray-500">{placeholder}</span>}
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}


