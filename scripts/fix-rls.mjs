import pg from "pg";
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const pool = new pg.Pool({
  connectionString: `postgresql://postgres:${encodeURIComponent(PASSWORD)}@db.cluuqzhizeqvkgvfdisx.supabase.co:5432/postgres`,
});
await pool.query(`
  create or replace function public.is_admin()
  returns boolean language sql security definer stable as $$
    select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  $$;
  drop policy if exists "Admin v\u00ea todos" on public.profiles;
  create policy "Admin v\u00ea todos"
    on public.profiles for select
    using (auth.uid() = id or public.is_admin());
`);
console.log("OK");
await pool.end();
