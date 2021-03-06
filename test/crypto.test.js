const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const RH = require('../src');
const rhConfig = require('../src/config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

const baseURL = 'https://api.robinhood.com/';
const fakeToken = 'someToken';
const fakeUrl = 'someUrl';
const fakeId = 'someId';
const fakeCurrencyPairs = [
  {
    asset_currency: { code: 'BTC'  },
    id: '3d961844-d360-45fc-989b-f6fca761d511'
  }
];
const fakeAskPrice = '1.00';
const fakeOrderValue = 0.1;
const fakeQuantity = '0.00000115';
const fakeOrderCryptoResult = {
  account_id: '00000000-0000-0000-0000-000000000000',
  average_price: null,
  cancel_url: 'https://nummus.robinhood.com/orders/ffffffff-ffff-ffff-ffff-ffffffffffff/cancel/',
  created_at: '2020-2-29T12:00:00.000000-00:00',
  cumulative_quantity: '0.000000000000000000',
  currency_pair_id: '3d961844-d360-45fc-989b-f6fca761d511',
  entered_price: '0.100000000000000000',
  executions: [],
  id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  initiator_id: null,
  initiator_type: null,
  last_transaction_at: null,
  price: '60000.000000000000000000',
  quantity: '0.000001666666666666',
  ref_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  rounded_executed_notional: '0.00',
  side: 'buy',
  state: 'unconfirmed',
  time_in_force: 'gtc',
  type: 'market',
  updated_at: '2020-2-29T12:00:00.000000-00:00'
};
const currency_id_regex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
let mock;

afterEach(() => {
    mock.restore();
});

// getCurrencyId
test('getCurrencyId - should return an id based on the given crypto symbol', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const currencyId = await rh.getCurrencyId(symbol);
  expect(currencyId.match(currency_id_regex).length).toBe(1);
});

test('getCurrencyId - should handle get currency pairs response malformed', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, "notExpected");

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const currencyId = await rh.getCurrencyId(symbol);
  expect(currencyId).toBeUndefined();
});

test('getCurrencyId - should handle get currency pairs error', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(500, new Error("notExpected"));

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const currencyId = await rh.getCurrencyId(symbol);
  expect(currencyId).toBeUndefined();
});

test('getCurrencyId - should handle undefined symbol', async () => {
  const symbol = null;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const currencyId = await rh.getCurrencyId(symbol);
  expect(currencyId).toBeUndefined();
});

test('getCurrencyId - should handle invalid access token', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  mock = new MockAdapter(axios);

  const rh = new RH({});

  expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
  expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
  expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
  
  const currencyId = await rh.getCurrencyId(symbol);
  expect(currencyId).toBeUndefined();
});

// getCryptoQuote
test('getCryptoQuote - should return a quote based on the given crypto symbol', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({ symbol });
  expect(quote.ask_price).toBe(fakeAskPrice);
});

test('getCryptoQuote - should return a quote based on the given currency id', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({ currencyId: id });
  expect(quote.ask_price).toBe(fakeAskPrice);
});

test('getCryptoQuote - should handle get crypto quote response malformed', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, null);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({ currencyId: id });
  expect(quote).toBeUndefined();
});

test('getCryptoQuote - should handle get crypto quote error', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(500, new Error('notExpected'));

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({ currencyId: id });
  expect(quote).toBeUndefined();
});

test('getCryptoQuote - should handle invalid currency id', async () => {
  const symbol = 'KFC';
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({ symbol });
  expect(quote).toBeUndefined();
});

test('getCryptoQuote - should handle invalid options', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice });

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const quote = await rh.getCryptoQuote({});
  expect(quote).toBeUndefined();
  const otherQuote = await rh.getCryptoQuote();
  expect(otherQuote).toBeUndefined();
});

test('getCryptoQuote - should handle invalid access token', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);

  const rh = new RH({});

  expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
  expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
  expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);
  
  const quote = await rh.getCryptoQuote({ currencyId: id });
  expect(quote).toBeUndefined();
});

// orderCrypto
test('orderCrypto - should order crypto currency based on the given options', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  const orderResult = await rh.orderCrypto({
    symbol,
    quantity: fakeQuantity,
    currencyPrice: fakeAskPrice,
    side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeTruthy();
});

test('orderCrypto - should handle order crypto response malformed', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, null);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);

  const orderResult = await rh.orderCrypto({
    currencyId: id,
    orderValue: fakeOrderValue,
    side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeUndefined();
});

