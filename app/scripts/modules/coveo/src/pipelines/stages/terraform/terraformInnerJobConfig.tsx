import { capitalize, map } from 'lodash';
import React from 'react';
import Select, { Option } from 'react-select';

import {
  ArtifactTypePatterns,
  IArtifact,
  IExpectedArtifact,
  IStageConfigProps,
  RadioButtonInput,
  StageArtifactSelector,
  StageConfigField,
  yamlDocumentsToString,
  YamlEditor,
} from '@spinnaker/core';
import { IManifestBindArtifact, ManifestBindArtifactsSelector, ManifestSource } from '@spinnaker/kubernetes';

export interface ITerraformInnerJobConfigProps extends IStageConfigProps {
  innerJobName: string;
  prettyInnerJobName: string;
}

export interface ITerraformInnerJobConfigState {
  textManifest?: string;
}

export class TerraformInnerJobConfig extends React.Component<ITerraformInnerJobConfigProps> {
  public state: ITerraformInnerJobConfigState = {};

  private readonly excludedManifestArtifactTypes = [
    ArtifactTypePatterns.DOCKER_IMAGE,
    ArtifactTypePatterns.KUBERNETES,
    ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE,
    ArtifactTypePatterns.MAVEN_FILE,
  ];

  private readonly outputOptions = [
    { label: 'None', value: 'none' },
    { label: 'Logs', value: 'propertyFile' },
    { label: 'Artifact', value: 'artifact' },
  ];

  public componentDidMount() {
    this.initializeDefaultValue();
    this.initializeManifestState();
  }

  private initializeManifestState() {
    const { stage, innerJobName } = this.props;
    const manifest = stage?.innerJobs?.[innerJobName]?.manifest;

    if (manifest != null) {
      this.setState({ textManifest: yamlDocumentsToString([manifest]) });
    }
  }

  private initializeDefaultValue() {
    const { stage, innerJobName } = this.props;
    const manifestSource = stage.innerJobs?.[innerJobName]?.source;
    if (!manifestSource) {
      this.updateInnerJob({ source: ManifestSource.TEXT });
    }
  }

  private getRequiredArtifacts(): IManifestBindArtifact[] {
    const { innerJobName, stage } = this.props;
    const { requiredArtifactIds, requiredArtifacts } = stage?.innerJobs?.[innerJobName] ?? {};

    return (requiredArtifactIds || [])
      .map((id: string) => ({ expectedArtifactId: id }))
      .concat(requiredArtifacts || []);
  }

  private getSourceOptions(): Array<Option<string>> {
    return map([ManifestSource.TEXT, ManifestSource.ARTIFACT], (option) => ({
      label: capitalize(option),
      value: option,
    }));
  }

  private onArtifactEdited = (artifact: IArtifact) => {
    this.updateInnerJob({
      consumeArtifact: artifact,
      consumeArtifactId: artifact.id,
      consumeArtifactAccount: artifact.artifactAccount,
    });
  };

  private onArtifactSelected = (artifact: IExpectedArtifact) => {
    this.updateInnerJob({ consumeArtifactId: artifact.id });
  };

  private onConsumeSourceChanged = (consumeSource: string) => {
    const innerJobChanges: { [key: string]: any } = { consumeArtifactSource: consumeSource };
    if (consumeSource === 'none') {
      innerJobChanges.propertyFile = null;
    }
    this.updateInnerJob(innerJobChanges);
  };

  private onManifestArtifactEdited = (artifact: IArtifact) => {
    this.updateInnerJob({ manifestArtifactId: null, manifestArtifact: artifact });
  };

  private onManifestArtifactSelected = (artifact: IArtifact) => {
    this.updateInnerJob({ manifestArtifactId: artifact.id, manifestArtifact: null });
  };

  private onManifestChange = (rawManifest: string, manifests: any) => {
    if (manifests) {
      this.updateInnerJob({ manifest: manifests[0] });
    }

    this.setState({ textManifest: rawManifest });
  };

  private onManifestSourceChange = (manifestSource: ManifestSource) => {
    this.updateInnerJob({ source: manifestSource });
  };

