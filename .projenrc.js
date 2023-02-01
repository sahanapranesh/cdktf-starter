const { cdktf } = require('projen');
const { NodePackageManager } = require('projen/lib/javascript');
const project = new cdktf.ConstructLibraryCdktf({
  author: 'Sahana Pranesh',
  authorAddress: 'sahana.pranesh@everest.engineering',
  cdktfVersion: '^0.14.0',
  defaultReleaseBranch: 'main',
  name: 'starter-infra-aws-cdktf',
  repositoryUrl:
    'git@github.com:everest-engineering/starter-infra-aws-cdktf.git',
  deps: [
    '@cdktf/provider-aws',
    'constructs',
    '@eryldor/cidr',
  ],
  bundledDeps: [
    '@eryldor/cidr',
    '@cdktf/provider-null@4.0.1',
  ],
  peerDeps: [
    '@cdktf/provider-aws',
    'constructs',
  ],
  devDeps: [
    '@types/jest',
    '@types/node',
    'jest',
    'ts-jest',
    'ts-node',
    'typescript',
  ],
  //depsUpgrade: false,
  packageManager: NodePackageManager.NPM,
});

const common_exclude = ['cdktf.out', 'imports', 'yarn.lock'];
project.npmignore.exclude(...common_exclude, 'docs');
project.gitignore.exclude(...common_exclude);

project.synth();
