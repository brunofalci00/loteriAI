/**
 * Component: FeedbackModal
 *
 * Modal para coleta de feedback dos usuários
 * Suporta 3 tipos: Sugestões, Bugs, Elogios
 *
 * Features:
 * - Tabs por tipo de feedback
 * - Categorização opcional
 * - Textarea com contador de caracteres
 * - Validação (mín 10 caracteres)
 * - Gamificação (+1 crédito se >50 chars)
 * - Toast de confirmação
 * - Tracking de contexto
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Lightbulb,
  AlertCircle,
  Heart,
  Send,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreditsStatus } from '@/hooks/useUserCredits';
import { submitFeedback } from '@/services/feedbackService';

export interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: 'general' | 'post-generation' | 'post-share' | 'post-save' | 'header' | 'mobile-menu' | 'fab';
  defaultTab?: 'suggestion' | 'bug' | 'praise';
}

export function FeedbackModal({
  open,
  onOpenChange,
  context = 'general',
  defaultTab = 'suggestion',
}: FeedbackModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de créditos (se usuário autenticado)
  const { creditsRemaining } = useCreditsStatus(user?.id || '', !!user?.id);

  const charCount = content.length;
  const minChars = 10;
  const bonusThreshold = 50;
  const isValid = charCount >= minChars;
  const willGetBonus = charCount >= bonusThreshold;

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Feedback muito curto',
        description: `Por favor, escreva pelo menos ${minChars} caracteres.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        type: activeTab as 'suggestion' | 'bug' | 'praise',
        category: category || 'other',
        content,
        context,
        pageUrl: window.location.href,
      });

      if (result.success) {
        const creditsAwarded = result.creditAwarded ? 1 : 0;
        const newBalance = user && creditsAwarded > 0 ? creditsRemaining + creditsAwarded : null;

        // Descrição aprimorada com novo saldo
        let description = willGetBonus
          ? `Obrigado pela contribuição detalhada! Você ganhou +${creditsAwarded} crédito.`
          : 'Obrigado por nos ajudar a melhorar!';

        if (newBalance !== null) {
          description += ` Novo saldo: ${newBalance} ${newBalance === 1 ? 'crédito' : 'créditos'}.`;
        }

        // Botão "Usar créditos" se ganhou
        const toastAction = newBalance && newBalance > 0 ? (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              onOpenChange(false);
              navigate('/criar-jogo');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            Usar créditos
          </Button>
        ) : undefined;

        toast({
          title: '✅ Feedback enviado com sucesso!',
          description,
          duration: toastAction ? 8000 : 5000,
          action: toastAction,
        });

        // Reset form
        setContent('');
        setCategory('');
        setActiveTab('suggestion');
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar feedback',
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabConfig = {
    suggestion: {
      icon: Lightbulb,
      label: 'Sugestão',
      placeholder: 'Descreva sua ideia em detalhes...\n\nExemplo: Seria legal ter um filtro para ver apenas números pares na análise.',
      categories: [
        { value: 'ui', label: 'Interface/Design' },
        { value: 'analysis', label: 'Análise da IA' },
        { value: 'feature', label: 'Nova Funcionalidade' },
        { value: 'performance', label: 'Performance' },
      ],
    },
    bug: {
      icon: AlertCircle,
      label: 'Reportar Bug',
      placeholder: 'Descreva o problema que encontrou...\n\n• O que você estava fazendo?\n• O que esperava que acontecesse?\n• O que aconteceu de fato?',
      categories: [
        { value: 'ui', label: 'Erro Visual' },
        { value: 'analysis', label: 'Análise Incorreta' },
        { value: 'performance', label: 'Lentidão/Travamento' },
        { value: 'other', label: 'Outro' },
      ],
    },
    praise: {
      icon: Heart,
      label: 'Elogio',
      placeholder: 'Conte o que você mais gostou! ❤️\n\nSeus elogios motivam a equipe a continuar melhorando.',
      categories: [
        { value: 'ui', label: 'Design/Interface' },
        { value: 'analysis', label: 'Qualidade da Análise' },
        { value: 'feature', label: 'Funcionalidade' },
        { value: 'other', label: 'Geral' },
      ],
    },
  };

  const currentConfig = tabConfig[activeTab as keyof typeof tabConfig];
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Envie seu Feedback
          </DialogTitle>
          <DialogDescription>
            Sua opinião nos ajuda a melhorar constantemente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestion">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sugestão</span>
            </TabsTrigger>
            <TabsTrigger value="bug">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bug</span>
            </TabsTrigger>
            <TabsTrigger value="praise">
              <Heart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Elogio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Categoria (opcional)
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conteúdo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {currentConfig.label}
                </label>
                <span
                  className={`text-xs ${
                    charCount < minChars
                      ? 'text-destructive'
                      : willGetBonus
                      ? 'text-green-600 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {charCount} / {minChars} caracteres
                  {willGetBonus && ' ✨'}
                </span>
              </div>

              <Textarea
                placeholder={currentConfig.placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Incentivo de Créditos */}
            {activeTab !== 'praise' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <p className="font-medium mb-1">
                      Ganhe +1 crédito por feedback detalhado!
                    </p>
                    <p className="text-emerald-700">
                      Feedbacks com mais de {bonusThreshold} caracteres ganham
                      1 crédito de regeneração.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar {currentConfig.label}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <p className="text-xs text-center text-muted-foreground mt-2">
          Todos os feedbacks são lidos e considerados pela equipe
        </p>
      </DialogContent>
    </Dialog>
  );
}
