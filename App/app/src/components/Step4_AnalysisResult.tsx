import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Heart, RefreshCw, Edit, PlusCircle, Eye, Loader2, AlertCircle, Flame } from "lucide-react";
import type { AnalysisResult } from "@/services/manualGameAnalysisService";
import { SaveToggleButton } from "@/components/SaveToggleButton";
import { ShareButton } from "@/components/ShareButton";
import { DetailedAnalysisModal } from "@/components/DetailedAnalysisModal";
import { ConsumeCreditsConfirmation } from "@/components/ConsumeCreditsConfirmation";
import { useCreditsStatus } from "@/hooks/useUserCredits";
import { useToast } from "@/hooks/use-toast";

interface Step4_AnalysisResultProps {
  lotteryType: 'lotofacil' | 'lotomania';
  contestNumber: number;
  selectedNumbers: number[];
  analysisResult: AnalysisResult;
  userId: string | null;
  onGenerateVariations: () => void;
  onEdit: () => void;
  onReset: () => void;
  isGeneratingVariations?: boolean;
}

export function Step4_AnalysisResult({
  lotteryType,
  contestNumber,
  selectedNumbers,
  analysisResult,
  userId,
  onGenerateVariations,
  onEdit,
  onReset,
  isGeneratingVariations = false,
}: Step4_AnalysisResultProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { toast } = useToast();

  // Hook de créditos (apenas se usuário autenticado)
  const {
    creditsRemaining,
    canRegenerate,
    cannotRegenerateReason,
    isLoading: isLoadingCredits,
  } = useCreditsStatus(userId || '', !!userId);

  const { score, summary, hotCount, coldCount, balancedCount, evenOddDistribution, comparisonWithAverage } = analysisResult;

  // Handler para abrir modal de confirmação
  const handleVariationsClick = () => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Autenticação necessária',
        description: 'Faça login para gerar variações.',
      });
      return;
    }

    if (!canRegenerate) {
      toast({
        variant: 'destructive',
        title: 'Não é possível gerar variações',
        description: cannotRegenerateReason || 'Créditos insuficientes',
      });
      return;
    }

    setConfirmModalOpen(true);
  };

  // Handler para confirmar geração
  const handleConfirmVariations = () => {
    setConfirmModalOpen(false);
    onGenerateVariations();
  };

  // Mapear tipo de loteria para nome
  const lotteryNames: Record<string, string> = {
    'lotofacil': 'Lotofácil',
    'lotomania': 'Lotomania',
  };

  // Score agora já está em escala 0-5
  const stars = Math.floor(score);
  const halfStar = (score % 1) >= 0.5;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Análise da IA</h2>
        <p className="text-muted-foreground">
          Veja como seu jogo se compara com padrões históricos
        </p>
      </div>

      {/* Main Analysis Card */}
      <Card className="p-8 space-y-6">
        {/* Numbers Display */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Números selecionados:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((num) => {
              const isHot = analysisResult.detailedAnalysis.hotNumbers.includes(num);
              return (
                <div
                  key={num}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-lg text-base font-semibold shadow-glow transition-colors",
                    isHot
                      ? "bg-orange-500 text-white ring-2 ring-orange-500/50"
                      : "gradient-primary text-emerald-950 dark:text-emerald-50"
                  )}
                >
                  {num.toString().padStart(2, '0')}
                  {isHot && <Flame className="absolute -top-1 -right-1 h-3 w-3 text-orange-300" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          {/* Score with Stars */}
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{score.toFixed(1)}/5</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < stars
                          ? 'fill-yellow-400 text-yellow-400'
                          : i === stars && halfStar
                          ? 'fill-yellow-200 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Badge variant={score >= 3.5 ? 'default' : score >= 2.5 ? 'secondary' : 'destructive'}>
                {comparisonWithAverage}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2">Resumo:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>

          <Button
            onClick={() => setDetailsModalOpen(true)}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes da Análise
          </Button>

          {/* Share Button - Tier S moment (score >= 4.0) */}
          {score >= 4.0 && (
            <div className="mt-4 pt-4 border-t space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                A IA equilibrando {hotCount} números quentes e {coldCount} frios deixou esse jogo em destaque.
              </p>
              <p className="text-xs text-muted-foreground">
                Compartilhe seus números para ganhar créditos extras e mostrar como você montou o jogo.
              </p>
              <ShareButton
                context="score"
                data={{ score }}
                payload={{
                  lotteryType,
                  lotteryName: lotteryNames[lotteryType],
                  contestNumber,
                  numbers: selectedNumbers,
                  hotCount,
                  coldCount,
                  balancedCount,
                  source: 'manual',
                }}
                variant="primary"
                size="lg"
                celebratory={score >= 4.5}
                label="Compartilhar Resultado"
                showCredits={true}
                userId={userId}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Números Quentes</p>
            <p className="text-2xl font-bold text-orange-500">{hotCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Balanceados</p>
            <p className="text-2xl font-bold text-green-500">{balancedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Par / Ímpar</p>
            <p className="text-2xl font-bold">
              {evenOddDistribution.even} / {evenOddDistribution.odd}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {userId && (
            <SaveToggleButton
              lotteryType={lotteryType}
              contestNumber={contestNumber}
              numbers={selectedNumbers}
              analysisResult={{
                hotCount,
                coldCount,
                balancedCount: balancedCount,
                score,
                detailedAnalysis: analysisResult.detailedAnalysis
              }}
              source="manual_created"
              userId={userId}
              generationId={null}
              variant="default"
              className="w-full"
            />
          )}

          <Button
            onClick={handleVariationsClick}
            disabled={isGeneratingVariations || isLoadingCredits || !canRegenerate}
            variant="default"
            className="w-full"
          >
            {isGeneratingVariations ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : !canRegenerate && userId ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Sem créditos
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar 5 Variações
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onEdit}
            variant="outline"
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Números
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Novo Jogo
          </Button>
        </div>
      </div>

      {/* Detailed Analysis Modal - Tier B */}
      <DetailedAnalysisModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        analysisResult={analysisResult}
        selectedNumbers={selectedNumbers}
        lotteryName={lotteryNames[lotteryType]}
        userId={userId}
        onEdit={onEdit}
      />

      {/* Consume Credits Confirmation Modal */}
      {userId && (
        <ConsumeCreditsConfirmation
          open={confirmModalOpen}
          onOpenChange={setConfirmModalOpen}
          title="Gerar 5 Variações?"
          description="Esta ação gerará 5 variações otimizadas mantendo 60-70% dos números originais."
          creditsRequired={1}
          creditsRemaining={creditsRemaining}
          onConfirm={handleConfirmVariations}
          confirmLabel="Gerar Variações"
          isLoading={isGeneratingVariations}
        />
      )}
    </div>
  );
}
