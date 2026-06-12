export function scoreDeal(deal, criteria) {
  const weights = criteria.dealScoreWeights || {};

  const priceScore = deal.estimatedTotal
    ? Math.max(0, Math.min(100, 100 - ((deal.estimatedTotal - criteria.maxTotalBudget) / criteria.maxTotalBudget) * 100))
    : 50;

  const familyFit = deal.familyFit ?? 60;
  const dateQuality = deal.dateQuality ?? 55;
  const travelConvenience = deal.travelConvenience ?? 55;
  const confidence = deal.confidence ?? 50;

  const weighted =
    priceScore * ((weights.price ?? 40) / 100) +
    familyFit * ((weights.familyFit ?? 25) / 100) +
    dateQuality * ((weights.dateQuality ?? 15) / 100) +
    travelConvenience * ((weights.travelConvenience ?? 10) / 100) +
    confidence * ((weights.confidence ?? 10) / 100);

  return Math.round(weighted);
}

export function labelDeal(score) {
  if (score >= 85) return 'Strong deal';
  if (score >= 70) return 'Worth watching';
  if (score >= 55) return 'Maybe';
  return 'Pass for now';
}
