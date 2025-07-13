import { useState } from 'react';
import { Calculator, Zap, Key, Info, Settings } from 'lucide-react';
import { Tier, WorkflowType, TransferredVariables, ViewType } from './types';
import { 
  DEFAULT_CREDIT_RATE, 
  DEFAULT_CREDIT_PACK_SIZE, 
  DEFAULT_CREDIT_PACK_PRICE, 
  DEFAULT_BYOK_SAVINGS,
  DEFAULT_TIERS,
  DEFAULT_WORKFLOW_TYPES,
  DEFAULT_TIER_META
} from './constants';
import { formatNumber, calculateCreditUsage } from './utils';
import Scenarios from './Scenarios';
import FeatureComparison from './FeatureComparison';
import ROICalculator from './ROICalculator';

import { useEffect } from 'react';

const PricingCalculator = () => {
  const [currentView, setCurrentView] = useState<ViewType>("calculator");
  const [transferredVariables, setTransferredVariables] = useState<Partial<TransferredVariables>>({});
  const [usage, setUsage] = useState<{ executions: number; hasApiKeys: boolean }>({
    executions: 500,
    hasApiKeys: false
  });

  // ROI report loading state
  interface RoiInputs {
    hoursPerWeek?: number;
    numPeople?: number;
    hourlyRate?: number;
    automationLevel?: number;
    errorRate?: number;
    errorCost?: number;
    implementationCost?: number;
  }
  interface LoadedRoiReport {
    roiResults?: { doozerCost?: number };
    scenarioVariables?: TransferredVariables;
    roiInputs?: RoiInputs;
  }
  const [loadedRoiReport, setLoadedRoiReport] = useState<LoadedRoiReport | null>(null);
  const [loadingRoi, setLoadingRoi] = useState(false);

  // Auto-load variables from URL (id, data, or roi) on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const base64 = params.get("data");
    const roi = params.get("roi");
    if (roi) {
      setLoadingRoi(true);
      fetch(`/api/roi-report/${roi}`)
        .then(res => res.ok ? res.json() : Promise.reject("Not found"))
        .then(json => setLoadedRoiReport(json))
        .catch(() => setLoadedRoiReport(null))
        .finally(() => setLoadingRoi(false));
      return;
    }
    if (id) {
      // Load from backend
      (async () => {
        try {
          const url = `/api/scenario-config/${id}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (typeof json === "object" && json) {
              setTransferredVariables({
                creditRate: json.creditRate,
                creditPackSize: json.creditPackSize,
                creditPackPrice: json.creditRate * json.creditPackSize,
                byokSavings: json.byokSavings,
                tiers: json.tiers,
                workflowTypes: json.workflowTypes
              });
            }
          }
        } catch { /* ignore */ }
      })();
    } else if (base64) {
      try {
        const json = JSON.parse(atob(base64));
        if (typeof json === "object" && json) {
          setTransferredVariables({
            creditRate: json.creditRate,
            creditPackSize: json.creditPackSize,
            creditPackPrice: json.creditRate * json.creditPackSize,
            byokSavings: json.byokSavings,
            tiers: json.tiers,
            workflowTypes: json.workflowTypes
          });
        }
      } catch { /* ignore */ }
    }
  }, []);
  const [selectedWorkflowIndex, setSelectedWorkflowIndex] = useState(0);
const [selectedTier, setSelectedTier] = useState<'starter' | 'business' | 'professional' | 'enterprise'>('starter');

  // Credit pricing (use transferred variables if present)
  const CREDIT_RATE = transferredVariables.creditRate ?? DEFAULT_CREDIT_RATE;
  const CREDIT_PACK_SIZE = transferredVariables.creditPackSize ?? DEFAULT_CREDIT_PACK_SIZE;
  const CREDIT_PACK_PRICE = transferredVariables.creditPackPrice ?? DEFAULT_CREDIT_PACK_PRICE;
  const BYOK_SAVINGS = transferredVariables.byokSavings ?? DEFAULT_BYOK_SAVINGS;

  // Pricing tiers configuration (use transferred if present)
  const tiers: Record<string, Tier> = Object.fromEntries(
    Object.entries(transferredVariables.tiers ?? DEFAULT_TIERS).map(([key, tier]) => [
      key,
      {
        ...tier,
        color: tier.color ?? DEFAULT_TIER_META[key]?.color,
        icon: tier.icon ?? DEFAULT_TIER_META[key]?.icon
      }
    ])
  );

  // Workflow types with variable credit costs (use transferred if present)
  const workflowTypes: WorkflowType[] = transferredVariables.workflowTypes ?? DEFAULT_WORKFLOW_TYPES;

  const costBreakdown = calculateCreditUsage(
    usage,
    selectedWorkflowIndex,
    selectedTier,
    tiers,
    workflowTypes,
    CREDIT_RATE,
    CREDIT_PACK_SIZE,
    BYOK_SAVINGS
  );

  const handleTransferVariables = (variables: TransferredVariables) => {
    setTransferredVariables(variables);
    setCurrentView('calculator');
  };

  // If scenarios view is selected, render the Scenarios component
  // In PricingCalculator.tsx, replace the scenarios view logic with this:
  if ((currentView as ViewType) === "scenarios") {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get("mode") === "admin";
    
    // In admin mode, don't pass initialVariables when navigating back
    // Let Scenarios component use localStorage as the source of truth
    if (isAdmin) {
      return (
        <Scenarios
          onBack={() => setCurrentView("calculator")}
          onTransferVariables={handleTransferVariables}
          // Don't pass initialVariables in admin mode - let localStorage handle it
        />
      );
    }
    
    // For non-admin mode, preserve the original logic
    const hasInitialVars =
      transferredVariables &&
      (transferredVariables.creditRate !== undefined ||
        transferredVariables.creditPackSize !== undefined ||
        transferredVariables.byokSavings !== undefined ||
        transferredVariables.tiers !== undefined ||
        transferredVariables.workflowTypes !== undefined);
        
    return (
      <Scenarios
        onBack={() => setCurrentView("calculator")}
        onTransferVariables={handleTransferVariables}
        {...(hasInitialVars ? { initialVariables: transferredVariables } : {})}
      />
    );
  }
  if ((currentView as ViewType) === "feature-comparison") {
    return <FeatureComparison tiers={tiers} onBack={() => setCurrentView("calculator")} />;
  }
  // If loaded via ROI GUID, show only the ROI Calculator page and hide back button
  if (loadedRoiReport) {
    return (
      <ROICalculator
        onNavigate={() => {}} // no-op
        currentView="roi-calculator"
        annualDoozerCost={loadedRoiReport.roiResults?.doozerCost}
        scenarioVariables={loadedRoiReport.scenarioVariables}
        hideBackButton={true}
        loadedRoiInputs={loadedRoiReport.roiInputs}
      />
    );
  }
  if (loadingRoi) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading ROI report...</div>
      </div>
    );
  }

  if ((currentView as ViewType) === "roi-calculator") {
    // Map workflow name to workflowConfig key for ROI Calculator
    const workflowNameToKey: Record<string, "email" | "data" | "content" | "document" | "complex"> = {
      "Simple Email Classifier": "email",
      "Basic Data Processing": "data",
      "Content Summarization": "content",
      "Document Review": "document",
      "Complex Multi-Step Agent": "complex"
    };
    const selectedWorkflow = workflowTypes[selectedWorkflowIndex];
    // Try to match by name, fallback to "email"
    let workflowTypeKey: "email" | "data" | "content" | "document" | "complex" = "email";
    if (selectedWorkflow && selectedWorkflow.name) {
      for (const [label, key] of Object.entries(workflowNameToKey)) {
        if (selectedWorkflow.name.startsWith(label)) {
          workflowTypeKey = key as typeof workflowTypeKey;
          break;
        }
      }
    }
    return (
      <ROICalculator
        onNavigate={setCurrentView}
        currentView={currentView}
        annualDoozerCost={costBreakdown.totalCost * 12}
        scenarioVariables={transferredVariables}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Doozer AI Pricing Calculator</h1>
        </div>
        <p className="text-gray-600">Calculate your monthly costs based on credit usage</p>
        <div className="mt-2 text-sm text-gray-500">
          Credit Rate: ${CREDIT_PACK_PRICE} per {CREDIT_PACK_SIZE.toLocaleString()} credits (${CREDIT_RATE.toFixed(4)} per credit)
        </div>
        
        {/* Navigation Menu */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentView("calculator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === "calculator"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </button>
          <button
            onClick={() => setCurrentView("scenarios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === "scenarios"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            type="button"
          >
            <Settings className="w-4 h-4" />
            Scenarios
          </button>
          <button
            onClick={() => setCurrentView("roi-calculator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === "roi-calculator"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            type="button"
          >
            <Zap className="w-4 h-4" />
            ROI Calculator
          </button>
          <button
            onClick={() => setCurrentView("feature-comparison")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === "feature-comparison"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            type="button"
          >
            <span className="w-4 h-4 flex items-center justify-center">★</span>
            Feature Comparison
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Usage Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Expected Monthly Usage</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Executions
                </label>
                <input
                  type="number"
                  value={usage.executions}
                  onChange={(e) => setUsage(prev => ({
                    ...prev,
                    executions: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Workflow Type
                </label>
                <select
                  value={selectedWorkflowIndex}
                  onChange={(e) => setSelectedWorkflowIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workflowTypes.map((workflow: WorkflowType, index: number) => (
                    <option key={index} value={index}>
                      {workflow.name} ({workflow.credits} credits)
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  Variable credits for LLM calls and compute steps
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="byok"
                  checked={usage.hasApiKeys}
                  onChange={(e) => setUsage(prev => ({
                    ...prev,
                    hasApiKeys: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="byok" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Key className="w-4 h-4" />
                  I'll bring my own API keys (BYOK)
                </label>
              </div>
              {usage.hasApiKeys && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      BYOK saves ~{BYOK_SAVINGS}% on variable costs by eliminating our markup on third-party provider fees.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Select Plan</h3>
              <div className="space-y-2">
                {['starter', 'professional', 'business', 'enterprise'].map((key) => {
                  const tier = tiers[key];
                  if (!tier) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTier(key as 'starter' | 'business' | 'professional' | 'enterprise')}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        selectedTier === key
                          ? `${tier.color} text-white border-transparent`
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tier.icon}
                        <div className="text-left flex-1">
                          <div className="font-medium">{tier.name}</div>
                          <div className="text-xs opacity-90">{formatNumber(tier.credits)} credits</div>
                        </div>
                        <span className="font-bold">${tier.basePrice}/mo</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              {tiers[selectedTier].icon}
              <h2 className="text-xl font-semibold text-gray-800">{tiers[selectedTier].name} Plan</h2>
              <div className="ml-auto text-sm text-gray-600">
                {tiers[selectedTier].workspace} Workspace
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Base Plan Cost:</span>
                <span className="font-medium">${tiers[selectedTier].basePrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Included Credits:</span>
                <span className="font-medium">{formatNumber(costBreakdown.includedCredits)} credits</span>
              </div>

              {costBreakdown.totalCreditsNeeded > costBreakdown.includedCredits && (
                <>
                  <hr className="my-2" />
                  <div className="text-sm text-gray-600 mb-2">Additional Credits Needed:</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">
                      Total Usage: {formatNumber(costBreakdown.totalCreditsNeeded)} credits
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">
                      Overage: {formatNumber(costBreakdown.additionalCreditsNeeded)} credits
                    </span>
                  </div>
                  {usage.hasApiKeys && costBreakdown.additionalCreditsNeeded !== costBreakdown.additionalCreditsAfterByok && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        After BYOK savings: {formatNumber(costBreakdown.additionalCreditsAfterByok)} credits
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">
                      Additional Cost:
                    </span>
                    <span className="text-red-600">+${costBreakdown.additionalCreditCost.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <hr className="my-3" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="flex items-center gap-1">
                  Total Monthly Cost:
                  <span
                    title={`Total Cost = Base Price (${tiers[selectedTier].basePrice}) + Additional Credit Cost (${costBreakdown.additionalCreditCost.toFixed(2)}) = ${costBreakdown.totalCost.toFixed(2)}${usage.hasApiKeys && costBreakdown.additionalCreditsNeeded !== costBreakdown.additionalCreditsAfterByok ? `\n(BYOK applied: Additional credits reduced by ${BYOK_SAVINGS}% of variable credits)` : ""}`}
                    style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/>
                    </svg>
                  </span>
                </span>
                <span className={`${tiers[selectedTier].color} text-white px-3 py-1 rounded`}>
                  ${costBreakdown.totalCost.toFixed(2)}
                </span>
              </div>

              {costBreakdown.creditPacksNeeded > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Equivalent to {costBreakdown.creditPacksNeeded} credit pack{costBreakdown.creditPacksNeeded !== 1 ? 's' : ''} 
                  (${costBreakdown.creditPacksNeeded * CREDIT_PACK_PRICE} at ${CREDIT_PACK_PRICE}/{CREDIT_PACK_SIZE.toLocaleString()} credits)
                </div>
              )}
            </div>

            {/* Credit Usage Visualization */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Credit Usage Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Executions</span>
                    <span className="font-medium">{formatNumber(usage.executions)} runs</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fixed Credits per Execution</span>
                    <span className="font-medium">{tiers[selectedTier].fixedCreditsPerExecution} credits</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Variable Credits per Execution</span>
                    <span className="font-medium">{costBreakdown.variableCreditsPerExecution} credits</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1 border-t pt-1">
                    <span className="font-medium">Total Credits per Execution</span>
                    <span className="font-medium">{costBreakdown.totalCreditsPerExecution} credits</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Credits Needed</span>
                    <span className="font-medium flex items-center gap-1">
                      {formatNumber(costBreakdown.totalCreditsNeeded)} credits
                      <span
                        title={`Credits Needed = Executions (${usage.executions}) × (Fixed Credits/Execution (${tiers[selectedTier].fixedCreditsPerExecution}) + Workflow Credits (${costBreakdown.variableCreditsPerExecution})) = ${costBreakdown.totalCreditsNeeded}`}
                        style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/>
                        </svg>
                      </span>
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 transition-all"
                        style={{ 
                          width: `${Math.min((costBreakdown.includedCredits / costBreakdown.totalCreditsNeeded) * 100, 100)}%` 
                        }}
                      />
                      {costBreakdown.totalCreditsNeeded > costBreakdown.includedCredits && (
                        <div
                          className="bg-red-500 transition-all"
                          style={{ 
                            width: `${((costBreakdown.totalCreditsNeeded - costBreakdown.includedCredits) / costBreakdown.totalCreditsNeeded) * 100}%` 
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Included: {formatNumber(costBreakdown.includedCredits)}</span>
                    {costBreakdown.totalCreditsNeeded > costBreakdown.includedCredits && (
                      <span className="text-red-600 flex items-center gap-1">
                        Overage: {formatNumber(costBreakdown.additionalCreditsNeeded)}
                        <span
                          title={`Overage Credits = max(0, Credits Needed (${costBreakdown.totalCreditsNeeded}) - Included Credits (${costBreakdown.includedCredits})) = ${costBreakdown.additionalCreditsNeeded}`}
                          style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="inline w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/>
                          </svg>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Comparison */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Cost per Execution Across Tiers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(tiers).map(([tierKey, tier]: [string, Tier]) => {
                  const workflow = workflowTypes[selectedWorkflowIndex] ?? workflowTypes[0];
                  const variableCreditsPerExecution = workflow.credits;
                  const tierCreditsPerExecution = Number(tier.fixedCreditsPerExecution) + Number(variableCreditsPerExecution);
                  const tierCostPerExecution = tierCreditsPerExecution * CREDIT_RATE;
                  const isCurrentTier = tierKey === selectedTier;
                  
                  return (
                    <div key={tierKey} className={`p-3 rounded-lg border-2 ${isCurrentTier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium text-gray-800">{tier.name}</div>
                      <div className="text-xs text-gray-600">{tier.fixedCreditsPerExecution} + {variableCreditsPerExecution} credits</div>
                      <div className="text-sm font-bold text-gray-800">${tierCostPerExecution.toFixed(3)}/execution</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Higher tiers have lower fixed costs per execution, making them more efficient for high-volume usage.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit System Explanation */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">How Credits Work</h2>
        <div className="text-gray-700 text-sm space-y-4">
          <div>
            <p>
              Every month, your plan gives you a set number of included credits. Each time you run a workflow, credits are used up based on the type of workflow and your plan. There are two parts to the credit cost:
            </p>
            <ul className="list-disc list-inside ml-4 my-2">
              <li>
                <b>Fixed credits per execution:</b> This is a small, set amount that depends on your plan.
              </li>
              <li>
                <b>Variable credits per execution:</b> This depends on the workflow you choose (for example, more complex workflows use more credits).
              </li>
            </ul>
            <p>
              The more you run workflows, the more credits you use. If you stay within your included credits, you just pay your plan price. If you go over, you'll pay a little extra for the additional credits you use.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">What happens if I go over my included credits?</h3>
            <p>
              If you use more credits than your plan includes, you'll be charged for the extra credits at a low per-credit rate. You can also buy credit packs in advance for a discount.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">How can I save with BYOK?</h3>
            <p>
              If you bring your own API keys for providers like OpenAI or Anthropic, you'll save on the variable part of your credit usage. This can reduce your extra credit costs by about {BYOK_SAVINGS}%.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Summary</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                Each plan includes a monthly credit allowance (Starter: {formatNumber(tiers.starter.credits)}, Business: {formatNumber(tiers.business.credits)}, Professional: {formatNumber(tiers.professional.credits)}, Enterprise: {formatNumber(tiers.enterprise.credits)}).
              </li>
              <li>
                You only pay extra if you use more credits than your plan includes.
              </li>
              <li>
                Bringing your own API keys can help you save even more on high-volume usage.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
