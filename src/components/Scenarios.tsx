import React, { useState, useEffect } from 'react';
import { Calculator, Settings, Plus, Trash2, RotateCcw, ArrowLeft } from 'lucide-react';

interface Tier {
  name: string;
  basePrice: number;
  credits: number;
  fixedCreditsPerExecution: number;
}

interface WorkflowType {
  name: string;
  credits: number;
}

interface Scenario {
  id: number;
  executions: number;
  workflowIndex: number;
  tierKey: string;
  hasByok: boolean;
  totalCreditsPerExecution: number;
  totalCreditsNeeded: number;
  includedCredits: number;
  additionalCreditsNeeded: number;
  additionalCreditsAfterByok: number;
  additionalCreditCost: number;
  totalCost: number;
  costPerExecution: number;
}

interface TransferredVariables {
  creditRate?: number;
  creditPackSize?: number;
  creditPackPrice?: number;
  byokSavings?: number;
  tiers?: Record<string, Tier>;
  workflowTypes?: WorkflowType[];
}

interface ScenariosProps {
  onBack?: () => void;
  onTransferVariables?: (variables: TransferredVariables) => void;
  initialVariables?: TransferredVariables;
}

const Scenarios: React.FC<ScenariosProps> = ({ onBack, onTransferVariables, initialVariables }) => {
  const [creditRate, setCreditRate] = useState(initialVariables?.creditRate ?? 0.004);
  const [creditPackSize, setCreditPackSize] = useState(initialVariables?.creditPackSize ?? 10000);
  // const [creditPackPrice, setCreditPackPrice] = useState(initialVariables?.creditPackPrice ?? 40);
  const [byokSavings, setByokSavings] = useState(initialVariables?.byokSavings ?? 60);

  const [tiers, setTiers] = useState<Record<string, Tier>>(initialVariables?.tiers ?? {
    starter: { name: 'Starter', basePrice: 50, credits: 1000, fixedCreditsPerExecution: 4 },
    business: { name: 'Business', basePrice: 400, credits: 200000, fixedCreditsPerExecution: 3 },
    enterprise: { name: 'Enterprise', basePrice: 1000, credits: 300000, fixedCreditsPerExecution: 2 }
  });

  const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[]>(initialVariables?.workflowTypes ?? [
    { name: 'Simple Email Classifier', credits: 10 },
    { name: 'Basic Data Processing', credits: 15 },
    { name: 'Content Summarization', credits: 25 },
    { name: 'Classifier Sharepoint+BOX', credits: 30 },
    { name: 'Report Generation', credits: 40 },
    { name: 'Research & Analysis', credits: 50 },
    { name: 'Complex Multi-Step Agent', credits: 100 },
    { name: 'Advanced Multi-Agent System', credits: 200 }
  ]);

  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Scenario input state
  const [monthlyExecutions, setMonthlyExecutions] = useState(500);
  const [selectedWorkflowIndex, setSelectedWorkflowIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [hasByok, setHasByok] = useState(false);

  // Comparison matrix state
  const [comparisonExecutions, setComparisonExecutions] = useState(1000);
  const [comparisonWorkflowIndex, setComparisonWorkflowIndex] = useState(0);

  const calculateScenario = (executions: number, workflowIndex: number, tierKey: string, hasByokFlag: boolean) => {
    const tier = tiers[tierKey];
    const workflow = workflowTypes[workflowIndex];
    
    if (!tier || !workflow) {
      return {
        totalCreditsPerExecution: 0,
        totalCreditsNeeded: 0,
        includedCredits: 0,
        additionalCreditsNeeded: 0,
        additionalCreditsAfterByok: 0,
        additionalCreditCost: 0,
        totalCost: 0,
        costPerExecution: 0
      };
    }

    const totalCreditsPerExecution = tier.fixedCreditsPerExecution + workflow.credits;
    const totalCreditsNeeded = executions * totalCreditsPerExecution;
    const includedCredits = tier.credits;
    
    let additionalCreditsNeeded = Math.max(0, totalCreditsNeeded - includedCredits);
    
    // Apply BYOK savings (only on variable costs)
    if (hasByokFlag && additionalCreditsNeeded > 0) {
      const variableCreditsInOverage = Math.min(additionalCreditsNeeded, executions * workflow.credits);
      const estimatedSavings = variableCreditsInOverage * (byokSavings / 100);
      additionalCreditsNeeded = Math.max(0, additionalCreditsNeeded - estimatedSavings);
    }
    
    const additionalCreditCost = additionalCreditsNeeded * creditRate;
    const totalCost = tier.basePrice + additionalCreditCost;
    const costPerExecution = totalCost / executions;
    
    return {
      totalCreditsPerExecution,
      totalCreditsNeeded,
      includedCredits,
      additionalCreditsNeeded: Math.max(0, totalCreditsNeeded - includedCredits),
      additionalCreditsAfterByok: additionalCreditsNeeded,
      additionalCreditCost,
      totalCost,
      costPerExecution
    };
  };

  const updateTier = (tierKey: string, property: keyof Tier, value: string | number) => {
    setTiers(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        [property]: typeof value === 'string' ? value : parseFloat(value.toString())
      }
    }));
  };

  const resetTier = (tierKey: string) => {
    const defaults = {
      starter: { name: 'Starter', basePrice: 50, credits: 1000, fixedCreditsPerExecution: 4 },
      business: { name: 'Business', basePrice: 400, credits: 200000, fixedCreditsPerExecution: 3 },
      enterprise: { name: 'Enterprise', basePrice: 1000, credits: 300000, fixedCreditsPerExecution: 2 }
    };
    setTiers(prev => ({
      ...prev,
      [tierKey]: { ...defaults[tierKey as keyof typeof defaults] }
    }));
  };

  const updateWorkflow = (index: number, property: keyof WorkflowType, value: string | number) => {
    setWorkflowTypes(prev => prev.map((workflow, i) => {
      if (i !== index) return workflow;
      if (property === 'credits') {
        return { ...workflow, credits: Number(value) };
      }
      if (property === 'name') {
        return { ...workflow, name: String(value) };
      }
      return workflow;
    }));
  };

  const addWorkflowType = () => {
    setWorkflowTypes(prev => [...prev, { name: 'New Workflow', credits: 25 }]);
  };

  const removeWorkflow = (index: number) => {
    setWorkflowTypes(prev => prev.filter((_, i) => i !== index));
  };

  const addScenario = () => {
    const calculation = calculateScenario(monthlyExecutions, selectedWorkflowIndex, selectedTier, hasByok);
    
    const scenario: Scenario = {
      id: Date.now(),
      executions: monthlyExecutions,
      workflowIndex: selectedWorkflowIndex,
      tierKey: selectedTier,
      hasByok,
      ...calculation
    };
    
    setScenarios(prev => [...prev, scenario]);
  };

  const removeScenario = (index: number) => {
    setScenarios(prev => prev.filter((_, i) => i !== index));
  };

  // Update scenarios when global variables change
  useEffect(() => {
    setScenarios(prev => prev.map(scenario => ({
      ...scenario,
      ...calculateScenario(scenario.executions, scenario.workflowIndex, scenario.tierKey, scenario.hasByok)
    })));
  }, [creditRate, creditPackSize, byokSavings, tiers, workflowTypes]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </button>
          )}
          <Calculator className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Doozer AI Pricing Scenario Analyzer</h1>
        </div>
        {onTransferVariables && (
          <div className="flex justify-start mb-4" style={{ marginLeft: 0 }}>
            <button
              onClick={() => onTransferVariables({
                creditRate,
                creditPackSize,
                creditPackPrice: creditRate * creditPackSize,
                byokSavings,
                tiers,
                workflowTypes
              })}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Calculator className="w-5 h-5" />
              Transfer Variables to Calculator
            </button>
          </div>
        )}
        <p className="text-gray-600">Test different pricing scenarios and configurations</p>
      </div>


      {/* Global Variables */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Global Pricing Variables</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Rate ($)</label>
            <input
              type="number"
              step="0.001"
              value={creditRate}
              onChange={(e) => setCreditRate(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Pack Size</label>
            <input
              type="number"
              step="1000"
              value={creditPackSize}
              onChange={(e) => setCreditPackSize(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Pack Price ($)</label>
            <input
              type="number"
              value={creditRate * creditPackSize}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BYOK Savings (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={byokSavings}
              onChange={(e) => setByokSavings(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Transfer button moved to header */}
      </div>

      {/* Tier Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tier Configuration</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border-b font-semibold">Tier</th>
                <th className="text-left p-3 border-b font-semibold">Base Price ($)</th>
                <th className="text-left p-3 border-b font-semibold">Included Credits</th>
                <th className="text-left p-3 border-b font-semibold">Fixed Credits/Execution</th>
                <th className="text-left p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tiers).map(([key, tier]) => (
                <tr key={key} className={`${key === 'starter' ? 'bg-blue-50' : key === 'business' ? 'bg-purple-50' : 'bg-amber-50'}`}>
                  <td className="p-3 border-b">
                    <strong>{tier.name}</strong>
                  </td>
                  <td className="p-3 border-b">
                    <input
                      type="number"
                      value={tier.basePrice}
                      onChange={(e) => updateTier(key, 'basePrice', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="p-3 border-b">
                    <input
                      type="number"
                      step="1000"
                      value={tier.credits}
                      onChange={(e) => updateTier(key, 'credits', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="p-3 border-b">
                    <input
                      type="number"
                      step="0.1"
                      value={tier.fixedCreditsPerExecution}
                      onChange={(e) => updateTier(key, 'fixedCreditsPerExecution', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => resetTier(key)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Types */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Workflow Types</h2>
        <div className="space-y-3">
          {workflowTypes.map((workflow, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => updateWorkflow(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={workflow.credits}
                onChange={(e) => updateWorkflow(index, 'credits', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeWorkflow(index)}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addWorkflowType}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Workflow Type
        </button>
      </div>

      {/* Scenario Testing */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Scenario Testing</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Executions</label>
              <input
                type="number"
                value={monthlyExecutions}
                onChange={(e) => setMonthlyExecutions(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Type</label>
              <select
                value={selectedWorkflowIndex}
                onChange={(e) => setSelectedWorkflowIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {workflowTypes.map((workflow, index) => (
                  <option key={index} value={index}>
                    {workflow.name} ({workflow.credits} credits)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(tiers).map(([key, tier]) => (
                  <option key={key} value={key}>{tier.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasByok"
                checked={hasByok}
                onChange={(e) => setHasByok(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor="hasByok" className="text-sm font-medium text-gray-700">Use BYOK</label>
            </div>
          </div>
          <button
            onClick={addScenario}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Add Scenario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border-b font-semibold">Scenario</th>
                <th className="text-left p-3 border-b font-semibold">Executions</th>
                <th className="text-left p-3 border-b font-semibold">Workflow</th>
                <th className="text-left p-3 border-b font-semibold">Tier</th>
                <th className="text-left p-3 border-b font-semibold">BYOK</th>
                <th className="text-left p-3 border-b font-semibold">Credits Needed</th>
                <th className="text-left p-3 border-b font-semibold">Overage Credits</th>
                <th className="text-left p-3 border-b font-semibold">Total Cost</th>
                <th className="text-left p-3 border-b font-semibold">Cost/Execution</th>
                <th className="text-left p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => (
                <tr key={scenario.id}>
                  <td className="p-3 border-b">Scenario {index + 1}</td>
                  <td className="p-3 border-b">{formatNumber(scenario.executions)}</td>
                  <td className="p-3 border-b">{workflowTypes[scenario.workflowIndex]?.name || 'Unknown'}</td>
                  <td className="p-3 border-b">{tiers[scenario.tierKey]?.name}</td>
                  <td className="p-3 border-b">{scenario.hasByok ? '✅' : '❌'}</td>
                  <td className="p-3 border-b">{formatNumber(scenario.totalCreditsNeeded)}</td>
                  <td className="p-3 border-b">{formatNumber(scenario.additionalCreditsNeeded)}</td>
                  <td className="p-3 border-b bg-yellow-100 font-semibold">${scenario.totalCost.toFixed(2)}</td>
                  <td className="p-3 border-b">${scenario.costPerExecution.toFixed(3)}</td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => removeScenario(index)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tier Comparison Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Executions</label>
            <input
              type="number"
              value={comparisonExecutions}
              onChange={(e) => setComparisonExecutions(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Type</label>
            <select
              value={comparisonWorkflowIndex}
              onChange={(e) => setComparisonWorkflowIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workflowTypes.map((workflow, index) => (
                <option key={index} value={index}>
                  {workflow.name} ({workflow.credits} credits)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border-b font-semibold">Tier</th>
                <th className="text-left p-3 border-b font-semibold">Base Price</th>
                <th className="text-left p-3 border-b font-semibold">Credits Needed</th>
                <th className="text-left p-3 border-b font-semibold">Overage</th>
                <th className="text-left p-3 border-b font-semibold">Total Cost</th>
                <th className="text-left p-3 border-b font-semibold">Cost/Execution</th>
                <th className="text-left p-3 border-b font-semibold">Total Cost (BYOK)</th>
                <th className="text-left p-3 border-b font-semibold">Cost/Execution (BYOK)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tiers).map(([tierKey, tier]) => {
                const regular = calculateScenario(comparisonExecutions, comparisonWorkflowIndex, tierKey, false);
                const byok = calculateScenario(comparisonExecutions, comparisonWorkflowIndex, tierKey, true);
                
                return (
                  <tr key={tierKey} className={`${tierKey === 'starter' ? 'bg-blue-50' : tierKey === 'business' ? 'bg-purple-50' : 'bg-amber-50'}`}>
                    <td className="p-3 border-b">
                      <strong>{tier.name}</strong>
                    </td>
                    <td className="p-3 border-b">${tier.basePrice}</td>
                    <td className="p-3 border-b">{formatNumber(regular.totalCreditsNeeded)}</td>
                    <td className="p-3 border-b">{formatNumber(regular.additionalCreditsNeeded)}</td>
                    <td className="p-3 border-b">${regular.totalCost.toFixed(2)}</td>
                    <td className="p-3 border-b">${regular.costPerExecution.toFixed(3)}</td>
                    <td className="p-3 border-b">${byok.totalCost.toFixed(2)}</td>
                    <td className="p-3 border-b">${byok.costPerExecution.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scenarios;
