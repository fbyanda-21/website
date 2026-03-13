module.exports = {
  apps: [
    {
      name: 'yanzz-dl',
      script: 'src/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8676
      }
    }
  ]
};
