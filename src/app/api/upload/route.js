import { NextResponse } from 'next/server'
import { addSiteData } from '@/app/lib/db'

export async function POST(req) {
  try {
    const body = await req.json();
    const id = await addSiteData(body)
    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 })
  }
}
