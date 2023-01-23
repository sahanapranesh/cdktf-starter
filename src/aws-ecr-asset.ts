import { DataAwsEcrImage } from '@cdktf/provider-aws/lib/data-aws-ecr-image';
import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { Resource } from '@cdktf/provider-null/lib/resource';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { IPrincipal } from './aws-iam-role';

export interface AwsEcrAssetConfig {
  path: string;
  name: string;
  region: string;
}

export class AwsEcrAsset extends Construct {
  public readonly image: string;
  public readonly repository: EcrRepository;
  public readonly imageDigest?: string;

  constructor(scope: Construct, name: string, config: AwsEcrAssetConfig) {
    super(scope, name);

    const { path, region } = config;
    const compatibleName = config.name.toLowerCase();

    this.repository = new EcrRepository(this, 'dockerAsset', {
      name: compatibleName,
    });

    const buildAndPush = new Resource(this, 'buildAndPush', {
      dependsOn: [this.repository],
    });

    const imageName = this.repository.repositoryUrl;
    const command = `
      aws ecr get-login-password --region ${region} |
      docker login --username AWS --password-stdin ${imageName} &&
      cd ${path} && docker build -t ${imageName} . &&
      docker push ${imageName}
    `;
    buildAndPush.addOverride('provisioner.local-exec.command', command);

    const data = new DataAwsEcrImage(this, 'image', {
      repositoryName: this.repository.name,
      imageTag: 'latest',
      dependsOn: [buildAndPush],
    });

    new TerraformOutput(this, 'ecr', {
      value: this.repository.repositoryUrl,
    });

    this.image = this.repository.repositoryUrl;
    this.imageDigest = data.imageDigest;
  }

  public grantPull(principal: IPrincipal) {
    const actions = [
      'ecr:GetAuthorizationToken',
      'ecr:BatchCheckLayerAvailability',
      'ecr:GetDownloadUrlForLayer',
      'ecr:BatchGetImage',
    ];
    principal.grant('ecr-pull', actions, this.repository.arn);
    principal.grant('ecr-login', ['ecr:GetAuthorizationToken']);
  }
}