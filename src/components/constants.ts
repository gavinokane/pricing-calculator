import React from 'react';
import { Zap, Building, Briefcase, Crown } from 'lucide-react';
import { Tier, WorkflowType } from './types';

export const SCENARIO_STORAGE_KEY = "doozerScenarioState";

export const DEFAULT_CREDIT_RATE = 0.01;
export const DEFAULT_CREDIT_PACK_SIZE = 50000;
export const DEFAULT_CREDIT_PACK_PRICE = 500;
export const DEFAULT_BYOK_SAVINGS = 60;

export const DEFAULT_TIER_META: Record<string, { color: string; icon: React.ReactNode }> = {
  starter: { color: 'bg-blue-500', icon: React.createElement(Zap, { className: "w-5 h-5" }) },
  business: { color: 'bg-purple-500', icon: React.createElement(Building, { className: "w-5 h-5" }) },
  professional: { color: 'bg-teal-500', icon: React.createElement(Briefcase, { className: "w-5 h-5" }) },
  enterprise: { color: 'bg-amber-500', icon: React.createElement(Crown, { className: "w-5 h-5" }) }
};

export const DEFAULT_TIERS: Record<string, Tier> = {
  starter: {
    name: 'Starter',
    basePrice: 50,
    credits: 1000,
    fixedCreditsPerExecution: 10,
    workspace: 'Shared',
    features: [
      '1,000 credits included',
      '10 credits fixed cost per execution',
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
    basePrice: 700,
    credits: 75000,
    fixedCreditsPerExecution: 2.5,
    workspace: 'Private + Advanced',
    features: [
      '75,000 credits included',
      '2.5 credits fixed cost per execution',
      'Private workspace with advanced controls',
      'Role-based access control (RBAC)',
      'Custom agent development',
      'Advanced workflow automation',
      'Premium integrations',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'API access',
      'Workflow scheduling'
    ]
  },
  professional: {
    name: 'Professional',
    basePrice: 400,
    credits: 50000,
    fixedCreditsPerExecution: 5,
    workspace: 'Private',
    features: [
      '50,000 credits included',
      '5 credits fixed cost per execution',
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
    basePrice: 1000,
    credits: 100000,
    fixedCreditsPerExecution: 0.5,
    workspace: 'Private + SSO',
    features: [
      '100,000 credits included',
      '0.5 credits fixed cost per execution',
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

export const DEFAULT_WORKFLOW_TYPES: WorkflowType[] = [
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
