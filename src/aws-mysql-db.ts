import { DbInstance } from '@cdktf/provider-aws/lib/db-instance';
import { DbOptionGroup } from '@cdktf/provider-aws/lib/db-option-group';
import { DbParameterGroup } from '@cdktf/provider-aws/lib/db-parameter-group';
import { DbSubnetGroup } from '@cdktf/provider-aws/lib/db-subnet-group';
import { Token } from 'cdktf';
import { Construct } from 'constructs';

interface AwsMysqlDBConfig {
  name: string;
  subnets: string[];
  vpc: string;
  tags: any;
  dbname: string;
  username: string;
  password: string;
  securityGroups: string[];
}

export class AwsMysqlDB extends Construct {
  dbInstance: DbInstance;
  constructor(scope: Construct, id: string, options: AwsMysqlDBConfig) {
    super(scope, id);
    const dbSubnetGroup = new DbSubnetGroup(
      scope,
      id + '-subnet-group',
      {
        name: id+'-subnet-group',
        subnetIds: options.subnets,
        tags: options.tags,
      },
    );

    const dbParameterGroup = new DbParameterGroup(
      scope,
      id + '-parameter-group',
      {
        name: id + '-param-gp',
        family: 'mysql8.0',
        description: 'Parameter group DB',
        tags: options.tags,
      },
    );

    const dbOptionGroup = new DbOptionGroup(
      scope,
      id + '-option-group',
      {
        name: id + '-option-group',
        engineName: 'mysql',
        majorEngineVersion: '8.0',
        optionGroupDescription: 'Option group for MySqL db: managed by terraform',
        tags: options.tags,
      },
    );

    this.dbInstance = new DbInstance(scope, id + '-instance', {
      identifier: id + '-id',
      engine: 'mysql',
      engineVersion: '8.0',
      allocatedStorage: 30,
      maxAllocatedStorage: 300,
      storageType: 'gp2',
      instanceClass: 'db.t3.micro',
      dbName: options.dbname,
      username: options.username,
      password: options.password,
      multiAz: false,
      autoMinorVersionUpgrade: true,
      backupRetentionPeriod: 7,
      storageEncrypted: true,
      dbSubnetGroupName: Token.asString(dbSubnetGroup.name),
      parameterGroupName: dbParameterGroup.name,
      optionGroupName: dbOptionGroup.name,
      vpcSecurityGroupIds: options.securityGroups,
      tags: options.tags,
    });
  }
}
