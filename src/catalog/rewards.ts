import type { RewardAsset, SharedItem } from "./types";

export function formatRewardLabel(value: string): string {
  return value
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getRewardAsset(
  rewardType: string,
  assets?: Record<string, RewardAsset>,
  sharedItems?: Record<string, SharedItem>
): RewardAsset {
  const asset = assets?.[rewardType];
  if (asset) return asset;
  const shared = sharedItems?.[rewardType];
  if (shared) return { label: shared.label, icon: shared.icon };
  return { label: formatRewardLabel(rewardType) };
}
