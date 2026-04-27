import { NextRequest, NextResponse } from 'next/server'
import { AuthorizationError, requireAuth } from '@/lib/auth'
import { readStoredUpload } from '@/lib/uploads'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filePath: string[] }> }
) {
  try {
    const session = await requireAuth(request)
    const { filePath } = await params
    const storedFile = await readStoredUpload(filePath)

    if (storedFile.bucket === 'ekyc' && !['admin', 'developer'].includes(session.user.role)) {
      throw new AuthorizationError('Anda tidak mempunyai kebenaran untuk melihat fail eKYC', 403)
    }

    return new NextResponse(storedFile.buffer, {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': `inline; filename="${storedFile.fileName}"`,
        'Content-Length': String(storedFile.buffer.byteLength),
        'Content-Type': storedFile.mimeType,
      },
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return NextResponse.json(
        { success: false, error: 'Fail tidak dijumpai' },
        { status: 404 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    console.error('Error reading uploaded file:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuatkan fail' },
      { status: 500 }
    )
  }
}
