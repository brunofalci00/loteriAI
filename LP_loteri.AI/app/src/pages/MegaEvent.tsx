import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 space-y-10">
        <section className="space-y-4 text-center">
          <Badge className="mx-auto bg-amber-100/20 text-amber-50">Mega da Virada</Badge>
          <h1 className="text-3xl font-black sm:text-4xl">Registre suas apostas douradas aqui.</h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Esta é a central oficial do evento no app. Use os botões abaixo para escolher entre a geração guiada pela IA
            ou a criação manual com todo o branding da Mega da Virada.
          </p>
          <div className="mx-auto max-w-md shimmer-border rounded-3xl p-[1px]">
            <div className="rounded-[calc(var(--radius)*2)] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 px-6 py-5 text-emerald-950">
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
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {ctas.map((cta) => (
            <Card key={cta.title} className="border-amber-200/10 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <cta.icon className="h-5 w-5 text-amber-300" />
                  {cta.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{cta.description}</p>
                <Button
                  className="w-full rounded-full bg-emerald-950 text-amber-200 hover:bg-emerald-900"
                  onClick={() => navigate(cta.href)}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
