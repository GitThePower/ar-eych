const RH = require('../src');
const config = require('../local-config');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

// Only used for integration testing
test.skip('Testing the rh api', async () => {
    try {
        const rh = new RH({
            username: config.rhUsername,
            password: config.rhPassword,
            // mfa_code: '795378'
        });
        await sleep(3);
        const bitCoin = await rh.getCrypto('BTC');
        console.log(bitCoin);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
});