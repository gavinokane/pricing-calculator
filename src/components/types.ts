import React from 'react';

export interface Tier {
  name: string;
  basePrice: number;
  credits: number;
  fixedCreditsPerExecution: number;
  color?: string;
  icon?: React.ReactNode;
  workspace?: string;
  features?: string[];
}

export interface WorkflowType {
  name: string;
  credits: number;
  description?: string;
}

export interface TransferredVariables {
  creditRate?: number;
  creditPackSize?: number;
  creditPackPrice?: number;
  byokSavings?: number;
  tiers?: Record<string, Tier>;
  workflowTypes?: WorkflowType[];
}

export interface Scenario {
  id: number;
  executions: number;
  workflowIndex: number;
  tierKey: string;
  hasByok: boolean;
  totalCreditsPerExecution: number;
  totalCreditsNeeded: number;
  includedCredits: number;
  additionalCreditsNeeded: number;
  additionalCreditsAfterByok: number;
  additionalCreditCost: number;
  totalCost: number;
  costPerExecution: number;
}

export type ViewType = "calculator" | "scenarios" | "feature-comparison" | "roi-calculator";
