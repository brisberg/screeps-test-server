/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * Simple Screeps Server Mod
 *
 * Echos a message over pubsub.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function simpleMod(config: any): void {
  // Engine (main) patch
  if (config.engine) {
    config.engine.on('init', async (processType: string) => {
      if (processType === 'main') {
        const {pubsub} = config.common.storage;
        console.log('subscribing');

        pubsub.subscribe('simplemod:in', (message: string) => {
          console.log('pubsub ' + message);
          pubsub.publish('simplemod:out', message + '_out');
        });
      }
    });
  }
}

// CommonJS Style Export
export = simpleMod;
