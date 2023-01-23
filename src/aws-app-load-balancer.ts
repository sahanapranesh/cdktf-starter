import { Lb } from '@cdktf/provider-aws/lib/lb';
import { LbListener } from '@cdktf/provider-aws/lib/lb-listener';
import { LbTargetGroup } from '@cdktf/provider-aws/lib/lb-target-group';
import { Token } from 'cdktf';
import { Construct } from 'constructs';

interface AwsLoadBalancerConfig {
  name: string;
  publicSubnets: string[];
  privateSubnets: string[];
  securityGroups: string[];
  albCertificateArn: string;
  vpcId: string;
  tags: any;
};

export class AwsLoadBalancer extends Construct {
  httpsListener: any;
  targetGroup: LbTargetGroup;
  alb: Lb;
  constructor(scope: Construct, id: string, options: AwsLoadBalancerConfig) {
    super(scope, id);
    this.alb = new Lb(scope, 'app-load-balancer', {
      name: options.name + '-alb',
      subnets: options.publicSubnets,
      tags: options.tags,
      loadBalancerType: 'application',
      securityGroups: options.securityGroups,
      enableDeletionProtection: true,
      dropInvalidHeaderFields: true,
    });
    this.targetGroup = new LbTargetGroup(scope, 'service-target-group', {
      port: 8080,
      name: options.name + '-target-group',
      protocol: 'HTTP',
      targetType: 'ip',
      slowStart: 300,
      healthCheck: {
        enabled: true,
        timeout: 30,
        interval: 60,
        healthyThreshold: 3,
        unhealthyThreshold: 3,
      },
      vpcId: Token.asString(options.vpcId),
      tags: options.tags,

    });
    new LbListener(scope, 'http-listener', {
      loadBalancerArn: this.alb.arn,
      port: 80,
      protocol: 'HTTP',
      defaultAction: [
        {
          order: 1,
          type: 'redirect',
          redirect: {
            port: '443',
            protocol: 'HTTPS',
            statusCode: 'HTTP_301',
          },
        },
      ],
      tags: options.tags,
    });
    new LbListener(scope, 'https-listener', {
      certificateArn: options.albCertificateArn,
      loadBalancerArn: this.alb.arn,
      port: 443,
      protocol: 'HTTPS',
      defaultAction: [{
        type: 'forward',
        targetGroupArn: this.targetGroup.arn,
      }],
      tags: options.tags,
    });
  }
}

