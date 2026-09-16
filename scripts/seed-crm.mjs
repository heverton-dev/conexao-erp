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

const SENHA = "Conexao@2026";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXVxemhpemVxdmtndmZkaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg3NjksImV4cCI6MjA5NzM2NDc2OX0.GM3quHA1z_9kCiMEYsfAh9Pi0KVdnCIFQEYe-wwE9MM";
const supabaseUrl = "https://cluuqzhizeqvkgvfdisx.supabase.co";

// ============================================================
// DADOS DE ENTRADA
// ============================================================

const EMPRESA_NOME = "CONEXÃO IMPLANTES";

const diretor = {
  nome: "Diretor Comercial",
  email: "diretor@conexao.com.br",
  celular: "+5511999990001",
};

const gestores = [
  {
    nome: "Gestor São Paulo",
    email: "gestor.sp@conexao.com.br",
    celular: "+5511999990002",
  },
  {
    nome: "Gestor Rio de Janeiro",
    email: "gestor.rj@conexao.com.br",
    celular: "+5511999990003",
  },
];

const consultores = [
  {
    nome: "Carlos Silva",
    email: "carlos.silva@conexao.com.br",
    celular: "+5511999991001",
    gestorIdx: 0,
  },
  {
    nome: "Ana Oliveira",
    email: "ana.oliveira@conexao.com.br",
    celular: "+5511999991002",
    gestorIdx: 0,
  },
  {
    nome: "Marcos Pereira",
    email: "marcos.pereira@conexao.com.br",
    celular: "+5511999991003",
    gestorIdx: 0,
  },
  {
    nome: "Juliana Costa",
    email: "juliana.costa@conexao.com.br",
    celular: "+5511999991004",
    gestorIdx: 1,
  },
  {
    nome: "Roberto Lima",
    email: "roberto.lima@conexao.com.br",
    celular: "+5511999991005",
    gestorIdx: 1,
  },
  {
    nome: "Fernanda Souza",
    email: "fernanda.souza@conexao.com.br",
    celular: "+5511999991006",
    gestorIdx: 1,
  },
];

const clientesData = [
  // São Paulo
  {
    doutor: "Dr. João Santos",
    clinica: "Sorriso Certo Odontologia",
    tel: "+5511988001001",
    cidade: "São Paulo",
  },
  {
    doutor: "Dra. Maria Oliveira",
    clinica: "Clínica Dental Plus",
    tel: "+5511988001002",
    cidade: "São Paulo",
  },
  {
    doutor: "Dr. Pedro Alves",
    clinica: "Instituto Odontológico São Lucas",
    tel: "+5511988001003",
    cidade: "Campinas",
  },
  {
    doutor: "Dra. Lucia Mendes",
    clinica: "Odonto Care Especialidades",
    tel: "+5511988001004",
    cidade: "São Bernardo",
  },
  {
    doutor: "Dr. Fernando Cruz",
    clinica: "Center Dentes",
    tel: "+5511988001005",
    cidade: "Santo André",
  },
  {
    doutor: "Dra. Carla Dias",
    clinica: "Odonto Premium",
    tel: "+5511988001006",
    cidade: "Santos",
  },
  {
    doutor: "Dr. Rafael Souza",
    clinica: "Clínica Sorriso Feliz",
    tel: "+5511988001007",
    cidade: "Ribeirão Preto",
  },
  {
    doutor: "Dra. Beatriz Rocha",
    clinica: "Dental Expert",
    tel: "+5511988001008",
    cidade: "São José dos Campos",
  },
  {
    doutor: "Dr. Thiago Martins",
    clinica: "Odonto Vida",
    tel: "+5511988001009",
    cidade: "Sorocaba",
  },
  {
    doutor: "Dra. Camila Barbosa",
    clinica: "Clínica Bem Estar",
    tel: "+5511988001010",
    cidade: "Jundiaí",
  },
  // Rio de Janeiro
  {
    doutor: "Dr. Ricardo Mendes",
    clinica: "Odonto Rio",
    tel: "+5521988002001",
    cidade: "Rio de Janeiro",
  },
  {
    doutor: "Dra. Patricia Lima",
    clinica: "Clínica Dental RJ",
    tel: "+5521988002002",
    cidade: "Niterói",
  },
  {
    doutor: "Dr. Gustavo Ferreira",
    clinica: "Sorriso RJ",
    tel: "+5521988002003",
    cidade: "Rio de Janeiro",
  },
  {
    doutor: "Dra. Amanda Costa",
    clinica: "Odonto Centro",
    tel: "+5521988002004",
    cidade: "Petrópolis",
  },
  {
    doutor: "Dr. Leonardo Santos",
    clinica: "Dental Care RJ",
    tel: "+5521988002005",
    cidade: "Duque de Caxias",
  },
  {
    doutor: "Dra. Isabela Moura",
    clinica: "Clínica Odonto RJ",
    tel: "+5521988002006",
    cidade: "Rio de Janeiro",
  },
  {
    doutor: "Dr. Felipe Rodrigues",
    clinica: "Implantar Odonto",
    tel: "+5521988002007",
    cidade: "Volta Redonda",
  },
  {
    doutor: "Dra. Vanessa Almeida",
    clinica: "Rio Sorriso",
    tel: "+5521988002008",
    cidade: "Campos dos Goytacazes",
  },
];

