declare module '@almadar-io/agent' {
  interface HealthCheckResult {
    status: string;
  }

  interface ObservabilityCollector {
    getPerformanceSnapshot(): unknown;
    healthCheck(): Promise<HealthCheckResult[]>;
    getSessionTelemetry(threadId: string): unknown;
    getActiveSessions(): unknown;
  }

  export function getObservabilityCollector(): ObservabilityCollector;
}
