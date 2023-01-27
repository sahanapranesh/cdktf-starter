import { DataAwsEcrImage } from '@cdktf/provider-aws/lib/data-aws-ecr-image';
import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { IPrincipal } from './aws-iam-role';

export interface AwsEcrAssetConfig {
  name: string;
  imageTag: string;
}

export class AwsEcrAsset extends Construct {
  public readonly image: string;
  public readonly repository: EcrRepository;
  public readonly imageDigest?: string;

  constructor(scope: Construct, name: string, config: AwsEcrAssetConfig) {
    super(scope, name);

    const compatibleName = config.name.toLowerCase();

    this.repository = new EcrRepository(this, 'dockerAsset', {
      name: compatibleName,
    });

    const data = new DataAwsEcrImage(this, 'image', {
      repositoryName: this.repository.name,
      imageTag: config.imageTag,
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