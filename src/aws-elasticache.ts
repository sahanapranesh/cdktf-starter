import { ElasticacheReplicationGroup } from '@cdktf/provider-aws/lib/elasticache-replication-group';
import { ElasticacheSubnetGroup } from '@cdktf/provider-aws/lib/elasticache-subnet-group';
import { Construct } from 'constructs';

export interface AwsElasticacheConfig {
  vpcId: string;
  privateSubnetsCidr: string[];
  privateSubnetIds: string[];
  replicationGroupDescription: string;
  cacheInstanceType: string;
  securityGroupId: string;
  tags: any;
}

export class AwsElasticCache extends Construct {
  constructor(scope: Construct, name: string, config: AwsElasticacheConfig) {
    super(scope, name);

    const redisSubnetGroup = new ElasticacheSubnetGroup(scope, 'redis-subnet-group', {
      name: name + '-redis-subnet-group',
      subnetIds: config.privateSubnetIds,
    });

    new ElasticacheReplicationGroup(scope, 'redis', {
      replicationGroupId: name + '-redis-replication-group',
      tags: config.tags,
      replicationGroupDescription: config.replicationGroupDescription,
      engine: 'redis',
      nodeType: config.cacheInstanceType,
      numCacheClusters: 2,
      multiAzEnabled: true,
      automaticFailoverEnabled: true,
      subnetGroupName: redisSubnetGroup.name,
      securityGroupIds: [config.securityGroupId],
      atRestEncryptionEnabled: true,
    });
  }

}