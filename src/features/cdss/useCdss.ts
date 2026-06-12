import { useMutation, useQuery } from '@tanstack/react-query';
import { cdssService } from '@/services/cdss.service';
import type { CdssContext } from './cdss.types';

export function useCdssRules() {
  return useQuery({ queryKey: ['cdss-rules'], queryFn: () => cdssService.loadRules() });
}

export function useCdssRecommend() {
  return useMutation({
    mutationFn: ({ screeningId, ctx }: { screeningId: string; ctx: CdssContext }) =>
      cdssService.recommend(screeningId, ctx),
  });
}
