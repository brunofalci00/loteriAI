import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Sparkles, LineChart, Download, Zap } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Escolha sua Loteria",
      description: "Selecione entre Mega-Sena, Quina, Lotofácil e outras modalidades disponíveis.",
      icon: Sparkles,
    },
    {
      number: 2,
      title: "Análise Inteligente",
      description: "Nossa IA analisa milhares de resultados históricos e identifica padrões estatísticos.",
      icon: LineChart,
    },
    {
      number: 3,
      title: "Receba Combinações",
      description: "Obtenha sugestões de números otimizadas baseadas em análise preditiva avançada.",
      icon: Zap,
    },
    {
      number: 4,
      title: "Exporte e Jogue",
      description: "Baixe suas combinações em formato compatível com casas lotéricas.",
      icon: Download,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Como Funciona
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aumente suas chances em 4 passos simples
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.number}
                className="p-6 hover:shadow-lg transition-all duration-300 border-border/50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary mb-4">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Por que escolher o Loter.AI?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2 text-primary">Tecnologia Avançada</h3>
                <p className="text-sm text-muted-foreground">
                  Utilizamos inteligência artificial e algoritmos estatísticos para analisar milhões de combinações.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Atualizações Automáticas</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa base de dados é atualizada automaticamente após cada sorteio oficial.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Múltiplas Loterias</h3>
                <p className="text-sm text-muted-foreground">
                  Suporte para todas as principais modalidades da Caixa Econômica Federal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Fácil Exportação</h3>
                <p className="text-sm text-muted-foreground">
                  Exporte suas combinações em formatos compatíveis com as casas lotéricas.
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
