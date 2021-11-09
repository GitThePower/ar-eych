const config = require('./config');
const { v4: uuidv4 } = require('uuid');

class RH {
    request = require('./request');
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
            console.log(config.INVALID_CREDENTIALS_ERROR);
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
            console.log(config.INVALID_USER_PW_ERROR);
        }

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
    };

    /**
     * Sets authentication header for requests
     * @returns {Boolean} true if access token exists, false otherwise
     */
    setAuth = () => {
        if (this.access_token !== config.DEFAULT_TOKEN) {
            this.request.defaults.headers.common['Authorization'] = 'Bearer ' + this.access_token;
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
        } else {
            console.error(config.INVALID_TOKEN_ERROR);
        }
    };
}

module.exports = RH