import { apiClient, ApiError } from './api-client';

interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresAt: string;
}

export interface UploadedPhoto {
  key: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_MB = 10;

export async function uploadPhoto(file: File): Promise<UploadedPhoto> {
  const presign = await apiClient.post<PresignResponse>('/storage/presign', {
    mimeType: file.type,
    fileSize: file.size,
  });

  const res = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Error al subir la imagen');
  }

  return {
    key: presign.key,
    publicUrl: presign.publicUrl,
    filename: file.name,
    mimeType: file.type,
    fileSize: file.size,
  };
}