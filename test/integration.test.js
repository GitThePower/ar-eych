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
        const account = await rh.getAccountDetails();
        const { crypto, crypto_buying_power } = account;
        console.log('CRYPTO EQUITY: ', crypto.equity.amount);
        console.log('CRYPTO BUYING POWER: ', crypto_buying_power.amount);
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