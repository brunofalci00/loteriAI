/**
 * Script para adicionar 20 créditos para todos os usuários
 *
 * Como usar:
 * 1. cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\app\app
 * 2. node ../scripts/add-credits-to-users.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (PRODUÇÃO)
const SUPABASE_URL = 'https://aaqthgqsuhyagsrlnyqk.supabase.co';
const SUPABASE_SERVICE_KEY = 'SEU_SERVICE_ROLE_KEY_AQUI'; // ⚠️ IMPORTANTE: Usar SERVICE ROLE KEY, não ANON KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DEFAULT_MONTHLY_CREDITS = 20;

async function addCreditsToAllUsers() {
  console.log('🚀 Iniciando processo de adição de créditos...\n');

  try {
    // 1. Buscar todos os usuários
    console.log('📊 Buscando todos os usuários...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email');

    if (usersError) {
      throw usersError;
    }

    console.log(`✅ ${users.length} usuários encontrados\n`);

    // 2. Para cada usuário, inserir ou atualizar créditos
    let updated = 0;
    let created = 0;
    let errors = 0;

    for (const user of users) {
      console.log(`Processing: ${user.email}`);

      // Upsert (insert ou update)
      const { error: upsertError } = await supabase
        .from('user_credits')
        .upsert(
          {
            user_id: user.id,
            credits_remaining: DEFAULT_MONTHLY_CREDITS,
            credits_total: DEFAULT_MONTHLY_CREDITS,
            last_reset_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (upsertError) {
        console.error(`  ❌ Erro: ${upsertError.message}`);
        errors++;
      } else {
        console.log(`  ✅ ${DEFAULT_MONTHLY_CREDITS} créditos adicionados`);
        updated++;
      }
    }

    // 3. Verificar resultado final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL:');
    console.log('='.repeat(50));
    console.log(`Total de usuários: ${users.length}`);
    console.log(`✅ Atualizados com sucesso: ${updated}`);
    console.log(`❌ Erros: ${errors}`);
    console.log('='.repeat(50) + '\n');

    // 4. Mostrar estatísticas finais
    const { data: stats, error: statsError } = await supabase.rpc('get_credits_stats');

    if (!statsError && stats) {
      console.log('📈 Estatísticas de créditos:');
      console.log(stats);
    }

    console.log('\n✨ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Função auxiliar para criar estatísticas (se não existir)
async function createStatsFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_credits_stats()
    RETURNS TABLE (
      total_users INTEGER,
      avg_credits NUMERIC,
      min_credits INTEGER,
      max_credits INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        COUNT(*)::INTEGER as total_users,
        AVG(credits_remaining)::NUMERIC as avg_credits,
        MIN(credits_remaining)::INTEGER as min_credits,
        MAX(credits_remaining)::INTEGER as max_credits
      FROM user_credits;
    END;
    $$ LANGUAGE plpgsql;
  `;

  await supabase.rpc('sql', { query: sql });
}

// Executar script
console.log('⚠️  AVISO: Este script irá atualizar TODOS os usuários em PRODUÇÃO!');
console.log('⚠️  Certifique-se de ter configurado o SERVICE_ROLE_KEY corretamente.\n');

// Descomentar a linha abaixo para executar
// addCreditsToAllUsers();

console.log('⚠️  Script desabilitado por segurança.');
console.log('⚠️  Edite o arquivo e descomente a linha "addCreditsToAllUsers()" para executar.');
console.log('⚠️  OU use o SQL direto no Supabase SQL Editor (recomendado).');
