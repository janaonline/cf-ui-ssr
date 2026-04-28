const baseUrl = 'https://dev.cityfinance.in';

export const environment = {
  baseUrl,
  blogUrl: 'https://blog.cityfinance.in',
  api: {
    url: baseUrl + '/api/v1/',
    urlV2: baseUrl + '/api/v2/',
  },
  ui: { urlV1: baseUrl + '/v1/', urlV2: baseUrl + '/fc/' },
  // v1Url: 'http://localhost:4200',
  // v2Url: 'http://localhost:4300',
  v1Url: '/v1',
  v2Url: '/fc',
  environment: 'dev',
  isProduction: false,
  googleTagID: 'G-803HPPLFMM',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: 'G-803HPPLFMM',
};
