import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaEventHero } from "@/components/MegaEventHero";
import { CheckCircle2, Sparkles, LineChart, History, Shield } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Combos inteligentes",
    description: "Sugestões guiadas por IA com probabilidade calibrada para a Mega da Virada.",
  },
  {
    icon: LineChart,
    title: "Painéis históricos",
    description: "Visualize os padrões e a distribuição dos 15 últimos concursos especiais.",
  },
  {
    icon: History,
    title: "Replay de estratégias",
    description: "Compare jogos antigos com os novos palpites e salve variações favoritas.",
  },
  {
    icon: Shield,
    title: "Créditos unificados",
    description: "Nada de tokens extras: use os mesmos créditos do app em todas as ações premium.",
  },
];

const steps = [
  { title: "1. Configure", text: "Selecione seu orçamento de créditos e o volume de jogos." },
  { title: "2. Gere & ajuste", text: "Deixe a IA sugerir variações e refine manualmente." },
  { title: "3. Salve & exporte", text: "Envie os jogos para impressão ou compartilhe com o bolão." },
];

export default function MegaEvent() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-10 space-y-3">
          <Badge className="bg-emerald-600/20 text-emerald-100">Mega da Virada</Badge>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Centro estratégico para o maior sorteio do ano.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Esta página concentra todas as ferramentas especiais: contagem regressiva, planos guiados e relatórios
            históricos para montar apostas conscientes antes do dia 31.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Começar agora</Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Ver créditos disponíveis
            </Button>
          </div>
        </div>

        <MegaEventHero />

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border border-emerald-500/10 bg-card/60">
              <CardContent className="flex items-start gap-4 p-5">
                <benefit.icon className="mt-1 h-5 w-5 text-emerald-300" />
                <div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-white/5 bg-gradient-to-br from-[#05291f] to-[#03130d] p-6">
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <h2 className="text-2xl font-bold">Como funciona</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
