module.exports = {
    DEFAULT_CLIENT_ID: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS',
    DEFAULT_PASSWORD: 'ifThisIsYourPasswordThenChangeYourPassword',
    DEFAULT_USERNAME: 'ifThisIsYourUsernameThenChangeYourUsername',
    DEFAULT_MFA_CODE: 'notAnActualMFACode',
    DEFAULT_TOKEN: 'notAnActualToken',
    DEFAULT_ACCOUNT: 'notAnActualAccount',
    DEFAULT_ACCOUNT_ID: 'notAnActualAccountId',
    DEFAULT_REQUEST: {},

    // Conditions
    IS_INIT: true,
    IS_NOT_INIT: false,

    // URLS
    LOGIN_URL: 'oauth2/token/',
    ACCOUNTS_URL: 'accounts/',
    CURRENCY_PAIRS_BASE_URL: 'https://nummus.robinhood.com/',
    CURRENCY_PAIRS_URL: 'currency_pairs/',
    CRYPTO_QUOTES_URL: 'marketdata/forex/quotes/',
    ORDERS_URL: 'orders/',
    BONFIRE_BASE_URL: 'https://bonfire.robinhood.com/',
    PHOENIX_ACCOUNTS_UNIFIED_URL: 'phoenix/accounts/unified/',

    // Method Responses
    LOGIN_MFA_REQUIRED: 'MFA required to log in.',
    ACCOUNTS_DOES_NOT_EXIST: 'Response did not return an account.',
    ACCOUNTS_ID_DOES_NOT_EXIST: 'Response did not return an account ID.',
    ORDER_CRYPTO_GENERIC_SUCCESS_RESPONSE: 'Order crypto succeeded.',

    // Method Error Responses
    INVALID_CREDENTIALS_ERROR: 'Invalid credentials. Token or username+password required.',
    INVALID_USER_PW_ERROR: 'Invalid credentials. Username+password required.',
    INVALID_TOKEN_ERROR: 'Invalid credentials. Token required.',
    LOGIN_GENERIC_FAILURE_RESPONSE: 'Login request failed.',
    LOGIN_MALFORMED_RESPONSE: 'Login response returned malformed data object.',
    UNREACHABLE_RESPONSE: 'This should not be called.',
    ACCOUNTS_GENERIC_FAILURE_RESPONSE: 'Request to get account failed.',
    ACCOUNTS_ID_GENERIC_FAILURE_RESPONSE: 'Request to get account ID failed.',
    GET_CURRENCY_ID_INVALID_SYMBOL: 'Get currency id did not receive a symbol.',
    GET_CURRENCY_ID_GENERIC_FAILURE_RESPONSE: 'Get currency id request failed.',
    GET_CURRENCY_ID_MALFORMED_RESPONSE: 'Get currency id response returned malformed data object.',
    GET_CRYPTO_QUOTE_INVALID_OPTIONS: 'Get crypto quote did not receive valid options.',
    GET_CRYPTO_QUOTE_INVALID_ID: 'Get crypto quote did not receive a valid currency id.',
    GET_CRYPTO_QUOTE_GENERIC_FAILURE_RESPONSE: 'Get crypto quote request failed.',
    GET_CRYPTO_QUOTE_MALFORMED_RESPONSE: 'Get crypto quote response returned malformed data object.',
    ORDER_CRYPTO_INVALID_OPTIONS: 'Order crypto did not receive valid options.',
    ORDER_CRYPTO_INVALID_ID: 'Order crypto did not receive a valid currency id.',
    ORDER_CRYPTO_GENERIC_FAILURE_RESPONSE: 'Order crypto request failed.',
    GET_ACCOUNT_DETAILS_MALFORMED_RESPONSE: 'Get account details response returned malformed data object.',
    GET_ACCOUNT_DETAILS_GENERIC_FAILURE_RESPONSE: 'Get account details request failed.'
}