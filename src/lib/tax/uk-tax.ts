/**
 * UK take-home pay estimate for England/Wales/Northern Ireland tax rates
 * (Scotland uses different income tax bands and is not modelled here).
 *
 * Figures are for the 2025/26 tax year — update TAX_YEAR and the constants
 * below when new rates are announced (usually each Spring Budget / Autumn
 * Statement). This is a simplified PAYE estimate: it assumes a standard
 * tax code, one job, no student loan, no benefits-in-kind, and no other
 * income. Treat the result as a planning estimate, not a payslip.
 */
export const TAX_YEAR_LABEL = "2025/26 (England/Wales/NI, estimate)";

const PERSONAL_ALLOWANCE = 12_570;
const PERSONAL_ALLOWANCE_TAPER_THRESHOLD = 100_000;
const BASIC_RATE_UPPER = 50_270;
const HIGHER_RATE_UPPER = 125_140;

const BASIC_RATE = 0.2;
const HIGHER_RATE = 0.4;
const ADDITIONAL_RATE = 0.45;

const NI_PRIMARY_THRESHOLD = 12_570;
const NI_UPPER_EARNINGS_LIMIT = 50_270;
const NI_MAIN_RATE = 0.08;
const NI_UPPER_RATE = 0.02;

export type PensionType = "none" | "salary_sacrifice" | "personal";

export interface TaxEstimateInput {
  /** Gross annual salary before any pension contribution. */
  annualSalary: number;
  /** Pension contribution as a percentage of gross annual salary (0-100). */
  pensionPercent: number;
  pensionType: PensionType;
}

export interface TaxEstimateResult {
  grossAnnual: number;
  pensionContributionAnnual: number;
  /** Income used for tax/NI purposes — lower than gross when salary-sacrificing. */
  taxableGrossAnnual: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTaxAnnual: number;
  nationalInsuranceAnnual: number;
  /** Personal-pension contributions are deducted from take-home; salary-sacrifice already reduced taxableGross. */
  netPensionDeductionAnnual: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
}

function calculateIncomeTax(taxableIncome: number): number {
  const basicBandSize = BASIC_RATE_UPPER - PERSONAL_ALLOWANCE;
  const higherBandSize = HIGHER_RATE_UPPER - BASIC_RATE_UPPER;

  let tax = 0;
  const basicAmount = Math.min(Math.max(taxableIncome, 0), basicBandSize);
  tax += basicAmount * BASIC_RATE;

  if (taxableIncome > basicBandSize) {
    const higherAmount = Math.min(taxableIncome - basicBandSize, higherBandSize);
    tax += higherAmount * HIGHER_RATE;
  }

  if (taxableIncome > basicBandSize + higherBandSize) {
    const additionalAmount = taxableIncome - basicBandSize - higherBandSize;
    tax += additionalAmount * ADDITIONAL_RATE;
  }

  return tax;
}

function calculateNationalInsurance(taxableGross: number): number {
  let ni = 0;
  if (taxableGross > NI_PRIMARY_THRESHOLD) {
    const mainBand = Math.min(taxableGross, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD;
    ni += mainBand * NI_MAIN_RATE;
  }
  if (taxableGross > NI_UPPER_EARNINGS_LIMIT) {
    ni += (taxableGross - NI_UPPER_EARNINGS_LIMIT) * NI_UPPER_RATE;
  }
  return ni;
}

export function estimateTakeHome({
  annualSalary,
  pensionPercent,
  pensionType,
}: TaxEstimateInput): TaxEstimateResult {
  const grossAnnual = Math.max(0, annualSalary);
  const pensionContributionAnnual =
    pensionType === "none" ? 0 : grossAnnual * (Math.max(0, pensionPercent) / 100);

  // Salary sacrifice reduces the salary itself, so it lowers both income tax
  // and National Insurance. A personal/relief-at-source pension doesn't
  // change gross pay for tax or NI purposes — it's deducted from take-home.
  const taxableGrossAnnual =
    pensionType === "salary_sacrifice" ? grossAnnual - pensionContributionAnnual : grossAnnual;

  let personalAllowance = PERSONAL_ALLOWANCE;
  if (taxableGrossAnnual > PERSONAL_ALLOWANCE_TAPER_THRESHOLD) {
    personalAllowance = Math.max(
      0,
      PERSONAL_ALLOWANCE - Math.floor((taxableGrossAnnual - PERSONAL_ALLOWANCE_TAPER_THRESHOLD) / 2)
    );
  }

  const taxableIncome = Math.max(0, taxableGrossAnnual - personalAllowance);
  const incomeTaxAnnual = calculateIncomeTax(taxableIncome);
  const nationalInsuranceAnnual = calculateNationalInsurance(taxableGrossAnnual);

  const netPensionDeductionAnnual = pensionType === "personal" ? pensionContributionAnnual : 0;

  const takeHomeAnnual =
    taxableGrossAnnual - incomeTaxAnnual - nationalInsuranceAnnual - netPensionDeductionAnnual;

  return {
    grossAnnual,
    pensionContributionAnnual,
    taxableGrossAnnual,
    personalAllowance,
    taxableIncome,
    incomeTaxAnnual,
    nationalInsuranceAnnual,
    netPensionDeductionAnnual,
    takeHomeAnnual,
    takeHomeMonthly: takeHomeAnnual / 12,
  };
}

/**
 * Estimates take-home pay for a single month that includes one-off extra
 * gross pay (overtime, bonus, etc.) on top of the usual 1/12 of salary.
 * The extra is annualised to apply the right marginal tax rate, then the
 * annual result is divided back down to a monthly figure — the standard
 * approximation used by take-home-pay calculators, since PAYE is actually
 * calculated cumulatively across the tax year rather than per payslip.
 */
export function estimateMonthlyTakeHomeWithExtra(
  settings: Pick<TaxEstimateInput, "annualSalary" | "pensionPercent" | "pensionType">,
  extraGrossThisMonth: number
): TaxEstimateResult {
  const equivalentAnnualSalary =
    settings.annualSalary + Math.max(0, extraGrossThisMonth) * 12;

  return estimateTakeHome({
    ...settings,
    annualSalary: equivalentAnnualSalary,
  });
}
