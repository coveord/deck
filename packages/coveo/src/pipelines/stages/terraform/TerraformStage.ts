/*
 * Copyright 2021 Coveo Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExecutionDetailsTasks, Registry } from '@spinnaker/core';
import { TerraformStageConfig } from './TerraformStageConfig';
import { TerraformStageExecutionDetails } from './TerraformStageExecutionDetails';

Registry.pipeline.registerStage({
  label: 'Terraform Stage',
  description: 'Run a Terraform plan followed by a Terraform plan',
  key: 'terraform',
  alias: 'terraform',
  addAliasToConfig: true,
  cloudProvider: 'kubernetes',
  component: TerraformStageConfig,
  executionDetailsSections: [TerraformStageExecutionDetails, ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  producesArtifacts: true,
  restartable: true,
});
