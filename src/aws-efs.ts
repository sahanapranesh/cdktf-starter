import { EfsAccessPoint } from '@cdktf/provider-aws/lib/efs-access-point';
import { EfsFileSystem } from '@cdktf/provider-aws/lib/efs-file-system';
import { EfsMountTarget } from '@cdktf/provider-aws/lib/efs-mount-target';
import { Fn } from 'cdktf';
import { Construct } from 'constructs';

export interface AwsEfsAccessPointConfig {
  posixUid: number;
  ownerUid: number;
  ownerGid: number;
  posixGid: number;
  rootDirectoryPath: string;
  creationInfo: string;
  permissions: string;
}

export interface AwsEfsConfig {
  subnets: string[];
  securityGroupId: string;
  accessPointConfig?: AwsEfsAccessPointConfig;
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
      posixUser: {
        gid: config.accessPointConfig ? config.accessPointConfig.posixGid : 0,
        uid: config.accessPointConfig ? config.accessPointConfig.posixUid : 0,
      },
      rootDirectory: {
        path: config.accessPointConfig ? config.accessPointConfig.rootDirectoryPath : '/',
        creationInfo: {
          ownerGid: config.accessPointConfig ? config.accessPointConfig.ownerGid : 0,
          ownerUid: config.accessPointConfig ? config.accessPointConfig.ownerUid : 0,
          permissions: config.accessPointConfig ? config.accessPointConfig.permissions : '',
        },
      },
    });

    for (let i = 0; i < config.subnets.length; i++) {
      new EfsMountTarget(scope, name + '-efs-mount-target' + i, {
        fileSystemId: this.efs.id,
        subnetId: Fn.element(config.subnets, 0),
        securityGroups: [config.securityGroupId],
      });
    }
  }
}