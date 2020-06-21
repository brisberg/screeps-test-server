const ScreepsTestServer = require('./test-server');

describe('Screeps Test Server', () => {
  let server;

  afterEach(async () => {
    await server.stop();
  })

  it('should launch a test server in the test environment', async () => {
    server = new ScreepsTestServer({serverDir: 'testEnv'});
    await server.start();
    const {db, env, pubsub} = server;

    // Queries against live servers succeed
    expect(await env.get(env.keys.GAMETIME)).toEqual(2);

    await server.stop();

    // Queries against closed connections will never complete, expect a timeout
    const query = db['rooms'].find().timeout(300);
    return expect(query).rejects.toEqual(new Error('Timed out after 300 ms'));
  });

  it.todo(`should produce no console output with 'silent' option`);

  it.todo(`should forward output to console with 'silent: false'`);

  it.todo(`should load server mods requested in options`);

  it.todo(`should load bot scripts requested in options`);
});
