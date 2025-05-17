import { supabase } from "@/lib/supabaseClient";

/**
 * Upload a file to Supabase storage with a unique filename
 * @param file The file to upload
 * @param prefix A prefix for the filename (e.g., 'profile', 'token')
 * @param bucketName The name of the storage bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToStorage(
  file: File,
  prefix: string,
  bucketName: string = "merchant-profile-dev"
): Promise<string> {
  // Create a unique filename with timestamp and random string
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${prefix}-${timestamp}-${randomString}.${fileExtension}`;
  
  console.log(`Uploading file to ${bucketName}/${fileName}`);
  
  try {
    // Upload the file
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    console.log('File uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error('Error in uploadFileToStorage:', err);
    throw new Error(err instanceof Error ? err.message : 'Unknown upload error');
  }
}
