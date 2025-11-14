import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2, PenLine } from "lucide-react";

const formatNumber = (value: number) => value.toString().padStart(2, "0");

const ctas = [
  {
    title: "Fazer jogo com IA",
    description: "Entre na sala exclusiva para gerar combinações guiadas pela IA treinada no histórico do evento.",
    icon: Wand2,
    href: "/mega-da-virada/jogo-ia",
  },
  {
    title: "Montar jogo manual",
    description: "Use o construtor manual com a paleta dourada e salve variações dedicadas à Mega da Virada.",
    icon: PenLine,
    href: "/mega-da-virada/manual",
  },
];

export default function MegaEvent() {
  const [timeLeft, setTimeLeft] = useState({ days: 48, hours: 12, minutes: 30 });
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes } = prev;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days = Math.max(days - 1, 0);
          }
        }
        return { days, hours, minutes };
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const countdown = useMemo(
    () => [
      { label: "dias", value: formatNumber(timeLeft.days) },
      { label: "horas", value: formatNumber(timeLeft.hours) },
      { label: "min", value: formatNumber(timeLeft.minutes) },
    ],
    [timeLeft]
  );

  const timeline = [
    { title: "Explore", text: "Veja a contagem, histórico e benefícios exclusivos antes de escolher a jornada." },
    { title: "Escolha o fluxo", text: "IA para análises guid​as ou manual para lapidar cada número dourado." },
    { title: "Salve e compartilhe", text: "Armazene suas combinações, exporte e acompanhe créditos sem sair da página." },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,25,22,0.9),_#020805)] text-foreground">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 space-y-12">
        <section className="mega-panel">
          <div className="mega-panel__inner space-y-4 text-center">
            <Badge className="mx-auto bg-amber-100/20 text-amber-50">Mega da Virada</Badge>
            <h1 className="text-3xl font-black sm:text-4xl text-white">Experiência VIP do maior sorteio do ano.</h1>
            <p className="mx-auto max-w-2xl text-sm mega-text-muted">
              Escolha como quer gerar seus jogos com a estética dourada oficial: IA especializada ou criação manual refinada.
            </p>
            <div className="mx-auto max-w-md mega-border rounded-[calc(var(--radius)*2)] p-[1px]">
              <div className="rounded-[calc(var(--radius)*2)] bg-gradient-to-br from-amber-200 to-amber-400 px-6 py-5 text-emerald-950">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900/70">
                  Contagem regressiva
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  {countdown.map((item) => (
                    <div key={item.label} className="flex-1">
                      <p className="text-3xl font-black">{item.value}</p>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-900/70">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold">R$ 850 milhões em jogo.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {ctas.map((cta) => (
            <div key={cta.title} className="mega-panel">
              <div className="mega-panel__inner h-full space-y-4 text-sm mega-text-muted">
                <div className="flex items-center gap-2 text-lg text-white">
                  <cta.icon className="h-5 w-5 text-amber-300" />
                  <span className="font-semibold">{cta.title}</span>
                </div>
                <p>{cta.description}</p>
                <Button
                  className="mega-button w-full"
                  onClick={() => navigate(cta.href)}
                >
                  Acessar jornada
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="mega-panel">
          <div className="mega-panel__inner mega-timeline">
            {timeline.map((step) => (
              <div key={step.title} className="mega-timeline-item">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs mega-text-muted">{step.text}</p>
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
