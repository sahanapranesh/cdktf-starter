import { CloudfrontDistribution } from '@cdktf/provider-aws/lib/cloudfront-distribution';
import { DataAwsCloudfrontCachePolicy } from '@cdktf/provider-aws/lib/data-aws-cloudfront-cache-policy';
import { DataAwsCloudfrontOriginRequestPolicy } from '@cdktf/provider-aws/lib/data-aws-cloudfront-origin-request-policy';
import { DataAwsCloudfrontResponseHeadersPolicy } from '@cdktf/provider-aws/lib/data-aws-cloudfront-response-headers-policy';
import { Construct } from 'constructs';

const VIEWER_PROTOCOL_POLICY = 'redirect-to-https';

export interface AwsCloudfrontDistributionConfig {
  targetOriginId: string;
  originName: string;
  dnsName: string;
  acmCertificateArn: string;
}

export class AwsCloudfrontDistribution extends Construct {
  constructor(scope: Construct, name: string, config: AwsCloudfrontDistributionConfig) {
    super(scope, name);

    const cachingDisabledPolicy = new DataAwsCloudfrontCachePolicy(scope, 'cache-policy', {
      name: 'Managed-CachingDisabled',
    });

    const originRequestPolicy = new DataAwsCloudfrontOriginRequestPolicy(scope, 'origin-request-policy', {
      name: 'Managed-AllViewer',
    });

    const responseHeadersPolicy = new DataAwsCloudfrontResponseHeadersPolicy(scope, 'response-headers-policy', {
      name: 'Managed-SecurityHeadersPolicy',
    });

    new CloudfrontDistribution(scope, 'cfn-distribution', {
      defaultCacheBehavior: {
        allowedMethods: ['POST', 'HEAD', 'PATCH', 'DELETE', 'PUT', 'GET', 'OPTIONS'],
        viewerProtocolPolicy: VIEWER_PROTOCOL_POLICY,
        originRequestPolicyId: originRequestPolicy.id,
        targetOriginId: config.targetOriginId,
        cachePolicyId: cachingDisabledPolicy.id,
        cachedMethods: ['HEAD', 'GET', 'OPTIONS'],
        responseHeadersPolicyId: responseHeadersPolicy.id,
      },
      priceClass: 'PriceClass_All',
      aliases: [config.dnsName],
      enabled: true,
      origin: [{
        customOriginConfig: {
          httpsPort: 443,
          originProtocolPolicy: 'https-only',
          httpPort: 80,
          originSslProtocols: ['TLSv1.2'],
        },
        domainName: config.originName,
        originId: config.targetOriginId,
      }],
      restrictions: {
        geoRestriction: {
          restrictionType: 'whitelist',
          locations: [
            'AE',
            'GB',
            'US',
            'IN',
            'AU',
            'CA',
          ],
        },
      },
      viewerCertificate: {
        acmCertificateArn: config.acmCertificateArn,
        sslSupportMethod: 'sni-only',
      },
    });
  }
}