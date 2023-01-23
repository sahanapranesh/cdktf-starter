import { SnsTopic } from '@cdktf/provider-aws/lib/sns-topic';
import { SnsTopicSubscription } from '@cdktf/provider-aws/lib/sns-topic-subscription';
import { Construct } from 'constructs';

export interface AwsSnsTopicConfig {
  endpoint: string;
  protocol: string;
  tags: any;
}

export class AwsSnsTopic extends Construct {
  topic: SnsTopic;

  constructor(scope: Construct, name: string, config: AwsSnsTopicConfig) {
    super(scope, name);
    this.topic = new SnsTopic(scope, name + '-topic', {
      name: name,
      tags: config.tags,
    });

    new SnsTopicSubscription(scope, name + '-subscription', {
      endpoint: config.endpoint,
      protocol: config.protocol,
      topicArn: this.topic.arn,
    });

  }
}