test('orderCrypto - should handle order crypto error', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(500, new Error('unexpectedError'));

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);

  const orderResult = await rh.orderCrypto({
    currencyId: id,
    orderValue: fakeOrderValue,
    side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeUndefined();
});

test('orderCrypto - should handle invalid currency id', async () => {
  const symbol = 'KFC';
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);

  const orderResult = await rh.orderCrypto({
    symbol,
    quantity: fakeQuantity,
    currencyPrice: fakeAskPrice,
    side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeUndefined();
});

test('orderCrypto - should handle invalid options', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);

  // removing required parameter 'side'
  let orderResult = await rh.orderCrypto({
    currencyId: id,
    orderValue: fakeOrderValue,
    // side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeUndefined();

  // options === undefined
  orderResult = await rh.orderCrypto();
  expect(orderResult).toBeUndefined();
});

test('orderCrypto - should handle invalid options', async () => {
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);

  const rh = new RH({});

  expect(rh.access_token).toBe(rhConfig.DEFAULT_TOKEN);
  expect(rh.account).toBe(rhConfig.DEFAULT_ACCOUNT);
  expect(rh.account_id).toBe(rhConfig.DEFAULT_ACCOUNT_ID);

  let orderResult = await rh.orderCrypto({
    currencyId: id,
    orderValue: fakeOrderValue,
    side: 'buy',
    time_in_force: 'gtc',
    type: 'market'
  });
  expect(orderResult).toBeUndefined();
});

// marketBuyCrypto
test('marketBuyCrypto - should buy crypto currency based on simplified options', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  let orderResult = await rh.marketBuyCrypto({
    symbol,
    quantity: fakeQuantity,
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.marketBuyCrypto({
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeTruthy();
});

// marketSellCrypto
test('marketSellCrypto - should sell crypto currency based on simplified options', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onGet(baseURL + rhConfig.CRYPTO_QUOTES_URL + id + '/').reply(200, { ask_price: fakeAskPrice })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  let orderResult = await rh.marketSellCrypto({
    symbol,
    quantity: fakeQuantity,
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.marketSellCrypto({
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeTruthy();
});

// limitBuyCrypto
test('limitBuyCrypto - should buy crypto currency based on simplified options', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  let orderResult = await rh.limitBuyCrypto({
    currencyPrice: fakeAskPrice,
    symbol,
    quantity: fakeQuantity,
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.limitBuyCrypto({
    currencyPrice: fakeAskPrice,
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.limitBuyCrypto({
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeFalsy();

  orderResult = await rh.limitBuyCrypto(null);
  expect(orderResult).toBeFalsy();
});

// limitSellCrypto
test('limitSellCrypto - should sell crypto currency based on simplified options', async () => {
  const symbol = fakeCurrencyPairs[0].asset_currency.code;
  const id = fakeCurrencyPairs[0].id;
  mock = new MockAdapter(axios);
  mock.onGet(baseURL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ url: fakeUrl }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ACCOUNTS_URL).reply(200, { results: [{ id: fakeId }] })
      .onGet(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.CURRENCY_PAIRS_URL).reply(200, { results: fakeCurrencyPairs })
      .onPost(rhConfig.CURRENCY_PAIRS_BASE_URL + rhConfig.ORDERS_URL).reply(200, fakeOrderCryptoResult);

  const rh = new RH({
      access_token: fakeToken
  });
  await sleep(1);

  expect(rh.access_token).toBe(fakeToken);
  expect(rh.account).toBe(fakeUrl);
  expect(rh.account_id).toBe(fakeId);
  
  let orderResult = await rh.limitSellCrypto({
    currencyPrice: fakeAskPrice,
    symbol,
    quantity: fakeQuantity,
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.limitSellCrypto({
    currencyPrice: fakeAskPrice,
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeTruthy();

  orderResult = await rh.limitSellCrypto({
    currencyId: id,
    orderValue: fakeOrderValue
  });
  expect(orderResult).toBeFalsy();

  orderResult = await rh.limitSellCrypto(null);
  expect(orderResult).toBeFalsy();
});
