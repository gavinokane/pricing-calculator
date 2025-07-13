import React, { useState, useEffect } from 'react';
import { Calculator, Settings, Plus, Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Tier, WorkflowType, Scenario, TransferredVariables } from './types';
import { SCENARIO_STORAGE_KEY, DEFAULT_TIERS, DEFAULT_WORKFLOW_TYPES } from './constants';
import { calculateScenario, formatNumber } from './utils';
/* ChartControls and chart components imports removed while hidden */

interface ScenariosProps {
  onBack?: () => void;
  onTransferVariables?: (variables: TransferredVariables) => void;
  initialVariables?: TransferredVariables;
}

// --- Base64 URL param loader ---
const Scenarios: React.FC<ScenariosProps> = ({ onBack, onTransferVariables, initialVariables }) => {
  // (Removed unused getBase64Param function)

  // Get mode param and key param from URL
  const getModeParam = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode");
    } catch {
      return null;
    }
  };
  const getKeyParam = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("key");
    } catch {
      return null;
    }
  };
  const isAdmin =
    getModeParam() === "admin" &&
    getKeyParam() &&
    getKeyParam() === import.meta.env.VITE_ADMIN_GUID;

  const [creditRate, setCreditRate] = useState<number | null>(null);
  const [creditPackSize, setCreditPackSize] = useState<number | null>(null);
  const [byokSavings, setByokSavings] = useState<number | null>(null);
  const [tiers, setTiers] = useState<Record<string, Tier> | null>(null);
  const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[] | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);

  // On mount: check for id param (Cosmos), else base64 param, else fallback to persisted/initial/defaults
  // Replace the existing useEffect (around line 52) with this corrected version:

  useEffect(() => {
    // Helper functions
    const getIdParam = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
      } catch {
        return null;
      }
    };

    const getModeParam = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("mode");
      } catch {
        return null;
      }
    };

    const getKeyParam = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get("key");
      } catch {
        return null;
      }
    };

    const getBase64Param = (param: string) => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
      } catch {
        return null;
      }
    };

    const getPersistedData = () => {
      try {
        const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const isAdmin = getModeParam() === "admin" && getKeyParam() === import.meta.env.VITE_ADMIN_GUID;

    console.log("[Scenarios] Loading state on mount, isAdmin:", isAdmin);

    // In admin mode, ALWAYS use localStorage first, ignore initialVariables completely
    if (isAdmin) {
      const persisted = getPersistedData();
      console.log("[Scenarios] ADMIN MODE: persisted data:", persisted);
      
      if (persisted) {
        console.log("[Scenarios] ADMIN MODE: Using persisted data");
        setCreditRate(persisted.creditRate ?? 0.01);
        setCreditPackSize(persisted.creditPackSize ?? 50000);
        setByokSavings(persisted.byokSavings ?? 60);
        
        // For tiers, use persisted data directly without merging with defaults
        if (persisted.tiers) {
          console.log("[Scenarios] ADMIN MODE: Setting tiers from persisted:", persisted.tiers);
          setTiers(() => {
            const newTiers = persisted.tiers;
            console.log("[Scenarios] ADMIN MODE: tiers state after setTiers:", newTiers);
            return newTiers;
          });
        } else {
          setTiers(DEFAULT_TIERS);
        }
        
        setWorkflowTypes(persisted.workflowTypes ?? DEFAULT_WORKFLOW_TYPES);
        setScenarios(persisted.scenarios ?? []);
      } else {
        console.log("[Scenarios] ADMIN MODE: No persisted data, using defaults");
        setCreditRate(0.01);
        setCreditPackSize(50000);
        setByokSavings(60);
        setTiers(DEFAULT_TIERS);
        setWorkflowTypes(DEFAULT_WORKFLOW_TYPES);
        setScenarios([]);
      }
      return;
    }

    // Non-admin mode logic (existing logic for id, base64, etc.)
    const id = getIdParam();
    if (id) {
      (async () => {
        try {
          const url = `/api/scenario-config/${id}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (typeof json === "object" && json) {
              if (typeof json.creditRate === "number") setCreditRate(json.creditRate);
              if (typeof json.creditPackSize === "number") setCreditPackSize(json.creditPackSize);
              if (typeof json.byokSavings === "number") setByokSavings(json.byokSavings);
              if (json.tiers) setTiers(json.tiers);
              if (Array.isArray(json.workflowTypes)) setWorkflowTypes(json.workflowTypes);
              if (Array.isArray(json.scenarios)) setScenarios(json.scenarios);
            }
            return;
          }
        } catch { /* ignore */ }
      })();
      return;
    }

    const base64 = getBase64Param("data");
    if (base64) {
      try {
        const json = JSON.parse(atob(base64));
        if (typeof json === "object" && json) {
          if (typeof json.creditRate === "number") setCreditRate(json.creditRate);
          if (typeof json.creditPackSize === "number") setCreditPackSize(json.creditPackSize);
          if (typeof json.byokSavings === "number") setByokSavings(json.byokSavings);
          if (json.tiers) setTiers(json.tiers);
          if (Array.isArray(json.workflowTypes)) setWorkflowTypes(json.workflowTypes);
          if (Array.isArray(json.scenarios)) setScenarios(json.scenarios);
        }
        return;
      } catch { /* ignore */ }
    }

    // Fallback logic for non-admin mode
    const persisted = getPersistedData();
    setCreditRate(persisted?.creditRate ?? initialVariables?.creditRate ?? 0.01);
    setCreditPackSize(persisted?.creditPackSize ?? initialVariables?.creditPackSize ?? 50000);
    setByokSavings(persisted?.byokSavings ?? initialVariables?.byokSavings ?? 60);
    
    const tierBase = persisted?.tiers ?? initialVariables?.tiers ?? DEFAULT_TIERS;
    setTiers(['starter', 'professional', 'business', 'enterprise'].reduce((acc, key) => {
      acc[key] = { ...DEFAULT_TIERS[key], ...(tierBase?.[key] || {}) };
      return acc;
    }, {} as Record<string, Tier>));
    
    setWorkflowTypes(persisted?.workflowTypes ?? initialVariables?.workflowTypes ?? DEFAULT_WORKFLOW_TYPES);
    setScenarios(persisted?.scenarios ?? []);

  }, [initialVariables?.byokSavings, initialVariables?.creditPackSize, initialVariables?.creditRate, initialVariables?.tiers, initialVariables?.workflowTypes]); // Added missing dependencies per eslint

  // Use non-null assertion or fallback for state variables
  const _creditRate = creditRate ?? 0.01;
  const _creditPackSize = creditPackSize ?? 50000;
  const _byokSavings = byokSavings ?? 60;
  const _tiers = tiers ?? DEFAULT_TIERS;
  const _workflowTypes = workflowTypes ?? DEFAULT_WORKFLOW_TYPES;
  const _scenarios = React.useMemo(() => scenarios ?? [], [scenarios]);
// --- END Base64 URL param loader ---


  // Scenario input state
  const [monthlyExecutions, setMonthlyExecutions] = useState(500);
  const [selectedWorkflowIndex, setSelectedWorkflowIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [hasByok, setHasByok] = useState(false);

  // Comparison matrix state
  const [comparisonExecutions, setComparisonExecutions] = useState(1000);
  const [comparisonWorkflowIndex, setComparisonWorkflowIndex] = useState(0);

  // Chart controls state removed while charts are hidden

  const updateTier = (tierKey: string, property: keyof Tier, value: string | number) => {
    console.log("[Scenarios] updateTier called:", { tierKey, property, value });
    setTiers(prev => {
      const updated = {
        ...(prev ?? DEFAULT_TIERS),
        [tierKey]: {
          ...(prev?.[tierKey] ?? DEFAULT_TIERS[tierKey]),
          [property]: typeof value === 'string' ? value : parseFloat(value.toString())
        }
      };
      console.log("[Scenarios] updateTier new tiers:", updated);
      return updated;
    });
  };

  const resetTier = (tierKey: string) => {
    const defaults = DEFAULT_TIERS;
    setTiers(prev => ({
      ...(prev ?? _tiers),
      [tierKey]: { ...defaults[tierKey as keyof typeof defaults] }
    }));
  };

  const updateWorkflow = (index: number, property: keyof WorkflowType, value: string | number) => {
    setWorkflowTypes(prev => (prev ?? _workflowTypes).map((workflow, i) => {
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
    setWorkflowTypes(prev => [...(prev ?? _workflowTypes), { name: 'New Workflow', credits: 25 }]);
  };

  const removeWorkflow = (index: number) => {
    setWorkflowTypes(prev => (prev ?? _workflowTypes).filter((_, i) => i !== index));
  };

  const addScenario = () => {
    const calculation = calculateScenario(
      monthlyExecutions, 
      selectedWorkflowIndex, 
      selectedTier, 
      hasByok,
      _tiers,
      _workflowTypes,
      _creditRate,
      _byokSavings
    );
    
    const scenario: Scenario = {
      id: Date.now(),
      executions: monthlyExecutions,
      workflowIndex: selectedWorkflowIndex,
      tierKey: selectedTier,
      hasByok,
      ...calculation
    };
    
    setScenarios(prev => [...(prev ?? _scenarios), scenario]);
  };

  const removeScenario = (index: number) => {
    setScenarios(prev => (prev ?? _scenarios).filter((_, i) => i !== index));
  };

  // Update scenarios when global variables change
  useEffect(() => {
    setScenarios(prev => (prev ?? _scenarios).map(scenario => ({
      ...scenario,
      ...calculateScenario(
        scenario.executions, 
        scenario.workflowIndex, 
        scenario.tierKey, 
        scenario.hasByok,
        _tiers,
        _workflowTypes,
        _creditRate,
        _byokSavings
      )
    })));
  }, [_creditRate, _creditPackSize, _byokSavings, _tiers, _workflowTypes, _scenarios]);

  // Persist all relevant state to localStorage on change
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    setHasLoaded(true);
  }, []);
  useEffect(() => {
    if (!hasLoaded) return;
    const toPersist = {
      creditRate: _creditRate,
      creditPackSize: _creditPackSize,
      byokSavings: _byokSavings,
      tiers: _tiers,
      workflowTypes: _workflowTypes,
      scenarios: _scenarios
    };
    console.log("[Scenarios] Persisting to localStorage:", toPersist);
    try {
      localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(toPersist));
      const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
      console.log("[Scenarios] localStorage after setItem:", raw);
    } catch (e) {
      console.error("[Scenarios] Error persisting to localStorage:", e);
    }
  }, [_creditRate, _creditPackSize, _byokSavings, _tiers, _workflowTypes, _scenarios, hasLoaded]);


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

        {/* Save to Cloud Button and Modal */}
        {isAdmin && (
          <SaveToCloudButton
            creditRate={creditRate ?? 0.01}
            creditPackSize={creditPackSize ?? 50000}
            byokSavings={byokSavings ?? 60}
            tiers={tiers ?? DEFAULT_TIERS}
            workflowTypes={workflowTypes ?? DEFAULT_WORKFLOW_TYPES}
            scenarios={scenarios ?? []}
          />
        )}

        {isAdmin && onTransferVariables && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                // Persist current scenario variables to localStorage
                const toPersist = {
                  creditRate: _creditRate,
                  creditPackSize: _creditPackSize,
                  byokSavings: _byokSavings,
                  tiers: _tiers,
                  workflowTypes: _workflowTypes,
                  scenarios: _scenarios
                };
                try {
                  localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(toPersist));
                } catch { /* ignore */ }
                onTransferVariables({
                  creditRate: _creditRate,
                  creditPackSize: _creditPackSize,
                  creditPackPrice: _creditRate * _creditPackSize,
                  byokSavings: _byokSavings,
                  tiers: _tiers,
                  workflowTypes: _workflowTypes
                });
              }}
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
              value={_creditRate}
              onChange={(e) => setCreditRate(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isAdmin}
              readOnly={!isAdmin}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Pack Size</label>
            <input
              type="number"
              step="1000"
              value={_creditPackSize}
              onChange={(e) => setCreditPackSize(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isAdmin}
              readOnly={!isAdmin}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Pack Price ($)</label>
            <input
              type="number"
              value={_creditRate * _creditPackSize}
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
              value={_byokSavings}
              onChange={(e) => setByokSavings(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isAdmin}
              readOnly={!isAdmin}
            />
          </div>
        </div>
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
                <th className="text-left p-3 border-b font-semibold">Price per Credit</th>
                <th className="text-left p-3 border-b font-semibold">Fixed Credits/Execution</th>
                <th className="text-left p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>

              {['starter', 'professional', 'business', 'enterprise'].map((key) => {
                const tier = _tiers[key] || { name: key, basePrice: 0, credits: 0, fixedCreditsPerExecution: 0 };
                return (
                  <tr key={key} className={
                    key === 'starter'
                      ? 'bg-blue-50'
                      : key === 'business'
                      ? 'bg-purple-50'
                      : key === 'professional'
                      ? 'bg-teal-50'
                      : 'bg-amber-50'
                  }>
                    <td className="p-3 border-b">
                      <strong>{tier.name}</strong>
                    </td>
                    <td className="p-3 border-b">
                      <input
                        type="number"
                        value={tier.basePrice === 0 ? "" : tier.basePrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          console.log("[Scenarios] input onChange basePrice:", val);
                          if (val === "") {
                            updateTier(key, 'basePrice', 0);
                          } else {
                            const parsed = parseFloat(val);
                            if (!isNaN(parsed)) {
                              updateTier(key, 'basePrice', parsed);
                            }
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={!isAdmin}
                        readOnly={!isAdmin}
                      />
                    </td>
                    <td className="p-3 border-b">
                      <input
                        type="number"
                        step="1000"
                        value={tier.credits}
                        onChange={(e) => updateTier(key, 'credits', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={!isAdmin}
                        readOnly={!isAdmin}
                      />
                    </td>
                    <td
                      className="p-3 border-b text-center"
                      title={
                        tier.credits > 0
                          ? `Price per Credit = Base Price ($${tier.basePrice}) / Included Credits (${tier.credits})`
                          : ''
                      }
                    >
                      {tier.credits > 0
                        ? `${(tier.basePrice / tier.credits).toFixed(4)}`
                        : '—'}
                    </td>
                    <td className="p-3 border-b">
                      <input
                        type="number"
                        step="0.1"
                        value={tier.fixedCreditsPerExecution}
                        onChange={(e) => updateTier(key, 'fixedCreditsPerExecution', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={!isAdmin}
                        readOnly={!isAdmin}
                      />
                    </td>
                    <td className="p-3 border-b">
                      {isAdmin && (
                        <button
                          onClick={() => resetTier(key)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Types */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Workflow Types</h2>
        <div className="space-y-3">

          {_workflowTypes.map((workflow, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => updateWorkflow(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isAdmin}
                readOnly={!isAdmin}
              />
              <input
                type="number"
                value={workflow.credits}
                onChange={(e) => updateWorkflow(index, 'credits', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isAdmin}
                readOnly={!isAdmin}
              />
              {isAdmin && (
                <button
                  onClick={() => removeWorkflow(index)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={addWorkflowType}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Workflow Type
          </button>
        )}
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
                {_workflowTypes.map((workflow, index) => (
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
                {['starter', 'professional', 'business', 'enterprise'].map((key) => {
                  const tier = _tiers[key] || { name: key };
                  return (
                    <option key={key} value={key}>{tier.name}</option>
                  );
                })}
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
                <th className="text-left p-3 border-b font-semibold">#</th>
                <th className="text-left p-3 border-b font-semibold">Executions</th>
                <th className="text-left p-3 border-b font-semibold">Workflow</th>
                <th className="text-left p-3 border-b font-semibold">Workflow Credits</th>
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
              {_scenarios.map((scenario: Scenario, index: number) => (
                <tr key={scenario.id}>
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">{formatNumber(scenario.executions)}</td>
                  <td className="p-3 border-b">{_workflowTypes[scenario.workflowIndex]?.name || 'Unknown'}</td>
                  <td className="p-3 border-b">{_workflowTypes[scenario.workflowIndex]?.credits ?? ''}</td>
                  <td className="p-3 border-b">{_tiers[scenario.tierKey]?.name}</td>
                  <td className="p-3 border-b">{scenario.hasByok ? '✅' : '❌'}</td>
                  <td
                    className="p-3 border-b"
                    title={`Credits Needed = Executions (${scenario.executions}) × (Fixed Credits/Execution (${_tiers[scenario.tierKey]?.fixedCreditsPerExecution}) + Workflow Credits (${_workflowTypes[scenario.workflowIndex]?.credits}))`}
                  >
                    {formatNumber(scenario.totalCreditsNeeded)}
                  </td>
                  <td
                    className="p-3 border-b"
                    title={`Overage Credits = max(0, Credits Needed (${scenario.totalCreditsNeeded}) - Included Credits (${_tiers[scenario.tierKey]?.credits}))`}
                  >
                    {formatNumber(scenario.additionalCreditsNeeded)}
                  </td>
                  <td
                    className="p-3 border-b bg-yellow-100 font-semibold"
                    title={`Total Cost = Base Price ($${_tiers[scenario.tierKey]?.basePrice}) + Additional Credit Cost ($${(scenario.totalCost - _tiers[scenario.tierKey]?.basePrice).toFixed(2)})`}
                  >
                    ${scenario.totalCost.toFixed(2)}
                  </td>
                  <td
                    className="p-3 border-b"
                    title={`Cost/Execution = Total Cost ($${scenario.totalCost.toFixed(2)}) / Executions (${scenario.executions})`}
                  >
                    ${scenario.costPerExecution.toFixed(3)}
                  </td>
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
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
              {_workflowTypes.map((workflow, index) => (
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

              {['starter', 'professional', 'business', 'enterprise'].map((tierKey) => {
                const tier = _tiers[tierKey] || { name: tierKey, basePrice: 0, credits: 0, fixedCreditsPerExecution: 0 };
                const regular = calculateScenario(
                  comparisonExecutions, 
                  comparisonWorkflowIndex, 
                  tierKey, 
                  false,
                  _tiers,
                  _workflowTypes,
                  _creditRate,
                  _byokSavings
                );
                const byok = calculateScenario(
                  comparisonExecutions, 
                  comparisonWorkflowIndex, 
                  tierKey, 
                  true,
                  _tiers,
                  _workflowTypes,
                  _creditRate,
                  _byokSavings
                );
                
                return (
                  <tr key={tierKey} className={
                    tierKey === 'starter'
                      ? 'bg-blue-50'
                      : tierKey === 'business'
                      ? 'bg-purple-50'
                      : tierKey === 'professional'
                      ? 'bg-teal-50'
                      : 'bg-amber-50'
                  }>
                    <td className="p-3 border-b">
                      <strong>{tier.name}</strong>
                    </td>
                    <td className="p-3 border-b">${tier.basePrice}</td>
                    <td
                      className="p-3 border-b"
                      title={`Credits Needed = Executions (${comparisonExecutions}) × (Fixed Credits/Execution (${tier.fixedCreditsPerExecution}) + Workflow Credits (${_workflowTypes[comparisonWorkflowIndex]?.credits}))`}
                    >
                      {formatNumber(regular.totalCreditsNeeded)}
                    </td>
                    <td
                      className="p-3 border-b"
                      title={`Overage Credits = max(0, Credits Needed (${regular.totalCreditsNeeded}) - Included Credits (${tier.credits}))`}
                    >
                      {formatNumber(regular.additionalCreditsNeeded)}
                    </td>
                    <td
                      className="p-3 border-b"
                      title={`Total Cost = Base Price ($${tier.basePrice}) + Additional Credit Cost ($${(regular.totalCost - tier.basePrice).toFixed(2)})\nAdditional Credit Cost = Overage Credits (${regular.additionalCreditsNeeded}) × Credit Rate ($${_creditRate.toFixed(4)}) = $${(regular.additionalCreditsNeeded * _creditRate).toFixed(2)}`}
                    >
                      ${regular.totalCost.toFixed(2)}
                    </td>
                    <td
                      className="p-3 border-b"
                      title={`Cost/Execution = Total Cost ($${regular.totalCost.toFixed(2)}) / Executions (${comparisonExecutions})`}
                    >
                      ${regular.costPerExecution.toFixed(3)}
                    </td>
                    <td
                      className="p-3 border-b"
                      title={`Total Cost (BYOK) = Base Price ($${tier.basePrice}) + Additional Credit Cost after BYOK savings ($${(byok.totalCost - tier.basePrice).toFixed(2)})\n
Additional Credit Cost after BYOK = Overage Credits after BYOK savings (${byok.additionalCreditsAfterByok.toFixed(0)}) × Credit Rate ($${_creditRate.toFixed(4)}) = $${(byok.additionalCreditsAfterByok * _creditRate).toFixed(2)}\n
Overage Credits after BYOK savings = Overage Credits (${regular.additionalCreditsNeeded}) - (Variable Credits in Overage (${Math.min(regular.additionalCreditsNeeded, comparisonExecutions * (_workflowTypes[comparisonWorkflowIndex]?.credits ?? 0))}) × BYOK Savings (${_byokSavings}%)) = ${byok.additionalCreditsAfterByok.toFixed(0)}\n
BYOK reduces the variable portion of overage credits by ${_byokSavings}%`}
                    >
                      ${byok.totalCost.toFixed(2)}
                    </td>
                    <td
                      className="p-3 border-b"
                      title={`Cost/Execution (BYOK) = Total Cost (BYOK) ($${byok.totalCost.toFixed(2)}) / Executions (${comparisonExecutions})`}
                    >
                      ${byok.costPerExecution.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Analysis Section (temporarily hidden) */}
      {/* ChartControls and all chart components are hidden for now */}
    </div>
  );
};


/* (Base64ExportButton removed as it was unused) */

/** Save to Cloud Button and Modal */
const SaveToCloudButton: React.FC<{
  creditRate: number;
  creditPackSize: number;
  byokSavings: number;
  tiers: Record<string, Tier>;
  workflowTypes: WorkflowType[];
  scenarios: Scenario[];
}> = ({ creditRate, creditPackSize, byokSavings, tiers, workflowTypes, scenarios }) => {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setDocId(null);
    try {
      const doc = {
        creditRate,
        creditPackSize,
        byokSavings,
        tiers,
        workflowTypes,
        scenarios,
        type: "saas-credits"
      };
      console.log("DEBUG: Saving to cloud with doc:", JSON.parse(JSON.stringify(doc)));
      const res = await fetch("/api/scenario-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(doc)
      });
      if (!res.ok) throw new Error("Failed to save to backend");
      const data = await res.json();
      setDocId(data.id);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to save to backend");
    } finally {
      setSaving(false);
      setShow(true);
    }
  };

  const handleCopy = () => {
    if (docId) {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?id=${docId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save to Cloud"}
        </button>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
            <button
              onClick={() => setShow(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Cloud Config Saved</h2>
            {error && (
              <div className="mb-2 text-red-600">{error}</div>
            )}
            {docId && (
              <>
                <div className="mb-2">
                  <span className="font-mono text-xs break-all">ID: {docId}</span>
                </div>
                <textarea
                  className="w-full h-16 p-2 border border-gray-300 rounded mb-3 font-mono text-xs resize-none"
                  value={`${window.location.origin}${window.location.pathname}?id=${docId}`}
                  readOnly
                  onFocus={e => e.target.select()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    onClick={() => setShow(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 break-all">
                  Use this URL to load these values from the cloud.
                </div>
              </>
            )}
            {!docId && !error && (
              <div className="text-gray-600">No ID returned from server.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Scenarios;
