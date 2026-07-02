// Edge Function: menyimpan CSV terakhir yang diupload ke Netlify Blobs
// supaya user berikutnya tidak perlu upload manual lagi.
//
// Dipanggil dari frontend via: fetch('/api/save-dataset', { method: 'POST', body: file })
import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  if (!request.body) {
    return new Response(JSON.stringify({ ok: false, error: "Body kosong" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const store = getStore({ name: "m3-dashboard", consistency: "strong" });

    // Simpan langsung sebagai stream (tanpa buffer penuh di memori Edge Function),
    // supaya file CSV besar (ratusan ribu baris) tetap aman diupload.
    await store.set("latest-dataset.csv", request.body, {
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};

export const config = { path: "/api/save-dataset" };