  private onPropertyFileChange = (propertyFile: string) => {
    this.updateInnerJob({ propertyFile: propertyFile });
  };

  private onRequiredArtifactsChanged = (bindings: IManifestBindArtifact[]) => {
    this.updateInnerJob({
      requiredArtifacts: bindings.filter((b) => b.artifact),
      requiredArtifactIds: bindings.filter((b) => b.expectedArtifactId).map((b) => b.expectedArtifactId),
    });
  };

  private updateInnerJob = (changes: { [key: string]: any }) => {
    const { stage, innerJobName, updateStageField } = this.props;

    // Handle the case where the innerJobs structure doesn't exist yet
    const innerJobs = stage.innerJobs ?? {};
    if (!innerJobs?.[innerJobName]) {
      innerJobs[innerJobName] = {};
    }

    Object.entries(changes).forEach(([key, value]) => {
      innerJobs[innerJobName][key] = value;
    });

    updateStageField({ innerJobs });
  };

  public render(): React.ReactNode {
    const { stage, pipeline, innerJobName } = this.props;
    const innerJob = stage.innerJobs?.[innerJobName];

    return (
      <>
        <h4>Manifest</h4>
        <StageConfigField label="Manifest Source" helpKey="kubernetes.manifest.source">
          <RadioButtonInput
            options={this.getSourceOptions()}
            onChange={(event: any) => this.onManifestSourceChange(event.target.value)}
            value={innerJob?.source || ManifestSource.TEXT}
          />
        </StageConfigField>
        {innerJob?.source === ManifestSource.TEXT && (
          <YamlEditor value={this.state.textManifest} onChange={this.onManifestChange} />
        )}
        {innerJob?.source === ManifestSource.ARTIFACT && (
          <>
            <StageConfigField label="Manifest Artifact" helpKey="kubernetes.manifest.expectedArtifact">
              <StageArtifactSelector
                artifact={innerJob?.manifestArtifact}
                excludedArtifactTypePatterns={this.excludedManifestArtifactTypes}
                expectedArtifactId={innerJob?.manifestArtifactId}
                onArtifactEdited={this.onManifestArtifactEdited}
                onExpectedArtifactSelected={this.onManifestArtifactSelected}
                pipeline={this.props.pipeline}
                stage={stage}
              />
            </StageConfigField>
          </>
        )}
        <StageConfigField label="Required Artifacts to Bind" helpKey="kubernetes.manifest.requiredArtifactsToBind">
          <ManifestBindArtifactsSelector
            bindings={this.getRequiredArtifacts()}
            onChangeBindings={this.onRequiredArtifactsChanged}
            pipeline={this.props.pipeline}
            stage={stage}
          />
        </StageConfigField>
        <h4>Output</h4>
        <StageConfigField label="Capture Output From" helpKey="kubernetes.runJob.captureSource">
          <div>
            <Select
              clearable={false}
              options={this.outputOptions}
              value={innerJob?.consumeArtifactSource}
              onChange={(event: any) => this.onConsumeSourceChanged(event.value)}
            />
          </div>
        </StageConfigField>
        {innerJob?.consumeArtifactSource === 'propertyFile' && (
          <StageConfigField label="Container Name" helpKey="kubernetes.runJob.captureSource.containerName">
            <input
              className="form-control input-sm"
              type="text"
              value={innerJob?.propertyFile}
              onChange={(event: any) => this.onPropertyFileChange(event.target.value)}
            />
          </StageConfigField>
        )}
        {innerJob?.consumeArtifactSource === 'artifact' && (
          <StageConfigField label="Artifact">
            <StageArtifactSelector
              pipeline={pipeline}
              stage={stage}
              artifact={innerJob?.consumeArtifact}
              excludedArtifactTypePatterns={[]}
              expectedArtifactId={innerJob?.consumeArtifactId}
              onExpectedArtifactSelected={this.onArtifactSelected}
              onArtifactEdited={this.onArtifactEdited}
            />
          </StageConfigField>
        )}
      </>
    );
  }
}
