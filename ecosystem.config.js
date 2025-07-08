module.exports = {
    apps: [
        {
            name: 'cf-ui-ssr',
            script: 'dist/cf-ui-ssr/server/server.mjs',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 4000
            }
        }
    ]
};
