/**
 * Norvik Jewels pricing engine.
 *
 * Formula (from client, Aug 2026):
 *   RSP = (Gold Rate x Gold Weight) + Making Charges + Diamond Charges + GST
 *   Gold Rate = (MCX 24K Rate / 24) x Desired Karat
 *   Making Charges = MC% x Gold Value
 *   Diamond Charges = (Base rate/carat x Carat Required) + Color/Clarity/Cut variable charges
 *   GST = 3% always added on top of subtotal; catalog prices are shown GST-exclusive.
 *
 * IMPORTANT — currently using a fixed test gold rate (see TEST_GOLD_RATE_24K
 * below), not a live MCX feed. Swap in a live rate once:
 *   1. Real product data replaces the mock catalogue, and
 *   2. An MCX rate API provider is chosen (Metals.Dev / Metals-API / other).
 *
 * OPEN QUESTIONS for the client before this goes live:
 *   - Is the MCX rate quoted per gram or per 10 grams? (affects the /24 step)
 *   - Exact Making Charge % per category (rings vs earrings, etc.)
 *   - Exact Color / Clarity / Cut variable charge percentages
 */

export type PricingInput = {
  goldRate24kPer10g: number; // MCX 24K rate, quoted per 10 grams (standard MCX convention)
  desiredKarat: 9 | 14 | 18;
  goldWeightGrams: number;
  makingChargePercent: number; // e.g. 12 for 12%
  diamondCaratRequired: number; // total carat weight, e.g. 0.385
  diamondBaseRatePerCarat: number; // e.g. 100000 for ₹1L/carat
  colorChargePercent: number; // additive % on diamond base value
  clarityChargePercent: number;
  cutChargePercent: number;
  gstPercent: number; // e.g. 3
};

export type PricingResult = {
  effectiveGoldRate: number;
  goldValue: number;
  makingCharge: number;
  diamondBaseValue: number;
  diamondVariableCharge: number;
  diamondCharge: number;
  subtotalExGst: number;
  gstAmount: number;
  finalPrice: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculatePrice(input: PricingInput): PricingResult {
  // MCX rate is per 10 grams — convert to per-gram, then apply karat purity.
  // ⚠️ UNCONFIRMED with client — verify before going live. If the rate turns
  // out to be quoted per gram instead, remove the "/ 10" below.
  const goldRatePerGram24k = input.goldRate24kPer10g / 10;
  const effectiveGoldRate = (goldRatePerGram24k / 24) * input.desiredKarat;
  const goldValue = effectiveGoldRate * input.goldWeightGrams;

  // Making Charges = MC% x Gold Value
  const makingCharge = (input.makingChargePercent / 100) * goldValue;

  // Diamond Charges = base carat value + Color/Clarity/Cut variable charges
  const diamondBaseValue = input.diamondBaseRatePerCarat * input.diamondCaratRequired;
  const variablePercent =
    input.colorChargePercent + input.clarityChargePercent + input.cutChargePercent;
  const diamondVariableCharge = (variablePercent / 100) * diamondBaseValue;
  const diamondCharge = diamondBaseValue + diamondVariableCharge;

  const subtotalExGst = goldValue + makingCharge + diamondCharge;
  const gstAmount = (input.gstPercent / 100) * subtotalExGst;
  const finalPrice = subtotalExGst + gstAmount;

  return {
    effectiveGoldRate: round2(effectiveGoldRate),
    goldValue: round2(goldValue),
    makingCharge: round2(makingCharge),
    diamondBaseValue: round2(diamondBaseValue),
    diamondVariableCharge: round2(diamondVariableCharge),
    diamondCharge: round2(diamondCharge),
    subtotalExGst: round2(subtotalExGst),
    gstAmount: round2(gstAmount),
    finalPrice: round2(finalPrice),
  };
}

// Fixed test rate — client confirmed 24K rate = ₹1,00,000 per 10g for testing.
// Replace with a live API value once the provider is chosen.
export const TEST_GOLD_RATE_24K_PER_10G = 100000;