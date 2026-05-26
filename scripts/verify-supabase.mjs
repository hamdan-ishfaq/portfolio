/**
 * Phase 0 verification — run: node scripts/verify-supabase.mjs
 * Loads .env.local manually (no dotenv dependency).
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch {
    return null;
  }
}

const TABLES = [
  'projects',
  'timeline_events',
  'contact_submissions',
  'demo_requests',
  'devlog_entries',
  'devlog_versions',
  'project_comments',
  'settings',
  'admin_audit_log',
  'rate_limits',
];

const BUCKETS = ['cv', 'images', 'avatars'];

async function checkTable(url, anonKey, table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  return { table, status: res.status, ok: res.ok, error: res.ok ? null : await res.text() };
}

async function checkStorage(url, serviceKey, bucket) {
  const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  return { bucket, status: res.status, ok: res.ok };
}

async function main() {
  console.log('\n=== Portfolio Supabase Verification ===\n');

  const env = loadEnvLocal();
  if (!env) {
    console.error('FAIL: .env.local not found');
    process.exit(1);
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const adminUid = env.ADMIN_UID;

  const missing = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length) {
    console.error('FAIL: Missing env vars:', missing.join(', '));
    process.exit(1);
  }

  console.log(`Project URL: ${url}`);
  console.log(`ADMIN_UID set: ${adminUid ? 'yes' : 'NO — required for admin login'}`);

  // Validate API keys before table checks
  const anonTest = await fetch(`${url}/rest/v1/settings?select=id&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  const serviceTest = await fetch(`${url}/rest/v1/settings?select=id&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });

  if (!anonTest.ok) {
    console.error('\nFAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY is invalid (HTTP ' + anonTest.status + ').');
    console.error('Fix: Supabase Dashboard → Settings → API → copy the "anon public" key');
    console.error('     Paste into .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
    console.error('     Then restart: npm run dev\n');
  } else {
    console.log('Anon key: OK');
  }

  if (!serviceTest.ok) {
    console.error('FAIL: SUPABASE_SERVICE_ROLE_KEY is invalid (HTTP ' + serviceTest.status + ').');
  } else {
    console.log('Service role key: OK');
  }

  if (env.NEXT_PUBLIC_FIREBASE_API_KEY || env.FIREBASE_ADMIN_PRIVATE_KEY) {
    console.warn('\nWARN: Firebase vars still in .env.local — remove them (Supabase-only stack).');
  }

  if (adminUid && adminUid.length < 30) {
    console.warn('\nWARN: ADMIN_UID looks like a Firebase UID (short). Supabase Auth UUIDs are 36 chars with hyphens.');
  }

  if (!anonTest.ok) {
    console.log('\nSkipping table checks until anon key is fixed.\n');
    process.exit(1);
  }

  console.log('\n--- Tables ---');
  let tablesOk = 0;
  for (const table of TABLES) {
    const r = await checkTable(url, anonKey, table);
    const icon = r.ok ? 'OK' : 'FAIL';
    console.log(`  [${icon}] ${table} (HTTP ${r.status})`);
    if (!r.ok && r.error) console.log(`       ${r.error.slice(0, 120)}`);
    if (r.ok) tablesOk++;
  }

  console.log('\n--- Storage buckets (service role) ---');
  let bucketsOk = 0;
  for (const bucket of BUCKETS) {
    const r = await checkStorage(url, serviceKey, bucket);
    const icon = r.ok ? 'OK' : 'FAIL';
    console.log(`  [${icon}] ${bucket} (HTTP ${r.status})`);
    if (r.ok) bucketsOk++;
  }

  console.log('\n--- Seed data ---');
  const settingsRes = await fetch(`${url}/rest/v1/settings?select=display_name,id&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (settingsRes.ok) {
    const rows = await settingsRes.json();
    console.log(`  Settings row: ${rows.length ? rows[0].display_name : 'EMPTY'}`);
  } else {
    console.log('  Settings: FAIL');
  }

  const projectsRes = await fetch(`${url}/rest/v1/projects?select=slug,published&limit=5`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (projectsRes.ok) {
    const rows = await projectsRes.json();
    console.log(`  Published projects: ${rows.length} visible to anon`);
    rows.forEach((p) => console.log(`    - ${p.slug}`));
  }

  console.log('\n--- Summary ---');
  const pass = tablesOk === TABLES.length && bucketsOk === BUCKETS.length;
  if (pass) {
    console.log('PASS: Database schema + storage look good.');
  } else {
    console.log(`PARTIAL: ${tablesOk}/${TABLES.length} tables, ${bucketsOk}/${BUCKETS.length} buckets.`);
    console.log('Run missing SQL in Supabase Dashboard → SQL Editor:');
    if (tablesOk < TABLES.length) console.log('  - supabase/schema.sql');
    if (bucketsOk < BUCKETS.length) console.log('  - supabase/storage-setup.sql');
    console.log('  - supabase/rls.sql (if not run yet)');
  }

  console.log('');
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
