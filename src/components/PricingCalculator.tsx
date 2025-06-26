import React, { useState } from 'react';
import { Calculator, Zap, Building, Crown, Key, AlertCircle, Info } from 'lucide-react';

const PricingCalculator = () => {
  const [usage, setUsage] = useState({
    executions: 500,
    variableCreditsPerExecution: 10,
    hasApiKeys: false
  });

  const [selectedTier, setSelectedTier] = useState('starter');

  // Credit pricing
  const CREDIT_RATE = 0.01; // $0.004 per credit
  const CREDIT_PACK_SIZE = 50000;
  const CREDIT_PACK_PRICE = 50;

  // Pricing tiers configuration
  const tiers = {
    starter: {
      name: 'Starter',
      icon: <Zap className="w-5 h-5" />,
      basePrice: 50,
      color: 'bg-blue-500',
      credits: 1000,
      fixedCreditsPerExecution: 10,
      workspace: 'Shared',
      features: [
        '1,000 credits included',
        '4 credits fixed cost per execution',
        'Shared workspace',
        'Pre-built agent templates',
        'Basic workflow builder',
        'Standard integrations',
        'Community support',
        'Usage analytics'
      ]
    },
    business: {
      name: 'Business',
      icon: <Building className="w-5 h-5" />,
      basePrice: 400,
      color: 'bg-purple-500',
      credits: 50000,
      fixedCreditsPerExecution: 5,
      workspace: 'Private',
      features: [
        '200,000 credits included',
        '3 credits fixed cost per execution',
        'Private workspace',
        'Custom agent development',
        'Advanced workflow automation',
        'Premium integrations',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'API access'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      icon: <Crown className="w-5 h-5" />,
      basePrice: 1000,
      color: 'bg-amber-500',
      credits: 100000,
      fixedCreditsPerExecution: .5,
      workspace: 'Private + SSO',
      features: [
        '300,000 credits included',
        '2 credits fixed cost per execution',
        'Private workspace with SSO',
        'Role-based access control (RBAC)',
        'Unlimited custom agents',
        'Enterprise workflow engine',
        'Custom integrations',
        'Dedicated support with SLA',
        'Custom analytics & reporting',
        'Advanced security features',
        'On-premise deployment option'
      ]
    }
  };

  // Workflow types with variable credit costs
  const workflowTypes = [
    { 
      name: 'Simple Email Classifier', 
      credits: 10, 
      description: '1 LLM call (classification), 2 compute steps (routing, logging)' 
    },
    { 
      name: 'Basic Data Processing', 
      credits: 15, 
      description: '2 LLM calls (validation, formatting), 5 compute steps' 
    },
    { 
      name: 'Content Summarization', 
      credits: 25, 
      description: '1 large LLM call (summarization), 3 compute steps' 
    },
    { 
      name: 'Classifier Sharepoint+BOX', 
      credits: 30, 
      description: '2 LLM call (classification), 3 compute steps (routing, logging)' 
    },
    { 
      name: 'Report Generation', 
      credits: 40, 
      description: '2 LLM calls (research, writing), 5 compute steps' 
    },
    { 
      name: 'Research & Analysis', 
      credits: 50, 
      description: '4 LLM calls (research, analysis, synthesis), 8 compute steps' 
    },
    { 
      name: 'Complex Multi-Step Agent', 
      credits: 100, 
      description: '6 LLM calls (planning, execution, validation), 10 compute steps' 
    },
    { 
      name: 'Advanced Multi-Agent System', 
      credits: 200, 
      description: '8+ LLM calls (coordination, execution, review), 15+ compute steps' 
    }
  ];

  const calculateCreditUsage = () => {
    const currentTier = tiers[selectedTier];
    const totalCreditsPerExecution = currentTier.fixedCreditsPerExecution + usage.variableCreditsPerExecution;
    const totalCreditsNeeded = usage.executions * totalCreditsPerExecution;
    const includedCredits = currentTier.credits;
    
    let additionalCreditsNeeded = Math.max(0, totalCreditsNeeded - includedCredits);
    
    // BYOK discount calculation (reduces variable costs by ~50-80% typically)
    if (usage.hasApiKeys && additionalCreditsNeeded > 0) {
      // Estimate that BYOK saves about 60% on variable costs (LLM calls)
      // This is a simplified calculation - in reality it depends on the execution mix
      const variableCreditsInOverage = Math.min(additionalCreditsNeeded, usage.executions * usage.variableCreditsPerExecution);
      const estimatedSavings = variableCreditsInOverage * 0.6;
      additionalCreditsNeeded = Math.max(0, additionalCreditsNeeded - estimatedSavings);
    }
    
    const additionalCreditCost = additionalCreditsNeeded * CREDIT_RATE;
    const totalCost = currentTier.basePrice + additionalCreditCost;
    
    return {
      totalCreditsPerExecution,
      totalCreditsNeeded,
      includedCredits,
      additionalCreditsNeeded: Math.max(0, totalCreditsNeeded - includedCredits),
      additionalCreditsAfterByok: additionalCreditsNeeded,
      additionalCreditCost,
      totalCost,
      creditPacksNeeded: Math.ceil(additionalCreditsNeeded / CREDIT_PACK_SIZE)
    };
  };

  const costBreakdown = calculateCreditUsage();

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Doozer AI Pricing Calculator</h1>
        </div>
        <p className="text-gray-600">Calculate your monthly costs based on credit usage</p>
        <div className="mt-2 text-sm text-gray-500">
          Needs updated...Credit Rate: $50 per 10,000 credits ($0.004 per credit)
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
                  value={usage.variableCreditsPerExecution}
                  onChange={(e) => setUsage(prev => ({
                    ...prev,
                    variableCreditsPerExecution: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workflowTypes.map((workflow, index) => (
                    <option key={index} value={workflow.credits}>
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
                      BYOK saves ~60% on variable costs by eliminating our 20% markup on third-party provider fees.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Select Plan</h3>
              <div className="space-y-2">
                {Object.entries(tiers).map(([key, tier]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTier(key)}
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
                ))}
              </div>
            </div>

            {/* Workflow Type Details */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 text-gray-800">Selected Workflow Details</h3>
              {(() => {
                const selectedWorkflow = workflowTypes.find(w => w.credits === usage.variableCreditsPerExecution);
                return selectedWorkflow ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                    <div className="font-medium text-blue-900">{selectedWorkflow.name}</div>
                    <div className="text-blue-700 mt-1">{selectedWorkflow.description}</div>
                    <div className="text-blue-600 font-medium mt-2">{selectedWorkflow.credits} variable credits per execution</div>
                  </div>
                ) : null;
              })()}
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
                <span>Total Monthly Cost:</span>
                <span className={`${tiers[selectedTier].color} text-white px-3 py-1 rounded`}>
                  ${costBreakdown.totalCost.toFixed(2)}
                </span>
              </div>

              {costBreakdown.creditPacksNeeded > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Equivalent to {costBreakdown.creditPacksNeeded} credit pack{costBreakdown.creditPacksNeeded !== 1 ? 's' : ''} 
                  (${costBreakdown.creditPacksNeeded * CREDIT_PACK_PRICE} at $40/10k credits)
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
                    <span className="font-medium">{usage.variableCreditsPerExecution} credits</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1 border-t pt-1">
                    <span className="font-medium">Total Credits per Execution</span>
                    <span className="font-medium">{costBreakdown.totalCreditsPerExecution} credits</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Credits Needed</span>
                    <span className="font-medium">{formatNumber(costBreakdown.totalCreditsNeeded)} credits</span>
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
                      <span className="text-red-600">
                        Overage: {formatNumber(costBreakdown.additionalCreditsNeeded)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Comparison */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Cost per Execution Across Tiers</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tiers).map(([tierKey, tier]) => {
                  const tierCreditsPerExecution = tier.fixedCreditsPerExecution + usage.variableCreditsPerExecution;
                  const tierCostPerExecution = tierCreditsPerExecution * CREDIT_RATE;
                  const isCurrentTier = tierKey === selectedTier;
                  
                  return (
                    <div key={tierKey} className={`p-3 rounded-lg border-2 ${isCurrentTier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium text-gray-800">{tier.name}</div>
                      <div className="text-xs text-gray-600">{tier.fixedCreditsPerExecution} + {usage.variableCreditsPerExecution} credits</div>
                      <div className="text-sm font-bold text-gray-800">${tierCostPerExecution.toFixed(3)}/execution</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Higher tiers have lower fixed costs per execution, making them more efficient for high-volume usage.
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Plan Features</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {tiers[selectedTier].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit System Explanation */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">How Credits Work</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Execution Costs</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div><strong>Fixed Cost per Execution:</strong></div>
              <div>• Starter: 4 credits</div>
              <div>• Business: 3 credits</div> 
              <div>• Enterprise: 2 credits</div>
              <div className="pt-2"><strong>Variable Costs:</strong></div>
              <div>• LLM calls: Provider cost + 20% markup</div>
              <div>• Compute steps: 1 credit each (limited time)</div>
              <div>• BYOK: 0 credits for third-party calls</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Additional Credits</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div>When you exceed your monthly allowance:</div>
              <div>• Purchase credit packs: $40 per 10,000 credits</div>
              <div>• Or pay overage at $0.004 per credit</div>
              <div>• BYOK can reduce overage costs significantly</div>
              <div className="pt-2 text-blue-600">
                <strong>Pro tip:</strong> Bring your own OpenAI/Anthropic API keys to save on variable costs!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;