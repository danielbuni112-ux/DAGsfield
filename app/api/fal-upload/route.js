// File upload → fal.ai storage
// ─────────────────────────────────────────────────────────────────────────────
// Client sends multipart FormData with "file" field.
// Server uploads to fal.ai storage and returns the public URL.
// ─────────────────────────────────────────────────────────────────────────────

import * as fal from '@fal-ai/serverless-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

export async function POST(request) {
  if (!process.env.FAL_KEY) {
    return Response.json({ error: 'FAL_KEY not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // fal.storage.upload accepts File/Blob directly
    const url = await fal.storage.upload(file);

    console.log('PROXY_METRIC ' + JSON.stringify({
      t: new Date().toISOString(),
      provider: 'fal',
      endpoint: 'storage/upload',
      status: 200,
      size_bytes: file.size || 0,
    }));

    return Response.json({ url, file_url: url });
  } catch (error) {
    console.error('fal upload failed:', error);
    return Response.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
