/**
 * @almadar/server-hono - Hono server infrastructure for Almadar applications
 *
 * Re-exports framework-agnostic utilities from @almadar/server and provides
 * Hono-native middleware replacements for Express-specific code.
 *
 * @packageDocumentation
 */

// ─── Hono-native lib ────────────────────────────────────────────────────────
export {
  setupHonoEventBroadcast,
  getHonoWebSocketServer,
  closeHonoWebSocketServer,
  getHonoConnectedClientCount,
} from './lib/websocket.js';

// ─── SSE helpers (re-exported from @almadar/server) ─────────────────────────
export {
  setupSSE,
  sendSSEEvent,
  formatSSEEvent,
  sendSSEDone,
  closeSSE,
  type SSEEvent,
} from '@almadar/server';

// ─── Hono-native middleware (replaces Express versions) ─────────────────────
export { errorHandler, notFoundHandler } from './middleware/error-handler.js';
export { authenticateFirebase } from './middleware/auth.js';
export { validateBody, validateQuery, validateParams } from './middleware/validation.js';

// ─── Hono-native routers (replaces Express versions) ────────────────────────
export { debugEventsRouter } from './lib/debug-router.js';
export { observabilityRouter } from './routes/observability.js';

// ─── Hono Env types ─────────────────────────────────────────────────────────
export type { AppEnv, FirebaseEnv, FullUserEnv, FirebaseVariables, UserContextVariables, UserContext } from './types.js';

// ─── Error classes (re-export from @almadar/server) ─────────────────────────
export { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError } from '@almadar/server';

// ─── Lib exports (framework-agnostic, re-exported from @almadar/server) ─────
export { env } from '@almadar/server';
export { logger } from '@almadar/server';
export {
  EventBus,
  getServerEventBus,
  resetServerEventBus,
  emitEntityEvent,
  type EventLogEntry,
} from '@almadar/server';
export {
  DistributedEventBus,
  InMemoryTransport,
  RedisTransport,
  type IEventBusTransport,
  type TransportMessage,
  type TransportReceiver,
  type RedisTransportOptions,
} from '@almadar/server';
export {
  EventPersistence,
  InMemoryEventStore,
  type PersistedEvent,
  type EventQuery,
  type EventPersistenceOptions,
  type IEventStore,
} from '@almadar/server';
export { initializeFirebase, getFirestore, getAuth, db } from '@almadar/server';
export {
  setupEventBroadcast,
  getWebSocketServer,
  closeWebSocketServer,
  getConnectedClientCount,
} from '@almadar/server';

// ─── Services (framework-agnostic, re-exported from @almadar/server) ────────
export {
  MockDataService,
  getMockDataService,
  resetMockDataService,
  type FieldSchema,
  type EntitySchema,
} from '@almadar/server';
export {
  getDataService,
  resetDataService,
  seedMockData,
  type DataService,
  type EntitySeedConfig,
  type PaginationOptions,
  type PaginatedResult,
} from '@almadar/server';
export {
  getSubstrateService,
  setSubstrateService,
  resetSubstrateService,
  type SubstrateService,
} from '@almadar/server';

// ─── Compat re-exports (deprecated lazy proxies from @almadar/server) ───────
export { dataService, mockDataService, serverEventBus } from '@almadar/server';

// ─── Stores (framework-agnostic, re-exported from @almadar/server) ──────────
export {
  toFirestoreFormat,
  fromFirestoreFormat,
  SchemaStore,
  SnapshotStore,
  ChangeSetStore,
  ValidationStore,
  SchemaProtectionService,
  getRuntimeEntity,
  clearRuntimeEntity,
  resetRuntimeEntityStore,
} from '@almadar/server';

// ─── Utils (framework-agnostic, re-exported from @almadar/server) ───────────
export {
  parseQueryFilters,
  applyFiltersToQuery,
  extractPaginationParams,
  type ParsedFilter,
  type FirestoreWhereFilterOp,
  type PaginationParams,
} from '@almadar/server';

// ─── Service Discovery (framework-agnostic, re-exported from @almadar/server) ─
export {
  ServiceDiscovery,
  InMemoryServiceRegistry,
  type ServiceRegistration,
  type ServiceRegistryOptions,
  type IServiceRegistry,
} from '@almadar/server';

// ─── Contract types (re-exported from @almadar/server) ──────────────────────
export type {
  DataServiceActions,
  DataServiceContract,
  EventBusActions,
  EventBusServiceContract,
  ServiceDiscoveryActions,
  ServiceDiscoveryContract,
  ServerServiceContracts,
} from '@almadar/server';

// ─── Rabit compatibility exports (re-exported from @almadar/server) ─────────
export {
  getOrbitalMemory,
  resetOrbitalMemory,
  getSessionStore,
  resetSessionStore,
  createServerSkillAgent,
} from '@almadar/server';
