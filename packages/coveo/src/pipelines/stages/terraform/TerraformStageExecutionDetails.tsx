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

import { get, isEmpty, sortBy } from 'lodash';
import React from 'react';

import type { IExecutionDetailsSectionProps, IJobOwnedPodStatus } from '@spinnaker/core';
import {
  AccountTag,
  DefaultPodNameProvider,
  ExecutionDetailsSection,
  JobStageExecutionLogs,
  StageFailureMessage,
} from '@spinnaker/core';

export class TerraformStageExecutionDetails extends React.Component<IExecutionDetailsSectionProps, any> {
  public static title = 'runJobConfig';

  private createdPodNames(podsStatuses: IJobOwnedPodStatus[]): string[] {
    const sorted = sortBy(podsStatuses, (p: IJobOwnedPodStatus) => p.status.startTime);
    return sorted.map((p: IJobOwnedPodStatus) => p.name);
  }

  public render() {
    const { stage, name, current } = this.props;
    const { context } = stage;
    const namespace = get(stage, ['context', 'jobStatus', 'location'], '');
    const deployedName = namespace ? get<string[]>(context, ['deploy.jobs', namespace])[0] : '';
    const externalLink = get<string>(stage, ['context', 'execution', 'logs']);
    const pods = get(stage.context, 'jobStatus.pods', []);
    const podNames = !isEmpty(pods)
      ? this.createdPodNames(pods)
      : [get(stage, ['context', 'jobStatus', 'mostRecentPodName'], '')];
    const podNamesProviders = podNames.map((p) => new DefaultPodNameProvider(p));

    return (
      <ExecutionDetailsSection name={name} current={current}>
        {stage.failureMessage && <StageFailureMessage stage={stage} message={stage.failureMessage} />}
        <div className="row">
          <div className="col-md-9">
            <dl className="dl-narrow dl-horizontal">
              <dt>Account</dt>
              <dd>
                <AccountTag account={context.account} />
              </dd>
              {namespace && (
                <>
                  <dt>Namespace</dt>
                  <dd>{stage.context.jobStatus.location}</dd>
                  <dt>Logs</dt>
                  <dd>
                    <JobStageExecutionLogs
                      deployedName={deployedName}
                      account={this.props.stage.context.account}
                      location={namespace}
                      application={this.props.application}
                      externalLink={externalLink}
                      podNamesProviders={podNamesProviders}
                    />
                  </dd>
                </>
              )}
              {!namespace && <div className="well">Collecting additional details...</div>}
            </dl>
          </div>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
