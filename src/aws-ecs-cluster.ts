import { EcsCluster } from '@cdktf/provider-aws/lib/ecs-cluster';
import { EcsClusterCapacityProviders } from '@cdktf/provider-aws/lib/ecs-cluster-capacity-providers';
import { Construct } from 'constructs';

export class AwsEcsCluster extends Construct {
  ecsCluster: EcsCluster;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.ecsCluster = new EcsCluster(scope, id + '-cluster', {
      name: 'everest',
      setting: [{ name: 'containerInsights', value: 'enabled' }],
    });

    new EcsClusterCapacityProviders(this, 'capacity-providers-everest', {
      clusterName: this.ecsCluster.name,
      dependsOn: [this.ecsCluster],
      capacityProviders: ['FARGATE', 'FARGATE_SPOT'],
    });
  }
}