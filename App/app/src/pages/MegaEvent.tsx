/**
 * Page: MegaEvent
 *
 * Página principal do evento Mega da Virada 2024/2025
 * Sistema unificado usando créditos mensais comuns
 *
 * Seções:
 * 1. Hero com contagem regressiva
 * 2. Exibição de créditos disponíveis
 * 3. Cards de features disponíveis
 * 4. Histórico de prêmios passados
 * 5. Impacto social e probabilidades
 * 6. Regras do evento
 * 7. Suporte WhatsApp
 */

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowRight,
  Calendar,
  Flame,
  History,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  PieChart,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { CreditsDisplayMega } from "@/components/CreditsDisplayMega";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsStatus } from "@/hooks/useUserCredits";
import { useMegaEvent } from "@/contexts/MegaEventContext";

// Feature cards
const featureCards = [
  {
    title: "Gerar 3 jogos IA",
    description:
      "Geração inteligente treinada em dados históricos da Mega da Virada com storytelling do prêmio.",
    creditCost: 1,
  },
  {
    title: "Análise de jogos manuais",
    description:
      "Diagnóstico especial com números históricos e recomendações exclusivas do evento.",
    creditCost: 1,
  },
  {
    title: "Regenerar combinações",
    description: "Novas variações com foco em padrões dos últimos concursos da Mega.",
    creditCost: 1,
  },
  {
    title: "Gerar variações IA",
    description:
      "Estratégias exclusivas como foco em dezenas recentes e números mais sorteados.",
    creditCost: 1,
  },
];

// Highlights do evento
const highlights = [
  {
    label: "Créditos por ação",
    value: "1 crédito",
    icon: Flame,
  },
  {
    label: "Vigência do evento",
    value: "Até 07/01",
    icon: Calendar,
  },
  {
    label: "Prêmio estimado",
    value: "R$ 850 milhões",
    icon: TrendingUp,
  },
];

// Histórico de prêmios
const megaPrizeHistory = [
  { year: "2023", numbers: "21 • 24 • 33 • 41 • 48 • 56", prize: "R$ 588,9 mi", winners: "5 apostas" },
  { year: "2022", numbers: "04 • 05 • 10 • 34 • 58 • 59", prize: "R$ 541,9 mi", winners: "5 apostas" },
  { year: "2021", numbers: "12 • 15 • 23 • 32 • 33 • 46", prize: "R$ 378,1 mi", winners: "2 apostas" },
  { year: "2020", numbers: "17 • 20 • 22 • 35 • 41 • 42", prize: "R$ 325,2 mi", winners: "2 apostas" },
  { year: "2018", numbers: "05 • 10 • 12 • 18 • 25 • 33", prize: "R$ 302,5 mi", winners: "52 apostas" },
  { year: "2009", numbers: "10 • 27 • 40 • 46 • 49 • 58", prize: "R$ 144,9 mi", winners: "2 apostas" },
];

// Impacto social
const socialImpactFacts = [
  {
    title: "40% da arrecadação é social",
    description:
      "Cerca de R$ 0,40 de cada R$ 1,00 apostado financia Esporte, Cultura, Seguridade Social, Saúde e Segurança Pública.",
    icon: Shield,
  },
  {
    title: "Prêmios não resgatados viram educação",
    description:
      "Após 90 dias, valores esquecidos seguem para o Tesouro e reforçam o FIES. Em 2023, um bolão de Osasco destinou R$ 1,4 milhão ao fundo.",
    icon: GraduationCap,
  },
];

// Probabilidades
const probabilityInsights = [
  {
    title: "Aposta simples",
    value: "1 em 50.063.860",
    note: "Probabilidade de acertar a Sena com 6 dezenas – prêmio é garantido, mas a dificuldade permanece alta.",
    icon: PieChart,
  },
  {
    title: "Aumentando dezenas",
    value: "1 em 10.003 (15 dezenas)",
    note: "Custo passa para R$ 25.025. No limite de 20 dezenas (R$ 193.800), a chance melhora para 1 em 1.292.",
    icon: Star,
  },
  {
    title: "Princípio da não-acumulação",
    value: "Distribuição obrigatória",
    note: "Sem vencedores na Sena, o prêmio desce para Quina e Quadra. Isso impulsiona confiança e volume de apostas.",
    icon: Shield,
  },
];

