// Edge Function: mengambil CSV terakhir yang tersimpan di Netlify Blobs.
// Dipanggil dari frontend saat halaman pertama kali dibuka, agar user
// kedua dst tidak perlu upload file CSV/Excel lagi.
//
// Response:
//  - Jika belum ada data tersimpan -> JSON { exists: false }
//  - Jika ada data tersimpan       -> body CSV mentah (content-type: text/csv)
import { getStore } from "@netlify/blobs";

export default async (request) => {
  try {
    const store = getStore({ name: "m3-dashboard", consistency: "strong" });
    const entry = await store.getWithMetadata("latest-dataset.csv", { type: "stream" });

    if (!entry || !entry.data) {
      return new Response(JSON.stringify({ exists: false }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(entry.data, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "x-uploaded-at": (entry.metadata && entry.metadata.uploadedAt) || "",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ exists: false, error: String(err) }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
};

export const config = { path: "/api/get-dataset" };
