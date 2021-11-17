const RH = require('../src');
const config = require('../local-config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

// Only used for integration testing
test.skip('Testing the rh api', async () => {
    try {
        const rh = new RH({
            username: config.rhUsername,
            password: config.rhPassword,
            // mfa_code: '123456'
        });
        await sleep(3);
        const currencyId = await rh.getCurrencyId('BTC');
        const bitCoin = await rh.getCryptoQuote({currencyId});
        console.log(bitCoin);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
});