const axios = require('axios');

axios.defaults.baseURL  = 'https://api.robinhood.com/';
axios.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate';
axios.defaults.headers.common['Content-Encoding'] = 'gzip';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Host'] = 'api.robinhood.com';
axios.defaults.headers.common['Accept'] = '*/*';
axios.defaults.headers.common['Referer'] = 'https://robinhood.com/';
axios.defaults.headers.common['Origin'] = 'https://robinhood.com';

module.exports = axios;