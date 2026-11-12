import { neon } from "@neondatabase/serverless";

const TRACKS = [
  { id: "computer", name: "Công nghệ & máy tính" },
  { id: "engineering", name: "Kỹ thuật & công nghệ" },
  { id: "science", name: "Khoa học tự nhiên & môi trường" },
  { id: "mathdata", name: "Toán ứng dụng & dữ liệu" },
];

const TRACK_IDS = new Set(TRACKS.map((track) => track.id));
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let schemaPromise;
let schemaDatabaseUrl;

function json(status, payload, headers = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_NOT_CONFIGURED");
  return { sql: neon(connectionString), connectionString };
}

async function ensureSchema(sql, connectionString) {
  if (schemaPromise && schemaDatabaseUrl === connectionString) return schemaPromise;

  schemaDatabaseUrl = connectionString;
  schemaPromise = sql`
    CREATE TABLE IF NOT EXISTS stem_path_choices (
      participant_id UUID NOT NULL,
      group_id TEXT NOT NULL CHECK (group_id IN ('computer', 'engineering', 'science', 'mathdata')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (participant_id, group_id)
    )
  `.catch((error) => {
    schemaPromise = undefined;
    throw error;
  });
  return schemaPromise;
}

async function readJsonBody(request) {
  if (Number(request.headers.get("content-length") || 0) > 4096) throw new Error("BODY_TOO_LARGE");
  return request.json();
}

async function getStats(sql) {
  const [countRows, totalRows] = await sql.transaction([
    sql`SELECT group_id, COUNT(*)::integer AS selected_count
        FROM stem_path_choices
        GROUP BY group_id`,
    sql`SELECT COUNT(DISTINCT participant_id)::integer AS total_participants
        FROM stem_path_choices`,
  ], { readOnly: true });

  const counts = new Map(countRows.map((row) => [row.group_id, Number(row.selected_count)]));
  const groupOrder = new Map(TRACKS.map((track, index) => [track.id, index]));
  const groups = TRACKS
    .map((track) => ({ ...track, selectedCount: counts.get(track.id) || 0 }))
    .sort((first, second) => second.selectedCount - first.selectedCount || groupOrder.get(first.id) - groupOrder.get(second.id))
    .map((track, index) => ({ ...track, rank: index + 1 }));

  return {
    totalBrowserIds: Number(totalRows[0]?.total_participants || 0),
    groups,
  };
}

async function handle(request) {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "PUT") {
    return json(405, { error: "Phương thức này chưa được hỗ trợ." }, { Allow: "GET, PUT" });
  }

  try {
    const { sql, connectionString } = getSql();
    await ensureSchema(sql, connectionString);

    if (method === "GET") {
      return json(200, await getStats(sql));
    }

    const body = await readJsonBody(request);
    if (typeof body.participantId !== "string" || !UUID_PATTERN.test(body.participantId)) {
      return json(400, { error: "Mã trình duyệt không hợp lệ." });
    }
    if (!Array.isArray(body.trackIds) || body.trackIds.length > TRACKS.length || body.trackIds.some((id) => !TRACK_IDS.has(id))) {
      return json(400, { error: "Danh sách nhóm ngành không hợp lệ." });
    }

    const trackIds = [...new Set(body.trackIds)];
    const writes = [sql`DELETE FROM stem_path_choices WHERE participant_id = ${body.participantId}`];
    for (const trackId of trackIds) {
      writes.push(sql`
        INSERT INTO stem_path_choices (participant_id, group_id)
        VALUES (${body.participantId}, ${trackId})
        ON CONFLICT (participant_id, group_id)
        DO UPDATE SET updated_at = NOW()
      `);
    }
    await sql.transaction(writes);
    return json(200, await getStats(sql));
  } catch (error) {
    if (error.message === "DATABASE_NOT_CONFIGURED") {
      return json(503, { error: "Chưa kết nối cơ sở dữ liệu cho thống kê chung." });
    }
    if (error.message === "BODY_TOO_LARGE") {
      return json(413, { error: "Dữ liệu gửi lên quá lớn." });
    }
    if (error instanceof SyntaxError) {
      return json(400, { error: "Nội dung gửi lên không phải JSON hợp lệ." });
    }
    return json(500, { error: "Không thể cập nhật thống kê chung lúc này." });
  }
}

export default { fetch: handle };
