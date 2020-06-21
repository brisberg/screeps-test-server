const ScreepsTestServer = require('../test-server');

describe('Screeps Test Server (with mods)', () => {
  let server;

  beforeEach(async () => {
    server = new ScreepsTestServer({mods: ['../testing/simpleMod/index.js']});
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should modify mods.json with given mod paths', () => {
    const mods = require('../server/mods.json');

    expect(mods.mods).toEqual(['../testing/simpleMod/index.js']);
  });

  it.todo('should launch test server with specified mod enabled');
});
