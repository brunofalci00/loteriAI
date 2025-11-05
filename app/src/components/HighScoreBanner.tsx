/**
 * Component: HighScoreBanner
 *
 * Banner celebratório para taxa de acerto alta (75%+)
 * Tier S moment - incentiva compartilhamento
 *
 * Features:
 * - Visual destacado com gradiente
 * - Badge de "Acima da Média"
 * - ShareButton integrado
 * - Animação sutil de entrada
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { ShareButton } from '@/components/ShareButton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';

export interface HighScoreBannerProps {
  /**
   * Taxa de acerto (ex: 78.5)
   */
  accuracyRate: number;

  /**
   * Mostrar animação de entrada
   */
  animate?: boolean;

  /**
   * ID do usuário (para mostrar saldo atualizado no toast)
   */
  userId?: string | null;
}

/**
 * Banner para taxas de acerto altas (75%+)
 */
export function HighScoreBanner({ accuracyRate, animate = true, userId = null }: HighScoreBannerProps) {
  // Só renderizar se accuracy >= 75%
  if (accuracyRate < 75) {
    return null;
  }

  // Determinar nível de celebração
  const isExceptional = accuracyRate >= 85; // 85%+ = excepcional
  const isExcellent = accuracyRate >= 80; // 80%+ = excelente

  return (
    <Card
      className={`
        p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg
        ${animate ? 'animate-in slide-in-from-top-2 duration-500' : ''}
      `}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <h3 className="text-xl font-bold">
                {isExceptional
                  ? 'Taxa Excepcional!'
                  : isExcellent
                  ? 'Taxa Excelente!'
                  : 'Taxa Acima da Média!'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{Math.round(accuracyRate)}%</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                {isExceptional
                  ? 'Top 5%'
                  : isExcellent
                  ? 'Top 10%'
                  : 'Top 20%'}
              </Badge>
            </div>

            <p className="text-sm text-emerald-50">
              {isExceptional
                ? 'Seus jogos estão entre os melhores do sistema!'
                : isExcellent
                ? 'Seus jogos têm desempenho muito acima da média!'
                : 'Seus jogos estão performando bem acima da média!'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20" />

        {/* Share Section */}
        <div className="space-y-3">
          <p className="text-sm text-center text-emerald-50">
            Compartilhe este resultado e ganhe créditos extras
          </p>
          <ShareButton
            context="high-rate"
            data={{ accuracyRate }}
            variant="secondary"
            size="lg"
            celebratory={isExceptional}
            label="Compartilhar Taxa de Acerto"
            showCredits={true}
            userId={userId}
            className="w-full bg-white hover:bg-gray-100 text-emerald-600"
          />
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-emerald-100">
          Taxa de acerto baseada em {isExceptional ? 'padrões históricos avançados' : 'análise de concursos anteriores'}
        </p>
      </div>
    </Card>
  );
}
