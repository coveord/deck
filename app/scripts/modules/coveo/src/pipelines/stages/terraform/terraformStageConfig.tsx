import React from 'react';

import { AccountService, CheckboxInput, IAccount, IStageConfigProps, StageConfigField } from '@spinnaker/core';
import { ManifestBasicSettings } from '@spinnaker/kubernetes';
import { TerraformInnerJobConfig } from './terraformInnerJobConfig';

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
    this.props.updateStageField({ autoApproved: isAutoApproved });
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
            checked={stage.autoApproved}
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
