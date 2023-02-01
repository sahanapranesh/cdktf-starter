import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { IPrincipal } from './aws-iam-role';

export interface AwsEcrRepositoryConfig {
  name: string;
  tags: any;
}

export class AwsEcrRepository extends Construct {
  public readonly repository: EcrRepository;
  public readonly imageDigest?: string;

  constructor(scope: Construct, name: string, config: AwsEcrRepositoryConfig) {
    super(scope, name);

    const compatibleName = config.name.toLowerCase();

    this.repository = new EcrRepository(this, 'dockerAsset', {
      name: compatibleName,
      encryptionConfiguration: [
        {
          encryptionType: 'KMS',
        },
      ],
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      imageTagMutability: 'IMMUTABLE',
      tags: config.tags,
    });

    new TerraformOutput(this, 'ecr', {
      value: this.repository.repositoryUrl,
    });
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