declare module '@almadar-io/rabit' {
  import type { JsonValue } from '@almadar/core';

  // Canonical SSE event vocabulary re-exported for hono-server consumers.
  export type {
    SSEEvent,
    SSEEventType,
    SSEEventBase,
    StartEvent,
    MessageEvent,
    ToolCallEvent,
    ToolResultEvent,
    TodoUpdateEvent,
    TodoDetailEvent,
    FileOperationEvent,
    FileWrittenEvent,
    SchemaUpdateEvent,
    GenerationLogEvent,
    SubagentEvent,
    SubagentStartEvent,
    SubagentProgressEvent,
    SubagentCompleteEvent,
    InterruptEvent,
    ErrorEvent,
    CancelledEvent,
    CompleteEvent,
    AppCreatedEvent,
    SchemaPhaseValidatedEvent,
    SchemaPhaseUpdateEvent,
    OrbitalAddedEvent,
    OrbitalSchemaCompleteEvent,
    ProcessStartEvent,
    ProcessCompleteEvent,
    ProcessErrorEvent,
    ProcessRepairEvent,
    ProcessRepairCompleteEvent,
    ParamsRepairEmittedEvent,
    ChangesetRecordedEvent,
    SnapshotCreatedEvent,
    GateStartEvent,
    GateCompleteEvent,
    JepaValidityEvent,
    JepaErrorsEvent,
    JepaGapEvent,
    JepaRepairEvent,
    ViewChangeEvent,
    EditModeEnterEvent,
    EditModeExitEvent,
    EditSelectEvent,
    CoordinatorDecisionEvent,
    PlanCommittedEvent,
    PendingQuestionEvent,
    ClarificationQuestionEvent,
    CoordinatorThinkingEvent,
    ChatMessageAppendedEvent,
    AnalysisCompleteEvent,
  } from '@almadar-io/rabit';

  export interface TraceEvent {
    type: string;
    timestamp: number;
    [key: string]: JsonValue;
  }
}
