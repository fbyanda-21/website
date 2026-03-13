const axios = require('axios');
const https = require('https');

const defaultUserAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

const http = axios.create({
  timeout: 25_000,
  headers: {
    'User-Agent': defaultUserAgent,
    Accept: '*/*'
  },
  // Some third-party download APIs have misconfigured TLS.
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

module.exports = { http, defaultUserAgent };
