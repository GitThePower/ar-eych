const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const RH = require('../src');
const rhConfig = require('../src/config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

const baseURL = 'https://api.robinhood.com/';
const fakeToken = 'someToken';
const fakeUrl = 'someUrl';
const fakeId = 'someId';
const fakeUsername = 'someUsername';
const fakePassword = 'somePassword';
const fakeMfaCode = 'someMfaCode';
let mock;

afterEach(() => {
    mock.restore();
});

test('Instantiating the rh object without credentials should trigger invalid credentials', async () => {
    mock = new MockAdapter(axios);

    const rh = new RH({});
    await sleep(1);

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});

test('Instantiating the rh object with just User/PW should trigger mfa required', async () => {
    mock = new MockAdapter(axios);
    mock.onPost(baseURL + rhConfig.LOGIN_URL).replyOnce(200, { mfa_required: 'true' })
        .onPost(baseURL + rhConfig.LOGIN_URL).reply(200, { access_token: fakeToken })
        .onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
        .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] });

    const rh = new RH({
        username: fakeUsername,
        password: fakePassword
    });
    await sleep(1);

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});

test('Instantiating the rh object with mfa_code should log in and get account info', async () => {
    mock = new MockAdapter(axios);
    mock.onPost(baseURL + rhConfig.LOGIN_URL).replyOnce(200, { mfa_required: 'true' })
        .onPost(baseURL + rhConfig.LOGIN_URL).reply(200, { access_token: fakeToken })
        .onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
        .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] });

    const rh = new RH({
        username: fakeUsername,
        password: fakePassword,
        mfa_code: fakeMfaCode
    });
    await sleep(1);

    expect(rh.access_token).toBe(fakeToken);
    expect(rh.account).toBe(fakeUrl);
    expect(rh.account_id).toBe(fakeId);
});

test('Instantiating the rh object with a token skip log in and get account info', async () => {
    mock = new MockAdapter(axios);
    mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
        .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] });

    const rh = new RH({
        access_token: fakeToken
    });
    await sleep(1);

    expect(rh.access_token).toBe(fakeToken);
    expect(rh.account).toBe(fakeUrl);
    expect(rh.account_id).toBe(fakeId);
});

test('Calling login without proper instantiation should trigger invalid User/PW', async () => {
    mock = new MockAdapter(axios);

    const rh = new RH({});
    await sleep(1);
    await rh.logIn();

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});

test('Calling setAuth without proper instantiation should do nothing', async () => {
    mock = new MockAdapter(axios);

    const rh = new RH({});
    await sleep(1);
    rh.setAuth();

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});

test('Calling getSession without proper instantiation should trigger invalid token', async () => {
    mock = new MockAdapter(axios);

    const rh = new RH({});
    await sleep(1);
    await rh.getSession();

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});

test('The login endpoint returning an unexpected response should trigger malformed response', async () => {
    mock = new MockAdapter(axios);
    mock.onPost(baseURL + rhConfig.LOGIN_URL).reply(200, 'notExpected')
        .onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
        .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] });

    const rh = new RH({
        username: fakeUsername,
        password: fakePassword,
        mfa_code: fakeMfaCode
    });
    await sleep(1);

    expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
    expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
    expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
});