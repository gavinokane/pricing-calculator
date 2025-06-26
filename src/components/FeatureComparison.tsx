import React from "react";

interface Tier {
  name: string;
  basePrice: number;
  credits: number;
  fixedCreditsPerExecution: number;
}

interface FeatureComparisonProps {
  tiers: Record<string, Tier>;
  onBack?: () => void;
}

const formatNumber = (num: number) => num.toLocaleString();

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ tiers, onBack }) => (
  <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
    {onBack && (
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <span className="text-lg">&larr;</span>
        Back to Calculator
      </button>
    )}
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Feature Comparison Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border-b font-semibold text-left">Feature</th>
              <th className="p-3 border-b font-semibold text-center">Starter</th>
              <th className="p-3 border-b font-semibold text-center">Business</th>
              <th className="p-3 border-b font-semibold text-center">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b">Credits/Month</td>
              <td className="p-3 border-b text-center">{formatNumber(tiers.starter?.credits ?? 0)}</td>
              <td className="p-3 border-b text-center">{formatNumber(tiers.business?.credits ?? 0)}</td>
              <td className="p-3 border-b text-center">{formatNumber(tiers.enterprise?.credits ?? 0)}</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Fixed Cost/Execution</td>
              <td className="p-3 border-b text-center">{tiers.starter?.fixedCreditsPerExecution ?? 0} credits</td>
              <td className="p-3 border-b text-center">{tiers.business?.fixedCreditsPerExecution ?? 0} credits</td>
              <td className="p-3 border-b text-center">{tiers.enterprise?.fixedCreditsPerExecution ?? 0} credits</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Workspaces</td>
              <td className="p-3 border-b text-center">1</td>
              <td className="p-3 border-b text-center">5</td>
              <td className="p-3 border-b text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Agents</td>
              <td className="p-3 border-b text-center">3</td>
              <td className="p-3 border-b text-center">8</td>
              <td className="p-3 border-b text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Users</td>
              <td className="p-3 border-b text-center">3</td>
              <td className="p-3 border-b text-center">25</td>
              <td className="p-3 border-b text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Workflow Builder</td>
              <td className="p-3 border-b text-center">✅ Basic</td>
              <td className="p-3 border-b text-center">✅ Advanced</td>
              <td className="p-3 border-b text-center">✅ Enterprise</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Inter-Agent Collaboration</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Integrations</td>
              <td className="p-3 border-b text-center">Basic (5)</td>
              <td className="p-3 border-b text-center">Premium (25+)</td>
              <td className="p-3 border-b text-center">Enterprise (Unlimited)</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Support</td>
              <td className="p-3 border-b text-center">Community</td>
              <td className="p-3 border-b text-center">Priority Email</td>
              <td className="p-3 border-b text-center">24/7 Dedicated SLA</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Uptime SLA</td>
              <td className="p-3 border-b text-center">Best Effort</td>
              <td className="p-3 border-b text-center">99.5%</td>
              <td className="p-3 border-b text-center">99.9%</td>
            </tr>
            <tr>
              <td className="p-3 border-b">API Access</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅ Full Suite</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Custom Templates</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">SSO</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">BYOK Support</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Usage Analytics</td>
              <td className="p-3 border-b text-center">Basic</td>
              <td className="p-3 border-b text-center">Advanced</td>
              <td className="p-3 border-b text-center">Custom</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Workflow Scheduling</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Audit Logs</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Data Export</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">CSV/JSON</td>
              <td className="p-3 border-b text-center">All Formats</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Custom Domain</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">✅</td>
            </tr>
            <tr>
              <td className="p-3 border-b">Multi-Agent Orchestration</td>
              <td className="p-3 border-b text-center">❌</td>
              <td className="p-3 border-b text-center">Basic</td>
              <td className="p-3 border-b text-center">Advanced</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default FeatureComparison;
