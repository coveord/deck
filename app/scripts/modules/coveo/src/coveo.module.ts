import { module } from 'angular';

import { CloudProviderRegistry } from '@spinnaker/core';

import './help/coveo.help';
import './pipelines/stages/terragrunt/terragruntStage';

export const COVEO_MODULE = 'spinnaker.coveo';

module(COVEO_MODULE, []).config(() => {
  CloudProviderRegistry.registerProvider('coveo', {
    name: 'Coveo',
  });
});
