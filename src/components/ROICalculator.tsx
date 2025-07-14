/* jsPDF import removed as it was unused */
import "jspdf-autotable";
import React, { useState, useEffect } from "react";
import { Zap, ArrowLeft } from "lucide-react";

/* workflowConfig removed as it was unused */

/* workflowOptions removed as it was unused */

const benefitsMultiplier = 1.3; // 30% benefits/overhead

const formatCurrency = (n: number) =>
  "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

import { ViewType, TransferredVariables } from "./types";

interface RoiInputs {
  hoursPerWeek?: number;
  numPeople?: number;
  hourlyRate?: number;
  automationLevel?: number;
  errorRate?: number;
  errorCost?: number;
  implementationCost?: number;
}

interface ROICalculatorProps {
  onNavigate: (view: ViewType) => void;
  currentView?: ViewType;
  annualDoozerCost?: number;
  scenarioVariables?: TransferredVariables;
  hideBackButton?: boolean;
  loadedRoiInputs?: RoiInputs;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({
  onNavigate,
  // currentView = "roi-calculator", // unused
  annualDoozerCost,
  scenarioVariables,
  hideBackButton = false,
  loadedRoiInputs
}) => {
  // Save/Send modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendName, setSendName] = useState("");
  const [sendCompany, setSendCompany] = useState("");
  const [sendEmail, setSendEmail] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendDescription, setSendDescription] = useState("");

  // Inputs
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [numPeople, setNumPeople] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [automationLevel, setAutomationLevel] = useState(85);
  const [errorRate, setErrorRate] = useState(3);
  const [errorCost, setErrorCost] = useState(70);
  const [implementationCost, setImplementationCost] = useState(5000);

  // If loadedRoiInputs is present, initialize state from it (only on mount)
  useEffect(() => {
    if (loadedRoiInputs) {
      setHoursPerWeek(loadedRoiInputs.hoursPerWeek ?? 40);
      setNumPeople(loadedRoiInputs.numPeople ?? 3);
      setHourlyRate(loadedRoiInputs.hourlyRate ?? 35);
      setAutomationLevel(loadedRoiInputs.automationLevel ?? 85);
      setErrorRate(loadedRoiInputs.errorRate ?? 3);
      setErrorCost(loadedRoiInputs.errorCost ?? 70);
      setImplementationCost(loadedRoiInputs.implementationCost ?? 5000);
    }
  }, [loadedRoiInputs]);

