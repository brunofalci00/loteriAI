import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Play, ShieldAlert, Sparkles } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

type ResultTarget = "mega" | "quina" | "quadra";

const SESSION_DEADLINE_KEY = "megaVirada.funnel.deadlineMs";
const SESSION_CAPACITY_KEY = "megaVirada.funnel.capacitySeed";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (secondsTotal: number) => {
  const seconds = Math.max(0, Math.floor(secondsTotal));
  const minutesPart = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsPart = String(seconds % 60).padStart(2, "0");
  return `${minutesPart}:${secondsPart}`;
};

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const uniqueRandomNumbers = (count: number, max: number) => {
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(1 + Math.floor(Math.random() * max));
  }
  return Array.from(picked).sort((a, b) => a - b);
};

const uniqueRandomNumbersSeeded = (count: number, max: number, seed: number) => {
  const rand = mulberry32(seed);
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(1 + Math.floor(rand() * max));
  }
  return Array.from(picked).sort((a, b) => a - b);
};

const getSessionDeadlineMs = (ttlSeconds: number) => {
  const existing = sessionStorage.getItem(SESSION_DEADLINE_KEY);
  const parsed = existing ? Number(existing) : NaN;
  const now = Date.now();
  if (Number.isFinite(parsed) && parsed > now) return parsed;
  const next = now + ttlSeconds * 1000;
  sessionStorage.setItem(SESSION_DEADLINE_KEY, String(next));
  return next;
};

const getCapacitySeed = () => {
  const existing = sessionStorage.getItem(SESSION_CAPACITY_KEY);
  const parsed = existing ? Number(existing) : NaN;
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  const next = Math.random();
  sessionStorage.setItem(SESSION_CAPACITY_KEY, String(next));
  return next;
};

