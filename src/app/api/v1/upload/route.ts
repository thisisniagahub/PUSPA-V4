import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationError, requireAuth } from '@/lib/auth'
import { isUploadBucket, storeUpload } from '@/lib/uploads'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    const formData = await request.formData()
    const file = formData.get('file')
    const bucketValue = String(formData.get('bucket') || '')
    const scopeIdValue = formData.get('scopeId')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Fail diperlukan' },
        { status: 400 }
      )
    }

    if (!isUploadBucket(bucketValue)) {
      return NextResponse.json(
        { success: false, error: 'Bucket fail tidak sah' },
        { status: 400 }
      )
    }

    if (bucketValue === 'ekyc' && !['admin', 'developer'].includes(session.user.role)) {
      throw new AuthorizationError('Anda tidak mempunyai kebenaran untuk memuat naik fail eKYC', 403)
    }

    const uploaded = await storeUpload({
      bucket: bucketValue,
      file,
      scopeId: typeof scopeIdValue === 'string' && scopeIdValue.trim() ? scopeIdValue : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: uploaded,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat naik fail' },
      { status: 500 }
    )
  }
}
