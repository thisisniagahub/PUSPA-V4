export const HERMES_LOCAL_ONLY = process.env.HERMES_LOCAL_ONLY !== 'false'
export const HERMES_WEBHOOKS_ENABLED = process.env.HERMES_WEBHOOKS_ENABLED === 'true'
export const HERMES_GATEWAY_URL = process.env.HERMES_GATEWAY_URL || 'http://127.0.0.1:18789'

export function getHermesRuntimeMode() {
  return {
    localOnly: HERMES_LOCAL_ONLY,
    webhooksEnabled: HERMES_WEBHOOKS_ENABLED,
    gatewayUrl: HERMES_GATEWAY_URL,
  }
}
