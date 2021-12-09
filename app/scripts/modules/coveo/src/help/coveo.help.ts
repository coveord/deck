import { HelpContentsRegistry } from '@spinnaker/core';

const helpContents: { [key: string]: string } = {
  'coveo.terraform.autoapproved': 'Will apply without requiring human approval.',
};

Object.keys(helpContents).forEach((key) => HelpContentsRegistry.register(key, helpContents[key]));
