import { NextResponse } from 'next/server'
import { getAllSites } from '@/app/lib/db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mysecret123'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const password = searchParams.get('password')

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sites = await getAllSites()
  return NextResponse.json(sites)
}
