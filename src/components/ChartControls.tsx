import React from 'react';
import { Settings, BarChart3 } from 'lucide-react';
import { WorkflowType } from './types';

interface ChartControlsProps {
  workflowTypes: WorkflowType[];
  selectedWorkflowIndex: number;
  onWorkflowChange: (index: number) => void;
  fixedExecutions: number;
  onExecutionsChange: (executions: number) => void;
  maxExecutions: number;
  onMaxExecutionsChange: (maxExecutions: number) => void;
  activeChartSection: string;
  onChartSectionChange: (section: string) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  workflowTypes,
  selectedWorkflowIndex,
  onWorkflowChange,
  fixedExecutions,
  onExecutionsChange,
  maxExecutions,
  onMaxExecutionsChange,
  activeChartSection,
  onChartSectionChange
}) => {
  const chartSections = [
    { id: 'volume', name: 'Volume Analysis', description: 'Cost vs execution volume' },
    { id: 'efficiency', name: 'Efficiency Analysis', description: 'Cost per execution & credit utilization' },
    { id: 'comparison', name: 'Comparison Analysis', description: 'BYOK savings & workflow comparison' },
    { id: 'breakeven', name: 'Break-Even Analysis', description: 'Tier transition points' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Chart Analysis Controls</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Workflow Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workflow Type
          </label>
          <select
            value={selectedWorkflowIndex}
            onChange={(e) => onWorkflowChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {workflowTypes.map((workflow, index) => (
              <option key={index} value={index}>
                {workflow.name} ({workflow.credits} credits)
              </option>
            ))}
          </select>
        </div>

        {/* Fixed Executions for Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Point (Executions)
          </label>
          <input
            type="number"
            value={fixedExecutions}
            onChange={(e) => onExecutionsChange(parseInt(e.target.value) || 1000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="100"
          />
          <div className="text-xs text-gray-500 mt-1">
            For comparison charts
          </div>
        </div>

        {/* Max Executions for Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chart Range (Max Executions)
          </label>
          <input
            type="number"
            value={maxExecutions}
            onChange={(e) => onMaxExecutionsChange(parseInt(e.target.value) || 5000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1000"
            step="1000"
          />
          <div className="text-xs text-gray-500 mt-1">
            For volume charts
          </div>
        </div>

        {/* Current Analysis Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-800 mb-1">
            Current Analysis
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Workflow: {workflowTypes[selectedWorkflowIndex]?.name.split(' ').slice(0, 2).join(' ')}</div>
            <div>Credits: {workflowTypes[selectedWorkflowIndex]?.credits}</div>
            <div>Range: 1 - {maxExecutions.toLocaleString()}</div>
            <div>Point: {fixedExecutions.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {chartSections.map((section) => (
            <button
              key={section.id}
              onClick={() => onChartSectionChange(section.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeChartSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div>{section.name}</div>
                <div className="text-xs opacity-75">{section.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ChartControls;