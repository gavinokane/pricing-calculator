import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tier, WorkflowType } from './types';
import { calculateScenario } from './utils';

interface CostVolumeChartProps {
  tiers: Record<string, Tier>;
  workflowTypes: WorkflowType[];
  selectedWorkflowIndex: number;
  creditRate: number;
  byokSavings: number;
  maxExecutions?: number;
}

const CostVolumeChart: React.FC<CostVolumeChartProps> = ({
  tiers,
  workflowTypes,
  selectedWorkflowIndex,
  creditRate,
  byokSavings,
  maxExecutions = 5000
}) => {
  // Generate data points for the chart
  const generateDataPoints = () => {
    const points = [];
    const step = Math.max(1, Math.floor(maxExecutions / 50)); // 50 data points max
    
    for (let executions = 0; executions <= maxExecutions; executions += step) {
      if (executions === 0) executions = 1; // Avoid division by zero
      
      const dataPoint: any = { executions };
      
      Object.entries(tiers).forEach(([tierKey, tier]) => {
        // Without BYOK
        const resultRegular = calculateScenario(
          executions,
          selectedWorkflowIndex,
          tierKey,
          false,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        // With BYOK
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
        
        dataPoint[`${tier.name}`] = resultRegular.totalCost;
        dataPoint[`${tier.name} (BYOK)`] = resultByok.totalCost;
      });
      
      points.push(dataPoint);
    }
    
    return points;
  };

  const data = generateDataPoints();
  
  // Define colors for each tier
  const tierColors = {
    'Starter': '#3b82f6',
    'Business': '#8b5cf6',
    'Professional': '#14b8a6',
    'Enterprise': '#f59e0b'
  };
  
  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;
  const formatExecutions = (value: number) => `${value.toLocaleString()}`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Cost vs Volume Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Total monthly cost across execution volumes for {workflowTypes[selectedWorkflowIndex]?.name || 'selected workflow'}
        </p>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <span>Regular pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed' }}></div>
            <span>With BYOK savings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostVolumeChart;
