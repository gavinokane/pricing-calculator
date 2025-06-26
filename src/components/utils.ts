import { Tier, WorkflowType } from './types';

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const calculateScenario = (
  executions: number,
  workflowIndex: number,
  tierKey: string,
  hasByokFlag: boolean,
  tiers: Record<string, Tier>,
  workflowTypes: WorkflowType[],
  creditRate: number,
  byokSavings: number
) => {
  const tier = tiers[tierKey];
  const workflow = workflowTypes[workflowIndex];
  
  if (!tier || !workflow) {
    return {
      totalCreditsPerExecution: 0,
      totalCreditsNeeded: 0,
      includedCredits: 0,
      additionalCreditsNeeded: 0,
      additionalCreditsAfterByok: 0,
      additionalCreditCost: 0,
      totalCost: 0,
      costPerExecution: 0
    };
  }

  const totalCreditsPerExecution = Number(tier.fixedCreditsPerExecution) + Number(workflow.credits);
  const totalCreditsNeeded = executions * totalCreditsPerExecution;
  const includedCredits = tier.credits;
  
  const originalAdditionalCreditsNeeded = Math.max(0, totalCreditsNeeded - includedCredits);
  let additionalCreditsAfterByok = originalAdditionalCreditsNeeded;
  
  // Apply BYOK savings (only on variable costs)
  if (hasByokFlag && originalAdditionalCreditsNeeded > 0) {
    const variableCreditsInOverage = Math.min(originalAdditionalCreditsNeeded, executions * workflow.credits);
    const estimatedSavings = variableCreditsInOverage * (byokSavings / 100);
    additionalCreditsAfterByok = Math.max(0, originalAdditionalCreditsNeeded - estimatedSavings);
  }
  
  const additionalCreditCost = additionalCreditsAfterByok * creditRate;
  const totalCost = tier.basePrice + additionalCreditCost;
  const costPerExecution = totalCost / executions;
  
  return {
    totalCreditsPerExecution,
    totalCreditsNeeded,
    includedCredits,
    additionalCreditsNeeded: originalAdditionalCreditsNeeded, // ✅ Now clearly the original overage
    additionalCreditsAfterByok: additionalCreditsAfterByok,   // ✅ BYOK-adjusted overage
    additionalCreditCost,
    totalCost,
    costPerExecution
  };
};

export const calculateCreditUsage = (
  usage: { executions: number; hasApiKeys: boolean },
  selectedWorkflowIndex: number,
  selectedTier: string,
  tiers: Record<string, Tier>,
  workflowTypes: WorkflowType[],
  creditRate: number,
  creditPackSize: number,
  byokSavings: number
) => {
  const currentTier = tiers[selectedTier];
  const workflow = workflowTypes[selectedWorkflowIndex] ?? workflowTypes[0];
  const variableCreditsPerExecution = workflow.credits;
  const totalCreditsPerExecution = Number(currentTier.fixedCreditsPerExecution) + Number(variableCreditsPerExecution);
  const totalCreditsNeeded = usage.executions * totalCreditsPerExecution;
  const includedCredits = currentTier.credits;
  
  const originalAdditionalCreditsNeeded = Math.max(0, totalCreditsNeeded - includedCredits);
  let additionalCreditsAfterByok = originalAdditionalCreditsNeeded;
  
  // BYOK discount calculation
  if (usage.hasApiKeys && originalAdditionalCreditsNeeded > 0) {
    const variableCreditsInOverage = Math.min(originalAdditionalCreditsNeeded, usage.executions * variableCreditsPerExecution);
    const estimatedSavings = variableCreditsInOverage * (byokSavings / 100);
    additionalCreditsAfterByok = Math.max(0, originalAdditionalCreditsNeeded - estimatedSavings);
  }
  
  const additionalCreditCost = additionalCreditsAfterByok * creditRate;
  const totalCost = currentTier.basePrice + additionalCreditCost;
  
  return {
    totalCreditsPerExecution,
    totalCreditsNeeded,
    includedCredits,
    additionalCreditsNeeded: originalAdditionalCreditsNeeded, // ✅ Fixed: now returns original overage
    additionalCreditsAfterByok: additionalCreditsAfterByok,   // ✅ BYOK-adjusted overage
    additionalCreditCost,
    totalCost,
    creditPacksNeeded: Math.ceil(additionalCreditsAfterByok / creditPackSize), // ✅ Uses BYOK-adjusted value
    variableCreditsPerExecution
  };
};