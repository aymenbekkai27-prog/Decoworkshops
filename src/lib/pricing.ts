import type { Job, MaterialUsage, Material } from '../types';

export const AREA_RATE_LARGE = 1900;
export const AREA_RATE_SMALL_MIN = 2300;
export const AREA_RATE_SMALL_MAX = 2400;
export const WORKER_AREA_RATE = 700;

export const SPOTLIGHT_CLIENT_RATE = 350;
export const SPOTLIGHT_WORKER_RATE = 250;
export const SPOTLIGHT_ADMIN_DIRECT_PROFIT = 100;

export interface PriceBreakdown {
  areaRate: number;
  areaCharge: number;
  spotlightCharge: number;
  totalClientBill: number;
  workerAreaPayout: number;
  workerSpotlightPayout: number;
  workerTotalPayout: number;
  adminDirectProfit: number;
}

export function getApplicableAreaRate(verifiedArea: number): number {
  if (verifiedArea > 10) return AREA_RATE_LARGE;
  return Math.round((AREA_RATE_SMALL_MIN + AREA_RATE_SMALL_MAX) / 2);
}

export function calculateJobPricing(job: Job): PriceBreakdown {
  const area = job.inspection?.verifiedArea ?? job.estimatedArea ?? 0;
  const spotlights = job.inspection?.spotlightsCount ?? 0;

  const override = job.manualOverride ?? {};
  const areaRate = override.areaRate ?? getApplicableAreaRate(area);
  const spotlightRate = override.spotlightRate ?? SPOTLIGHT_CLIENT_RATE;
  const workerAreaRate = override.workerAreaRate ?? WORKER_AREA_RATE;
  const workerSpotlightRate = override.workerSpotlightRate ?? SPOTLIGHT_WORKER_RATE;

  const areaCharge = area * areaRate;
  const spotlightCharge = spotlights * spotlightRate;
  const totalClientBill = areaCharge + spotlightCharge;

  const workerAreaPayout = area * workerAreaRate;
  const workerSpotlightPayout = spotlights * workerSpotlightRate;
  const workerTotalPayout = workerAreaPayout + workerSpotlightPayout;

  const adminDirectProfit = spotlights * SPOTLIGHT_ADMIN_DIRECT_PROFIT;

  return {
    areaRate,
    areaCharge,
    spotlightCharge,
    totalClientBill,
    workerAreaPayout,
    workerSpotlightPayout,
    workerTotalPayout,
    adminDirectProfit,
  };
}

export interface SettlementBreakdown {
  totalRevenue: number;
  materialCosts: number;
  workerPayout: number;
  deliveryFee: number;
  netProfit: number;
  adminShare: number;
  partnerShare: number;
  adminProfitSplit: number;
}

export function calculateSettlement(
  job: Job,
  materialUsages: MaterialUsage[],
  adminProfitSplit: number,
  deliveryFee: number = 0,
): SettlementBreakdown {
  const pricing = calculateJobPricing(job);
  const totalRevenue = pricing.totalClientBill;
  const materialCosts = materialUsages.reduce((sum, m) => sum + m.totalCost, 0);
  const workerPayout = pricing.workerTotalPayout;
  const effectiveDeliveryFee = job.manualOverride?.deliveryFee ?? deliveryFee;

  const netProfit = totalRevenue - materialCosts - workerPayout - effectiveDeliveryFee;
  const adminShare = Math.round((netProfit * adminProfitSplit) / 100);
  const partnerShare = netProfit - adminShare;

  return {
    totalRevenue,
    materialCosts,
    workerPayout,
    deliveryFee: effectiveDeliveryFee,
    netProfit,
    adminShare,
    partnerShare,
    adminProfitSplit,
  };
}

export function generateBOM(
  verifiedArea: number,
  materials: Material[],
): MaterialUsage[] {
  const usages: MaterialUsage[] = [];

  const placoMaterial = materials.find((m) => m.category === 'placo');
  if (placoMaterial) {
    const qty = Math.ceil(verifiedArea * 1.1);
    usages.push({
      materialId: placoMaterial.id,
      materialName: placoMaterial.name,
      quantity: qty,
      unitCost: placoMaterial.unitCost,
      totalCost: qty * placoMaterial.unitCost,
    });
  }

  const screwsMaterial = materials.find(
    (m) => m.category === 'consumable' && m.name.includes('براغي'),
  );
  if (screwsMaterial && verifiedArea > 0) {
    const boxesNeeded = Math.max(1, Math.ceil(verifiedArea * 0.1));
    const alreadyOpened =
      screwsMaterial.boxOpened && screwsMaterial.boxOpenedForJobId !== undefined;
    const unitCost = alreadyOpened ? 0 : screwsMaterial.unitCost;
    usages.push({
      materialId: screwsMaterial.id,
      materialName: screwsMaterial.name,
      quantity: boxesNeeded,
      unitCost,
      totalCost: boxesNeeded * unitCost,
    });
  }

  return usages;
}

export function formatDZD(amount: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' دج';
}
