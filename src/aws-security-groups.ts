import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';

interface AwsSecurityGroupsConfig {
  vpcId: string;
  tags: any;
}

const anyIp = '0.0.0.0/0';

export class AwsSecurityGroups extends Construct {
  serviceSecurityGroup: SecurityGroup;
  loadBalancerSecurityGroup: SecurityGroup;
  vpcId: string;
  tags: any;

  constructor(scope: Construct, name: string, config: AwsSecurityGroupsConfig) {
    super(scope, name);

    this.vpcId = config.vpcId;
    this.tags = config.tags;
    this.loadBalancerSecurityGroup = this.getAlbSecurityGroup(scope, name);
    //Creates a security group that will be used by EFS and ECS service
    this.serviceSecurityGroup = this.getServiceSecurityGroup(scope, name, config);
  }

  public getServiceSecurityGroup(scope: Construct, name: string, config: AwsSecurityGroupsConfig) {
    return new SecurityGroup(scope, 'service-security-group', {
      name: name + '-service-security-group',
      vpcId: Fn.tostring(config.vpcId),
      tags: config.tags,
      ingress: [{
        protocol: 'tcp',
        fromPort: 80,
        toPort: 80,
        cidrBlocks: [anyIp],
      }, {
        protocol: 'tcp',
        fromPort: 443,
        toPort: 443,
        cidrBlocks: [anyIp],
      },
      {
        protocol: 'tcp',
        fromPort: 2049,
        toPort: 2049,
        cidrBlocks: [anyIp],
      },
      {
        protocol: '-1',
        fromPort: 0,
        toPort: 0,
        securityGroups: [this.loadBalancerSecurityGroup.id],
      }],
      egress: [{
        protocol: '-1',
        fromPort: 0,
        toPort: 0,
        cidrBlocks: [anyIp],
      }],
    });
  }

  public getAlbSecurityGroup(scope: Construct, name: string) {
    return new SecurityGroup(scope, name + 'alb-security-group', {
      name: name + 'alb-security-group',
      vpcId: this.vpcId,
      tags: this.tags,
      egress: [{
        fromPort: 0,
        toPort: 0,
        protocol: '-1',
        cidrBlocks: [anyIp],
      }],
      ingress: [
        {
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          cidrBlocks: [anyIp],
        },
        {
          fromPort: 443,
          toPort: 443,
          protocol: 'tcp',
          cidrBlocks: [anyIp],
        },
        {
          fromPort: 1024,
          toPort: 65535,
          protocol: 'tcp',
          cidrBlocks: [anyIp],
        },
      ],
    });
  }

  public getRedisSecurityGroup(scope: Construct, name: string, ingressCidrBlocks: string[]) {
    return new SecurityGroup(scope, name + 'elasticache-security-group', {
      namePrefix: name + '-service-security-group',
      vpcId: Fn.tostring(this.vpcId),
      tags: this.tags,
      ingress: [{
        protocol: 'tcp',
        fromPort: 6379,
        toPort: 6379,
        cidrBlocks: ingressCidrBlocks,
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
  }

}