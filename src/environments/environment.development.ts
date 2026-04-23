const baseUrl = 'https://dev.cityfinance.in';

export const environment = {
  baseUrl,
  blogUrl: 'https://blog.cityfinance.in',
  api: {
    url: baseUrl + '/api/v1/',
    urlV2: baseUrl + '/api/v2/',
  },
  v1Url: '/v1',
  v2Url: '/fc',
  environment: 'dev',
  isProduction: false,
  googleTagID: 'G-803HPPLFMM',
  gtm: {
    containerId: '',
    auth: '',
    preview: '',
  },
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: 'G-803HPPLFMM',
};