const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const RH = require('../src');
const rhConfig = require('../src/config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

const baseURL = 'https://api.robinhood.com/';
const fakeToken = 'someToken';
const fakeUrl = 'someUrl';
const fakeId = 'someId';
const fakeAccountDetails = {
  crypto: {
    equity: {
      amount: 10.00
    }
  },
  crypto_buying_power: {
    amount: 1.00
  }
};
let mock;

afterEach(() => {
    mock.restore();
});

// getAccountDetails
test('getAccountDetails - should return account details', async () => {
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.BONFIRE_BASE_URL + rhConfig.PHOENIX_ACCOUNTS_UNIFIED_URL).reply(200, fakeAccountDetails);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const accountDetails = await rh.getAccountDetails();
  expect(accountDetails.hasOwnProperty('crypto')).toBe(true);
  expect(accountDetails.hasOwnProperty('crypto_buying_power')).toBe(true);
});


test('getAccountDetails - should handle get account details response malformed', async () => {
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.BONFIRE_BASE_URL + rhConfig.PHOENIX_ACCOUNTS_UNIFIED_URL).reply(200, null);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const accountDetails = await rh.getAccountDetails();
  expect(accountDetails).toBeUndefined();
});

test('getAccountDetails - should handle get account details error', async () => {
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.BONFIRE_BASE_URL + rhConfig.PHOENIX_ACCOUNTS_UNIFIED_URL).reply(500, new Error("notExpected"));

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const accountDetails = await rh.getAccountDetails();
  expect(accountDetails).toBeUndefined();
});



test('getAccountDetails - should handle invalid access token', async () => {
  mock = new MockAdapter(axios);

  const rh = new RH({});

  expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
  expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
  expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
  
  const accountDetails = await rh.getAccountDetails();
  expect(accountDetails).toBeUndefined();
});