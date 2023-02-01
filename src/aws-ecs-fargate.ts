import { AppautoscalingTarget } from '@cdktf/provider-aws/lib/appautoscaling-target';
import { DataAwsEcsCluster } from '@cdktf/provider-aws/lib/data-aws-ecs-cluster';
import { EcsService } from '@cdktf/provider-aws/lib/ecs-service';
import { Construct } from 'constructs';

export interface AutoScalingConfig {
  minCapacity: number;
  maxCapacity: number;
}

export interface LoadbalancerConfig {
  containerName: string;
  containerPort: number;
  targetGroupArn: string;
}

export interface AwsEcsFargateServiceConfig {
  clusterName: string;
  serviceName: string;
  vpcId: string;
  subnets: string[];
  desiredCount: number;
  loadBalancerConfig: LoadbalancerConfig;
  securityGroupId: string;
  autoScalingConfig: AutoScalingConfig;
  tags: any;
  healthCheckGracePeriodSeconds: number;
  taskDefinitionArn: string;
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

    this.ecsService = new EcsService(scope, name + 'service', {
      name: serviceName,
      tags: config.tags,
      cluster: ecsCluster.arn,
      taskDefinition: config.taskDefinitionArn,
      desiredCount: desiredCount,
      launchType: 'FARGATE',
      schedulingStrategy: 'REPLICA',
      networkConfiguration: {
        securityGroups: [config.securityGroupId!],
        subnets: subnets,
      },
      loadBalancer: [{
        containerName: config.loadBalancerConfig.containerName,
        containerPort: config.loadBalancerConfig.containerPort,
        targetGroupArn: config.loadBalancerConfig.targetGroupArn,
      }],
      healthCheckGracePeriodSeconds: config.healthCheckGracePeriodSeconds,
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
