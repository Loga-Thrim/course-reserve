const axios = require('axios');
const https = require('https');

const PSRU_API_BASE_URL = process.env.PSRU_API_BASE_URL || 'https://library.psru.ac.th/portal/lib_api';
const PSRU_API_TOKEN = process.env.PSRU_API_TOKEN;

const PSRU_ENDPOINTS = {
  AUTH: `${PSRU_API_BASE_URL}/authen`,
  BOOK_KEYWORD: `${PSRU_API_BASE_URL}/bookKeyword`
};

const psruAxios = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    'Content-Type': 'application/json',
    'token': PSRU_API_TOKEN
  },
  timeout: 10000
});

module.exports = {
  PSRU_API_BASE_URL,
  PSRU_API_TOKEN,
  PSRU_ENDPOINTS,
  psruAxios
};
