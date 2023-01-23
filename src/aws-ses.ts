import { DataAwsRoute53Zone } from '@cdktf/provider-aws/lib/data-aws-route53-zone';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { SesDomainDkim } from '@cdktf/provider-aws/lib/ses-domain-dkim';
import { SesDomainIdentity } from '@cdktf/provider-aws/lib/ses-domain-identity';
import { SesDomainMailFrom } from '@cdktf/provider-aws/lib/ses-domain-mail-from';
import { SesIdentityNotificationTopic } from '@cdktf/provider-aws/lib/ses-identity-notification-topic';
import { Construct } from 'constructs';

export interface AwsSesConfig {
  domain: string;
  mailFromDomain: string;
  topicArn: string;
  region: string;
}

export class AwsSimpleEmailService extends Construct {
  hostedZone: DataAwsRoute53Zone;
  sesDomain: SesDomainIdentity;
  sesDomainDkim: SesDomainDkim;
  sesDomainMailFrom: SesDomainMailFrom;

  constructor(scope: Construct, name: string, config: AwsSesConfig) {
    super(scope, name);

    this.hostedZone = new DataAwsRoute53Zone(scope, 'hosted-zone', {
      name: config.mailFromDomain,
    });

    this.sesDomain = new SesDomainIdentity(scope, name + '-domainId', {
      domain: config.domain,
    });

    this.sesDomainMailFrom = new SesDomainMailFrom(scope, name + '-mail-from', {
      domain: this.sesDomain.domain,
      mailFromDomain: config.mailFromDomain,
    });

    this.sesDomainDkim = new SesDomainDkim(scope, name + '-dkim', {
      domain: this.sesDomain.domain,
    });

    new Route53Record(scope, name + 'mx-record', {
      zoneId: this.hostedZone.id,
      name: this.sesDomainMailFrom.mailFromDomain,
      type: 'MX',
      ttl: 600,
      records: ['10 feedback-smtp.'.concat(config.region).concat('.amazonses.com')],
    });

    new Route53Record(scope, name + 'spf-mail-from-record', {
      zoneId: this.hostedZone.id,
      name: this.sesDomainMailFrom.mailFromDomain,
      type: 'TXT',
      ttl: 600,
      records: ['v=spf1 include:amazonses.com -all'],
    });

    new SesIdentityNotificationTopic(scope, 'bounce-notification-topic', {
      identity: this.sesDomain.domain,
      notificationType: 'Bounce',
      topicArn: config.topicArn,
      includeOriginalHeaders: true,
    });

    new SesIdentityNotificationTopic(scope, 'complaint-notification-topic', {
      identity: this.sesDomain.domain,
      notificationType: 'Complaint',
      topicArn: config.topicArn,
      includeOriginalHeaders: true,
    });

  }
}