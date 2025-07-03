const baseUrl = 'https://dev.cityfinance.in';
//let baseUrl = 'http://localhost:8080';
let GoogleTagID = 'G-803HPPLFMM';
let isProduction: boolean = false;
let STORAGE_BASEURL = 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com';
let env = 'dev';

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
