import { z } from "zod";
import pkg from "pg";
const { Client } = pkg;

export const pageMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  isNext: z.boolean(),
});

const aspirationStatusSchema = z.enum(["SUBMITTED", "REVIEWED", "RESOLVED"]);

const aspirationReplySchema = z.object({
  message: z.string(),
  repliedAt: z.string(),
  repliedById: z.string(),
  repliedByName: z.string(),
});

const aspirationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  category: z.string().nullable(),
  status: aspirationStatusSchema,
  adminReply: aspirationReplySchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function createApiSuccessSchema(data) {
  return z.object({
    success: z.literal(true),
    data,
    meta: pageMetaSchema.optional(),
  });
}

const aspirationListResponseSchema = createApiSuccessSchema(z.array(aspirationSchema));

const client = new Client({ connectionString: "postgresql://neondb_owner:npg_O1livU0NusTp@ep-young-pine-aoyarekm-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" });

function toIso(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM aspirations LIMIT 50');
  const rows = res.rows;
  
  const payload = {
    success: true,
    data: rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      category: row.category ?? null,
      status: row.status,
      adminReply:
        row.admin_reply_message && row.replied_at && row.replied_by
          ? {
              message: row.admin_reply_message,
              repliedAt: toIso(row.replied_at) ?? new Date().toISOString(),
              repliedById: row.replied_by,
              repliedByName: "Admin RW 25",
            }
          : null,
      createdAt: toIso(row.created_at) ?? new Date().toISOString(),
      updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
    })),
    meta: { page: 1, limit: 50, total: rows.length, totalPages: 1, isNext: false }
  };
  
  try {
    aspirationListResponseSchema.parse(payload);
    console.log("Validation passed with meta");
  } catch (err) {
    console.log("Validation failed!");
    console.error(JSON.stringify(err, null, 2));
  }
  
  await client.end();
}

run().catch(console.error);
