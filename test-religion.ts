import { getDb, citizen } from "./packages/db/src";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  const c = await db.select({
    religion: citizen.religion,
    count: sql`count(*)`
  }).from(citizen).groupBy(citizen.religion);
  
  console.log("Religions:", c);
  process.exit(0);
}

main().catch(console.error);
