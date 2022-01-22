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
        console.log('ACCOUNT DETAILS: ', account);
        const currencyId = await rh.getCurrencyId('BTC');
        console.log('BTC ID: ', currencyId);
        // const options = {
        //     currencyId,
        //     orderValue: 0.10,
        //     currencyPrice: '100000.00',
        // }
        // const orderResult = await rh.limitBuyCrypto(options);
        // console.log('ORDER RESULT: ', orderResult);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
});