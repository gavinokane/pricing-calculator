import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Tier, WorkflowType } from './types';
import { calculateScenario } from './utils';

interface BreakEvenChartProps {
  tiers: Record<string, Tier>;
  workflowTypes: WorkflowType[];
  selectedWorkflowIndex: number;
  creditRate: number;
  byokSavings: number;
  maxExecutions?: number;
}

const BreakEvenChart: React.FC<BreakEvenChartProps> = ({
  tiers,
  workflowTypes,
  selectedWorkflowIndex,
  creditRate,
  byokSavings,
  maxExecutions = 10000
}) => {
  // Calculate break-even points
  const findBreakEvenPoints = () => {
    const tierNames = Object.keys(tiers);
    const breakEvenPoints: { point: number; from: string; to: string; savings: number }[] = [];
    
    // Check each execution level to find crossover points
    for (let executions = 1; executions <= maxExecutions; executions += 50) {
      const costs = tierNames.map(tierKey => {
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
        return { tier: tierKey, cost: result.totalCost, executions };
      });
      
      // Sort by cost
      costs.sort((a, b) => a.cost - b.cost);
      
      // Check for tier changes from previous execution level
      if (executions > 1) {
        const prevCosts = tierNames.map(tierKey => {
          const result = calculateScenario(
            executions - 50,
            selectedWorkflowIndex,
            tierKey,
            false,
            tiers,
            workflowTypes,
            creditRate,
            byokSavings
          );
          return { tier: tierKey, cost: result.totalCost };
        });
        
        prevCosts.sort((a, b) => a.cost - b.cost);
        
        // If the cheapest tier changed, we found a break-even point
        if (costs[0].tier !== prevCosts[0].tier) {
          const fromTier = tiers[prevCosts[0].tier].name;
          const toTier = tiers[costs[0].tier].name;
          const savings = prevCosts[0].cost - costs[0].cost;
          
          breakEvenPoints.push({
            point: executions,
            from: fromTier,
            to: toTier,
            savings
          });
        }
      }
    }
    
    return breakEvenPoints;
  };

  // Generate chart data
  const generateChartData = () => {
    const points = [];
    const step = Math.max(1, Math.floor(maxExecutions / 100));
    
    for (let executions = step; executions <= maxExecutions; executions += step) {
      const dataPoint: any = { executions };
      
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
        
        dataPoint[tier.name] = result.totalCost;
      });
      
      points.push(dataPoint);
    }
    
    return points;
  };

  // Generate efficiency comparison data (cost per execution)
  const generateEfficiencyData = () => {
    const points = [];
    const step = Math.max(1, Math.floor(maxExecutions / 100));
    
    for (let executions = step; executions <= maxExecutions; executions += step) {
      const dataPoint: any = { executions };
      
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
        
        dataPoint[`${tier.name}_efficiency`] = result.costPerExecution;
      });
      
      points.push(dataPoint);
    }
    
    return points;
  };

  const chartData = generateChartData();
  const efficiencyData = generateEfficiencyData();
  const breakEvenPoints = findBreakEvenPoints();
  
  const tierColors = {
    'Starter': '#3b82f6',
    'Business': '#8b5cf6', 
    'Professional': '#14b8a6',
    'Enterprise': '#f59e0b'
  };

  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;
  const formatExecutions = (value: number) => `${value.toLocaleString()}`;
  const formatEfficiency = (value: number) => `$${value.toFixed(3)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Break-Even Analysis Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Tier Break-Even Analysis
          </h3>
          <p className="text-sm text-gray-600">
            Total cost comparison showing optimal tier transitions for {workflowTypes[selectedWorkflowIndex]?.name || 'selected workflow'}
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  <Line
                    key={tierKey}
                    type="monotone"
                    dataKey={tier.name}
                    stroke={tierColors[tier.name as keyof typeof tierColors]}
                    strokeWidth={3}
                    dot={false}
                  />
                );
              })}
              
              {/* Add reference lines for break-even points */}
              {breakEvenPoints.slice(0, 3).map((point, index) => (
                <ReferenceLine
                  key={index}
                  x={point.point}
                  stroke="#ef4444"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Break-even summary */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Key Break-Even Points:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {breakEvenPoints.slice(0, 3).map((point, index) => (
              <div key={index} className="flex justify-between">
                <span>{formatExecutions(point.point)} executions:</span>
                <span className="font-medium">{point.from} → {point.to}</span>
              </div>
            ))}
            {breakEvenPoints.length === 0 && (
              <p className="text-gray-500 italic">No tier transitions in this range</p>
            )}
          </div>
        </div>
      </div>

      {/* Cost Efficiency Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Cost Efficiency Trends
          </h3>
          <p className="text-sm text-gray-600">
            Cost per execution showing scale economics across tiers
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={efficiencyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="executions" 
                tickFormatter={formatExecutions}
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis tickFormatter={formatEfficiency} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatEfficiency(value), 
                  name.replace('_efficiency', '') + ' Cost/Execution'
                ]}
                labelFormatter={(value: number) => `${formatExecutions(value)} executions`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <Legend 
                formatter={(value: string) => value.replace('_efficiency', '')}
              />
              
              {['starter', 'professional', 'business', 'enterprise'].map((tierKey) => {
                const tier = tiers[tierKey];
                if (!tier) return null;
                return (
                  <Line
                    key={tierKey}
                    type="monotone"
                    dataKey={`${tier.name}_efficiency`}
                    stroke={tierColors[tier.name as keyof typeof tierColors]}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Higher tiers show lower cost-per-execution at scale due to lower fixed costs</p>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenChart;
