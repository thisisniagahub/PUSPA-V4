import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

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

export function getUploadRoot() {
  return path.resolve(process.cwd(), 'upload')
}

function sanitizePathSegment(value: string) {
  if (!value || value === '.' || value === '..' || value.includes('/') || value.includes('\\')) {
    throw new Error('Laluan fail tidak sah')
  }

  const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, '-')

  if (!sanitized || sanitized === '.' || sanitized === '..') {
    throw new Error('Laluan fail tidak sah')
  }

  return sanitized
}

function sanitizeStem(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'file'
}

function inferMimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase()
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

function ensureUploadPath(segments: string[]) {
  const root = getUploadRoot()
  const safeSegments = segments.map(sanitizePathSegment)
  const resolvedPath = path.resolve(root, ...safeSegments)

  if (resolvedPath !== root && !resolvedPath.startsWith(`${root}${path.sep}`)) {
    throw new Error('Laluan fail tidak sah')
  }

  return resolvedPath
}

export async function storeUpload(options: {
  bucket: UploadBucket
  file: File
  scopeId?: string
}): Promise<UploadResult> {
  const { bucket, file, scopeId } = options
  const fileName = file.name || `${bucket}-upload`
  const mimeType = normalizeMimeType(fileName, file.type)
  const extension = path.extname(fileName).toLowerCase() || '.bin'
  const buffer = Buffer.from(await file.arrayBuffer())

  assertFileAllowed(bucket, fileName, mimeType, buffer.byteLength)

  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const scopeSuffix = scopeId ? `-${sanitizeStem(scopeId)}` : ''
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}${scopeSuffix}${extension}`
  const relativeSegments = [bucket, year, month, storedName]
  const absolutePath = ensureUploadPath(relativeSegments)

  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, buffer)

  const relativePath = relativeSegments.join('/')

  return {
    path: relativePath,
    url: `/api/v1/upload/${relativePath}`,
    fileName,
    size: buffer.byteLength,
    mimeType,
  }
}

export function resolveUploadFile(relativePathSegments: string[]) {
  if (relativePathSegments.length < 4) {
    throw new Error('Laluan fail tidak sah')
  }

  const [bucket, ...rest] = relativePathSegments
  if (!isUploadBucket(bucket)) {
    throw new Error('Bucket fail tidak sah')
  }

  const absolutePath = ensureUploadPath([bucket, ...rest])

  return {
    bucket,
    absolutePath,
    relativePath: [bucket, ...rest].join('/'),
    fileName: path.basename(absolutePath),
  }
}

export function getMimeTypeForStoredFile(fileName: string) {
  return inferMimeType(fileName)
}

export async function readStoredUpload(relativePathSegments: string[]) {
  const file = resolveUploadFile(relativePathSegments)
  const buffer = await readFile(file.absolutePath)

  return {
    ...file,
    buffer,
    mimeType: getMimeTypeForStoredFile(file.fileName),
  }
}
