const {launchTestServer, killTestServer} = require('.');

describe('Screeps Test Server', () => {
  it('should launch a test server in the test environment', async () => {
    const {db, env, pubsub} = await launchTestServer();

    // Queries against live servers succeed
    expect(await env.get(env.keys.GAMETIME)).toEqual(2);

    await killTestServer();

    // Queries against closed connections will never complete, expect a timeout
    const query = db['rooms'].find().timeout(300);
    return expect(query).rejects.toEqual(new Error('Timed out after 300 ms'));
  });

  it.todo(`should produce no console output with 'silent' option`);

  it.todo(`should forward output to console with 'silent: false'`);
});
