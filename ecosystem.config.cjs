module.exports = {
  apps: [
    {
      name: 'terminbuchung',
      cwd: '/projekt/Terminbuchungsprogramm/backend',
      script: 'server.js',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
  ],
};
