import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { maskIc, maskPhone, parsePagination } from '@/lib/bot-api-utils'
import { requireBotAuth, botAuthErrorResponse } from '@/lib/bot-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireBotAuth(request, 'ekyc')
  } catch (error) {
    return botAuthErrorResponse(error)
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const { limit, offset } = parsePagination(searchParams)

    const where: any = {}
    if (status) where.status = status

    const [verifications, total, pendingCount] = await Promise.all([
      db.eKYCVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              memberNumber: true,
              ic: true,
              phone: true,
            },
          },
        },
      }),
      db.eKYCVerification.count({ where }),
      db.eKYCVerification.count({ where: { status: 'pending' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        verifications: verifications.map((verification) => ({
          id: verification.id,
          status: verification.status,
          idNumberMasked: maskIc(verification.member.ic),
          documentStatus: {
            hasIdImageFront: Boolean(verification.icFrontUrl),
            hasIdImageBack: Boolean(verification.icBackUrl),
            hasSelfieImage: Boolean(verification.selfieUrl),
          },
          verifiedAt: verification.verifiedAt,
          rejectionReason: verification.rejectionReason,
          member: {
            id: verification.member.id,
            name: verification.member.name,
            memberNumber: verification.member.memberNumber,
            icMasked: maskIc(verification.member.ic),
            phoneMasked: maskPhone(verification.member.phone),
          },
          createdAt: verification.createdAt,
        })),
        summary: {
          total,
          pending: pendingCount,
        },
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + verifications.length < total,
        },
      },
    })
  } catch (error) {
    console.error('[BOT_EKYC]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch eKYC verifications' },
      { status: 500 }
    )
  }
}
