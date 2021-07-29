const http = require('http');
const express = require('express');

const config = require('./config');

const { useV2Tokens } = config;

// Each app trusts the other one, and nobody else.
const validIssuers = useV2Tokens
  ? [
    `https://login.microsoftonline.${config.app1.cloud}/${config.app1.tenantId}/v2.0`, // token version 2
    `https://login.microsoftonline.${config.app2.cloud}/${config.app2.tenantId}/v2.0`, // token version 2
  ]
  : [
    `https://sts.windows.net/${config.app1.tenantId}/`, // token version 1
    `https://sts.windows.net/${config.app2.tenantId}/`, // token version 1
  ];
const app1Auth = require('./commonAuthMiddleware')({ ...config.app1, validIssuers, useV2Tokens });
const app2Auth = require('./commonAuthMiddleware')({ ...config.app2, validIssuers, useV2Tokens });

const router = express.Router();

router.get('/app1', app1Auth, (req, res) => {
  res.send(`Hello ${req.userName}.  This endpoint is owned by app1.`);
});
router.get('/app2', app2Auth, (req, res) => {
  res.send(`Hello ${req.userName}.  This endpoint is owned by app2.`);
});

const app = express();
app.use(router);
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (!req.userName) {
    res.sendStatus(401);
    return;
  }
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = http.createServer(app);
server.listen(8080, () => {
  console.log('listening');
});

module.exports = { app };
