import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { aspiration } from "../src/schema/aspirations.js";
import { aspirationListResponseSchema } from "../../contracts/src/aspirations.js";
import { toIso } from "../src/lib/serialize.js"; // Wait, serialize is not in db

const { Client } = pkg;
const client = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/pharmindo" });
await client.connect();
const db = drizzle(client);

const rows = await db.select().from(aspiration).limit(50);
console.log(rows);
await client.end();
