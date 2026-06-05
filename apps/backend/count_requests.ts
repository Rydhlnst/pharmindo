import { getDb, serviceRequest } from "@abdimas/db";
import { count } from "drizzle-orm";

async function main() {
  const db = getDb();
  const [{ value }] = await db.select({ value: count() }).from(serviceRequest);
  console.log("Total Permohonan:", value);
  process.exit(0);
}

main().catch(console.error);
