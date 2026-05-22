import { Platform } from '@bitdev/platforms.platform';

const BridgetechService = import.meta.resolve('@rca/health-bridgetech.services.bridgetech-service');
const HealthBridgetech = import.meta.resolve('@rca/health-bridgetech.apps.health-bridgetech');
const PlatformGateway = import.meta.resolve('@bitdev/platforms.backend.gateway-server');

/** Bridgetech platform composes the React frontend with the Express backend behind a unified gateway */
export const BridgetechPlatform = Platform.from({
  name: 'bridgetech-platform',

  frontends: {
    main: HealthBridgetech,
    mainPortRange: [3000, 3100],
  },

  backends: {
    main: PlatformGateway,
    services: [BridgetechService],
  },
});

export default BridgetechPlatform;
