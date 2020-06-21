/**
 * Simple Screeps Server Mod
 *
 * Echos a message over pubsub.
 */
module.exports = (config) => {
  // Engine (main) patch
  if (config.engine) {
    config.engine.on('init', async (processType) => {
      if (processType === 'main') {
        const {pubsub} = config.common.storage;

        pubsub.subscribe('simplemod:in', (message) => {
          pubsub.publish('simplemod:out', message + '_out');
        });
      }
    });
  }
};
