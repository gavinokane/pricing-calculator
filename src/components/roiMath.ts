export const benefitsMultiplier = 1.3;

export interface RoiInputs {
  hoursPerWeek: number;
  numPeople: number;
  hourlyRate: number;
  automationLevel: number;
  errorRate: number;
  errorCost: number;
  implementationCost: number;
  annualDoozerCost: number;
}

export interface RoiResult {
  annualLaborCost: number;
  annualErrorCost: number;
  totalCurrentCost: number;
  remainingLaborCost: number;
  netAnnualSavings: number;
  hoursFreedPerWeek: number;

  year1NetCashFlow: number;
  year2NetCashFlow: number;
  year3NetCashFlow: number;

  year1ROI: number | null;
  year2ROI: number | null;
  year3ROI: number | null;

  returnPerDollar3yr: number | null;

  paybackMonths: number | null;
}

export function computeRoi(inputs: RoiInputs): RoiResult {
  const {
    hoursPerWeek,
    numPeople,
    hourlyRate,
    automationLevel,
    errorRate,
    errorCost,
    implementationCost,
    annualDoozerCost,
  } = inputs;

  const totalHourlyRate = hourlyRate * benefitsMultiplier;
  const annualLaborCost = hoursPerWeek * numPeople * totalHourlyRate * 52;
  const annualErrorCost =
    hourlyRate > 0
      ? annualLaborCost * (errorRate / 100) * (errorCost / hourlyRate)
      : 0;
  const totalCurrentCost = annualLaborCost + annualErrorCost;

  const automationFraction = automationLevel / 100;
  const remainingLaborCost = annualLaborCost * (1 - automationFraction);
  const totalNewCost = remainingLaborCost + annualDoozerCost;
  const netAnnualSavings = totalCurrentCost - totalNewCost;
  const hoursFreedPerWeek = hoursPerWeek * automationFraction;

  const year1NetCashFlow = netAnnualSavings - implementationCost;
  const year2NetCashFlow = netAnnualSavings * 2 - implementationCost;
  const year3NetCashFlow = netAnnualSavings * 3 - implementationCost;

  const denom = implementationCost;
  const ratioPct = (numerator: number) =>
    denom > 0 ? (numerator / denom) * 100 : null;

  const year1ROI = ratioPct(year1NetCashFlow);
  const year2ROI = ratioPct(year2NetCashFlow);
  const year3ROI = ratioPct(year3NetCashFlow);

  const returnPerDollar3yr =
    denom > 0 ? (denom + year3NetCashFlow) / denom : null;

  const paybackMonths =
    netAnnualSavings > 0 && implementationCost > 0
      ? (implementationCost / netAnnualSavings) * 12
      : implementationCost === 0 && netAnnualSavings > 0
        ? 0
        : null;

  return {
    annualLaborCost,
    annualErrorCost,
    totalCurrentCost,
    remainingLaborCost,
    netAnnualSavings,
    hoursFreedPerWeek,
    year1NetCashFlow,
    year2NetCashFlow,
    year3NetCashFlow,
    year1ROI,
    year2ROI,
    year3ROI,
    returnPerDollar3yr,
    paybackMonths,
  };
}

export function roiBand(roiPct: number | null): string {
  if (roiPct === null) return "No upfront investment — ROI not applicable";
  if (roiPct < 0) return "Negative — does not pay back within 3 years";
  if (roiPct < 50) return "Below typical business ROI target for 3 years";
  if (roiPct < 150) return "Solid 3-year investment";
  if (roiPct < 300) return "Excellent 3-year investment";
  return "Outstanding 3-year investment";
}
