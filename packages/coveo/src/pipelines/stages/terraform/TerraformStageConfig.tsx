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

import type { IAccount, IStageConfigProps } from '@spinnaker/core';
import { AccountService, CheckboxInput, StageConfigField } from '@spinnaker/core';
import { ManifestBasicSettings } from '@spinnaker/kubernetes';
import { TerraformInnerJobConfig } from './TerraformInnerJobConfig';

export interface ITerraformStageConfigState {
  credentials: IAccount[];
}

export class TerraformStageConfig extends React.Component<IStageConfigProps> {
  public state: ITerraformStageConfigState = {
    credentials: [],
  };
  private readonly PLAN_JOB = { key: 'terraformPlan', prettyName: 'Plan' };
  private readonly APPLY_JOB = { key: 'terraformApply', prettyName: 'Apply' };

  constructor(props: IStageConfigProps) {
    super(props);
    const { stage, application } = this.props;
    if (!stage.application) {
      stage.application = application.name;
    }
  }

  public componentDidMount() {
    this.props.updateStageField({ cloudProvider: 'kubernetes' });
    AccountService.getAllAccountDetailsForProvider('kubernetes').then((accounts: any) => {
      this.setState({ credentials: accounts });
    });
  }

  private onAccountChanged = (account: string) => {
    this.props.updateStageField({
      credentials: account,
      account: account,
    });
  };

  private onAutoApprovedChanged = (isAutoApproved: boolean) => {
    this.props.updateStageField({ isAutoApproved });
  };

  public render(): React.ReactNode {
    const props = this.props;
    const { stage } = props;

    return (
      <div className="container-fluid form-horizontal">
        <h3>Basic Settings</h3>
        <ManifestBasicSettings
          selectedAccount={stage.account || ''}
          accounts={this.state.credentials}
          onAccountSelect={this.onAccountChanged}
        />
        <StageConfigField label="Don't require approval" helpKey="coveo.terraform.autoapproved">
          <CheckboxInput
            checked={stage.isAutoApproved}
            onChange={(e: any) => this.onAutoApprovedChanged(e.target.checked)}
          />
        </StageConfigField>
        <h3>Plan Configuration</h3>
        <TerraformInnerJobConfig
          innerJobName={this.PLAN_JOB.key}
          prettyInnerJobName={this.PLAN_JOB.prettyName}
          {...props}
        />
        <h3>Apply Configuration</h3>
        <TerraformInnerJobConfig
          innerJobName={this.APPLY_JOB.key}
          prettyInnerJobName={this.APPLY_JOB.prettyName}
          {...props}
        />
      </div>
    );
  }
}
