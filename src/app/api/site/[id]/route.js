import { NextResponse } from 'next/server'
import { getSiteDataById } from '@/app/lib/db'

export async function GET(req, { params }) {
  const site = await getSiteDataById(params.id)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(site)
}
