import { useQuery } from "@tanstack/react-query";
import { fetchLotteryDrawInfo } from "@/services/lotteryApi";
import { LotteryDrawInfo } from "@/types/lottery";

export const useLotteryDrawInfo = (lotteryType: string) => {
  return useQuery<LotteryDrawInfo, Error>({
    queryKey: ["lotteryDrawInfo", lotteryType],
    queryFn: () => fetchLotteryDrawInfo(lotteryType),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