  // Outputs
  // const [roiPercent, setRoiPercent] = useState(0); // unused
  // const [roiMultiple, setRoiMultiple] = useState(0); // unused
  const [annualSavings, setAnnualSavings] = useState(0);
  const [paybackPeriod, setPaybackPeriod] = useState(0);
  const [hoursFreed, setHoursFreed] = useState(0);
  const [doozerCost, setDoozerCost] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [errorCosts, setErrorCosts] = useState(0);
  const [totalCurrentCost, setTotalCurrentCost] = useState(0);
  const [remainingCost, setRemainingCost] = useState(0);
  const [doozerSubscription, setDoozerSubscription] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);

  // Calculation logic
  useEffect(() => {
    // Current costs
    const totalHourlyRate = hourlyRate * benefitsMultiplier;
    const annualLaborCost = hoursPerWeek * numPeople * totalHourlyRate * 52;
    const annualErrorCost =
      (annualLaborCost * (errorRate / 100)) * (errorCost / hourlyRate);
    const totalCurrent = annualLaborCost + annualErrorCost;

    // Post-automation
    const automationPercent = automationLevel / 100;
    const remainingLaborCost = annualLaborCost * (1 - automationPercent);

    // Doozer cost calculation: always use the value passed from Pricing Calculator
    const usedAnnualDoozerCost = annualDoozerCost ?? 0;

    // ROI calculations
    const totalNewCost = remainingLaborCost + usedAnnualDoozerCost;
    const netAnnualSavings = totalCurrent - totalNewCost;
    const totalFirstYearInvestment = remainingLaborCost + usedAnnualDoozerCost + implementationCost;
    // const roi = netAnnualSavings > 0 ? (netAnnualSavings / totalFirstYearInvestment) * 100 : 0; // unused
    const paybackMonths =
      totalFirstYearInvestment > 0 ? totalFirstYearInvestment / (netAnnualSavings / 12) : 0;
    const hoursFreedPerWeek = hoursPerWeek * automationPercent;
    // const roiMult = totalFirstYearInvestment > 0 ? netAnnualSavings / totalFirstYearInvestment : 0; // unused

    // Set outputs
    setAnnualSavings(Math.round(netAnnualSavings));
    setPaybackPeriod(paybackMonths > 0 ? paybackMonths : 0);
    setHoursFreed(Math.round(hoursFreedPerWeek));
    setDoozerCost(Math.round(usedAnnualDoozerCost));
    setCurrentCost(Math.round(annualLaborCost));
    setErrorCosts(Math.round(annualErrorCost));
    setTotalCurrentCost(Math.round(totalCurrent));
    setRemainingCost(Math.round(remainingLaborCost));
    setDoozerSubscription(Math.round(usedAnnualDoozerCost));
    setNetSavings(Math.round(netAnnualSavings));
    setTotalInvestment(Math.round(totalFirstYearInvestment));
  }, [
    hoursPerWeek,
    numPeople,
    hourlyRate,
    automationLevel,
    errorRate,
    errorCost,
    implementationCost,
    annualDoozerCost
  ]);

  // ROI context removed (was unused and caused errors)

  // 3-year cumulative ROI calculation
  const year2Investment = remainingCost + doozerCost;
  const year3Investment = year2Investment;
  const threeYearCumulativeROI =
    totalInvestment + year2Investment + year3Investment > 0
      ? Math.round(
          ((netSavings * 3) /
            (totalInvestment + year2Investment + year3Investment)) *
            100
        )
      : 0;

  // Simple custom Tooltip component
  interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    placement?: "top" | "bottom";
  }
  const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = "bottom" }) => {
    const [visible, setVisible] = useState(false);
    return (
      <span
        className="relative"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        style={{ outline: "none" }}
      >
        {children}
        <span
          className={`pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 ${
            placement === "top"
              ? "bottom-full mb-2"
              : "top-full mt-2"
          } transition-all duration-200 ${
            visible ? "opacity-100 scale-105" : "opacity-0 scale-95"
          }`}
          style={{
            whiteSpace: "pre-line",
            minWidth: "480px",
            maxWidth: "800px"
          }}
          role="tooltip"
        >
          <span className="relative flex flex-col items-center">
            {/* Arrow */}
            {placement === "top" ? (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500 drop-shadow" />
            ) : (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-500 drop-shadow" />
            )}
            {/* Tooltip box */}
            <span className="px-6 py-4 bg-blue-50 text-blue-900 text-lg rounded-2xl shadow-2xl border-2 border-blue-500 font-semibold leading-snug ring-2 ring-blue-200">
              {content}
            </span>
          </span>
        </span>
      </span>
    );
  };

  // Cost Breakdown Card extracted
  const CostBreakdownCard = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-2">
      <div className="text-lg font-semibold mb-4 text-gray-800">3-Year Financial Summary</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Current costs */}
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow p-4">
          {/* Base annual labor cost */}
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Base annual labor cost</span>
              <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Base annual labor cost</div>
                <div>
                  The total amount paid to staff for this process before overheads.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Hours per week × Number of people × Average hourly rate × 52 weeks<br />
                    = {hoursPerWeek} × {numPeople} × {formatCurrency(hourlyRate)} × 52<br />
                    = <b>{formatCurrency(hoursPerWeek * numPeople * hourlyRate * 52)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold text-gray-700">
                {formatCurrency(hoursPerWeek * numPeople * hourlyRate * 52)}
              </span>
            </Tooltip>
          </div>
          {/* Overheads/benefits */}
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Overheads/benefits (30%)</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Overheads/benefits (30%)</div>
                <div>
                  Estimated at 30% of base labor cost to cover superannuation, leave, and other on-costs.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Base annual labor cost × 30%<br />
                    = {formatCurrency(hoursPerWeek * numPeople * hourlyRate * 52)} × 0.3<br />
                    = <b>{formatCurrency(hoursPerWeek * numPeople * hourlyRate * 52 * 0.3)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold text-gray-700">
                {formatCurrency(hoursPerWeek * numPeople * hourlyRate * 52 * 0.3)}
              </span>
            </Tooltip>
          </div>
          {/* Error-related costs */}
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Error-related costs</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Error-related costs</div>
                <div>
                  The annual financial impact of mistakes in this process.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    (Total annual labor cost × Error rate) × (Cost per error ÷ Average hourly rate)<br />
                    = ({formatCurrency(currentCost)} × {errorRate}%) × ({formatCurrency(errorCost)} ÷ {formatCurrency(hourlyRate)})<br />
                    = <b>{formatCurrency(errorCosts)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold text-gray-700">
                {formatCurrency(errorCosts)}
              </span>
            </Tooltip>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-between py-2 border-t-2 border-gray-200 mt-2 items-end">
            <span className="text-gray-800 font-bold">Total current costs</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Total current costs</div>
                <div>
                  The sum of your annual labor costs and error-related costs for this process.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Total annual labor cost + Error-related costs<br />
                    = {formatCurrency(currentCost)} + {formatCurrency(errorCosts)}<br />
                    = <b>{formatCurrency(totalCurrentCost)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-bold text-red-800 text-lg">
                {formatCurrency(totalCurrentCost)}
              </span>
            </Tooltip>
          </div>
        </div>
        {/* Middle: Day 1 forward (investment) */}
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow p-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Remaining annual labor costs</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Remaining annual labor costs</div>
                <div>
                  What you expect to pay for this process after automation.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Total annual labor cost × (1 - Automation level)<br />
                    = {formatCurrency(currentCost)} × (1 - {automationLevel}%)<br />
                    = <b>{formatCurrency(remainingCost)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold">
                {formatCurrency(remainingCost)}
              </span>
            </Tooltip>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Doozer subscription (annual)</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Doozer subscription (annual)</div>
                <div>
                  The annual cost for the Doozer AI platform, as calculated in the Pricing Calculator.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Total monthly cost: <b>{formatCurrency(doozerSubscription / 12)}</b><br />
                    Total monthly cost × 12 months<br />
                    = <b>{formatCurrency(doozerSubscription)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold">
                {formatCurrency(doozerSubscription)}
              </span>
            </Tooltip>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Implementation cost (one-time)</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Implementation cost (one-time)</div>
                <div>
                  The up-front investment to set up Doozer AI for this process.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Entered above: <b>{formatCurrency(implementationCost)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-semibold">
                {formatCurrency(implementationCost)}
              </span>
            </Tooltip>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-between py-2 border-t-2 border-gray-200 mt-2 items-end">
            <span className="text-gray-800 font-bold">Total investment (Year 1)</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Total investment (Year 1)</div>
                <div>
                  The sum of your remaining labor costs, Doozer subscription, and implementation cost for the first year.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Remaining annual labor costs + Doozer subscription + Implementation cost<br />
                    = {formatCurrency(remainingCost)} + {formatCurrency(doozerSubscription)} + {formatCurrency(implementationCost)}<br />
                    = <b>{formatCurrency(totalInvestment)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-bold text-blue-800 text-lg">
                {formatCurrency(totalInvestment)}
              </span>
            </Tooltip>
          </div>
        </div>
        {/* Right: Positives/Savings */}
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow p-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-800">Year 1 savings</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Year 1 savings</div>
                <div>
                  The money you save in the first year after automation, minus the up-front implementation cost.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Net annual savings - Implementation cost<br />
                    = {formatCurrency(netSavings)} - {formatCurrency(implementationCost)}<br />
                    = <b>{formatCurrency(netSavings - implementationCost)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="text-green-700">
                {formatCurrency(netSavings - implementationCost)}
              </span>
            </Tooltip>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-800">Year 2 savings</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Year 2 savings</div>
                <div>
                  The ongoing annual savings you expect after the first year, assuming recurring savings.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Net annual savings<br />
                    = <b>{formatCurrency(netSavings)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="text-green-700">
                {formatCurrency(netSavings)}
              </span>
            </Tooltip>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-800">Year 3 savings</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Year 3 savings</div>
                <div>
                  The ongoing annual savings you expect after the first year, assuming recurring savings.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    Net annual savings<br />
                    = <b>{formatCurrency(netSavings)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="text-green-700">
                {formatCurrency(netSavings)}
              </span>
            </Tooltip>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-between py-2 border-t-2 border-green-400 mt-2 items-end">
            <span className="text-green-900 font-bold text-lg">Total 3 year savings</span>
            <Tooltip placement="top" content={
              <>
                <div className="font-bold mb-1">Total 3 year savings</div>
                <div>
                  The sum of your savings over three years, including the first year implementation cost.<br />
                  <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                    (Year 1 savings) + (Year 2 savings) + (Year 3 savings)<br />
                    = ({formatCurrency(netSavings - implementationCost)}) + ({formatCurrency(netSavings)}) + ({formatCurrency(netSavings)})<br />
                    = <b>{formatCurrency(netSavings * 3 - implementationCost)}</b>
                  </span>
                </div>
              </>
            }>
              <span className="font-extrabold text-green-800 text-lg">
                {formatCurrency(netSavings * 3 - implementationCost)}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Return to calculator button */}
      {!hideBackButton && (
        <div className="mb-8">
          <button
            onClick={() => onNavigate("calculator")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calculator
          </button>
        </div>
      )}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Doozer AI ROI Calculator</h1>
        </div>
        <p className="text-gray-600">Calculate return on investment for AI automation</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calculator Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-lg font-semibold mb-4 text-gray-800">Current Process</div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip content="On average, how many hours per week, each person spends on this process.">
                Average hours per week, each person spends on this process
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={168}
              value={hoursPerWeek}
              onChange={e => setHoursPerWeek(Number(e.target.value))}
              readOnly={hideBackButton}
              disabled={hideBackButton}
            />
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip placement="top" content={
                <>
                  <div className="font-bold mb-1">Number of people</div>
                  <div>
                    The number of people regularly involved in this process.
                  </div>
                </>
              }>
                Number of people
              </Tooltip>
            </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
                value={numPeople}
                onChange={e => setNumPeople(Number(e.target.value))}
                readOnly={hideBackButton}
                disabled={hideBackButton}
              />
            </div>
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip placement="top" content={
                <>
                  <div className="font-bold mb-1">Average hourly rate ($)</div>
                  <div>
                    The average hourly wage (excluding benefits/overheads) for people working on this process.
                  </div>
                </>
              }>
                Average hourly rate ($)
              </Tooltip>
            </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
                step={0.01}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                readOnly={hideBackButton}
                disabled={hideBackButton}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip placement="top" content={
                <>
                  <div className="font-bold mb-1">Expected automation level</div>
                  <div>
                    What percentage of this process you expect to automate with Doozer AI.
                  </div>
                </>
              }>
                Expected automation level
              </Tooltip>
            </label>
            <input
              type="range"
              min={50}
              max={95}
              value={automationLevel}
              onChange={e => setAutomationLevel(Number(e.target.value))}
              className="w-full"
              disabled={hideBackButton}
            />
            <div className="text-center font-semibold text-blue-600 mt-1">{automationLevel}%</div>
          </div>
          {/* Doozer workflow type selection removed as per requirements */}
          <div className="text-lg font-semibold mb-4 text-gray-800 mt-6">Error & Quality Factors</div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip placement="top" content={
                <>
                  <div className="font-bold mb-1">Current error rate (%)</div>
                  <div>
                    The percentage of tasks in this process that typically result in an error or need rework.
                  </div>
                </>
              }>
                Current error rate (%)
              </Tooltip>
            </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
                max={100}
                step={0.1}
                value={errorRate}
                onChange={e => setErrorRate(Number(e.target.value))}
                readOnly={hideBackButton}
                disabled={hideBackButton}
              />
            </div>
            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">Cost per error ($)</div>
                  <div>
                    The average cost to your business for each error in this process (e.g., time, materials, lost revenue).
                  </div>
                </>
              }>
                Cost per error ($)
              </Tooltip>
            </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
                step={0.01}
                value={errorCost}
                onChange={e => setErrorCost(Number(e.target.value))}
                readOnly={hideBackButton}
                disabled={hideBackButton}
              />
            </div>
          </div>
          <div className="text-lg font-semibold mb-4 text-gray-800 mt-6">Implementation</div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">One-time implementation cost ($)</div>
                  <div>
                    The up-front cost to implement Doozer AI for this process (e.g., setup, training, integration).
                  </div>
                </>
              }>
                One-time implementation cost ($)
              </Tooltip>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
              step={100}
              value={implementationCost}
              onChange={e => setImplementationCost(Number(e.target.value))}
              readOnly={hideBackButton}
              disabled={hideBackButton}
            />
          </div>
        </div>
        
        {/* Results Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* ROI Headline Card - spans both columns */}
          <div className="mb-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 w-full flex flex-col items-center">
              <Tooltip placement="bottom" content={
                <>
                  <div className="font-bold mb-1">3-Year Cumulative ROI</div>
                  <div className="p-4 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 text-sm">
                    <div className="font-bold mb-1">Calculation</div>
                    <div>
                      Your total return on investment over three years, including all costs and savings.<br />
                      <span className="block mt-2 font-mono text-sm bg-blue-50 rounded px-2 py-1">
                        (Net annual savings × 3) ÷ (Total investment over 3 years) × 100<br />
                        = ({formatCurrency(netSavings)} × 3) ÷ ({formatCurrency(totalInvestment)} + {formatCurrency(year2Investment)} + {formatCurrency(year3Investment)}) × 100<br />
                        = <b>{threeYearCumulativeROI}%</b>
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 text-sm">
                    <div className="font-bold mb-1">What this means</div>
                    <div>
                      This is your total return over 3 years, including all costs and savings.<br />
                      For every $1 invested, you get back{" "}
                      <b>
                        {totalInvestment + year2Investment + year3Investment > 0
                          ? `$${(
                              (totalInvestment + year2Investment + year3Investment + netSavings * 3) /
                              (totalInvestment + year2Investment + year3Investment)
                            ).toFixed(2)}`
                          : "$1.00"}
                      </b>{" "}
                      in value over 3 years.
                      <br />
                      <span className="block mt-2">
                        {threeYearCumulativeROI < 25
                          ? "Below typical business ROI target for 3 years"
                          : threeYearCumulativeROI < 100
                          ? "Solid 3-year investment"
                          : threeYearCumulativeROI < 200
                          ? "Excellent 3-year investment"
                          : "Outstanding 3-year investment"}
                      </span>
                    </div>
                  </div>
                </>
              }>
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {threeYearCumulativeROI}%
                </div>
              </Tooltip>
              <div className="text-gray-500 text-lg mt-2">3-Year Cumulative ROI</div>
            </div>
          </div>
          {/* Two-column grid for summary cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">Annual Savings</div>
                  <div>
                    The amount you save each year after automation, compared to your current costs.<br />
                    <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                      Total current costs - (Remaining labor + Doozer subscription)<br />
                      = {formatCurrency(totalCurrentCost)} - ({formatCurrency(remainingCost)} + {formatCurrency(doozerCost)})<br />
                      = <b>{formatCurrency(annualSavings)}</b>
                    </span>
                  </div>
                </>
              }>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(annualSavings)}
                </span>
              </Tooltip>
              <div className="text-xs text-gray-500 uppercase">Annual Savings</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">Payback (Months)</div>
                  <div>
                    How many months it will take for your savings to cover your initial investment.<br />
                    <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                      Total first-year investment ÷ (Net annual savings ÷ 12)<br />
                      = {formatCurrency(totalInvestment)} ÷ ({formatCurrency(netSavings)} ÷ 12)<br />
                      = <b>{paybackPeriod > 0 ? paybackPeriod.toFixed(1) : "N/A"}</b>
                    </span>
                  </div>
                </>
              }>
                <span className="text-2xl font-bold text-gray-800">
                  {paybackPeriod > 0 ? paybackPeriod.toFixed(1) : "N/A"}
                </span>
              </Tooltip>
              <div className="text-xs text-gray-500 uppercase">Payback (Months)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">Hours Freed/Week</div>
                  <div>
                    The number of staff hours you expect to save each week by automating this process.<br />
                    <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                      Hours per week × Automation level<br />
                      = {hoursPerWeek} × {automationLevel}%<br />
                      = <b>{hoursFreed}</b>
                    </span>
                  </div>
                </>
              }>
                <span className="text-2xl font-bold text-gray-800">
                  {hoursFreed}
                </span>
              </Tooltip>
              <div className="text-xs text-gray-500 uppercase">Hours Freed/Week</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Tooltip content={
                <>
                  <div className="font-bold mb-1">Annual Doozer Cost</div>
                  <div>
                    The yearly subscription fee for the Doozer AI platform, as calculated in the Pricing Calculator.<br />
                    <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                      = <b>{formatCurrency(doozerCost)}</b>
                    </span>
                  </div>
                </>
              }>
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(doozerCost)}
                </span>
              </Tooltip>
              <div className="text-xs text-gray-500 uppercase">Annual Doozer Cost</div>
            </div>
          </div>
          
          {/* Three card display for 1, 2, 3 year ROI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {(() => {
              const year2Investment = remainingCost + doozerCost;
              const year3Investment = year2Investment;
              const year1CumulativeROI =
                totalInvestment > 0
                  ? Math.round((netSavings / totalInvestment) * 100)
                  : 0;
              const year2CumulativeROI =
                totalInvestment + year2Investment > 0
                  ? Math.round(
                      ((netSavings * 2) / (totalInvestment + year2Investment)) * 100
                    )
                  : 0;
              const year3CumulativeROI =
                totalInvestment + year2Investment + year3Investment > 0
                  ? Math.round(
                      ((netSavings * 3) /
                        (totalInvestment + year2Investment + year3Investment)) *
                        100
                    )
                  : 0;
              return [
                {
                  label: "Year 1 ROI",
                  value: year1CumulativeROI,
                  tooltip: `Year 1 Cumulative ROI shows your return on investment at the end of the first year, after all costs and savings. Calculated as: Net annual savings ÷ (Remaining labor costs + Doozer subscription + Implementation cost) × 100 = ${formatCurrency(netSavings)} ÷ (${formatCurrency(remainingCost)} + ${formatCurrency(doozerCost)} + ${formatCurrency(implementationCost)}) × 100`
                },
                {
                  label: "Year 2 ROI",
                  value: year2CumulativeROI,
                  tooltip: `Year 2 Cumulative ROI shows your total return on investment after two years, including all costs and savings. Calculated as: (Net annual savings × 2) ÷ (Year 1 investment + Year 2 investment) × 100 = (${formatCurrency(netSavings)} × 2) ÷ (${formatCurrency(totalInvestment)} + ${formatCurrency(year2Investment)}) × 100`
                },
                {
                  label: "Year 3 ROI",
                  value: year3CumulativeROI,
                  tooltip: `Year 3 Cumulative ROI shows your total return on investment after three years, including all costs and savings. Calculated as: (Net annual savings × 3) ÷ (Year 1 + Year 2 + Year 3 investment) × 100 = (${formatCurrency(netSavings)} × 3) ÷ (${formatCurrency(totalInvestment)} + ${formatCurrency(year2Investment)} + ${formatCurrency(year3Investment)}) × 100`
                }
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200"
                >
                  <Tooltip content={
                    <>
                      <div className="font-bold mb-1">{card.label}</div>
                      <div>
                        {card.label === "Year 1 ROI" && (
                          <>
                            Your return on investment at the end of the first year, after all costs and savings.<br />
                            <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                              Net annual savings ÷ (Remaining labor costs + Doozer subscription + Implementation cost)<br />
                              = {formatCurrency(netSavings)} ÷ ({formatCurrency(remainingCost)} + {formatCurrency(doozerCost)} + {formatCurrency(implementationCost)})<br />
                              = <b>{card.value}%</b>
                            </span>
                          </>
                        )}
                        {card.label === "Year 2 ROI" && (
                          <>
                            Your total return on investment after two years, including all costs and savings.<br />
                            <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                              (Net annual savings × 2) ÷ (Year 1 investment + Year 2 investment)<br />
                              = ({formatCurrency(netSavings)} × 2) ÷ ({formatCurrency(totalInvestment)} + {formatCurrency(year2Investment)})<br />
                              = <b>{card.value}%</b>
                            </span>
                          </>
                        )}
                        {card.label === "Year 3 ROI" && (
                          <>
                            Your total return on investment after three years, including all costs and savings.<br />
                            <span className="block mt-2 font-mono text-sm bg-blue-100 rounded px-2 py-1">
                              (Net annual savings × 3) ÷ (Year 1 + Year 2 + Year 3 investment)<br />
                              = ({formatCurrency(netSavings)} × 3) ÷ ({formatCurrency(totalInvestment)} + {formatCurrency(year2Investment)} + {formatCurrency(year3Investment)})<br />
                              = <b>{card.value}%</b>
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  }>
                    <span className="text-2xl font-bold text-yellow-700 mb-1">
                      {card.value}%
                    </span>
                  </Tooltip>
                  <div className="text-xs text-gray-600 uppercase">{card.label}</div>
                </div>
              ));
            })()}
          </div>
          
          {!hideBackButton && (
            <div className="w-full mt-6 flex flex-col gap-3">
              <button
                className="w-full bg-blue-100 text-blue-900 border border-blue-300 rounded-lg py-3 font-semibold hover:bg-blue-200 transition"
                onClick={async () => {
                  // Save Report logic
                  const doc = {
                    type: "roi-calc",
                    roiInputs: {
                      hoursPerWeek,
                      numPeople,
                      hourlyRate,
                      automationLevel,
                      errorRate,
                      errorCost,
                      implementationCost
                    },
                    roiResults: {
                      annualSavings,
                      paybackPeriod,
                      hoursFreed,
                      doozerCost,
                      currentCost,
                      errorCosts,
                      totalCurrentCost,
                      remainingCost,
                      doozerSubscription,
                      netSavings,
                      totalInvestment,
                      year2Investment,
                      year3Investment,
                      threeYearCumulativeROI
                    },
                    scenarioVariables: scenarioVariables || {},
                    createdAt: new Date().toISOString()
                  };
                  setShowSaveModal(true);
                  setSaveLoading(true);
                  setSaveError(null);
                  setSavedDocId(null);
                  try {
                    const res = await fetch("/api/roi-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(doc)
                    });
                    if (!res.ok) throw new Error("Failed to save report");
                    const data = await res.json();
                    setSavedDocId(data.id);
                  } catch (e) {
                    setSaveError((e as Error).message || "Failed to save report");
                  } finally {
                    setSaveLoading(false);
                  }
                }}
              >
                💾 Save Report
              </button>
              <button
                className="w-full bg-green-100 text-green-900 border border-green-300 rounded-lg py-3 font-semibold hover:bg-green-200 transition"
                onClick={() => setShowSendModal(true)}
              >
                ✉️ Send Report
              </button>
            </div>
          )}
        </div>
        
        {/* Cost Breakdown Card: horizontal, spans both columns */}
        <div className="md:col-span-2">
          <CostBreakdownCard />
        </div>
      </div>
    </div>
    {/* Save Report Modal */}
    {showSendModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
          <button
            onClick={() => {
              setShowSendModal(false);
              setSendName("");
              setSendCompany("");
              setSendEmail("");
              setSendError(null);
              setSendSuccess(false);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold mb-2">Send ROI Report</h2>
          {sendSuccess ? (
            <div className="text-green-700 mb-2">Report sent successfully!</div>
          ) : (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  value={sendName}
                  onChange={e => setSendName(e.target.value)}
                  disabled={sendLoading}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  value={sendCompany}
                  onChange={e => setSendCompany(e.target.value)}
                  disabled={sendLoading}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  value={sendEmail}
                  onChange={e => setSendEmail(e.target.value)}
                  disabled={sendLoading}
                  type="email"
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded resize-vertical"
                  value={sendDescription}
                  onChange={e => setSendDescription(e.target.value)}
                  disabled={sendLoading}
                  rows={3}
                  placeholder="Add a description of this ROI calculation (optional)"
                />
              </div>
              {sendError && <div className="mb-2 text-red-600">{sendError}</div>}
              <button
                className="w-full bg-green-600 text-white rounded py-2 font-semibold hover:bg-green-700 transition"
                disabled={sendLoading || !sendName || !sendCompany || !sendEmail}
                onClick={async () => {
                  setSendLoading(true);
                  setSendError(null);
                  setSendSuccess(false);
                  try {
                    // 1. Save report to CosmosDB (same as Save Report)
                    const doc = {
                      type: "roi-calc",
                      roiInputs: {
                        hoursPerWeek,
                        numPeople,
                        hourlyRate,
                        automationLevel,
                        errorRate,
                        errorCost,
                        implementationCost
                      },
                      roiResults: {
                        annualSavings,
                        paybackPeriod,
                        hoursFreed,
                        doozerCost,
                        currentCost,
                        errorCosts,
                        totalCurrentCost,
                        remainingCost,
                        doozerSubscription,
                        netSavings,
                        totalInvestment,
                        year2Investment,
                        year3Investment,
                        threeYearCumulativeROI
                      },
                      scenarioVariables: scenarioVariables || {},
                      createdAt: new Date().toISOString()
                    };
                    const res = await fetch("/api/roi-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(doc)
                    });
                    if (!res.ok) throw new Error("Failed to save report");
                    const data = await res.json();
                    const guid = data.id;
                    // 2. Prepare payload and call external webservice
                    const payloadObj = {
                      name: sendName,
                      company: sendCompany,
                      email: sendEmail,
                      description: sendDescription,
                      guid
                    };
                    let payload = btoa(JSON.stringify(payloadObj));
                    // Make base64 URL-safe
                    payload = payload.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                    const wsRes = await fetch("https://fn-doozer-py-05.azurewebsites.net/api/Tool/execute", {
                      method: "POST",
                      headers: {
                        "Ocp-Apim-Subscription-Key": "74a411a1d9ea4340ae20c20e3d16d3fc",
                        "API_KEY": "cc20eb1800db4c0eb3fa7bf52f06afea",
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        doozer_name: "Adam",
                        variables: [
                          {
                            ability_name: "ROI Calculator Send",
                            params: `payload=${payload}`
                          }
                        ]
                      })
                    });
                    if (!wsRes.ok) throw new Error("Failed to send report");
                    setSendSuccess(true);
                  } catch (e) {
                    setSendError((e as Error).message || "Failed to send report");
                  } finally {
                    setSendLoading(false);
                  }
                }}
              >
                {sendLoading ? "Sending..." : "Send"}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {/* Save Report Modal */}
    {showSaveModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
          <button
            onClick={() => setShowSaveModal(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold mb-2">Report Saved</h2>
          {saveLoading && <div className="mb-2 text-blue-600">Saving...</div>}
          {saveError && <div className="mb-2 text-red-600">{saveError}</div>}
          {savedDocId && (
            <>
              <div className="mb-2">
                <span className="font-mono text-xs break-all">ID: {savedDocId}</span>
              </div>
              <textarea
                className="w-full h-16 p-2 border border-gray-300 rounded mb-3 font-mono text-xs resize-none"
                value={`${window.location.origin}${window.location.pathname}?roi=${savedDocId}`}
                readOnly
                onFocus={e => e.target.select()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?roi=${savedDocId}`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 break-all">
                Use this URL to load this ROI report from the cloud.
              </div>
            </>
          )}
          {!savedDocId && !saveError && !saveLoading && (
            <div className="text-gray-600">No ID returned from server.</div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default ROICalculator;
