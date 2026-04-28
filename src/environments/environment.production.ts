const baseUrl = 'https://www.cityfinance.in';

export const environment = {
  baseUrl,
  blogUrl: 'https://blog.cityfinance.in',
  api: {
    url: baseUrl + '/api/v1/',
    urlV2: baseUrl + '/api/v2/',
  },
  ui: { urlV1: baseUrl + '/v1/', urlV2: baseUrl + '/fc/' },
  v1Url: '/v1',
  v2Url: '/fc',
  environment: 'prod',
  isProduction: true,
  googleTagID: 'G-MDPDTZFW0N',
  STORAGE_BASEURL: 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com',
};
