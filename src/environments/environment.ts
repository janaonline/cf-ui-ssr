const baseUrl = 'https://dev.cityfinance.in';
//let baseUrl = 'http://localhost:8080';
let GoogleTagID = 'G-803HPPLFMM';
let isProduction: boolean = false;
let STORAGE_BASEURL = 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com';
let env = 'dev';

if (baseUrl.includes('staging')) {
  env = 'staging';
} else if (['https://cityfinance.in', 'https://www.cityfinance.in'].includes(baseUrl)) {
  env = 'prod';
  isProduction = true;
  GoogleTagID = 'G-5Z5B41B3G4';
  STORAGE_BASEURL = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com';
}

export const environment = {
    api: {
        url: baseUrl + '/api/v1/',
    },
    prefixUrl: '/fc',
    environment: env,
    isProduction,
    versionCheckURL: baseUrl + '/version.json',
    STORAGE_BASEURL,
    googleAnalyticsId: GoogleTagID,
    storageType: 'S3Url', // 'S3Url' for S3 storage type, for azure change this to 'BlobUrl'
};
