import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { Construct } from 'constructs';


export interface AwsIamRoleConfig {
  tags: any;
}

export class AwsIamRole extends Construct {

  constructor(scope: Construct, name: string) {
    super(scope, name);
  }

  public getEcstaskRole(scope: Construct, name: string, config: AwsIamRoleConfig) {
    return new IamRole(scope, 'task-role', {
      name: `${name}-task-role`,
      tags: config.tags,
      inlinePolicy: [
        {
          name: 'allow-logs',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
                Resource: '*',
              },
            ],
          }),
        },
      ],
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Sid: '',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
    });
  }

  public getEcsTaskExecutionRole(scope: Construct, name: string, config: AwsIamRoleConfig) {
    return new IamRole(scope, 'execution-role', {
      name: `${name}-execution-role`,
      tags: config.tags,
      inlinePolicy: [
        {
          name: 'allow-ecr-pull',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'ecr:GetAuthorizationToken',
                  'ecr:BatchCheckLayerAvailability',
                  'ecr:GetDownloadUrlForLayer',
                  'ecr:BatchGetImage',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                Resource: '*',
              },
            ],
          }),
        },
      ],
      // this role shall only be used by an ECS task
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Sid: '',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
    });
  }

  public getEcsSchedulerRole(scope: Construct, name: string, config: AwsIamRoleConfig) {
    return new IamRole(scope, 'scheduler-role', {
      name: `${name}-scheduler-role`,
      tags: config.tags,
      inlinePolicy: [
        {
          name: 'update-ecs-service',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['logs:*'],
                Resource: 'arn:aws:logs:*:*:*',
              },
              {
                Effect: 'Allow',
                Action: ['s3:GetObject'],
                Resource: '*',
              },
              {
                Effect: 'Allow',
                Action: ['ecs:DescribeServices',
                  'ecs:UpdateService'],
                Resource: '*',
              },
            ],
          }),
        },
      ],
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Sid: '',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
          },
        ],
      }),
    });
  }

}