import pg from "pg";
import fs from "fs";
import crypto from "crypto";

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

const consultores = [
  { nome: "Carlos Silva", email: "carlos.silva@conexao.com.br" },
  { nome: "Ana Oliveira", email: "ana.oliveira@conexao.com.br" },
  { nome: "Marcos Pereira", email: "marcos.pereira@conexao.com.br" },
  { nome: "Juliana Costa", email: "juliana.costa@conexao.com.br" },
  { nome: "Roberto Lima", email: "roberto.lima@conexao.com.br" },
];

const nomesPF = [
  "João Santos",
  "Maria Oliveira",
  "Pedro Alves",
  "Lucia Mendes",
  "Fernando Cruz",
  "Carla Dias",
  "Rafael Souza",
  "Beatriz Rocha",
  "Thiago Martins",
  "Camila Barbosa",
];
const nomesPJ = [
  "Sorriso Certo Odontologia Ltda",
  "Clínica Dental Plus Ltda",
  "Instituto Odontológico São Lucas S/S",
  "Odonto Care Especialidades ME",
  "Center Dentes Clínica Odontológica Ltda",
];
const statuses = [
  "link_gerado",
  "dados_enviados",
  "em_analise",
  "em_correcao",
  "aprovado",
  "reprovado",
];
const cidadesSP = [
  "São Paulo",
  "Campinas",
  "São Bernardo",
  "Santo André",
  "Santos",
  "Ribeirão Preto",
  "São José dos Campos",
  "Sorocaba",
  "Jundiaí",
  "Osasco",
];

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // 1. Create auth users via REST signup
  const { rows: existing } = await pool.query(
    `select email from auth.users where email = any($1)`,
    [consultores.map((c) => c.email)],
  );
  const existingEmails = new Set(existing.map((r) => r.email));

  for (const c of consultores) {
    if (!existingEmails.has(c.email)) {
      console.log(`Criando usuário auth: ${c.email}`);
      try {
        await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: { apikey: anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: c.email,
            password: SENHA,
            data: { nome: c.nome },
          }),
        });
      } catch (e) {
        console.error(`  ERRO: ${e.message}`);
      }
    }
  }

  // Wait for triggers
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Confirm email + set profile
  for (const c of consultores) {
    await pool.query(
      `update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = $1`,
      [c.email],
    );

    const { rows } = await pool.query(
      `select id from auth.users where email = $1`,
      [c.email],
    );
    if (rows.length > 0) {
      await pool.query(
        `insert into public.profiles (id, email, nome, role, ambiente, ativo) values ($1,$2,$3,'viewer','consultor',true)
         on conflict (id) do update set ambiente = 'consultor', role = 'viewer', ativo = true, nome = $3`,
        [rows[0].id, c.email, c.nome],
      );
    }
  }

  // 3. Get consultant users
  const { rows: users } = await pool.query(
    `select u.id, u.email, p.nome from auth.users u join public.profiles p on p.id = u.id where u.email = any($1)`,
    [consultores.map((c) => c.email)],
  );
  console.log(`\nConsultores prontos: ${users.length}`);

  // 4. Create cadastros + PF/PJ + enderecos for each
  let total = 0;
  for (const u of users) {
    const num = 6 + Math.floor(Math.random() * 8);
    for (let i = 0; i < num; i++) {
      const isPF = Math.random() > 0.4;
      const nome = isPF ? randItem(nomesPF) : randItem(nomesPJ);
      const status = randItem(statuses);
      const dias = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - dias * 86400000);
      const updatedAt =
        status === "link_gerado"
          ? createdAt
          : new Date(Date.now() - Math.floor(Math.random() * dias) * 86400000);
      const token = crypto.randomBytes(24).toString("hex");
      const codCli =
        status === "aprovado"
          ? `CLI-${1000 + Math.floor(Math.random() * 9000)}`
          : null;
      const tel = `119${9000 + Math.floor(Math.random() * 1000)}${1000 + Math.floor(Math.random() * 9000)}`;
      const emailLead =
        nome.toLowerCase().replace(/[^a-z0-9]/g, ".") + "@email.com";

      const {
        rows: [cad],
      } = await pool.query(
        `insert into public.cadastros (token_acesso, created_by, tipo_acao, lead_nome, lead_email, lead_whatsapp, forma_compartilhamento, status, codigo_cliente, comentario_reprovacao, nome_temporario, link_expiracao, created_at, updated_at)
         values ($1,$2,'solicitar_cadastro',$3,$4,$5,'whatsapp',$6,$7,$8,$3,now()+interval'30 days',$9,$10) returning id`,
        [
          token,
          u.id,
          nome,
          emailLead,
          tel,
          status,
          codCli,
          status === "reprovado" ? "Documentação incompleta" : null,
          createdAt.toISOString(),
          updatedAt.toISOString(),
        ],
      );

      if (isPF) {
        const cpf = `${100 + Math.floor(Math.random() * 900)}.${100 + Math.floor(Math.random() * 900)}.${100 + Math.floor(Math.random() * 900)}-${10 + Math.floor(Math.random() * 90)}`;
        const nasc = new Date(
          1960 + Math.floor(Math.random() * 45),
          Math.floor(Math.random() * 12),
          1 + Math.floor(Math.random() * 27),
        )
          .toISOString()
          .split("T")[0];
        await pool.query(
          `insert into public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf, email_comunicacao, celular1, estado)
           values ($1,$2,$3,$4,$5,'SP',$6,$7,'SP')`,
          [
            cad.id,
            nome,
            cpf,
            nasc,
            `CRO-SP ${10000 + Math.floor(Math.random() * 90000)}`,
            emailLead,
            tel,
          ],
        );
      } else {
        const cnpj = `${10 + Math.floor(Math.random() * 90)}.${100 + Math.floor(Math.random() * 900)}.${100 + Math.floor(Math.random() * 900)}/${1000 + Math.floor(Math.random() * 9000)}-${10 + Math.floor(Math.random() * 90)}`;
        await pool.query(
          `insert into public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cnpj, email_comunicacao, celular1)
           values ($1,$2,$3,$4,$5,$6)`,
          [cad.id, nome, nome, cnpj, emailLead, tel],
        );
      }

      const cidade = randItem(cidadesSP);
      const cep = `${10 + Math.floor(Math.random() * 90)}${100 + Math.floor(Math.random() * 900)}-${100 + Math.floor(Math.random() * 900)}`;
      await pool.query(
        `insert into public.cadastros_enderecos (cadastro_id, cep, rua, numero, bairro, cidade, estado)
         values ($1,$2,$3,$4,$5,$6,'SP')`,
        [
          cad.id,
          cep,
          `Rua ${randItem(nomesPF)}`,
          String(100 + Math.floor(Math.random() * 9000)),
          "Centro",
          cidade,
        ],
      );

      total++;
    }
    console.log(`  ${u.nome}: ${num} cadastros`);
  }

  console.log(`\nTotal: ${users.length} consultores, ${total} cadastros`);
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
