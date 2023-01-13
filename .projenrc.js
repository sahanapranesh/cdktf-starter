const { cdktf } = require('projen');
const { NpmAccess } = require('projen/lib/javascript');
const project = new cdktf.ConstructLibraryCdktf({
  author: 'Sahana Pranesh',
  authorAddress: 'sahana.pranesh@everest.engineering',
  cdktfVersion: '^0.14.3',
  defaultReleaseBranch: 'main',
  repositoryUrl: 'git@github.com:everest-engineering/starter-infra-aws-cdktf.git',
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  deps: [
    '@cdktf/provider-aws',
    '@eryldor/cidr'
  ],
  devDeps: [
    '@types/jest',
    '@types/node',
    'jest',
    'typescript',
    'ts-jest',
    'ts-node'
  ],
  name: '@everest/starter-infra-aws-cdktf'
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

const common_exclude = ['cdktf.out', 'imports'];
project.npmignore.exclude(...common_exclude, 'docs');
project.gitignore.exclude(...common_exclude);

project.synth();