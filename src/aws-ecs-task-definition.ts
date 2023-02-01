import { EcsTaskDefinition } from '@cdktf/provider-aws/lib/ecs-task-definition';
import { Construct } from 'constructs';

export interface EfsConfig {
  fileSystemId: string;
  accessPointId: string;
}

export interface TaskDefConfig {
  cpu: string;
  memory: string;
  efsConfig: EfsConfig;
  executionRoleArn: string;
  taskRoleArn: string;
  containerDefinitions: string;
  tags: any;
}

export class AwsEcsTaskDefinition extends Construct {
  taskDefinition: EcsTaskDefinition;
  constructor(scope: Construct, name: string, config: TaskDefConfig) {
    super(scope, name);
    this.taskDefinition = new EcsTaskDefinition(scope, name + 'task-definition', {
      networkMode: 'awsvpc',
      tags: config.tags,
      requiresCompatibilities: ['FARGATE'],
      cpu: config.cpu,
      memory: config.memory,
      executionRoleArn: config.executionRoleArn,
      taskRoleArn: config.taskRoleArn,
      containerDefinitions: config.containerDefinitions,
      family: name,
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
  }
}