const baseUrl = 'http://localhost:8081';

export const environment = {
  baseUrl,
  blogUrl: 'https://blog.cityfinance.in',
  api: {
    url: baseUrl + '/api/v1/',
  },
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
