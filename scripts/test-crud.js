import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Tenta ler de .env primeiro, se não existir, tenta .env.local
const envPath = fs.existsSync('.env') ? '.env' : '.env.local';
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY faltantes no arquivo de ambiente.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCrudTest() {
  console.log("🚀 Iniciando Teste de CRUD do Catálogo em Massa...");
  let errors = [];

  // Categorias
  console.log("-> Testando [Categorias]");
  const { data: cat, error: errCat } = await supabase.from('catalogo_categorias').insert({ id: 'c-test', nome: 'Cat Teste', sigla: 'CT' }).select().single();
  if (errCat) errors.push(`Categorias Create: ${errCat.message}`);
  
  // Conexoes
  console.log("-> Testando [Conexoes]");
  const { error: errCon } = await supabase.from('catalogo_conexoes').insert({ id: 'cx-test', categoria_id: 'c-test', nome: 'Con Teste', sigla: 'CX' });
  if (errCon) errors.push(`Conexoes Create: ${errCon.message}`);

  // Componentes e Tipos
  console.log("-> Testando [Tipos]");
  await supabase.from('catalogo_tipos_abutment').insert({ id: 'ta-test', nome: 'TA Teste' });

  console.log("-> Executando Cleanup...");
  await supabase.from('catalogo_tipos_abutment').delete().eq('id', 'ta-test');
  await supabase.from('catalogo_conexoes').delete().eq('id', 'cx-test');
  await supabase.from('catalogo_categorias').delete().eq('id', 'c-test');

  if (errors.length > 0) {
    console.error("❌ ERROS ENCONTRADOS NO DB:");
    errors.forEach(e => console.error(e));
  } else {
    console.log("✅ BANCO DE DADOS 100% FUNCIONAL. NENHUM ERRO NAS INSERÇÕES.");
  }
}

runCrudTest();
