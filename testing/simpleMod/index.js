/**
 * Simple Screeps Server Mod
 *
 * Publishes over pubsub when server starts.
 */
module.exports = (config) => {
  // Engine (main) patch
  if (config.engine) {
    config.engine.on('init', async (processType) => {
      if (processType === 'main') {
        const {pubsub} = config.common.storage;

        pubsub.publish('simplemod:init', 'foobar');
      }
    });
  }
};
