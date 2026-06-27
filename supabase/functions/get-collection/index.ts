import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "./cors.ts";

const SIGNED_URL_TTL = 600; // seconds

interface UnlockRow {
  song_id: string;
  unlocked_at: string;
  songs: {
    title: string;
    artist: string;
    album: string | null;
    spotify_url: string | null;
    full_key: string | null;
  } | null;
}

// Authenticated: returns the user's unlocked songs with short-lived signed URLs
// for the full tracks. No song ids or storage keys are returned to the client.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    const token = (req.headers.get("Authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    if (!token) return jsonResponse({ error: "Not authenticated" }, 401);
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.getUser(token);
    if (userErr || !user) return jsonResponse({ error: "Not authenticated" }, 401);

    const { data, error } = await admin
      .from("unlocks")
      .select(
        "song_id, unlocked_at, songs(title, artist, album, spotify_url, full_key)",
      )
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as unknown as UnlockRow[];

    const items = await Promise.all(
      rows.map(async (row) => {
        let fullUrl: string | null = null;
        if (row.songs?.full_key) {
          const signed = await admin.storage
            .from("songs")
            .createSignedUrl(row.songs.full_key, SIGNED_URL_TTL);
          fullUrl = signed.data?.signedUrl ?? null;
        }
        return {
          title: row.songs?.title ?? "Unknown",
          artist: row.songs?.artist ?? "",
          album: row.songs?.album ?? null,
          spotifyUrl: row.songs?.spotify_url ?? null,
          unlockedAt: row.unlocked_at,
          fullUrl,
        };
      }),
    );

    return jsonResponse({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }
});
