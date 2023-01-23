import { AppautoscalingTarget } from '@cdktf/provider-aws/lib/appautoscaling-target';
import { DataAwsEcsCluster } from '@cdktf/provider-aws/lib/data-aws-ecs-cluster';
import { EcsService } from '@cdktf/provider-aws/lib/ecs-service';
import { EcsTaskDefinition } from '@cdktf/provider-aws/lib/ecs-task-definition';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { Construct } from 'constructs';

export interface EfsConfig {
  fileSystemId: string;
  accessPointId: string;
}

export interface AutoScalingConfig {
  minCapacity: number;
  maxCapacity: number;
}

export interface AwsEcsFargateServiceConfig {
  clusterName: string;
  serviceName: string;
  vpcId: string;
  subnets: string[];
  desiredCount: number;
  containerDefinitions: string;
  containerName: string;
  containerPort: number;
  targetGroupArn: string;
  securityGroupId: string;
  efsConfig: EfsConfig;
  autoScalingConfig: AutoScalingConfig;
  tags: any;
  dependsOn: any;
}

export class AwsEcsFargateService extends Construct {
  ecsService: EcsService;

  constructor(scope: Construct, name: string, config: AwsEcsFargateServiceConfig) {
    super(scope, name);

    const { serviceName, desiredCount, subnets } = config;

    const ecsCluster = new DataAwsEcsCluster(this, 'data-cluster', {
      clusterName: config.clusterName,
    });
    // Role that allows us to get the Docker image
    const executionRole = new IamRole(scope, 'execution-role', {
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

    // Role that allows us to push logs
    const taskRole = new IamRole(scope, 'task-role', {
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

    //Creates a task definition for the Fargate task
    const taskDefinition = new EcsTaskDefinition(scope, name + 'task-definition', {
      networkMode: 'awsvpc',
      tags: config.tags,
      requiresCompatibilities: ['FARGATE'],
      cpu: '2048',
      memory: '4096',
      executionRoleArn: executionRole.arn,
      taskRoleArn: taskRole.arn,
      containerDefinitions: config.containerDefinitions,
      family: name,
      dependsOn: config.dependsOn,
      volume: [{
        name: name + '-volume',
        efsVolumeConfiguration: {
          fileSystemId: config.efsConfig.fileSystemId,
          rootDirectory: '/',
          transitEncryption: 'ENABLED',
          authorizationConfig: {
            accessPointId: config.efsConfig.accessPointId,
          },
        },
      }],
    });

    this.ecsService = new EcsService(scope, name + 'service', {
      name: serviceName,
      tags: config.tags,
      cluster: ecsCluster.arn,
      taskDefinition: taskDefinition.arn,
      desiredCount: desiredCount,
      launchType: 'FARGATE',
      schedulingStrategy: 'REPLICA',
      networkConfiguration: {
        securityGroups: [config.securityGroupId!],
        subnets: subnets,
        assignPublicIp: true,
      },
      loadBalancer: [{ containerName: config.containerName, containerPort: config.containerPort, targetGroupArn: config.targetGroupArn }],
      healthCheckGracePeriodSeconds: 1800,
      deploymentMinimumHealthyPercent: 50,
      deploymentMaximumPercent: 200,
      deploymentCircuitBreaker: { enable: true, rollback: true },
    });

    new AppautoscalingTarget(scope, name + '-autoscaling-target', {
      minCapacity: config.autoScalingConfig.minCapacity,
      maxCapacity: config.autoScalingConfig.maxCapacity,
      scalableDimension: 'ecs:service:DesiredCount',
      serviceNamespace: 'ecs',
      resourceId: 'service/' + ecsCluster.clusterName + '/' + this.ecsService.name,
    });

  }


}
