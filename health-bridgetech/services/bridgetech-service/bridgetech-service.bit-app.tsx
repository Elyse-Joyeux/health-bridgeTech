import { NodeServer } from '@bitdev/node.node-server';

export default NodeServer.from({
  name: 'bridgetech-service',
  mainPath: import.meta.resolve('./bridgetech-service.app-root.js'),
});
