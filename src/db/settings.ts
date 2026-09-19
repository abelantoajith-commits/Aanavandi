export interface ConductorSettings {
  id?: string;              // single document key, e.g. "active_settings"
  conductorName: string;
  route: string;
  lastSyncedAt?: number;    // epoch ms, set by the Sync button (§6.8)
}
