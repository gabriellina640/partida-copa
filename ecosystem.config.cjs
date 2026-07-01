module.exports = {
  apps: [
    {
      name: 'partida-copa',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
