const config = require('./config');
const { v4: uuidv4 } = require('uuid');

class RH {
    request = require('./request');
    cryptoRequest = {}
    credentials = {
        client_id: config.DEFAULT_CLIENT_ID,
        device_token: uuidv4(),
        password: config.DEFAULT_PASSWORD,
        username: config.DEFAULT_USERNAME
    };
    mfa_code = config.DEFAULT_MFA_CODE;
    access_token = config.DEFAULT_TOKEN;
    refresh_token = config.DEFAULT_TOKEN;
    account = config.DEFAULT_ACCOUNT;
    account_id = config.DEFAULT_ACCOUNT_ID;

    /**
     * Constructor
     * @param {Object} credentials
     *  @property {String} access_token
     *  @property {String} mfa_code
     *  @property {String} password
     *  @property {String} username
     */
    constructor(credentials) {
        if (credentials && credentials.hasOwnProperty('access_token')) this.access_token = credentials.access_token;
        if (credentials && credentials.hasOwnProperty('mfa_code')) this.mfa_code = credentials.mfa_code;
        if (credentials && credentials.hasOwnProperty('password')) this.credentials.password = credentials.password;
        if (credentials && credentials.hasOwnProperty('username')) this.credentials.username = credentials.username;

        this.cryptoRequest = this.request.create({
            baseURL: config.CURRENCY_PAIRS_BASE_URL,
            headers: { 'Host': 'nummus.robinhood.com' }
        });

        this.startUp();
    }

    /**
     * Starts up the API
     * @requires password to not be default
     * @requires username to not be default
     * Optional - mfa_code
     * Optional - access_token
     */
    startUp = async () => {
        if (this.access_token === config.DEFAULT_TOKEN &&
            this.credentials.username === config.DEFAULT_USERNAME &&
            this.credentials.password === config.DEFAULT_PASSWORD) {
            console.error(config.INVALID_CREDENTIALS_ERROR);
        } else if (this.access_token === config.DEFAULT_TOKEN) {
            await this.logIn(config.IS_INIT, async () => {
                if (this.mfa_code === config.DEFAULT_MFA_CODE) {
                    console.log(config.LOGIN_MFA_REQUIRED);
                } else {
                    await this.logIn(config.IS_NOT_INIT, async () => {
                        await this.getSession();
                    });
                }
            });
        } else {
            await this.getSession();
        }
    }

    /**
     * Logs in
     * @requires password to not be default
     * @requires username to not be default
     * Optional - mfa_code
     */
    logIn = async (isInit, cb) => {
        if (this.credentials.username === config.DEFAULT_USERNAME &&
            this.credentials.password === config.DEFAULT_PASSWORD) {
            console.error(config.INVALID_USER_PW_ERROR);
        } else {
            const body = {
                grant_type: 'password',
                scope: 'internal',
                expires_in: 86400,
                ...this.credentials
            };
            if (!isInit && (this.mfa_code !== config.DEFAULT_MFA_CODE)) {
                body.mfa_code = this.mfa_code;
            }

            await this.request.post(config.LOGIN_URL, body)
                .then((r) => {
                    const { data } = r;
                    if (!data || (!data.access_token && !data.mfa_required)) {
                        console.error(config.LOGIN_MALFORMED_RESPONSE);
                    } else if (data.mfa_required) {
                        cb();
                    } else {
                        this.access_token = data.access_token;
                        this.refresh_token = data.refresh_token;
                        cb();
                    }
                })
                .catch(() => {
                    console.error(config.LOGIN_GENERIC_FAILURE_RESPONSE);
                });
        }
    };

