-- Corrigir constraint de tipos de loteria na tabela saved_games
-- Adiciona todos os tipos de loteria suportados pela plataforma
--
-- Erro anterior: "check_valid_lottery_saved" não incluía "mega-sena"
--
-- @date 2025-01-05
-- @author Claude Code

-- 1. Dropar a constraint antiga (se existir)
ALTER TABLE public.saved_games
DROP CONSTRAINT IF EXISTS check_valid_lottery_saved;

-- 2. Adicionar nova constraint com TODOS os tipos de loteria
ALTER TABLE public.saved_games
ADD CONSTRAINT check_valid_lottery_saved
CHECK (
  lottery_type IN (
    'mega-sena',
    'quina',
    'lotofacil',
    'lotomania',
    'dupla-sena',
    'timemania',
    'mais-milionaria',
    'federal',
    'dia-de-sorte',
    'super-sete'
  )
);

-- 3. Comentário na constraint
COMMENT ON CONSTRAINT check_valid_lottery_saved ON public.saved_games
IS 'Valida que apenas tipos de loteria suportados pela plataforma podem ser salvos';
