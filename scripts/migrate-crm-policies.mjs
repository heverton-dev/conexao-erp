import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const pwMatch = env.match(/SUPABASE_DB_PASSWORD=["']?([^"'\n]+)/);
const PASSWORD = pwMatch?.[1];
if (!PASSWORD) {
  console.error("no password");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: `postgresql://postgres:${encodeURIComponent(PASSWORD)}@db.cluuqzhizeqvkgvfdisx.supabase.co:5432/postgres`,
});

async function run() {
  const client = await pool.connect();
  try {
    // Trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION public.log_transferencia_cliente()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      BEGIN
        IF NEW.consultor_atual_id IS DISTINCT FROM OLD.consultor_atual_id THEN
          INSERT INTO public.logs_transferencia (cliente_id, de_consultor_id, para_consultor_id, transferido_por_id)
          VALUES (NEW.id, OLD.consultor_atual_id, NEW.consultor_atual_id, auth.uid());
          NEW.atualizado_em := NOW();
        END IF;
        RETURN NEW;
      END; $$;
    `);
    console.log("✅ Function log_transferencia_cliente");

    // Trigger
    try {
      await client.query(`
        CREATE TRIGGER trg_log_transferencia
          BEFORE UPDATE OF consultor_atual_id ON public.clientes
          FOR EACH ROW EXECUTE FUNCTION public.log_transferencia_cliente()
      `);
      console.log("✅ Trigger trg_log_transferencia");
    } catch (e) {
      console.log("⏭️  Trigger: " + e.message.slice(0, 80));
    }

    // RLS policies for clientes
    const policies = [
      `CREATE POLICY "Consultor ve seus clientes" ON public.clientes FOR SELECT USING (consultor_atual_id = auth.uid())`,
      `CREATE POLICY "Consultor cria clientes proprios" ON public.clientes FOR INSERT WITH CHECK (consultor_atual_id = auth.uid())`,
      `CREATE POLICY "Consultor atualiza seus clientes" ON public.clientes FOR UPDATE USING (consultor_atual_id = auth.uid())`,
      `CREATE POLICY "Super admin total clientes" ON public.clientes FOR ALL USING (public.has_role(auth.uid(), 'dev')) WITH CHECK (public.has_role(auth.uid(), 'dev'))`,
    ];
    for (const sql of policies) {
      try {
        await client.query(sql);
        console.log("✅ Policy: " + sql.match(/"([^"]+)"/)[1]);
      } catch (e) {
        console.log("⏭️  Policy: " + e.message.slice(0, 60));
      }
    }

    // RLS policies for visitas
    const visitasPolicies = [
      `CREATE POLICY "Consultor ve visitas dos seus clientes" ON public.visitas FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.clientes c WHERE c.id = visitas.cliente_id AND c.consultor_atual_id = auth.uid())
        OR consultor_executor_id = auth.uid()
      )`,
      `CREATE POLICY "Consultor registra visitas como executor" ON public.visitas FOR INSERT WITH CHECK (consultor_executor_id = auth.uid())`,
      `CREATE POLICY "Super admin total visitas" ON public.visitas FOR ALL USING (public.has_role(auth.uid(), 'dev')) WITH CHECK (public.has_role(auth.uid(), 'dev'))`,
    ];
    for (const sql of visitasPolicies) {
      try {
        await client.query(sql);
        console.log("✅ Policy visitas: " + sql.match(/"([^"]+)"/)[1]);
      } catch (e) {
        console.log("⏭️  Policy visitas: " + e.message.slice(0, 60));
      }
    }

    console.log("\n🎉 Migration CRM completa!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("❌ ERRO:", e.message);
  process.exit(1);
});
