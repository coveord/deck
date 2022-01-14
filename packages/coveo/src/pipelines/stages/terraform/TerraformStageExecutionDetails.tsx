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

import React from 'react';

import type { IExecutionDetailsSectionProps } from '@spinnaker/core';
import { AccountTag, ExecutionDetailsSection } from '@spinnaker/core';

import { TerraformInnerJob } from './TerraformInnerJob';
import { TerraformStageExecutionModal } from './TerraformStageExecutionModal';
import { InnerJobInfoProvider } from '../../../manifest/InnerJobPodInfoProvider';

export class TerraformStageExecutionDetails extends React.Component<IExecutionDetailsSectionProps, any> {
  public static title = 'Terraform execution';

  public render() {
    const { stage, name, current } = this.props;
    const { context } = stage;
    const account = context.account;

    const planInfo = context[TerraformInnerJob.PLAN.toString()] ?? {};
    const planInfoProvider = new InnerJobInfoProvider(TerraformInnerJob.PLAN, planInfo);
    const applyInfo = context[TerraformInnerJob.APPLY.toString()] ?? {};
    const applyInfoProvider = new InnerJobInfoProvider(TerraformInnerJob.APPLY, applyInfo);

    return (
      <ExecutionDetailsSection name={name} current={current}>
        {/*<StageFailureMessage stage={stage} message={stage.failureMessage} />*/}
        <div className="row">
          <div className="col-md-9">
            <dl className="dl-narrow dl-horizontal">
              <dt>Account</dt>
              <dd>
                <AccountTag account={context.account} />
              </dd>
              <div className="row">
                <div className="col-md-12">
                  <div className="well alert alert-info">
                    <TerraformStageExecutionModal
                      account={account}
                      planInfo={planInfoProvider}
                      applyInfo={applyInfoProvider}
                      linkName="Execution details"
                    />
                  </div>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