const temperaturas = ["Frio", "Morno", "Quente"];
const tiposVisita = ["Prospeccao", "Relacionamento", "Pos-venda"];
const cargos = ["Secretaria", "Dentista", "Outro"];
const probs = ["Baixa", "Media", "Alta"];
const atendentes = [
  "Maria Silva",
  "Ana Costa",
  "Juliana Santos",
  "Carla Oliveira",
  "Patricia Lima",
  "Fernanda Souza",
];
const acoes = [
  "Retorno em 7 dias",
  "Enviar proposta",
  "Agendar demo",
  "Follow-up WhatsApp",
  "Ligar semana que vem",
  "Enviar catálogo",
  "Visita técnica",
];

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function randDate(daysAgo) {
  const d = new Date(Date.now() - randInt(0, daysAgo) * 86400000);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const client = await pool.connect();
  try {
    // 0. Buscar empresa
    console.log(`\n🔍 Buscando empresa "${EMPRESA_NOME}"...`);
    const { rows: empresas } = await client.query(
      `SELECT id FROM empresas WHERE slug = 'conexao-implantes' OR nome ILIKE '%CONEXÃO%' OR nome ILIKE '%CONEXAO%' LIMIT 1`,
    );
    let empresaId;
    if (empresas.length > 0) {
      empresaId = empresas[0].id;
      console.log(`  ✅ Empresa encontrada: ${empresaId}`);
    } else {
      // Criar empresa
      const {
        rows: [emp],
      } = await client.query(
        `INSERT INTO empresas (nome, slug, ativo) VALUES ($1, $2, true) RETURNING id`,
        [EMPRESA_NOME, "conexao-implantes"],
      );
      empresaId = emp.id;
      console.log(`  ✅ Empresa criada: ${empresaId}`);
    }

    // 1. Criar auth users
    const todosUsuarios = [
      { ...diretor, role: "diretor_comercial" },
      ...gestores.map((g) => ({ ...g, role: "gestor" })),
      ...consultores.map((c) => ({ ...c, role: "consultor" })),
    ];

    console.log("\n👥 Criando usuários auth...");
    for (const u of todosUsuarios) {
      const { rows: existing } = await client.query(
        `SELECT id FROM auth.users WHERE email = $1`,
        [u.email],
      );
      if (existing.length === 0) {
        try {
          await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: { apikey: anonKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              email: u.email,
              password: SENHA,
              data: { nome: u.nome },
            }),
          });
          console.log(`  📧 ${u.email}`);
        } catch (e) {
          console.error(`  ❌ ${u.email}: ${e.message}`);
        }
      }
    }

    // Aguardar triggers
    await new Promise((r) => setTimeout(r, 3000));

    // 2. Confirmar emails + profiles
    console.log("\n✅ Confirmando emails...");
    for (const u of todosUsuarios) {
      await client.query(
        `UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) WHERE email = $1`,
        [u.email],
      );
    }

    // 3. Criar/atualizar profiles
    console.log("\n📋 Criando profiles...");
    for (const u of todosUsuarios) {
      const { rows } = await client.query(
        `SELECT id FROM auth.users WHERE email = $1`,
        [u.email],
      );
      if (rows.length > 0) {
        await client.query(
          `INSERT INTO profiles (id, email, nome, role, ambiente, ativo, empresa_id, celular)
           VALUES ($1, $2, $3, 'viewer', 'consultor', true, $4, $5)
           ON CONFLICT (id) DO UPDATE SET nome = $3, empresa_id = $4, celular = $5, ativo = true`,
          [rows[0].id, u.email, u.nome, empresaId, u.celular],
        );
      }
    }

    // 4. Criar usuarios CRM
    console.log("\n🏢 Criando usuários CRM...");
    const gestorIds = [];
    const consultorIds = [];
    let diretorId;

    // Diretor
    const { rows: dirAuth } = await client.query(
      `SELECT id FROM auth.users WHERE email = $1`,
      [diretor.email],
    );
    if (dirAuth.length > 0) {
      diretorId = dirAuth[0].id;
      await client.query(
        `INSERT INTO usuarios (id, nome_completo, email_corporativo, role, celular_corporativo, ativo, meta_diaria_visitas)
         VALUES ($1, $2, $3, 'diretor_comercial', $4, true, 5)
         ON CONFLICT (id) DO UPDATE SET nome_completo = $2, role = 'diretor_comercial', celular_corporativo = $4`,
        [diretorId, diretor.nome, diretor.email, diretor.celular],
      );
      console.log(`  👔 Diretor: ${diretor.nome}`);
    }

    // Gestores
    for (let i = 0; i < gestores.length; i++) {
      const g = gestores[i];
      const { rows: auth } = await client.query(
        `SELECT id FROM auth.users WHERE email = $1`,
        [g.email],
      );
      if (auth.length > 0) {
        const gid = auth[0].id;
        gestorIds.push(gid);
        await client.query(
          `INSERT INTO usuarios (id, nome_completo, email_corporativo, role, diretor_id, celular_corporativo, ativo, meta_diaria_visitas)
           VALUES ($1, $2, $3, 'gestor', $4, $5, true, 5)
           ON CONFLICT (id) DO UPDATE SET nome_completo = $2, role = 'gestor', diretor_id = $4, celular_corporativo = $5`,
          [gid, g.nome, g.email, diretorId, g.celular],
        );
        console.log(`  📊 Gestor: ${g.nome}`);
      }
    }

    // Consultores
    for (const c of consultores) {
      const { rows: auth } = await client.query(
        `SELECT id FROM auth.users WHERE email = $1`,
        [c.email],
      );
      if (auth.length > 0) {
        const cid = auth[0].id;
        consultorIds.push(cid);
        await client.query(
          `INSERT INTO usuarios (id, nome_completo, email_corporativo, role, gestor_id, celular_corporativo, ativo, meta_diaria_visitas)
           VALUES ($1, $2, $3, 'consultor', $4, $5, true, 3)
           ON CONFLICT (id) DO UPDATE SET nome_completo = $2, role = 'consultor', gestor_id = $4, celular_corporativo = $5`,
          [cid, c.nome, c.email, gestorIds[c.gestorIdx], c.celular],
        );
        console.log(`  🧑‍💼 Consultor: ${c.nome}`);
      }
    }

    // 5. Criar permissões CRM
    console.log("\n🔐 Criando permissões CRM...");
    const crmPerms = {
      crm_dashboard: true,
      crm_carteira: true,
      crm_cliente_detalhe: true,
      crm_equipe: true,
      crm_bi: true,
      crm_transferencia: true,
      crm_diretoria: true,
      crm_dev_convites: true,
      crm_dev_demo: true,
      crm_dev_usuarios: true,
    };
    const allUserIds = [diretorId, ...gestorIds, ...consultorIds].filter(
      Boolean,
    );
    for (const uid of allUserIds) {
      await client.query(
        `INSERT INTO permissoes (usuario_id, permissoes, empresa_id, modulos_acesso)
         VALUES ($1, $2, $3, '{"crm": {"acessar": true}}'::jsonb)
         ON CONFLICT (usuario_id) DO UPDATE SET permissoes = permissoes.permissoes || $2, modulos_acesso = permissoes.modulos_acesso || '{"crm": {"acessar": true}}'::jsonb`,
        [uid, JSON.stringify(crmPerms), empresaId],
      );
    }
    console.log(`  ✅ ${allUserIds.length} usuários com permissões CRM`);

    // 6. Criar clientes
    console.log("\n🧑‍🤝‍🧑 Criando clientes...");
    const clienteIds = [];
    for (let i = 0; i < clientesData.length; i++) {
      const c = clientesData[i];
      const consultorIdx = i < 10 ? randInt(0, 2) : randInt(3, 5); // SP -> consultores 0-2, RJ -> 3-5
      const consultorId = consultorIds[consultorIdx] || consultorIds[0];
      const {
        rows: [cli],
      } = await client.query(
        `INSERT INTO clientes (nome_doutor, nome_clinica, telefone_contato, consultor_atual_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [c.doutor, c.clinica, c.tel, consultorId],
      );
      clienteIds.push(cli.id);
    }
    console.log(`  ✅ ${clienteIds.length} clientes criados`);

    // 7. Criar visitas
    console.log("\n📅 Criando visitas...");
    let totalVisitas = 0;
    for (const clienteId of clienteIds) {
      const numVisitas = randInt(1, 5);
      for (let v = 0; v < numVisitas; v++) {
        const diasAtras = randInt(1, 90);
        const dataVisita = randDate(diasAtras);
        const temp = randItem(temperaturas);
        const valor =
          temp === "Quente"
            ? randInt(5000, 50000)
            : temp === "Morno"
              ? randInt(2000, 20000)
              : randInt(500, 8000);
        const gerouPedido = temp === "Quente" && Math.random() > 0.5;
        const gerouOrcamento = temp !== "Frio" || Math.random() > 0.6;

        // Buscar consultor do cliente
        const {
          rows: [cli],
        } = await client.query(
          `SELECT consultor_atual_id FROM clientes WHERE id = $1`,
          [clienteId],
        );

        await client.query(
          `INSERT INTO visitas (
            cliente_id, consultor_executor_id, data_visita, atendente, cargo_atendente,
            tipo_visita, gerou_orcamento, gerou_pedido, valor_estimado, interesse_escala,
            temperatura_vendedor, probabilidade_fechamento, feedback_cliente, observacoes_vendedor,
            data_proximo_contato, acao_prevista
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            clienteId,
            cli?.consultor_atual_id || consultorIds[0],
            dataVisita,
            randItem(atendentes),
            randItem(cargos),
            randItem(tiposVisita),
            gerouOrcamento,
            gerouPedido,
            valor,
            randInt(1, 5),
            temp,
            randItem(probs),
            gerouPedido
              ? "Cliente muito satisfeito com o produto"
              : temp === "Quente"
                ? "Demonstrou interesse real"
                : "Precisa de mais tempo",
            `Visita ${v + 1} - ${temp}`,
            gerouPedido ? null : randDate(diasAtras - 7),
            gerouPedido ? null : randItem(acoes),
          ],
        );
        totalVisitas++;
      }
    }
    console.log(`  ✅ ${totalVisitas} visitas criadas`);

    // 8. Criar alguns convites
    console.log("\n📧 Criando convites...");
    const convites = [
      {
        nome: "Novo Consultor SP",
        email: "novo.sp@conexao.com.br",
        celular: "+5511999992001",
        role: "consultor",
      },
      {
        nome: "Novo Consultor RJ",
        email: "novo.rj@conexao.com.br",
        celular: "+5521999992002",
        role: "consultor",
      },
    ];
    for (const cv of convites) {
      await client.query(
        `INSERT INTO convites_acesso (email_destino, nome_destino, celular_corporativo, role_atribuida, gestor_vinculado_id, token_hash, data_expiracao, status)
         VALUES ($1, $2, $3, $4, $5, encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '72 hours', 'pendente')`,
        [cv.email, cv.nome, cv.celular, cv.role, gestorIds[0]],
      );
    }
    console.log(`  ✅ ${convites.length} convites pendentes`);

    // RESUMO
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED CRM CONCLUÍDO!");
    console.log("=".repeat(50));
    console.log(`  Empresa: ${EMPRESA_NOME} (${empresaId})`);
    console.log(`  Diretor: 1`);
    console.log(`  Gestores: ${gestorIds.length}`);
    console.log(`  Consultores: ${consultorIds.length}`);
    console.log(`  Clientes: ${clienteIds.length}`);
    console.log(`  Visitas: ${totalVisitas}`);
    console.log(`  Convites: ${convites.length}`);
    console.log(`\n  Senha padrão: ${SENHA}`);
    console.log(`  Emails:`);
    for (const u of todosUsuarios) {
      console.log(`    ${u.role.padEnd(20)} ${u.email}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ ERRO:", e.message);
  process.exit(1);
});
