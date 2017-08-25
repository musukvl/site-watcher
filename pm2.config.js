module.exports = {
  apps : [{
    name        : "site-watcher",
    script      : "./app.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}