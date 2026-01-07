import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'astronout';

// Folder paths for different types of uploads
export const STORAGE_FOLDERS = {
  TOUR_HERO: (tourId: string) => `tours/${tourId}/hero`,
  TOUR_GALLERY: (tourId: string) => `tours/${tourId}/gallery`,
  TOUR_ITINERARY: (tourId: string) => `tours/${tourId}/itinerary`,
  TOUR_PACKAGES: (tourId: string) => `tours/${tourId}/packages`,
  CATEGORIES: 'categories',
  LABELS: 'labels',
  SITE: 'site',
  PAGES: 'pages',
  TEMP: 'temp',
} as const;

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadOptions {
  folder: string;
  fileName?: string;
  upsert?: boolean;
}

/**
 * Generate a unique filename with timestamp
 */
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = originalName
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  return `${baseName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Get the public URL for a file in storage
 */
export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a single file to Supabase storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    const fileName = options.fileName || generateFileName(file.name);
    const filePath = `${options.folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: options.upsert ?? false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    const url = getPublicUrl(data.path);
    
    return {
      success: true,
      url,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple files to Supabase storage
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadFile(file, options))
  );
  return results;
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Delete multiple files from Supabase storage
 */
export async function deleteFiles(paths: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string): Promise<{
  success: boolean;
  files?: { name: string; url: string; path: string }[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List error:', error);
      return { success: false, error: error.message };
    }

    const files = data
      .filter((item) => item.name !== '.emptyFolderPlaceholder')
      .map((item) => ({
        name: item.name,
        path: `${folder}/${item.name}`,
        url: getPublicUrl(`${folder}/${item.name}`),
      }));

    return { success: true, files };
  } catch (error) {
    console.error('List exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'List failed',
    };
  }
}

/**
 * Move/rename a file in storage
 */
export async function moveFile(
  fromPath: string,
  toPath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .move(fromPath, toPath);

    if (error) {
      console.error('Move error:', error);
      return { success: false, error: error.message };
    }

    const url = getPublicUrl(toPath);
    return { success: true, url };
  } catch (error) {
    console.error('Move exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Move failed',
    };
  }
}

/**
 * Copy a file in storage
 */
export async function copyFile(
  fromPath: string,
  toPath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .copy(fromPath, toPath);

    if (error) {
      console.error('Copy error:', error);
      return { success: false, error: error.message };
    }

    const url = getPublicUrl(toPath);
    return { success: true, url };
  } catch (error) {
    console.error('Copy exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Copy failed',
    };
  }
}

/**
 * Get a signed URL for temporary access (useful for private files)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Signed URL exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create signed URL',
    };
  }
}

/**
 * Extract the storage path from a full Supabase URL
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/astronout\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is from our Supabase storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/astronout');
}


