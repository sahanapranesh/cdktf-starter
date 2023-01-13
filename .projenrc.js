const { cdktf } = require('projen');
const project = new cdktf.ConstructLibraryCdktf({
  author: 'Sahana Pranesh',
  authorAddress: 'sahana.pranesh@estimateone.com',
  cdktfVersion: '^0.13.0',
  defaultReleaseBranch: 'main',
  name: 'starter-infra-aws-cdktf',
  repositoryUrl: 'git@github.com:everest-engineering/starter-infra-aws-cdktf.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();