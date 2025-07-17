module.exports = {
    apps: [
        {
            name: 'cf-ui-ssr',
            script: 'dist_ssr/cf-ui-ssr/server/server.mjs',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
                PM2_ENABLED: "true"
            }
        },
        {
            name: 'stag-cf-ui-ssr',
            script: 'dist/cf-ui-ssr/server/server.mjs',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'staging',
                PORT: 4000,
                PM2_ENABLED: "true"
            }
        },
        {
            name: 'dev-cf-ui-ssr',
            script: 'dist/cf-ui-ssr/server/server.mjs',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
                PORT: 4200,
                PM2_ENABLED: "true"
            }
        },
        {
            name: 'seo-cf-ui-ssr',
            script: 'dist/cf-ui-ssr/server/server.mjs',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
                PORT: 4100,
                PM2_ENABLED: "true"
            }
        }
    ]
};
