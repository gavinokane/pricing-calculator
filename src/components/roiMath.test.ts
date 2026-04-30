import { describe, it, expect } from "vitest";
import { computeRoi, roiBand, RoiInputs } from "./roiMath";

const baseline: RoiInputs = {
  hoursPerWeek: 3,
  numPeople: 1,
  hourlyRate: 67,
  automationLevel: 85,
  errorRate: 0,
  errorCost: 0,
  implementationCost: 4000,
  annualDoozerCost: 3588,
};

describe("computeRoi — known-good baseline", () => {
  const r = computeRoi(baseline);

  it("annual labor cost = 3 × 1 × ($67 × 1.3) × 52", () => {
    expect(r.annualLaborCost).toBeCloseTo(13587.6, 2);
  });

  it("zero error cost when errorRate is zero", () => {
    expect(r.annualErrorCost).toBe(0);
  });

  it("remaining labor cost after 85% automation", () => {
    expect(r.remainingLaborCost).toBeCloseTo(2038.14, 2);
  });

  it("net annual savings ≈ $7,961", () => {
    expect(r.netAnnualSavings).toBeCloseTo(7961.46, 2);
  });

  it("Year 1 ROI ≈ 99%", () => {
    expect(Math.round(r.year1ROI!)).toBe(99);
  });

  it("Year 2 ROI ≈ 298%", () => {
    expect(Math.round(r.year2ROI!)).toBe(298);
  });

  it("Year 3 ROI ≈ 497%", () => {
    expect(Math.round(r.year3ROI!)).toBe(497);
  });

  it("$ back per $1 invested over 3 years ≈ $5.97", () => {
    expect(r.returnPerDollar3yr!).toBeCloseTo(5.97, 2);
  });

  it("payback ≈ 6.0 months", () => {
    expect(r.paybackMonths!).toBeCloseTo(6.03, 1);
  });
});

describe("computeRoi — internal consistency", () => {
  it("Year-N ROI follows (netSavings × n − impl) / impl", () => {
    const r = computeRoi(baseline);
    const expected1 = ((r.netAnnualSavings - baseline.implementationCost) / baseline.implementationCost) * 100;
    const expected3 = ((r.netAnnualSavings * 3 - baseline.implementationCost) / baseline.implementationCost) * 100;
    expect(r.year1ROI!).toBeCloseTo(expected1, 6);
    expect(r.year3ROI!).toBeCloseTo(expected3, 6);
  });

  it("$ back per $1 = 1 + ROI/100", () => {
    const r = computeRoi(baseline);
    expect(r.returnPerDollar3yr!).toBeCloseTo(1 + r.year3ROI! / 100, 6);
  });

  it("does NOT double-count subscription in denominator", () => {
    // With the fix, doubling the subscription should reduce the denominator's
    // implicit "double-count" by exactly zero — i.e. the denominator (impl)
    // is unaffected by the subscription. Only the numerator changes.
    const r1 = computeRoi(baseline);
    const r2 = computeRoi({ ...baseline, annualDoozerCost: baseline.annualDoozerCost * 2 });
    // Net savings drops by the extra subscription cost.
    expect(r1.netAnnualSavings - r2.netAnnualSavings).toBeCloseTo(baseline.annualDoozerCost, 2);
    // Year 3 ROI numerator drops by 3× the extra subscription, denominator unchanged.
    const expectedDeltaPct = (3 * baseline.annualDoozerCost / baseline.implementationCost) * 100;
    expect(r1.year3ROI! - r2.year3ROI!).toBeCloseTo(expectedDeltaPct, 4);
  });
});

describe("computeRoi — edge cases", () => {
  it("zero implementation cost (pure SaaS) returns null ROIs and null $-per-$1", () => {
    const r = computeRoi({ ...baseline, implementationCost: 0 });
    expect(r.year1ROI).toBeNull();
    expect(r.year2ROI).toBeNull();
    expect(r.year3ROI).toBeNull();
    expect(r.returnPerDollar3yr).toBeNull();
    // Payback is zero when there's no upfront cost and savings are positive.
    expect(r.paybackMonths).toBe(0);
    // Net savings still computed normally.
    expect(r.netAnnualSavings).toBeCloseTo(7961.46, 2);
  });

  it("zero subscription (pure one-off project) — savings = full gross labour value freed", () => {
    const r = computeRoi({ ...baseline, annualDoozerCost: 0 });
    // Gross labour value freed = 13,587.60 × 0.85
    expect(r.netAnnualSavings).toBeCloseTo(13587.6 * 0.85, 2);
    // Year 1 ROI = (savings − impl) / impl
    expect(r.year1ROI!).toBeCloseTo(((r.netAnnualSavings - 4000) / 4000) * 100, 4);
  });

  it("100% automation — full elimination of labor cost", () => {
    const r = computeRoi({ ...baseline, automationLevel: 100 });
    expect(r.remainingLaborCost).toBe(0);
    // Net savings = full annualLaborCost − subscription
    expect(r.netAnnualSavings).toBeCloseTo(13587.6 - 3588, 2);
    expect(r.hoursFreedPerWeek).toBe(3);
  });

  it("0% automation — no benefit, negative ROI, payback null", () => {
    const r = computeRoi({ ...baseline, automationLevel: 0 });
    // Net savings = 0 − subscription = −$3,588
    expect(r.netAnnualSavings).toBeCloseTo(-3588, 2);
    expect(r.year1ROI!).toBeLessThan(0);
    expect(r.year3ROI!).toBeLessThan(0);
    // Payback undefined when savings are non-positive.
    expect(r.paybackMonths).toBeNull();
  });

  it("error costs are added to net savings", () => {
    const withErrors = computeRoi({ ...baseline, errorRate: 10, errorCost: 100 });
    const withoutErrors = computeRoi(baseline);
    // 10% of $13,587.60 × ($100 / $67) = $2,028 of avoided error cost.
    const expectedDelta = 13587.6 * 0.1 * (100 / 67);
    expect(withErrors.netAnnualSavings - withoutErrors.netAnnualSavings).toBeCloseTo(expectedDelta, 2);
  });

  it("hourlyRate=0 does not divide-by-zero on error cost", () => {
    const r = computeRoi({ ...baseline, hourlyRate: 0, errorRate: 10 });
    expect(r.annualErrorCost).toBe(0);
    expect(Number.isFinite(r.netAnnualSavings)).toBe(true);
  });
});

describe("roiBand", () => {
  it("null → no upfront", () => {
    expect(roiBand(null)).toMatch(/no upfront/i);
  });
  it("negative → does not pay back", () => {
    expect(roiBand(-50)).toMatch(/negative/i);
  });
  it("0–49 → below target", () => {
    expect(roiBand(25)).toMatch(/below typical/i);
  });
  it("50–149 → solid", () => {
    expect(roiBand(100)).toMatch(/solid/i);
  });
  it("150–299 → excellent", () => {
    expect(roiBand(200)).toMatch(/excellent/i);
  });
  it("≥300 → outstanding", () => {
    expect(roiBand(500)).toMatch(/outstanding/i);
  });
});
