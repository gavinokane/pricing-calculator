# Pricing Calculator VSCode Project Setup Script for Windows PowerShell
param(
    [string]$ProjectName = "pricing-calculator"
)

$ErrorActionPreference = "Stop"

$CurrentDir = Get-Location
$ProjectDir = Join-Path $CurrentDir $ProjectName

Write-Host "Setting up Pricing Calculator VSCode project..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Create project directory
if (Test-Path $ProjectDir) {
    $response = Read-Host "Directory $ProjectName already exists. Remove it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item -Recurse -Force $ProjectDir
        Write-Host "Removed existing directory" -ForegroundColor Green
    } else {
        Write-Host "Aborting setup" -ForegroundColor Red
        exit 1
    }
}

New-Item -ItemType Directory -Path $ProjectDir | Out-Null
Set-Location $ProjectDir

# Initialize npm project
Write-Host "Initializing npm project..." -ForegroundColor Blue
npm init -y | Out-Null

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install react react-dom lucide-react

# Install dev dependencies
Write-Host "Installing dev dependencies..." -ForegroundColor Blue
npm install -D @types/react @types/react-dom @vitejs/plugin-react vite typescript tailwindcss postcss autoprefixer eslint "@typescript-eslint/eslint-plugin" "@typescript-eslint/parser" eslint-plugin-react eslint-plugin-react-hooks

# Initialize Tailwind CSS
Write-Host "Setting up Tailwind CSS..." -ForegroundColor Blue
npx tailwindcss init -p | Out-Null

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Path "src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "src\styles" -Force | Out-Null
New-Item -ItemType Directory -Path "public" -Force | Out-Null
New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null

# Create package.json
Write-Host "Configuring package.json..." -ForegroundColor Blue
$packageJsonContent = @'
{
  "name": "pricing-calculator",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react": "^7.32.2",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
'@
$packageJsonContent | Out-File -FilePath "package.json" -Encoding utf8

# Create Vite config
Write-Host "Creating Vite configuration..." -ForegroundColor Blue
$viteConfigContent = @'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
'@
$viteConfigContent | Out-File -FilePath "vite.config.ts" -Encoding utf8

# Create TypeScript config
Write-Host "Creating TypeScript configuration..." -ForegroundColor Blue
$tsConfigContent = @'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
'@
$tsConfigContent | Out-File -FilePath "tsconfig.json" -Encoding utf8

$tsConfigNodeContent = @'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
'@
$tsConfigNodeContent | Out-File -FilePath "tsconfig.node.json" -Encoding utf8

# Update Tailwind config
Write-Host "Configuring Tailwind CSS..." -ForegroundColor Blue
$tailwindConfigContent = @'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
'@
$tailwindConfigContent | Out-File -FilePath "tailwind.config.js" -Encoding utf8

# Create Tailwind CSS file
$tailwindCssContent = @'
@tailwind base;
@tailwind components;
@tailwind utilities;
'@
$tailwindCssContent | Out-File -FilePath "src\styles\index.css" -Encoding utf8

# Create index.html
Write-Host "Creating index.html..." -ForegroundColor Blue
$indexHtmlContent = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pricing Calculator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
$indexHtmlContent | Out-File -FilePath "index.html" -Encoding utf8

# Create main.tsx
Write-Host "Creating main.tsx..." -ForegroundColor Blue
$mainTsxContent = @'
import React from 'react'
import ReactDOM from 'react-dom/client'
import PricingCalculator from './components/PricingCalculator.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PricingCalculator />
  </React.StrictMode>,
)
'@
$mainTsxContent | Out-File -FilePath "src\main.tsx" -Encoding utf8

# Create PricingCalculator component
Write-Host "Creating PricingCalculator component..." -ForegroundColor Blue
$pricingCalculatorContent = @'
import React, { useState } from 'react';
import { Calculator, Zap, Building, Crown, Key, AlertCircle, Info } from 'lucide-react';

