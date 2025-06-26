import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Tier, WorkflowType } from './types';
import { calculateScenario } from './utils';

interface ComparisonChartsProps {
  tiers: Record<string, Tier>;
  workflowTypes: WorkflowType[];
  creditRate: number;
  byokSavings: number;
  fixedExecutions?: number;
}

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  tiers,
  workflowTypes,
  creditRate,
  byokSavings,
  fixedExecutions = 1000
}) => {
  // BYOK Savings Impact Data
  const generateByokSavingsData = () => {
    return Object.entries(tiers).map(([tierKey, tier]) => {
      const savingsData = workflowTypes.map((workflow, workflowIndex) => {
        const regular = calculateScenario(
          fixedExecutions,
          workflowIndex,
          tierKey,
          false,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        const withByok = calculateScenario(
          fixedExecutions,
          workflowIndex,
          tierKey,
          true,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        const absoluteSavings = regular.totalCost - withByok.totalCost;
        const percentageSavings = regular.totalCost > 0 ? (absoluteSavings / regular.totalCost) * 100 : 0;
        
        return {
          workflow: workflow.name,
          tier: tier.name,
          regularCost: regular.totalCost,
          byokCost: withByok.totalCost,
          absoluteSavings,
          percentageSavings,
          workflowComplexity: workflow.credits
        };
      });
      
      return {
        tier: tier.name,
        workflows: savingsData,
        averageSavings: savingsData.reduce((sum, w) => sum + w.absoluteSavings, 0) / savingsData.length
      };
    });
  };

  // Workflow Type Comparison Matrix (Heatmap-style data)
  const generateWorkflowComparisonData = () => {
    return workflowTypes.map((workflow, workflowIndex) => {
      const workflowData: any = {
        workflow: workflow.name,
        credits: workflow.credits,
        complexity: workflow.credits > 100 ? 'High' : workflow.credits > 50 ? 'Medium' : 'Low'
      };
      
      Object.entries(tiers).forEach(([tierKey, tier]) => {
        const result = calculateScenario(
          fixedExecutions,
          workflowIndex,
          tierKey,
          false,
          tiers,
          workflowTypes,
          creditRate,
          byokSavings
        );
        
        workflowData[tier.name] = result.costPerExecution;
        workflowData[`${tier.name}_total`] = result.totalCost;
      });
      
      return workflowData;
    });
  };

  // Flatten BYOK savings data for chart
  const byokSavingsData = generateByokSavingsData();
  const flattenedByokData = byokSavingsData.flatMap(tierData => 
    tierData.workflows.map(w => ({
      ...w,
      tierWorkflow: `${w.tier} - ${w.workflow.split(' ').slice(0, 2).join(' ')}`
    }))
  ).filter(item => item.absoluteSavings > 0); // Only show items with actual savings

  const workflowComparisonData = generateWorkflowComparisonData();
  
  const tierColors = {
    'Starter': '#3b82f6',
    'Business': '#8b5cf6', 
    'Enterprise': '#f59e0b'
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Get color based on tier for BYOK chart
  const getBarColor = (tierName: string) => {
    return tierColors[tierName as keyof typeof tierColors] || '#6b7280';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* BYOK Savings Impact Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            BYOK Savings Impact
          </h3>
          <p className="text-sm text-gray-600">
            Dollar savings from BYOK across tiers and workflows at {fixedExecutions.toLocaleString()} executions
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flattenedByokData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="tierWorkflow" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'absoluteSavings') return [formatCurrency(value), 'Monthly Savings'];
                  return [value, name];
                }}
                labelFormatter={(label: string) => `${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              
              <Bar dataKey="absoluteSavings">
                {flattenedByokData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.tier)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Higher complexity workflows and higher tiers typically show greater BYOK savings</p>
        </div>
      </div>

      {/* Workflow Type Comparison Matrix */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Workflow Cost Comparison
          </h3>
          <p className="text-sm text-gray-600">
            Cost per execution by workflow complexity at {fixedExecutions.toLocaleString()} executions
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workflowComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="workflow" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), `${name} - Cost/Execution`]}
                labelFormatter={(label: string) => label}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              
              {Object.entries(tiers).map(([tierKey, tier]) => (
                <Bar
                  key={tierKey}
                  dataKey={tier.name}
                  fill={tierColors[tier.name as keyof typeof tierColors]}
                  name={tier.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Enterprise tier shows consistent low cost-per-execution across all workflow types</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCharts;