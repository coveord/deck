import { ExecutionDetailsTasks, Registry } from '@spinnaker/core';
import { TerraformStageConfig } from './terraformStageConfig';

Registry.pipeline.registerStage({
  label: 'Terraform Stage',
  description: 'Run a Terraform plan followed by a Terraform plan',
  key: 'terraform',
  alias: 'terraform',
  addAliasToConfig: true,
  cloudProvider: 'kubernetes',
  component: TerraformStageConfig,
  executionDetailsSections: [ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  producesArtifacts: true,
  restartable: true,
});