const NumberBall = ({ value, variant }: { value: number | string; variant?: "hot" | "locked" | "neutral" }) => {
  const base =
    variant === "hot"
      ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
      : variant === "locked"
        ? "bg-secondary/70 text-muted-foreground blur-[1.5px]"
        : "bg-card/90 text-foreground";

  return (
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full grid place-items-center font-extrabold text-lg border border-primary/20 ${base}`}>
      {value}
    </div>
  );
};

const CheckoutButton = ({
  label,
  className,
  checkoutUrl,
  onClick,
}: {
  label: string;
  className?: string;
  checkoutUrl: string;
  onClick?: () => void;
}) => {
  return (
    <Button
      asChild
      size="lg"
      onClick={onClick}
      className={
        className ??
        "w-full text-xl md:text-2xl py-8 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold text-center glow-primary-strong pulse-glow shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl"
      }
    >
      <a href={checkoutUrl} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  );
};

const MegaVirada = () => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const checkoutUrl =
    (import.meta.env.VITE_CHECKOUT_URL as string | undefined) ?? "https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689";
  const offerHeadline = (import.meta.env.VITE_OFFER_HEADLINE as string | undefined) ?? "Acesso vitalício ao gerador";
  const offerPriceLine = (import.meta.env.VITE_OFFER_PRICE_LINE as string | undefined) ?? "R$97,00 vitalício";
  const offerCashLine = (import.meta.env.VITE_OFFER_CASH_LINE as string | undefined) ?? "Pagamento único • liberação imediata";
  const offerFootnote = (import.meta.env.VITE_OFFER_FOOTNOTE as string | undefined) ?? "Sem mensalidade. Sem renovação.";
  const funnelCountdownSecondsRaw = Number((import.meta.env.VITE_FUNNEL_COUNTDOWN_SECONDS as string | undefined) ?? 6 * 60);
  const funnelCountdownSeconds = Number.isFinite(funnelCountdownSecondsRaw) && funnelCountdownSecondsRaw > 0 ? funnelCountdownSecondsRaw : 6 * 60;

  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<ResultTarget>("mega");
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [cyclePoints, setCyclePoints] = useState(0);

  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [capacitySeed, setCapacitySeed] = useState<number | null>(null);

  const [generated, setGenerated] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPartial, setShowPartial] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const generationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setDeadlineMs(getSessionDeadlineMs(funnelCountdownSeconds));
    setCapacitySeed(getCapacitySeed());
  }, [funnelCountdownSeconds]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (step === 0) trackPixelEvent("MegaViradaFunnelView");
  }, [step]);

  const timeLeftSeconds = useMemo(() => {
    if (!deadlineMs) return funnelCountdownSeconds;
    return Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
  }, [deadlineMs, nowMs, funnelCountdownSeconds]);

  const tickSpeedUp = timeLeftSeconds <= 20;

  const remainingActivations = useMemo(() => {
    const seed = capacitySeed ?? 0.5;
    const baseCapacity = Math.round(8 + seed * 10);
    const drainByTime = Math.floor((funnelCountdownSeconds - timeLeftSeconds) / 45);
    const drainBySteps = step <= 1 ? 0 : step - 1;
    return clamp(baseCapacity - drainByTime - drainBySteps, 0, baseCapacity);
  }, [capacitySeed, funnelCountdownSeconds, timeLeftSeconds, step]);

  const timerPercent = clamp((timeLeftSeconds / Math.max(1, funnelCountdownSeconds)) * 100, 0, 100);

  const goNext = () => setStep((prev) => prev + 1);

  const beginGeneration = () => {
    trackPixelEvent("MegaViradaFunnelGenerationStart", { target });
    setIsGenerating(true);
    setShowPartial(false);
    setIsLocked(false);
    setGenerated(uniqueRandomNumbers(6, 60));

    if (generationTimerRef.current) window.clearInterval(generationTimerRef.current);
    generationTimerRef.current = window.setInterval(() => {
      setGenerated(uniqueRandomNumbers(6, 60));
    }, 120);

    window.setTimeout(() => setShowPartial(true), 1350);
    window.setTimeout(() => {
      if (generationTimerRef.current) window.clearInterval(generationTimerRef.current);
      generationTimerRef.current = null;
      setIsGenerating(false);
      setIsLocked(true);
      trackPixelEvent("MegaViradaFunnelBlocked", { progress: 93 });
    }, 2600);
  };

  useEffect(() => {
    if (step !== 7) return;
    beginGeneration();
    return () => {
      if (generationTimerRef.current) window.clearInterval(generationTimerRef.current);
      generationTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepTitle = useMemo(() => {
    const titles = ["Entrada", "Verificação", "Verificação", "Verificação", "Mapa", "Provas", "Ajuste", "Geração", "Escassez", "Ativação"];
    return titles[step] ?? "Ativação";
  }, [step]);

  const showStickyCTA = step >= 9;
  const totalSteps = 10;

  const priorityNumbers = useMemo(() => {
    const seed = Math.floor(((capacitySeed ?? 0.5) * 1_000_000) + ((deadlineMs ?? Date.now()) % 1_000_000));
    return uniqueRandomNumbersSeeded(18, 60, seed);
  }, [capacitySeed, deadlineMs]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="absolute inset-0 opacity-30 pointer-events-none jackpot-radial" />

      <div className="slide-frame relative z-10 space-y-6 pb-28 md:pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-[0.3em]">
              {stepTitle}
            </Badge>
            <Badge className={`${timeLeftSeconds <= 60 ? "bg-destructive text-destructive-foreground" : ""}`}>Janela: {formatTime(timeLeftSeconds)}</Badge>
          </div>
          <Badge variant="outline" className="border-primary/30">
            {step + 1}/{totalSteps}
          </Badge>
        </div>

        <div className="timer-shell">
          <div className={`timer-bar ${tickSpeedUp ? "timer-bar--fast" : ""}`} style={{ width: `${timerPercent}%` }} />
        </div>

        {step === 0 && (
          <Card className="p-6 sm:p-8 bg-card/80 border border-primary/30 rounded-3xl landing-hero space-y-5">
            <div className="space-y-4">
              <p className="meta-label">PAINEL EM ENCERRAMENTO • CICLO ATIVO DA MEGA DA VIRADA</p>
              <h1 className="heading-hero text-glow">A Mega da Virada NÃO vai ficar acumulada.</h1>
              <p className="heading-3 text-primary">
                O sistema está ativo neste momento.
                <span className="block text-foreground font-extrabold mt-2">Quem entra antes, joga em condição diferente.</span>
              </p>

              <Card className="p-5 bg-primary/5 border border-primary/25 rounded-2xl">
                <div className="space-y-3">
                  <p className="text-lg sm:text-xl font-extrabold text-foreground">O sistema está recalculando jogos com base em concursos anteriores da Mega da Virada.</p>
                  <p className="text-base sm:text-lg font-semibold text-muted-foreground">
                    Entradas antecipadas evitam padrões comuns
                    <span className="block">antes do pico de apostas.</span>
                  </p>
                </div>
              </Card>

              <p className="text-base sm:text-lg font-semibold text-muted-foreground">
                Acesso liberado apenas durante este ciclo.
                <span className="block">Quando a janela fechar, novas entradas não participam do cálculo atual.</span>
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  trackPixelEvent("MegaViradaFunnelEnter");
                  goNext();
                }}
                size="lg"
                className="w-full text-xl md:text-2xl py-8 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold glow-primary-strong pulse-glow rounded-2xl"
              >
                ENTRAR NO SISTEMA AGORA
              </Button>
              <p className="text-xs text-muted-foreground">
                Ferramenta de apoio para geração de jogos. Resultados variam. Não há garantia de prêmio.
              </p>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-6">
            <div className="space-y-3">
              <p className="meta-label">ETAPA 1 DE 3 • INÍCIO DA VERIFICAÇÃO</p>
              <h2 className="heading-1 text-glow">Responda com calma.</h2>
              <p className="text-lg text-muted-foreground font-semibold">Isso ajuda o sistema a ajustar o processo.</p>
            </div>

            <Card className="p-5 bg-primary/5 border border-primary/25 rounded-2xl">
              <div className="space-y-3">
                <p className="meta-label">Progresso do ciclo</p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-4xl font-extrabold text-foreground">
                    {cyclePoints} <span className="text-muted-foreground font-bold">/ 30</span>
                  </p>
                  <Badge variant="outline" className="border-primary/30">
                    Pontos usados automaticamente
                  </Badge>
                </div>
                <Progress value={(cyclePoints / 30) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Esses pontos são usados automaticamente para liberar o Mapa de Números Prioritários.
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-secondary/30 border border-primary/20 rounded-3xl space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">Você acompanha a Mega da Virada de perto?</p>
                <p className="text-sm text-muted-foreground font-semibold">Responda do jeito que você falaria normalmente.</p>
              </div>

              <div className="space-y-3">
                {[
                  "Sim, acompanho e sei que o prêmio é muito alto",
                  "Sei que é alto, mas não acompanho tanto",
                  "Não acompanho, quero entender como funciona",
                ].map((label) => (
                  <Button
                    key={label}
                    variant="secondary"
                    className="w-full py-7 rounded-2xl text-base sm:text-lg font-extrabold justify-start text-left whitespace-normal"
                    onClick={() => {
                      trackPixelEvent("MegaViradaFunnelVerificationAnswer");
                      setCyclePoints((prev) => Math.min(prev + 10, 30));
                      goNext();
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>

            <p className="text-xs text-muted-foreground">
              Nenhuma resposta altera chances ou garante resultados. O sistema apenas ajusta a visualização das próximas etapas.
            </p>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-6">
            <div className="space-y-3">
              <p className="meta-label">ETAPA 2 DE 3 • CONTINUIDADE DA VERIFICAÇÃO</p>
              <h2 className="heading-1 text-glow">Responda com calma.</h2>
              <p className="text-lg text-muted-foreground font-semibold">Suas respostas ajudam o sistema a ajustar a análise.</p>
            </div>

            <Card className="p-5 bg-primary/5 border border-primary/25 rounded-2xl">
              <div className="space-y-3">
                <p className="meta-label">Progresso do ciclo</p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-4xl font-extrabold text-foreground">
                    {cyclePoints} <span className="text-muted-foreground font-bold">/ 30</span>
                  </p>
                  <Badge variant="outline" className="border-primary/30">
                    Pontos usados automaticamente
                  </Badge>
                </div>
                <Progress value={(cyclePoints / 30) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Esses pontos são usados automaticamente para liberar o Mapa de Números Prioritários.
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-secondary/30 border border-primary/20 rounded-3xl space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Você já apostou seguindo a intuição
                  <span className="block">e sentiu que nunca passa dos mesmos pontos?</span>
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Sempre. Escolho, mas nunca passo dos mesmos pontos",
                  "Jogo às vezes, mas já desanimei",
                  "Ainda não jogo, quero começar com estratégia",
                ].map((label) => (
                  <Button
                    key={label}
                    variant="secondary"
                    className="w-full py-7 rounded-2xl text-base sm:text-lg font-extrabold justify-start text-left whitespace-normal"
                    onClick={() => {
                      trackPixelEvent("MegaViradaFunnelVerificationAnswer", { step: 2 });
                      setCyclePoints((prev) => Math.min(prev + 10, 30));
                      goNext();
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-6">
            <div className="space-y-3">
              <p className="meta-label">ETAPA 3 DE 3 • FINAL DA VERIFICAÇÃO</p>
              <h2 className="heading-1 text-glow">Responda com calma.</h2>
            </div>

            <Card className="p-5 bg-primary/5 border border-primary/25 rounded-2xl">
              <div className="space-y-3">
                <p className="meta-label">Progresso do ciclo</p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-4xl font-extrabold text-foreground">
                    {cyclePoints} <span className="text-muted-foreground font-bold">/ 30</span>
                  </p>
                  <Badge variant="outline" className="border-primary/30">
                    Pontos usados automaticamente
                  </Badge>
                </div>
                <Progress value={(cyclePoints / 30) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Esses pontos liberam a visualização do Mapa de Números Prioritários.
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-secondary/30 border border-primary/20 rounded-3xl space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Quer ver o sistema que analisou concursos anteriores
                  <span className="block">montar um jogo para você agora?</span>
                </p>
              </div>

              <div className="space-y-3">
                {["Quero ver agora", "Quero entender como funciona", "Estou curioso, pode liberar"].map((label) => (
                  <Button
                    key={label}
                    variant="secondary"
                    className="w-full py-7 rounded-2xl text-base sm:text-lg font-extrabold justify-start text-left whitespace-normal"
                    onClick={() => {
                      trackPixelEvent("MegaViradaFunnelVerificationAnswer", { step: 3 });
                      setCyclePoints((prev) => Math.min(prev + 10, 30));
                      goNext();
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-6">
            <div className="space-y-3">
              <p className="meta-label">Acesso desbloqueado</p>
              <h2 className="heading-1 text-glow">Acesso desbloqueado ao Mapa dos Números Quentes</h2>
              <p className="text-lg text-muted-foreground font-semibold">Suas respostas liberaram o acesso ao mapa.</p>
            </div>

            <Card className="p-5 bg-primary/5 border border-primary/25 rounded-2xl">
              <div className="space-y-3">
                <p className="meta-label">Progresso concluído</p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-4xl font-extrabold text-foreground">
                    {cyclePoints} <span className="text-muted-foreground font-bold">/ 30</span>
                  </p>
                  <Badge className="bg-primary text-primary-foreground">30/30</Badge>
                </div>
                <Progress value={(cyclePoints / 30) * 100} className="h-2" />
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-secondary/30 border border-primary/20 rounded-3xl space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary text-glow tracking-wide">MAPA DOS NÚMEROS PRIORITÁRIOS</p>
                <p className="text-base sm:text-lg text-muted-foreground font-semibold">
                  Este mapa é gerado a partir da análise de concursos anteriores da Mega.
                </p>
              </div>

              <div className="rounded-3xl border border-primary/20 bg-card/60 p-5 space-y-4">
                <p className="text-base sm:text-lg font-extrabold text-foreground">
                  Não é chute. São probabilidades organizadas para evitar escolhas comuns e apoiar quem quer jogar com critério.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {priorityNumbers.map((n) => (
                    <NumberBall key={n} value={String(n).padStart(2, "0")} variant="hot" />
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-destructive/10 border border-destructive/40 rounded-2xl">
                <p className="font-extrabold text-foreground">
                  Acesso disponível enquanto este painel estiver aberto.
                  <span className="block text-muted-foreground font-semibold mt-1">
                    Se você sair ou atualizar a página, o sistema pode bloquear a visualização.
                  </span>
                </p>
              </Card>
            </Card>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-semibold text-center">Próxima etapa: ver como o sistema se comporta na prática.</p>
              <Button
                onClick={() => {
                  trackPixelEvent("MegaViradaFunnelMapContinue");
                  goNext();
                }}
                size="lg"
                className="w-full text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold rounded-2xl glow-primary-strong"
              >
                IR PARA A PRÓXIMA ETAPA
              </Button>
            </div>
          </Card>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-4">
              <h2 className="heading-1 text-glow">Prova que esmaga.</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <p className="meta-label">Prêmios (relatos)</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary text-glow">+R$ milhões</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <p className="meta-label">Mega</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-foreground">3 vencedores</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <p className="meta-label">Acertos</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-foreground">centenas de Quinas</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Prints/vídeos são de usuários e não garantem resultados futuros.
              </p>
            </Card>

          <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4 bg-card/85 border border-primary/20 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Vídeo</p>
                  <Badge variant="outline" className="border-primary/30">
                    prova
                  </Badge>
                </div>
                <div className="video-shell">
                  <video src={`${baseUrl}video/demo.mp4`} controls playsInline className="w-full h-full object-cover" />
                </div>
              </Card>
              <Card className="p-4 bg-card/85 border border-primary/20 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Vídeo</p>
                  <Badge variant="outline" className="border-primary/30">
                    prova
                  </Badge>
                </div>
                <div className="video-shell">
                  <video src={`${baseUrl}video/slot.mp4`} controls playsInline className="w-full h-full object-cover" />
                </div>
              </Card>
              <Card className="p-4 bg-card/85 border border-primary/20 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Print</p>
                  <Badge variant="outline" className="border-primary/30">
                    prova
                  </Badge>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-secondary/30 overflow-hidden">
                  <img src="/placeholder.svg" alt="Print de prova" className="w-full h-56 object-cover opacity-80" />
                </div>
              </Card>
              <Card className="p-4 bg-card/85 border border-primary/20 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Print</p>
                  <Badge variant="outline" className="border-primary/30">
                    prova
                  </Badge>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-secondary/30 overflow-hidden">
                  <img src="/placeholder.svg" alt="Print de prova" className="w-full h-56 object-cover opacity-80" />
                </div>
              </Card>
            </div>

            <Button
              onClick={() => {
                trackPixelEvent("MegaViradaFunnelProofCTA");
                goNext();
              }}
              size="lg"
              className="w-full text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold rounded-2xl glow-primary-strong"
            >
              QUERO ESSE RESULTADO
            </Button>
          </div>
        )}

        {step === 6 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-5">
            <div className="space-y-2">
              <h2 className="heading-1 text-glow">Ilusão de controle (do jeito certo).</h2>
              <p className="text-lg text-muted-foreground font-semibold">Escolha o tipo de resultado desejado:</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { key: "mega", label: "Mega" },
                  { key: "quina", label: "Quina" },
                  { key: "quadra", label: "Quadra" },
                ] as const
              ).map((item) => (
                <Button
                  key={item.key}
                  variant={target === item.key ? "default" : "secondary"}
                  className={`py-7 text-lg font-extrabold rounded-2xl ${target === item.key ? "glow-primary" : ""}`}
                  onClick={() => {
                    setTarget(item.key);
                    setStatusLine("Sistema ajustado.");
                    window.setTimeout(() => {
                      setStatusLine(null);
                      trackPixelEvent("MegaViradaFunnelTargetPicked", { target: item.key });
                      goNext();
                    }, 650);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {statusLine && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="font-bold text-foreground">{statusLine}</p>
              </div>
            )}
          </Card>
        )}

        {step === 7 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
            <div className="relative z-10 space-y-2">
              <h2 className="heading-1 text-glow">Gerando agora…</h2>
              <p className="text-lg text-muted-foreground font-semibold">Você está a poucos segundos de ver o jogo.</p>
            </div>

            <div className="relative z-10 rounded-3xl border border-primary/25 bg-secondary/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Alvo: {target.toUpperCase()}</Badge>
                <Badge className={`${isGenerating ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {isGenerating ? "AO VIVO" : "FINALIZANDO"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {generated.map((n, idx) => {
                  if (!showPartial) return <NumberBall key={`${n}-${idx}`} value={String(n).padStart(2, "0")} variant="neutral" />;
                  if (idx < 5) return <NumberBall key={`${n}-${idx}`} value={String(n).padStart(2, "0")} variant="hot" />;
                  return <NumberBall key={`${n}-${idx}`} value={"??"} variant="locked" />;
                })}
              </div>

              {showPartial && (
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-extrabold text-foreground">Sinal de “possível Quina” detectado.</p>
                    <p className="text-sm text-muted-foreground font-semibold">Faltou liberar o último ajuste.</p>
                  </div>
                </div>
              )}
            </div>

            {isLocked && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm grid place-items-center p-6 z-20">
                <div className="w-full max-w-md space-y-4 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-destructive/15 border border-destructive/40 grid place-items-center">
                    <Lock className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="heading-2 text-destructive text-glow">ACESSO BLOQUEADO</h3>
                  <p className="text-lg font-extrabold text-foreground">Você chegou a 93% do processo.</p>
                  <div className="space-y-2">
                    <Progress value={93} className="h-3" />
                    <p className="text-sm text-muted-foreground font-semibold">Sem ativação, o sistema não finaliza o jogo.</p>
                  </div>
                  <Button
                    onClick={() => {
                      trackPixelEvent("MegaViradaFunnelTryUnlock");
                      goNext();
                    }}
                    size="lg"
                    className="w-full text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold rounded-2xl glow-primary-strong"
                  >
                    TENTAR LIBERAR AGORA
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {step === 8 && (
          <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h2 className="heading-1 text-glow">Escassez real.</h2>
              <p className="text-lg text-muted-foreground font-semibold">Restam poucas ativações nesta janela.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                <p className="meta-label">Ativações restantes</p>
                <p className={`text-5xl font-extrabold ${remainingActivations <= 3 ? "text-destructive text-glow" : "text-primary text-glow"}`}>
                  {remainingActivations}
                </p>
              </div>
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                <p className="meta-label">Tempo</p>
                <p className={`text-5xl font-extrabold ${timeLeftSeconds <= 60 ? "text-destructive text-glow" : "text-primary text-glow"}`}>
                  {formatTime(timeLeftSeconds)}
                </p>
              </div>
            </div>

            <Card className="p-4 bg-destructive/10 border border-destructive/40 rounded-2xl">
              <p className="font-extrabold text-foreground">
                Quando fechar, o sistema continua sem você.
                <span className="block text-muted-foreground font-semibold mt-1">Quem entra antes, joga diferente. Quem entra depois, fica com o resto.</span>
              </p>
            </Card>

            <Button
              onClick={() => {
                trackPixelEvent("MegaViradaFunnelScarcityCTA");
                goNext();
              }}
              size="lg"
              className="w-full text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold rounded-2xl glow-primary-strong pulse-glow"
            >
              LIBERAR ACESSO AGORA
            </Button>
          </Card>
        )}

        {step >= 9 && (
          <div className="space-y-5">
            <Card className="p-6 sm:p-8 bg-card/85 border border-primary/25 rounded-3xl space-y-4">
              <p className="meta-label">Oferta • ativação imediata</p>
              <h2 className="heading-1 text-glow">Ou você entra agora, ou vai assistir outra pessoa ganhar.</h2>

              <Card className="p-5 bg-gradient-to-br from-black/40 via-secondary/80 to-gold/20 border border-primary rounded-3xl space-y-2 glow-primary-strong">
                <p className="text-xl font-extrabold text-foreground">{offerHeadline}</p>
                <p className="text-6xl font-extrabold text-primary text-glow">{offerPriceLine}</p>
                <p className="text-lg font-bold text-foreground">{offerCashLine}</p>
                <p className="text-sm text-muted-foreground font-semibold">{offerFootnote}</p>
              </Card>

              <p className="text-sm text-muted-foreground font-semibold">
                Ativação libera o ajuste final e destrava o jogo completo.
              </p>
            </Card>

            <CheckoutButton
              label="ATIVAR AGORA"
              checkoutUrl={checkoutUrl}
              onClick={() => trackPixelEvent("MegaViradaFunnelActivateClick")}
              className="w-full text-2xl py-9 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold text-center glow-primary-strong pulse-glow shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl"
            />

            <div className="text-center text-xs text-muted-foreground">
              <p>Ferramenta para gerar jogos. Aposta oficial é feita na lotérica/app da Caixa. Não há garantia de prêmio.</p>
            </div>
          </div>
        )}
      </div>

      {showStickyCTA && step >= 9 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
          <CheckoutButton
            label="ATIVAR AGORA"
            checkoutUrl={checkoutUrl}
            onClick={() => trackPixelEvent("MegaViradaFunnelActivateClickSticky")}
            className="w-full text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold text-center glow-primary-strong pulse-glow shadow-2xl rounded-2xl"
          />
        </div>
      )}

      {step === 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
          <Button
            onClick={() => {
              trackPixelEvent("MegaViradaFunnelProofCTASticky");
              goNext();
            }}
            size="lg"
            className="w-full text-lg py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold glow-primary-strong rounded-2xl"
          >
            QUERO ESSE RESULTADO
          </Button>
        </div>
      )}

      {step === 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
          <Button
            onClick={() => {
              trackPixelEvent("MegaViradaFunnelEnterSticky");
              goNext();
            }}
            size="lg"
            className="w-full text-lg py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-extrabold glow-primary-strong rounded-2xl"
          >
            <span className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> ENTRAR AGORA
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MegaVirada;
