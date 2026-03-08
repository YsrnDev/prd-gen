import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres('postgresql://postgres.fkbhtfmolaimbuzjdgpt:@Iwanfals1910@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');
const db = drizzle(client);

async function main() {
    await client`update "user" set role = 'admin' where email = 'user@example.com' or email = 'budi.santoso@gmail.com'`;
    console.log("Updated user role to admin");
    process.exit(0);
}
main();
