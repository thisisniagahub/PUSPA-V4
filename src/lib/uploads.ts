import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/server'

export type UploadBucket = 'documents' | 'ekyc'

type UploadResult = {
  path: string
  url: string
  fileName: string
  size: number
  mimeType: string
}

const MAX_UPLOAD_BYTES: Record<UploadBucket, number> = {
  documents: 50 * 1024 * 1024,
  ekyc: 10 * 1024 * 1024,
}

const MIME_FALLBACKS: Record<string, string> = {
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const DOCUMENT_MIME_ALLOWLIST = new Set([
  'application/msword',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
])

export function isUploadBucket(value: string): value is UploadBucket {
  return value === 'documents' || value === 'ekyc'
}

function inferMimeType(fileName: string) {
  const extension = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : ''
  return MIME_FALLBACKS[extension] || 'application/octet-stream'
}

function normalizeMimeType(fileName: string, mimeType: string) {
  return mimeType || inferMimeType(fileName)
}

function assertFileAllowed(bucket: UploadBucket, fileName: string, mimeType: string, size: number) {
  if (size <= 0) {
    throw new Error('Fail kosong tidak dibenarkan')
  }

  if (size > MAX_UPLOAD_BYTES[bucket]) {
    throw new Error(
      bucket === 'ekyc'
        ? 'Saiz fail eKYC melebihi had 10MB'
        : 'Saiz fail dokumen melebihi had 50MB'
    )
  }

  if (bucket === 'ekyc') {
    if (!mimeType.startsWith('image/')) {
      throw new Error('Hanya fail imej dibenarkan untuk eKYC')
    }
    return
  }

  const normalizedMimeType = normalizeMimeType(fileName, mimeType)
  if (!DOCUMENT_MIME_ALLOWLIST.has(normalizedMimeType)) {
    throw new Error('Jenis fail dokumen tidak dibenarkan')
  }
}

function sanitizeStem(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'file'
}

/**
 * Store a file upload in Supabase Storage.
 * Replaces the old filesystem-based upload that doesn't work on Vercel serverless.
 */
export async function storeUpload(options: {
  bucket: UploadBucket
  file: File
  scopeId?: string
}): Promise<UploadResult> {
  const { bucket, file, scopeId } = options
  const fileName = file.name || `${bucket}-upload`
  const mimeType = normalizeMimeType(fileName, file.type)
  const extension = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : '.bin'
  const buffer = Buffer.from(await file.arrayBuffer())

  assertFileAllowed(bucket, fileName, mimeType, buffer.byteLength)

  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const scopeSuffix = scopeId ? `-${sanitizeStem(scopeId)}` : ''
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}${scopeSuffix}${extension}`
  const storagePath = `${year}/${month}/${storedName}`

  const supabase = createAdminClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Gagal memuat naik fail: ${error.message}`)
  }

  return {
    path: `${bucket}/${storagePath}`,
    url: `/api/v1/upload/${bucket}/${storagePath}`,
    fileName,
    size: buffer.byteLength,
    mimeType,
  }
}

/**
 * Get a signed URL for a stored file (for secure downloads).
 */
export async function getSignedUrl(bucket: UploadBucket, storagePath: string, expiresIn = 3600) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    throw new Error(`Gagal mendapatkan URL fail: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Download a stored file from Supabase Storage.
 */
export async function readStoredUpload(bucket: UploadBucket, storagePath: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(storagePath)

  if (error) {
    throw new Error(`Gagal memuat turun fail: ${error.message}`)
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  const fileName = storagePath.split('/').pop() || 'file'

  return {
    bucket,
    storagePath,
    buffer,
    fileName,
    mimeType: inferMimeType(fileName),
  }
}

/**
 * Delete a stored file from Supabase Storage.
 */
export async function deleteStoredUpload(bucket: UploadBucket, storagePath: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([storagePath])

  if (error) {
    throw new Error(`Gagal memadam fail: ${error.message}`)
  }
}

export function getMimeTypeForStoredFile(fileName: string) {
  return inferMimeType(fileName)
}
