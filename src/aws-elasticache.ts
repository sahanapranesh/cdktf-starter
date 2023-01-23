import { ElasticacheReplicationGroup } from '@cdktf/provider-aws/lib/elasticache-replication-group';
import { ElasticacheSubnetGroup } from '@cdktf/provider-aws/lib/elasticache-subnet-group';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';


export interface AwsElasticacheConfig {
  vpcId: string;
  privateSubnetsCidr: string[];
  privateSubnetIds: string[];
  replicationGroupDescription: string;
  cacheInstanceType: string;
  tags: any;
}

export class AwsElasticCache extends Construct {
  constructor(scope: Construct, name: string, config: AwsElasticacheConfig) {
    super(scope, name);
    const redisSecurityGroup = new SecurityGroup(scope, 'elasticache-security-group', {
      namePrefix: name + '-service-security-group',
      vpcId: Fn.tostring(config.vpcId),
      tags: config.tags,
      ingress: [{
        protocol: 'tcp',
        fromPort: 6379,
        toPort: 6379,
        cidrBlocks: config.privateSubnetsCidr,
        ipv6CidrBlocks: ['::/0'],
      }],
      egress: [{
        protocol: '-1',
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ['0.0.0.0/0'],
        ipv6CidrBlocks: ['::/0'],
      }],
    });

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
      securityGroupIds: [redisSecurityGroup.id],
      atRestEncryptionEnabled: true,
    });
  }
}