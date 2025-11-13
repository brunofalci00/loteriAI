-- =====================================================
-- FIX: Expandir constraint de lottery types
-- Data: 2025-01-03
-- Issue: Database só aceita lotofacil/lotomania mas UI mostra 8 loterias
-- =====================================================

-- Remover constraint antiga que só aceita 2 loterias
ALTER TABLE saved_games
DROP CONSTRAINT IF EXISTS check_valid_lottery_saved;

-- Adicionar nova constraint com todas as loterias suportadas
ALTER TABLE saved_games
ADD CONSTRAINT check_valid_lottery_saved CHECK (
  lottery_type IN (
    'megasena',
    'quina',
    'lotofacil',
    'lotomania',
    'dupla_sena',
    'timemania',
    'dia_de_sorte',
    'mais_milionaria'
  )
);

-- Comentário
COMMENT ON CONSTRAINT check_valid_lottery_saved ON saved_games IS
'Valida que lottery_type é uma das 8 loterias suportadas pelo sistema';

-- =====================================================
-- Aplicar mesma correção em outras tabelas
-- =====================================================

-- Tabela: generation_history
ALTER TABLE generation_history
DROP CONSTRAINT IF EXISTS check_valid_lottery_type;

ALTER TABLE generation_history
ADD CONSTRAINT check_valid_lottery_type CHECK (
  lottery_type IN (
    'megasena',
    'quina',
    'lotofacil',
    'lotomania',
    'dupla_sena',
    'timemania',
    'dia_de_sorte',
    'mais_milionaria'
  )
);

-- Tabela: manual_creation_sessions
ALTER TABLE manual_creation_sessions
DROP CONSTRAINT IF EXISTS check_valid_lottery_type_manual;

ALTER TABLE manual_creation_sessions
ADD CONSTRAINT check_valid_lottery_type_manual CHECK (
  lottery_type IN (
    'megasena',
    'quina',
    'lotofacil',
    'lotomania',
    'dupla_sena',
    'timemania',
    'dia_de_sorte',
    'mais_milionaria'
  )
);

-- Tabela: manual_game_variations
ALTER TABLE manual_game_variations
DROP CONSTRAINT IF EXISTS check_valid_lottery_type_var;

ALTER TABLE manual_game_variations
ADD CONSTRAINT check_valid_lottery_type_var CHECK (
  original_lottery_type IN (
    'megasena',
    'quina',
    'lotofacil',
    'lotomania',
    'dupla_sena',
    'timemania',
    'dia_de_sorte',
    'mais_milionaria'
  )
);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Constraints de lottery_type atualizadas com sucesso!';
  RAISE NOTICE 'Loterias suportadas: megasena, quina, lotofacil, lotomania, dupla_sena, timemania, dia_de_sorte, mais_milionaria';
END $$;
