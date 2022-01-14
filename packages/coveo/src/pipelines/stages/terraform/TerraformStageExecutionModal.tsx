import AnsiUp from 'ansi_up';
import DOMPurify from 'dompurify';
import { bindAll } from 'lodash';
import React from 'react';
import { Button, Modal, Panel, PanelGroup } from 'react-bootstrap';

import type { Application, IExecution, IExecutionStage, IInstanceMultiOutputLog } from '@spinnaker/core';
import { InstanceReader, ReactInjector } from '@spinnaker/core';

import { TerraformInnerJob } from './TerraformInnerJob';
import type { InnerJobInfoProvider } from '../../../manifest/InnerJobPodInfoProvider';

export interface ITerraformStageExecutionModalProps {
  account: string;
  application: Application;
  execution: IExecution;
  stage: IExecutionStage;
  planInfo: InnerJobInfoProvider;
  applyInfo: InnerJobInfoProvider;
  linkName: string;
}

export interface ITerraformStageExecutionModalState {
  planLogs: IInstanceMultiOutputLog;
  applyLogs: IInstanceMultiOutputLog;
  showModal: boolean;
  errorMessage: string;
  loadingLogs: boolean;
}

export class TerraformStageExecutionModal extends React.Component<
  ITerraformStageExecutionModalProps,
  ITerraformStageExecutionModalState
> {
  private ansiUp: AnsiUp;

  constructor(props: ITerraformStageExecutionModalProps) {
    super(props);
    this.state = {
      planLogs: null,
      applyLogs: null,
      showModal: false,
      errorMessage: null,
      loadingLogs: false,
    };
    bindAll(this, ['open', 'close', 'onClick']);
    this.ansiUp = new AnsiUp();
  }

  public componentDidMount() {
    this.loadLogs(TerraformInnerJob.PLAN);
  }

  public close() {
    this.setState({ showModal: false });
  }

  public open() {
    this.setState({ showModal: true });
  }

  public onClick() {
    this.open();
  }

  private loadLogs = (innerJob: TerraformInnerJob) => {
    const { account, planInfo, applyInfo } = this.props;
    const podInfoProvider = innerJob == TerraformInnerJob.PLAN ? planInfo : applyInfo;
    const namespace = podInfoProvider.getNamespace();
    const podName = podInfoProvider.getPodName();

    if (namespace == null || podName == null) {
      return;
    }

    InstanceReader.getConsoleOutput(account, namespace, podName, 'kubernetes')
      .then((o) => {
        const containerLogs = o.output as IInstanceMultiOutputLog[];
        return {
          name: podName,
          output: containerLogs[0].output,
          formattedOutput: DOMPurify.sanitize(this.ansiUp.ansi_to_html(containerLogs[0].output)),
        } as IInstanceMultiOutputLog;
      })
      .then((log) => {
        switch (innerJob) {
          case TerraformInnerJob.PLAN:
            this.setState({ planLogs: log });
            break;
          case TerraformInnerJob.APPLY:
            this.setState({ applyLogs: log });
            break;
        }
      });
  };

  private provideJudgment = (judgmentDecision: string): void => {
    const { application, execution, stage } = this.props;
    ReactInjector.manualJudgmentService.provideJudgment(application, execution, stage, judgmentDecision, null);
  };

  public render() {
    const { showModal, planLogs, applyLogs, errorMessage } = this.state;
    return (
      <div>
        <a onClick={this.onClick} className="clickable">
          {this.props.linkName}
        </a>
        <Modal show={showModal} onHide={this.close} dialogClassName="modal-lg modal-fullscreen flex-fill">
          <Modal.Header closeButton={true}>
            <Modal.Title>{this.props.linkName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="flex-fill">
            <PanelGroup accordion defaultActiveKey="1" id="accordion-terraform-stage">
              <Panel eventKey="1">
                <Panel.Heading>
                  <Panel.Title toggle>Terraform Plan</Panel.Title>
                </Panel.Heading>
                <Panel.Collapse
                  onEnter={() => {
                    this.loadLogs(TerraformInnerJob.PLAN);
                  }}
                />
                <Panel.Body collapsible>
                  {planLogs && (
                    <pre
                      className="body-small fill-no-flex"
                      dangerouslySetInnerHTML={{ __html: planLogs.formattedOutput }}
                    ></pre>
                  )}
                </Panel.Body>
              </Panel>
              <Panel eventKey="2">
                <Panel.Heading>
                  <Panel.Title toggle>Manual Approval</Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                  <Button onClick={() => this.provideJudgment('CONTINUE')}>Approve Plan</Button>
                  <Button onClick={() => this.provideJudgment('STOP')}>Deny Plan</Button>
                </Panel.Body>
              </Panel>
              <Panel eventKey="3">
                <Panel.Heading>
                  <Panel.Title toggle>Terraform Apply</Panel.Title>
                </Panel.Heading>
                <Panel.Collapse
                  onEnter={() => {
                    this.loadLogs(TerraformInnerJob.APPLY);
                  }}
                />
                <Panel.Body collapsible>
                  {applyLogs && (
                    <pre
                      className="body-small fill-no-flex"
                      dangerouslySetInnerHTML={{ __html: applyLogs.formattedOutput }}
                    ></pre>
                  )}
                </Panel.Body>
              </Panel>
            </PanelGroup>
            {errorMessage && <pre className="body-small">{errorMessage}</pre>}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
