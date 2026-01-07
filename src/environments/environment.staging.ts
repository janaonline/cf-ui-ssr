const baseUrl = 'https://staging.cityfinance.in';

export const environment = {
  baseUrl,
  blogUrl: 'https://blog.cityfinance.in',
  api: {
    url: baseUrl + '/api/v1/',
    urlV2: baseUrl + '/api/v2/',
  },
  v1Url: '/v1',
  v2Url: '/fc',
  environment: 'staging',
  isProduction: false,
  googleTagID: 'G-803HPPLFMM',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
};
