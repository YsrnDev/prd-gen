import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function migrate() {
    console.log('🚀 Running billing migration...\n');

    // 1. Add billing columns to user table (if not exist)
    try {
        await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "tier" text NOT NULL DEFAULT 'FREE'`;
        console.log('✅ user.tier column added');
    } catch (e: any) {
        console.log('⚠️  user.tier:', e.message);
    }

    try {
        await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_status" text NOT NULL DEFAULT 'NONE'`;
        console.log('✅ user.subscription_status column added');
    } catch (e: any) {
        console.log('⚠️  user.subscription_status:', e.message);
    }

    try {
        await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_until" timestamp`;
        console.log('✅ user.subscription_until column added');
    } catch (e: any) {
        console.log('⚠️  user.subscription_until:', e.message);
    }

    // 2. Create subscription_plan table
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS "subscription_plan" (
                "id" serial PRIMARY KEY,
                "name" text NOT NULL UNIQUE,
                "price" integer NOT NULL,
                "features" jsonb DEFAULT '[]'::jsonb,
                "is_popular" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now()
            )
        `;
        console.log('✅ subscription_plan table created');
    } catch (e: any) {
        console.log('⚠️  subscription_plan:', e.message);
    }

    // 3. Create subscription table
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS "subscription" (
                "id" serial PRIMARY KEY,
                "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "plan_type" text NOT NULL DEFAULT 'FREE',
                "status" text NOT NULL DEFAULT 'NONE',
                "midtrans_order_id" text,
                "active_until" timestamp,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now()
            )
        `;
        console.log('✅ subscription table created');
    } catch (e: any) {
        console.log('⚠️  subscription:', e.message);
    }

    // 4. Seed default pricing plans (only if empty)
    const existingPlans = await sql`SELECT count(*) as cnt FROM subscription_plan`;
    if (Number(existingPlans[0].cnt) === 0) {
        await sql`
            INSERT INTO subscription_plan (name, price, features, is_popular, is_active) VALUES
            ('FREE', 0, '["1 PRD per month", "Basic AI generation", "PDF Export"]'::jsonb, false, true),
            ('PLUS', 99000, '["10 PRD per month", "AI Recommendations", "AI Chat Revisions", "PDF & Markdown Export", "Priority Support"]'::jsonb, true, true),
            ('PRO', 199000, '["Unlimited PRDs", "AI Recommendations", "AI Chat Revisions", "All Export Formats", "Custom Templates", "Dedicated Support"]'::jsonb, false, true)
        `;
        console.log('✅ Default pricing plans seeded (FREE, PLUS, PRO)');
    } else {
        console.log('⏭️  Pricing plans already exist, skipping seed');
    }

    console.log('\n🎉 Billing migration completed!');
    await sql.end();
    process.exit(0);
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
