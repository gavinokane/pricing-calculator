import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tier, WorkflowType } from './types';
import { calculateScenario } from './utils';

interface EfficiencyChartsProps {
  tiers: Record<string, Tier>;
  workflowTypes: WorkflowType[];
  selectedWorkflowIndex: number;
  creditRate: number;
  byokSavings: number;
  fixedExecutions?: number;
}

const EfficiencyCharts: React.FC<EfficiencyChartsProps> = ({
  tiers,
  workflowTypes,
  selectedWorkflowIndex,
  creditRate,
  byokSavings,
  fixedExecutions = 1000
}) => {
  // Chart data point type
  type EfficiencyDataPoint = { executions: number; [key: string]: number };

  // Cost per execution data across volumes
  const generateCostPerExecutionData = () => {
    const points: EfficiencyDataPoint[] = [];
    const maxExecutions = 5000;
    const step = Math.max(1, Math.floor(maxExecutions / 30));
    
    for (let executions = step; executions <= maxExecutions; executions += step) {
      const dataPoint: EfficiencyDataPoint = { executions };
      
      Object.entries(tiers).forEach(([tierKey, tier]) => {
        const result = calculateScenario(
          executions,
          selectedWorkflowIndex,
          tierKey,
          false,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        const resultByok = calculateScenario(
          executions,
          selectedWorkflowIndex,
          tierKey,
          true,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        dataPoint[`${tier.name}`] = result.costPerExecution;
        dataPoint[`${tier.name} (BYOK)`] = resultByok.costPerExecution;
      });
      
      points.push(dataPoint);
    }
    
    return points;
  };

  // Credit utilization data for fixed execution volume
  const generateCreditUtilizationData = () => {
    return Object.entries(tiers).map(([tierKey, tier]) => {
      const result = calculateScenario(
        fixedExecutions,
        selectedWorkflowIndex,
        tierKey,
        false,
        tiers,
        workflowTypes,
        creditRate,
        byokSavings
      );
      
      const utilizationPercentage = Math.min(100, (result.totalCreditsNeeded / result.includedCredits) * 100);
      const wastedCredits = Math.max(0, result.includedCredits - result.totalCreditsNeeded);
      const overageCredits = Math.max(0, result.totalCreditsNeeded - result.includedCredits);
      
      return {
        tier: tier.name,
        utilized: Math.min(result.totalCreditsNeeded, result.includedCredits),
        wasted: wastedCredits,
        overage: overageCredits,
        utilizationPercentage: utilizationPercentage,
        totalIncluded: result.includedCredits
      };
    });
  };

  const costPerExecutionData = generateCostPerExecutionData();
  const creditUtilizationData = generateCreditUtilizationData();
  
  const tierColors = {
    'Starter': '#3b82f6',
    'Business': '#8b5cf6',
    'Professional': '#14b8a6',
    'Enterprise': '#f59e0b'
  };

  const formatCurrency = (value: number) => `$${value.toFixed(3)}`;
  const formatExecutions = (value: number) => `${value.toLocaleString()}`;
  const formatCredits = (value: number) => `${value.toLocaleString()} credits`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost Per Execution Efficiency Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Cost Per Execution Efficiency
          </h3>
          <p className="text-sm text-gray-600">
            How cost-per-execution decreases with volume for {workflowTypes[selectedWorkflowIndex]?.name || 'selected workflow'}
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costPerExecutionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="executions" 
                tickFormatter={formatExecutions}
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(value: number) => `${formatExecutions(value)} executions`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              
              {['starter', 'professional', 'business', 'enterprise'].map((tierKey) => {
                const tier = tiers[tierKey];
                if (!tier) return null;
                return (
                  <React.Fragment key={tierKey}>
                    <Line
                      type="monotone"
                      dataKey={tier.name}
                      stroke={tierColors[tier.name as keyof typeof tierColors]}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="0"
                    />
                    <Line
                      type="monotone"
                      dataKey={`${tier.name} (BYOK)`}
                      stroke={tierColors[tier.name as keyof typeof tierColors]}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credit Utilization Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Credit Utilization Efficiency
          </h3>
          <p className="text-sm text-gray-600">
            Credit usage breakdown at {formatExecutions(fixedExecutions)} executions
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={creditUtilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="tier" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels = {
                    utilized: 'Utilized Credits',
                    wasted: 'Wasted Credits', 
                    overage: 'Overage Credits'
                  };
                  return [formatCredits(value), labels[name as keyof typeof labels] || name];
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              
              <Bar 
                dataKey="utilized" 
                stackId="credits" 
                fill="#10b981" 
                name="utilized"
              />
              <Bar 
                dataKey="wasted" 
                stackId="credits" 
                fill="#6b7280" 
                name="wasted"
              />
              <Bar 
                dataKey="overage" 
                stackId="credits" 
                fill="#ef4444" 
                name="overage"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Utilized (within plan)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Wasted (unused)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Overage (extra cost)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyCharts;
