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
    console.log("🔧 Aplicando migration CRM...\n");

    // 1. Enums
    const enums = [
      `CREATE TYPE public.app_role AS ENUM ('dev', 'diretor_comercial', 'gestor', 'consultor')`,
      `CREATE TYPE public.cargo_atendente AS ENUM ('Secretaria', 'Dentista', 'Outro')`,
      `CREATE TYPE public.tipo_visita AS ENUM ('Prospeccao', 'Relacionamento', 'Pos-venda')`,
      `CREATE TYPE public.temperatura_vendedor AS ENUM ('Frio', 'Morno', 'Quente')`,
      `CREATE TYPE public.probabilidade_fechamento AS ENUM ('Baixa', 'Media', 'Alta')`,
      `CREATE TYPE public.convite_status AS ENUM ('pendente', 'utilizado', 'expirado')`,
    ];
    for (const sql of enums) {
      try {
        await client.query(sql);
        console.log("✅ " + sql.match(/public\.(\w+)/)[1]);
      } catch (e) {
        if (e.message.includes("already exists"))
          console.log("⏭️  " + sql.match(/public\.(\w+)/)[1]);
        else console.error("❌ " + e.message);
      }
    }

    // 2. Table usuarios
    try {
      await client.query(`
        CREATE TABLE public.usuarios (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          nome_completo VARCHAR(255) NOT NULL,
          email_corporativo VARCHAR(255) UNIQUE NOT NULL,
          role public.app_role NOT NULL DEFAULT 'consultor',
          gestor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
          diretor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
          celular_corporativo VARCHAR,
          meta_diaria_visitas INTEGER NOT NULL DEFAULT 0,
          ativo BOOLEAN NOT NULL DEFAULT true,
          criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("✅ tabela usuarios");
    } catch (e) {
      if (e.message.includes("already exists"))
        console.log("⏭️  tabela usuarios");
      else console.error("❌ usuarios: " + e.message);
    }

    // 3. Table visitas
    try {
      await client.query(`
        CREATE TABLE public.visitas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
          consultor_executor_id UUID NOT NULL REFERENCES public.usuarios(id),
          data_visita DATE NOT NULL,
          atendente VARCHAR(255) NOT NULL,
          cargo_atendente public.cargo_atendente NOT NULL,
          tipo_visita public.tipo_visita NOT NULL,
          gerou_orcamento BOOLEAN NOT NULL DEFAULT false,
          gerou_pedido BOOLEAN NOT NULL DEFAULT false,
          valor_estimado DECIMAL(10,2),
          interesse_escala INTEGER CHECK (interesse_escala BETWEEN 1 AND 5),
          temperatura_vendedor public.temperatura_vendedor NOT NULL,
          probabilidade_fechamento public.probabilidade_fechamento,
          feedback_cliente TEXT,
          observacoes_vendedor TEXT,
          data_proximo_contato DATE,
          acao_prevista VARCHAR(255),
          criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("✅ tabela visitas");
    } catch (e) {
      if (e.message.includes("already exists"))
        console.log("⏭️  tabela visitas");
      else console.error("❌ visitas: " + e.message);
    }

    // 4. Table convites_acesso
    try {
      await client.query(`
        CREATE TABLE public.convites_acesso (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email_destino VARCHAR(255) NOT NULL,
          nome_destino VARCHAR,
          celular_corporativo VARCHAR,
          token_hash VARCHAR(255) UNIQUE NOT NULL,
          role_atribuida public.app_role NOT NULL,
          gestor_vinculado_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
          diretor_vinculado_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
          data_expiracao TIMESTAMPTZ NOT NULL,
          status public.convite_status NOT NULL DEFAULT 'pendente',
          criado_por_id UUID REFERENCES public.usuarios(id),
          criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("✅ tabela convites_acesso");
    } catch (e) {
      if (e.message.includes("already exists"))
        console.log("⏭️  tabela convites_acesso");
      else console.error("❌ convites_acesso: " + e.message);
    }

    // 5. Table logs_transferencia
    try {
      await client.query(`
        CREATE TABLE public.logs_transferencia (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
          de_consultor_id UUID REFERENCES public.usuarios(id),
          para_consultor_id UUID REFERENCES public.usuarios(id),
          transferido_por_id UUID REFERENCES public.usuarios(id),
          data_transferencia TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("✅ tabela logs_transferencia");
    } catch (e) {
      if (e.message.includes("already exists"))
        console.log("⏭️  tabela logs_transferencia");
      else console.error("❌ logs_transferencia: " + e.message);
    }

    // 6. Table logs_transferencia_consultor
    try {
      await client.query(`
        CREATE TABLE public.logs_transferencia_consultor (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          consultor_id UUID NOT NULL,
          de_gestor_id UUID REFERENCES public.usuarios(id),
          para_gestor_id UUID REFERENCES public.usuarios(id),
          transferido_por_id UUID REFERENCES public.usuarios(id),
          data_transferencia TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      console.log("✅ tabela logs_transferencia_consultor");
    } catch (e) {
      if (e.message.includes("already exists"))
        console.log("⏭️  tabela logs_transferencia_consultor");
      else console.error("❌ logs_transferencia_consultor: " + e.message);
    }

    // 7. RLS
    for (const t of [
      "usuarios",
      "visitas",
      "convites_acesso",
      "logs_transferencia",
      "logs_transferencia_consultor",
    ]) {
      try {
        await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`);
        console.log("🔒 RLS " + t);
      } catch (e) {
        /* ignore */
      }
    }

    // 8. Indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_clientes_consultor ON public.clientes(consultor_atual_id)`,
      `CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON public.visitas(cliente_id, data_visita DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_visitas_executor ON public.visitas(consultor_executor_id)`,
      `CREATE INDEX IF NOT EXISTS idx_usuarios_gestor ON public.usuarios(gestor_id)`,
    ];
    for (const sql of indexes) {
      try {
        await client.query(sql);
      } catch (e) {
        /* ignore */
      }
    }
    console.log("✅ indexes");

    // 9. Functions
    await client.query(`
      CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
      RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
        SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE id = _user_id AND role = _role AND ativo = true)
      $$;
    `);
    console.log("✅ has_role");

    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_gestor_de(_gestor_id UUID, _consultor_id UUID)
      RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
        SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE id = _consultor_id AND gestor_id = _gestor_id)
      $$;
    `);
    console.log("✅ is_gestor_de");

    // 10. Trigger: auth.users -> usuarios
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION public.handle_new_crm_user()
        RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
        BEGIN
          INSERT INTO public.usuarios (id, nome_completo, email_corporativo, role)
          VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nome_completo', SPLIT_PART(NEW.email, '@', 1)),
            NEW.email,
            COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'consultor')
          )
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END; $$;
      `);
      await client.query(`
        CREATE TRIGGER on_auth_user_created_crm
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_crm_user();
      `);
      console.log("✅ trigger handle_new_crm_user");
    } catch (e) {
      console.log("⏭️  trigger: " + e.message.slice(0, 80));
    }

    // 11. Trigger: log transferencia
    try {
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
      await client.query(`
        CREATE TRIGGER trg_log_transferencia
          BEFORE UPDATE OF consultor_atual_id ON public.clientes
          FOR EACH ROW EXECUTE FUNCTION public.log_transferencia_cliente();
      `);
      console.log("✅ trigger trg_log_transferencia");
    } catch (e) {
      console.log("⏭️  trigger transferencia: " + e.message.slice(0, 80));
    }

    console.log("\n🎉 Migration CRM aplicada com sucesso!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("❌ ERRO:", e.message);
  process.exit(1);
});