const PricingCalculator = () => {
  const [usage, setUsage] = useState({
    executions: 500,
    avgCreditsPerExecution: 15,
    hasApiKeys: false
  });

  const [selectedTier, setSelectedTier] = useState('starter');

  // Credit pricing
  const CREDIT_RATE = 0.004; // $0.004 per credit
  const CREDIT_PACK_SIZE = 10000;
  const CREDIT_PACK_PRICE = 40;

  // Pricing tiers configuration
  const tiers = {
    starter: {
      name: 'Starter',
      icon: <Zap className="w-5 h-5" />,
      basePrice: 50,
      color: 'bg-blue-500',
      credits: 1000,
      workspace: 'Shared',
      features: [
        '1,000 credits included',
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
      credits: 200000,
      workspace: 'Private',
      features: [
        '200,000 credits included',
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
      credits: 300000,
      workspace: 'Private + SSO',
      features: [
        '300,000 credits included',
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

  // Example execution types for reference
  const executionExamples = [
    { name: 'Simple automation (no LLM)', credits: '5-8 credits', description: 'Data processing, API calls, basic logic' },
    { name: 'LLM-powered workflow', credits: '15-50 credits', description: 'Text analysis, content generation, reasoning' },
    { name: 'Complex multi-step agent', credits: '30-100+ credits', description: 'Multiple LLM calls, tool integrations, decision trees' }
  ];

  const calculateCreditUsage = () => {
    const totalCreditsNeeded = usage.executions * usage.avgCreditsPerExecution;
    const currentTier = tiers[selectedTier as keyof typeof tiers];
    const includedCredits = currentTier.credits;
    
    let additionalCreditsNeeded = Math.max(0, totalCreditsNeeded - includedCredits);
    
    // BYOK discount calculation (reduces variable costs by ~50-80% typically)
    if (usage.hasApiKeys && additionalCreditsNeeded > 0) {
      // Estimate that BYOK saves about 60% on variable costs (LLM calls)
      // This is a simplified calculation - in reality it depends on the execution mix
      const estimatedSavings = additionalCreditsNeeded * 0.6;
      additionalCreditsNeeded = Math.max(0, additionalCreditsNeeded - estimatedSavings);
    }
    
    const additionalCreditCost = additionalCreditsNeeded * CREDIT_RATE;
    const totalCost = currentTier.basePrice + additionalCreditCost;
    
    return {
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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Relevance AI Pricing Calculator</h1>
        </div>
        <p className="text-gray-600">Calculate your monthly costs based on credit usage</p>
        <div className="mt-2 text-sm text-gray-500">
          Credit Rate: $40 per 10,000 credits ($0.004 per credit)
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
                  Average Credits per Execution
                </label>
                <input
                  type="number"
                  value={usage.avgCreditsPerExecution}
                  onChange={(e) => setUsage(prev => ({
                    ...prev,
                    avgCreditsPerExecution: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <div className="mt-1 text-xs text-gray-500">
                  See examples below for guidance
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

            {/* Execution Examples */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 text-gray-800">Credit Usage Examples</h3>
              <div className="space-y-2">
                {executionExamples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-2 text-xs">
                    <div className="font-medium text-gray-800">{example.name}</div>
                    <div className="text-blue-600 font-medium">{example.credits}</div>
                    <div className="text-gray-600">{example.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              {tiers[selectedTier as keyof typeof tiers].icon}
              <h2 className="text-xl font-semibold text-gray-800">{tiers[selectedTier as keyof typeof tiers].name} Plan</h2>
              <div className="ml-auto text-sm text-gray-600">
                {tiers[selectedTier as keyof typeof tiers].workspace} Workspace
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Base Plan Cost:</span>
                <span className="font-medium">${tiers[selectedTier as keyof typeof tiers].basePrice.toFixed(2)}</span>
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
                <span className={`${tiers[selectedTier as keyof typeof tiers].color} text-white px-3 py-1 rounded`}>
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

            {/* Usage Visualization */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Credit Usage Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Executions</span>
                    <span className="font-medium">{formatNumber(usage.executions)} runs</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Credits per Execution</span>
                    <span className="font-medium">{usage.avgCreditsPerExecution} credits</span>
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

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Plan Features</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {tiers[selectedTier as keyof typeof tiers].features.map((feature, index) => (
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
'@
$pricingCalculatorContent | Out-File -FilePath "src\components\PricingCalculator.tsx" -Encoding utf8

# Create ESLint config
Write-Host "Creating ESLint configuration..." -ForegroundColor Blue
$eslintConfigContent = @'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'eslint-plugin-react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
'@
$eslintConfigContent | Out-File -FilePath ".eslintrc.cjs" -Encoding utf8

# Create VSCode settings
Write-Host "Creating VSCode settings..." -ForegroundColor Blue
$vscodeSettingsContent = @'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
'@
$vscodeSettingsContent | Out-File -FilePath ".vscode\settings.json" -Encoding utf8

# Create VSCode extensions recommendations
$vscodeExtensionsContent = @'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
'@
$vscodeExtensionsContent | Out-File -FilePath ".vscode\extensions.json" -Encoding utf8

# Create .gitignore
Write-Host "Creating .gitignore..." -ForegroundColor Blue
$gitignoreContent = @'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
'@
$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8

# Create README
Write-Host "Creating README..." -ForegroundColor Blue
$readmeContent = @'
# Pricing Calculator

A React TypeScript application for calculating pricing based on credit usage and execution costs.

## Features

- Interactive pricing calculator
- Multiple tier plans (Starter, Business, Enterprise)
- Credit usage visualization
- BYOK (Bring Your Own Keys) cost savings
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (for icons)

## Project Structure

```
src/
├── components/
│   └── PricingCalculator.tsx
├── styles/
│   └── index.css
└── main.tsx
```
'@
$readmeContent | Out-File -FilePath "README.md" -Encoding utf8

# Final npm install
Write-Host "Installing all dependencies..." -ForegroundColor Blue
npm install

Write-Host ""
Write-Host "Project setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Project created in: $ProjectDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get started:" -ForegroundColor Yellow
Write-Host "  cd $ProjectName" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "The development server will start on http://localhost:3000" -ForegroundColor Green
Write-Host "Open the project in VSCode: code ." -ForegroundColor Green