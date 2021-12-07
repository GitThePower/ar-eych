const RH = require('../src');
const config = require('../local-config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

test.skip('Testing the rh api', async () => {
    try {
        const rh = new RH({
            username: config.rhUsername,
            password: config.rhPassword,
            // mfa_code: '123456'
            // access_token: ''
        });
        await sleep(3);
        console.log('AUTH: ', rh.access_token);
        const currencyId = await rh.getCurrencyId('BTC');
        console.log('BTC ID: ', currencyId);
        // const options = {
        //     currencyId,
        //     orderValue: 0.10
        // }
        // await rh.marketBuyCrypto(options);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
});