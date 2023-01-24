import { EfsAccessPoint } from '@cdktf/provider-aws/lib/efs-access-point';
import { EfsFileSystem } from '@cdktf/provider-aws/lib/efs-file-system';
import { EfsMountTarget } from '@cdktf/provider-aws/lib/efs-mount-target';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';


export interface AwsEfsConfig {
  subnets: string[];
  securityGroupId: string;
  tags: any;
}

export class AwsEfs extends Construct {
  efs: EfsFileSystem;
  accessPoint: EfsAccessPoint;
  constructor(scope: Construct, name: string, config: AwsEfsConfig) {
    super(scope, name);

    //Creates a file system and a mount target in the specified subnet
    this.efs = new EfsFileSystem(scope, name + '-efs', {
      lifecyclePolicy: [{ transitionToIa: 'AFTER_30_DAYS' }],
      performanceMode: 'generalPurpose',
      throughputMode: 'bursting',
      encrypted: true,
      tags: config.tags,
    });

    this.accessPoint = new EfsAccessPoint(scope, name + '-efs-access-point', {
      fileSystemId: this.efs.id,
      tags: config.tags,
    });

    //Works on the assumption that we have atleast 2 subnets where we need to create mount points
    new EfsMountTarget(scope, name + '-efs-mount-target-1', {
      fileSystemId: this.efs.id,
      subnetId: Fn.element(config.subnets, 0),
      securityGroups: [config.securityGroupId],
    });

    new EfsMountTarget(scope, name + '-efs-mount-target-2', {
      fileSystemId: this.efs.id,
      subnetId: Fn.element(config.subnets, 1),
      securityGroups: [config.securityGroupId],
    });
  }
}