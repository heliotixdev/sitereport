import { deleteSiteData } from '@/app/lib/db';

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await deleteSiteData(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to delete site report' }), { status: 500 });
  }
}
