import { get } from 'lodash';
import type { TerraformInnerJob } from '../pipelines/stages/terraform/TerraformInnerJob';

export class InnerJobInfoProvider {
  readonly innerJobType: TerraformInnerJob;
  private readonly innerJob: { [key: string]: any };

  constructor(innerJobType: TerraformInnerJob, innerJob: { [key: string]: any }) {
    this.innerJobType = innerJobType;
    this.innerJob = innerJob;
  }

  getNamespace(): string | undefined {
    return get(this.innerJob, ['jobStatus', 'location'], undefined);
  }

  getPodName(): string | undefined {
    const podName = get(this.innerJob, ['jobStatus', 'mostRecentPodName'], undefined);
    if (podName == null) {
      return undefined;
    }
    return `pod ${podName}`;
  }
}
