import { ExecutionDetailsTasks, Registry } from '@spinnaker/core';
import { TerragruntStageConfig } from './terragruntStageConfig';

export const KUBERNETES_V2_RUN_JOB_STAGE = 'spinnaker.coveo.pipeline.stage.terragrunt';

Registry.pipeline.registerStage({
  label: 'Terragrunt Stage',
  description: 'Run a Terragrunt plan followed by a Terragrunt plan',
  key: 'terragrunt',
  alias: 'terragrunt',
  addAliasToConfig: true,
  cloudProvider: 'kubernetes',
  component: TerragruntStageConfig,
  executionDetailsSections: [ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  producesArtifacts: true,
  restartable: true,
  validators: [
    // {
    //   type: 'custom',
    //   validate: (
    //     _pipeline: IPipeline,
    //     stage: IStage,
    //     _validator: IValidatorConfig,
    //     _config: IStageOrTriggerTypeConfig,
    //   ): string => {
    //     if (!stage.manifest || !stage.manifest.kind) {
    //       return '';
    //     }
    //     if (stage.manifest.kind !== 'Job') {
    //       return 'Run Job (Manifest) only accepts manifest of kind Job.';
    //     }
    //     return '';
    //   },
    // } as ICustomValidator,
  ],
});
