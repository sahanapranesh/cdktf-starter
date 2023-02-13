import { Instance } from '@cdktf/provider-aws/lib/instance';
import { Construct } from 'constructs';

export interface AwsInstanceConfig {
  instanceType: string;
  az: string;
  securityGroups: string[];
  keyname: string;
  ami: string;
}

export class AwsInstance extends Construct {
  instance: Instance;
  constructor(scope: Construct, name: string, config: AwsInstanceConfig) {
    super(scope, name);

    this.instance = new Instance(this, name, {
      ami: config.ami,
      instanceType: config.instanceType,
      availabilityZone: config.az,
      securityGroups: config.securityGroups,
      keyName: config.keyname,
    });
  }
}