export const MegaEvent = () => {
  const { user } = useAuth();
  const { isEventActive, eventConfig } = useMegaEvent();
  const { creditsRemaining, creditsTotal, lastResetAt, isLoading } = useCreditsStatus(user?.id);

  // Contagem regressiva até o sorteio
  const timeLeft = useMemo(() => {
    const target = eventConfig.endDate.getTime();
    const diff = Math.max(target - Date.now(), 0);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    };
  }, [eventConfig.endDate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 space-y-10">
        {/* SECTION 1: Hero Section */}
        <section className={`rounded-3xl bg-gradient-to-br ${eventConfig.theme.gradient} p-8 text-slate-900 shadow-2xl`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-4">
              <Badge className="bg-white/30 text-slate-900 w-fit">
                Mega da Virada • Evento especial
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                Análises especiais para disputar o prêmio histórico de R$ 850 milhões.
              </h1>
              <p className="text-lg text-slate-900/80">
                Use seus créditos mensais nas ferramentas exclusivas do evento: geração IA
                otimizada, insights sobre histórico da Mega e variações estratégicas.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="hero"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Ver meus créditos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 text-slate-900 hover:bg-white/30"
                  onClick={() => window.open("https://wa.me/message/5O5UF7LOSPUWK1", "_blank")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Falar no WhatsApp
                </Button>
              </div>
            </div>

            {/* Countdown Card */}
            <Card className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border-0 bg-white/20 p-6 text-left shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-800/70">
                Contagem regressiva
              </p>
              <div className="flex items-center justify-between text-3xl font-bold">
                <div className="text-center">
                  <p>{timeLeft.days.toString().padStart(2, "0")}</p>
                  <span className="text-xs font-medium uppercase text-slate-700">dias</span>
                </div>
                <span>:</span>
                <div className="text-center">
                  <p>{timeLeft.hours.toString().padStart(2, "0")}</p>
                  <span className="text-xs font-medium uppercase text-slate-700">horas</span>
                </div>
                <span>:</span>
                <div className="text-center">
                  <p>{timeLeft.minutes.toString().padStart(2, "0")}</p>
                  <span className="text-xs font-medium uppercase text-slate-700">min</span>
                </div>
              </div>
              <Separator className="bg-white/40" />
              <div className="space-y-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2 text-sm font-medium text-slate-800"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-slate-700">{item.label}</p>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 2: Credits Display */}
        <section className="space-y-4">
          <CreditsDisplayMega
            creditsRemaining={creditsRemaining}
            creditsTotal={creditsTotal}
            isLoading={isLoading}
            lastResetAt={lastResetAt}
          />

          {creditsRemaining === 0 && !isLoading && (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Créditos esgotados</AlertTitle>
              <AlertDescription>
                Você usou todos os seus 20 créditos deste mês. Eles serão renovados automaticamente no dia 1º.
                Enquanto isso, você ainda pode visualizar o histórico e dados da Mega da Virada.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-500/40 bg-blue-500/10">
            <AlertTitle>Como usar seus créditos</AlertTitle>
            <AlertDescription>
              Cada ação premium (gerar, analisar, regenerar, variar) consome 1 dos seus 20 créditos mensais.
              Você pode usá-los em qualquer loteria do app ou nas ferramentas especiais da Mega da Virada.
            </AlertDescription>
          </Alert>
        </section>

        {/* SECTION 3: Feature Cards */}
        <section className="grid gap-6 lg:grid-cols-2">
          {featureCards.map((feature) => (
            <Card
              key={feature.title}
              className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background p-6 hover:border-amber-500/40 transition-colors"
            >
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-200 border-amber-500/40">
                  {feature.creditCost} crédito
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-200">
                  Exclusivo Mega
                </Badge>
              </div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
            </Card>
          ))}
        </section>

        {/* SECTION 4: Historical Data & Trends */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-amber-500/20 bg-amber-500/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Star className="h-4 w-4 text-amber-400" />
              Histórico de prêmios (2009–2023)
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              {megaPrizeHistory.map((entry) => (
                <div key={entry.year} className="rounded-lg border border-amber-500/20 bg-background/30 p-3">
                  <div className="flex items-center justify-between text-foreground">
                    <p className="font-semibold">{entry.year}</p>
                    <span className="text-xs uppercase tracking-wide text-amber-300">{entry.prize}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.numbers}</p>
                  <p className="text-xs text-amber-300 mt-1">{entry.winners}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground border-t border-amber-500/20 pt-3">
                O prêmio saltou de R$ 144,9 mi em 2009 para quase R$ 600 mi na edição de 2023,
                refletindo o crescimento sustentado da arrecadação anual.
              </p>
            </div>
          </Card>

          {/* Placeholder para histórico de ações do usuário */}
          <Card className="border-border/80 bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <History className="h-4 w-4 text-primary" />
              Suas ações no evento
            </h3>
            <p className="text-sm text-muted-foreground">
              As ações que você realizar com a Mega da Virada aparecerão aqui:
              gerações, análises e variações exclusivas do evento.
            </p>
          </Card>
        </section>

        {/* SECTION 5: Social Impact & Probabilities */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-200">
              <Shield className="h-4 w-4" />
              Impacto financeiro e social
            </h3>
            {socialImpactFacts.map((fact) => (
              <div
                key={fact.title}
                className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-900/40 p-3 text-sm text-emerald-50"
              >
                {fact.icon && <fact.icon className="h-4 w-4 flex-shrink-0 text-emerald-200" />}
                <div>
                  <p className="font-semibold">{fact.title}</p>
                  <p className="text-emerald-100/80">{fact.description}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-emerald-100/70 border-t border-emerald-500/30 pt-3">
              A Mega da Virada é tanto entretenimento quanto ferramenta de arrecadação
              para políticas públicas — legitimação financeira que sustenta o evento.
            </p>
          </Card>

          <Card className="border border-blue-500/30 bg-blue-500/5 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-200">
              <PieChart className="h-4 w-4" />
              Probabilidades e mecânica
            </h3>
            {probabilityInsights.map((insight) => (
              <div key={insight.title} className="rounded-lg border border-blue-500/30 bg-blue-900/40 p-3 text-sm text-blue-50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{insight.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                    {insight.value}
                  </span>
                </div>
                <p className="text-blue-100/80 mt-1">{insight.note}</p>
              </div>
            ))}
          </Card>
        </section>

        {/* SECTION 6: Rules & Support */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-amber-500/30 bg-amber-500/5 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-200">
              <Shield className="h-4 w-4" />
              Regras do evento
            </h3>
            <ul className="space-y-2 text-sm text-amber-50/80">
              <li>• Use seus créditos mensais em qualquer função premium do app.</li>
              <li>• Cada ação especial da Mega consome 1 crédito (igual a outras loterias).</li>
              <li>• Créditos resetam automaticamente no dia 1º de cada mês.</li>
              <li>• Cooldown de 10 segundos entre gerações (anti-spam).</li>
              <li>• Suporte via WhatsApp disponível durante o evento.</li>
            </ul>
          </Card>

          <Alert className="border border-primary/40 bg-primary/10 p-6">
            <AlertTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Precisa de ajuda?
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3 pt-3">
              <span>
                Time de suporte dedicado via WhatsApp. Disponível para dúvidas sobre o evento,
                estratégias de jogo ou problemas técnicos.
              </span>
              <Button
                variant="default"
                onClick={() =>
                  window.open("https://wa.me/message/5O5UF7LOSPUWK1", "_blank")
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Abrir conversa
              </Button>
            </AlertDescription>
          </Alert>
        </section>
      </main>
    </div>
  );
};

export default MegaEvent;
