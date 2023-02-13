import { AwsLoadBalancer } from './aws-app-load-balancer';
import { AwsCloudfrontDistribution } from './aws-cloudfront-distribution';
import { AwsInstance } from './aws-ec2-instance';
import { AwsEcrRepository } from './aws-ecr-asset';
import { AwsEcsCluster } from './aws-ecs-cluster';
import { AwsEcsFargateService } from './aws-ecs-fargate';
import { AwsEcsTaskDefinition } from './aws-ecs-task-definition';
import { AwsEfs } from './aws-efs';
import { AwsElasticCache } from './aws-elasticache';
import { AwsIamRole } from './aws-iam-role';
import { AwsMysqlDB } from './aws-mysql-db';
import { AwsSecurityGroups } from './aws-security-groups';
import { AwsSimpleEmailService } from './aws-ses';
import { AwsSnsTopic } from './aws-sns-topic';
import { AwsVpc } from './aws-vpc';

export {
  AwsVpc, AwsLoadBalancer, AwsCloudfrontDistribution, AwsInstance, AwsEcrRepository,
  AwsEcsCluster, AwsEcsFargateService, AwsEcsTaskDefinition, AwsEfs, AwsElasticCache,
  AwsIamRole, AwsMysqlDB, AwsSecurityGroups, AwsSimpleEmailService, AwsSnsTopic,
};

export class Hello {
  public sayHello() {
    return 'hello, world!';
  }
}