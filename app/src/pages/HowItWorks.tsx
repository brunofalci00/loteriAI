import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  LineChart,
  Coins,
  Heart,
  PlusCircle,
  RefreshCw,
  Share2,
  Calendar,
  Zap,
} from "lucide-react";

const HowItWorks = () => {
  const mainFeatures = [
    {
      icon: LineChart,
      title: "Análise Inteligente com IA",
      description:
        "Nossa IA analisa milhares de resultados históricos e identifica padrões estatísticos para gerar combinações otimizadas.",
      color: "text-blue-500",
      badge: null,
    },
    {
      icon: PlusCircle,
      title: "Crie Jogos Manualmente",
      description:
        "Monte seus próprios jogos e receba análise completa da IA com score de 0-10, sugestões de melhoria e 5 variações otimizadas.",
      color: "text-purple-500",
      badge: "Novo",
    },
    {
      icon: Heart,
      title: "Salve e Organize",
      description:
        "Salve até 50 jogos favoritos, organize por loteria, edite nomes personalizados e acesse seu histórico completo.",
      color: "text-red-500",
      badge: "Novo",
    },
    {
      icon: Coins,
      title: "Sistema de Créditos",
      description:
        "Receba 50 créditos gratuitos todo mês para usar em análises, regenerações e variações. Salvar jogos é sempre gratuito!",
      color: "text-yellow-500",
      badge: "Gratuito",
    },
  ];

  const detailedSteps = [
    {
      number: 1,
      title: "Escolha sua Modalidade",
      description:
        "Selecione entre Mega-Sena, Lotofácil, Lotomania e outras modalidades. Cada uma com análise específica.",
      icon: Sparkles,
    },
    {
      number: 2,
      title: "Geração por IA ou Manual",
      description:
        "Deixe a IA gerar 10 combinações otimizadas (1 crédito) ou crie manualmente seu jogo e receba análise completa.",
      icon: Zap,
    },
    {
      number: 3,
      title: "Analise e Otimize",
      description:
        "Veja análise detalhada: números quentes/frios, distribuição par/ímpar, score visual com estrelas e sugestões da IA.",
      icon: LineChart,
    },
    {
      number: 4,
      title: "Salve seus Favoritos",
      description:
        "Salve até 50 jogos (gratuito!), edite nomes, organize por tipo e acesse quando quiser.",
      icon: Heart,
    },
    {
      number: 5,
      title: "Regenere e Varie",
      description:
        "Regenere novas combinações (1 crédito) ou gere 5 variações do seu jogo manual mantendo 60-70% dos números originais.",
      icon: RefreshCw,
    },
    {
      number: 6,
      title: "Exporte e Compartilhe",
      description:
        "Exporte para TXT ou compartilhe direto no WhatsApp com formatação profissional e estatísticas.",
      icon: Share2,
    },
  ];

  const creditsInfo = [
    {
      action: "Gerar Análise IA",
      cost: "1 crédito",
      description: "Analisa e gera 10 jogos otimizados",
      icon: Sparkles,
    },
    {
      action: "Regenerar Jogos",
      cost: "1 crédito",
      description: "Novas combinações da mesma análise",
      icon: RefreshCw,
    },
    {
      action: "Gerar Variações",
      cost: "1 crédito",
      description: "5 variações do seu jogo manual",
      icon: PlusCircle,
    },
    {
      action: "Criar Manual",
      cost: "Gratuito",
      description: "Monte seus jogos sem custo",
      icon: PlusCircle,
    },
    {
      action: "Salvar Jogos",
      cost: "Gratuito",
      description: "Até 50 jogos salvos",
      icon: Heart,
    },
    {
      action: "Exportar",
      cost: "Gratuito",
      description: "TXT ou WhatsApp ilimitado",
      icon: Share2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Como Funciona o Loter.AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Aumente suas chances com inteligência artificial, criação manual, análise
            detalhada e muito mais
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 relative overflow-hidden"
              >
                {feature.badge && (
                  <Badge className="absolute top-3 right-3 text-xs">
                    {feature.badge}
                  </Badge>
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <Icon className={`h-12 w-12 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed Steps */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Passo a Passo Completo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {detailedSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="p-6 border-border/50">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Credits System */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sistema de Créditos</h2>
                <p className="text-sm text-muted-foreground">
                  50 créditos gratuitos todo mês
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {creditsInfo.map((item, index) => {
                const Icon = item.icon;
                const isFree = item.cost === "Gratuito";
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isFree
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                        : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${isFree ? "text-green-600" : "text-primary"}`} />
                      <span className="font-medium text-sm">{item.action}</span>
                    </div>
                    <Badge variant={isFree ? "secondary" : "default"} className="mb-2 text-xs">
                      {item.cost}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <strong>Reset automático:</strong> Seus créditos são renovados todo dia 1º
                de cada mês às 00:00 (horário de Brasília)
              </p>
            </div>
          </Card>
        </div>

        {/* Why Choose */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 border-primary/20">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Por que escolher o Loter.AI?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Tecnologia Avançada
                </h3>
                <p className="text-sm text-muted-foreground">
                  IA e algoritmos estatísticos analisam milhões de combinações e padrões
                  históricos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Atualizações Automáticas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Base de dados atualizada automaticamente após cada sorteio oficial.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Múltiplas Loterias
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suporte completo para todas as modalidades da Caixa Econômica Federal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Criação Manual
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monte seus jogos e receba análise profissional com sugestões de melhoria.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Organização Total
                </h3>
                <p className="text-sm text-muted-foreground">
                  Salve, organize e acesse seus jogos favoritos a qualquer momento.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Fácil Exportação
                </h3>
                <p className="text-sm text-muted-foreground">
                  Exporte em TXT ou compartilhe direto no WhatsApp com formatação profissional.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