    /**
     * Sets authentication header for requests
     * @returns {Boolean} true if access token exists, false otherwise
     */
    setAuth = () => {
        if (this.access_token !== config.DEFAULT_TOKEN) {
            this.request.defaults.headers.common['Authorization'] = 'Bearer ' + this.access_token;
            this.cryptoRequest.defaults.headers.common['Authorization'] = 'Bearer ' + this.access_token;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Gets the user's account
     */
    getSession = async () => {
        if (this.setAuth()) {
            await this.request.get(config.ACCOUNTS_URL)
                .then((r) => {
                    const { data } = r;

                    if (data.results &&
                        data.results instanceof Array &&
                        data.results.length > 0) {
                        this.account = data.results[0].url;
                    } else {
                        console.log(config.ACCOUNTS_DOES_NOT_EXIST);
                    }
                })
                .catch(() => {
                    console.error(config.ACCOUNTS_GENERIC_FAILURE_RESPONSE);
                });
            await this.cryptoRequest.get(config.ACCOUNTS_URL)
                .then((r) => {
                    const { data } = r;

                    if (data.results &&
                        data.results instanceof Array &&
                        data.results.length > 0) {
                        this.account_id = data.results[0].id;
                    } else {
                        console.log(config.ACCOUNTS_ID_DOES_NOT_EXIST);
                    }
                })
                .catch(() => {
                    console.error(config.ACCOUNTS_ID_GENERIC_FAILURE_RESPONSE);
                });
        } else {
            console.error(config.INVALID_TOKEN_ERROR);
        }
    };

    /**
     * Gets the crypto currency pairs
     * @param {String} symbol ticker of the crypto currency
     * @returns {Object} currency pairs object
     */
    getCurrencyId = async (symbol) => {
        if (this.access_token !== config.DEFAULT_TOKEN) {
            if (symbol) {
                const currencyPairs = await this.cryptoRequest.get(config.CURRENCY_PAIRS_URL)
                    .then((r) => {
                        const { data } = r;
                        if (!data || !data.results) {
                            console.error(config.GET_CURRENCY_PAIRS_MALFORMED_RESPONSE);
                        } else {
                            return data.results;
                        }
                    })
                    .catch(() => {
                        console.error(config.GET_CURRENCY_PAIRS_GENERIC_FAILURE_RESPONSE);
                    });
                if (currencyPairs) {
                    const currency = currencyPairs.find(a => a.asset_currency.code.toLowerCase() === symbol.toLowerCase());
                    if (currency) {
                        return currency.id;
                    }
                }
            } else {
                console.error(config.GET_CURRENCY_PAIRS_INVALID_SYMBOL);
            }
        } else {
            console.error(config.INVALID_TOKEN_ERROR);
        }
    }

    /**
     * Gets information about crypto currency
     * @param {Object} options
     *  @property {String} symbol ticker of the crypto currency [OPTIONAL IF currencyId is specified]
     *  @property {String} currencyId pre-requested currency id [OPTIONAL IF symbol is specified]
     * @returns {Object} quote for specified crypto currency
     */
    getCryptoQuote = async (options) => {
        if (this.access_token !== config.DEFAULT_TOKEN) {
            if (options && (options.symbol || options.currencyId)) {
                const { symbol, currencyId } = options;
                const id = (currencyId) ? currencyId : await this.getCurrencyId(symbol);

                if (id) {
                    return this.request.get(config.CRYPTO_QUOTES_URL + id + '/')
                        .then((r) => {
                            const { data } = r;
                            if (!data) {
                                console.error(config.GET_CRYPTO_QUOTE_MALFORMED_RESPONSE);
                            } else {
                                return data;
                            }
                        })
                        .catch(() => {
                            console.error(config.GET_CRYPTO_QUOTE_GENERIC_FAILURE_RESPONSE);
                        });
                } else {
                    console.error(config.GET_CRYPTO_QUOTE_INVALID_ID);
                }
            } else {
                console.error(config.GET_CRYPTO_QUOTE_INVALID_OPTIONS);
            }
        } else {
            console.error(config.INVALID_TOKEN_ERROR);
        }
    }

    /**
     * Places an order for crypto currency
     * @param {Object} options
     *  @property {String} symbol ticker of the crypto currency [OPTIONAL IF currencyId is specified]
     *  @property {String} currencyId pre-requested currency id [OPTIONAL IF symbol is specified]
     *  @property {String} price desired price at which to place the order (ex. 60000.00)
     *  @property {String} quantity units of crypto currency to transact with (ex. 0.00000115)
     *  @property {String} side 'buy' or 'sell' (Possibly more, needs more research)
     *  @property {String} time_in_force 'gtc' or 'gfd' (Possibly more, needs more research)
     *  @property {String} type 'market' or 'limit' (Possibly more, needs more research)
     */
    orderCrypto = async (options) => {
        if (this.access_token !== config.DEFAULT_TOKEN) {
            if (options && (options.symbol || options.currencyId) && options.price &&
                options.quantity && options.side && options.time_in_force && options.type) {
                const { symbol, currencyId, ...body } = options;
                const id = (currencyId) ? currencyId : await this.getCurrencyId(symbol);

                if (id) {
                    body.account = this.account_id;
                    body.currency_pair_id = id;
                    body.ref_id = uuidv4();
                    return this.cryptoRequest.post(config.ORDERS_URL, body)
                        .then(() => {
                            console.log(config.ORDER_CRYPTO_GENERIC_SUCCESS_RESPONSE);
                        })
                        .catch(() => {
                            console.error(config.ORDER_CRYPTO_GENERIC_FAILURE_RESPONSE);
                        });
                } else {
                    console.error(config.ORDER_CRYPTO_INVALID_ID);
                }
            } else {
                console.error(config.ORDER_CRYPTO_INVALID_OPTIONS);
            }
        } else {
            console.error(config.INVALID_TOKEN_ERROR);
        }
    }
}

module.exports = RH