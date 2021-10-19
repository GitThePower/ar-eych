const rh = require('../src');
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

// Only used for integration testing
test.skip('Testing the rh api', async () => {
    try {
        new rh({
            username: 'someUsername',
            password: 'somePassword',
            // mfa_code: '123456'
        });
        await sleep(3);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
});