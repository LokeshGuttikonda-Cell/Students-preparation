/**
 * Students-Preparation Distributed Transactions, 2PC & Saga Orchestrator Studio
 * 100% Deterministic Local Compute | Zero External AI Billing ($0.00 Spend)
 * Content Policy Compliant: Generic, Vendor-Neutral Transaction Architectures
 */

export type CoordinationProtocol =
  | 'TWO_PHASE_COMMIT'
  | 'THREE_PHASE_COMMIT'
  | 'CHOREOGRAPHED_SAGA'
  | 'ORCHESTRATED_SAGA'
  | 'TRANSACTIONAL_OUTBOX';

export type IsolationLevel =
  | 'READ_COMMITTED'
  | 'REPEATABLE_READ'
  | 'SERIALIZABLE'
  | 'EVENTUAL_CONSISTENCY';

export type FailureInjection =
  | 'NONE'
  | 'PARTICIPANT_CRASH'
  | 'COORDINATOR_CRASH'
  | 'NETWORK_PARTITION'
  | 'DUAL_WRITE_OUTAGE';

export type TransactionGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export type StepStatus =
  | 'PENDING'
  | 'PREPARED'
  | 'COMMITTED'
  | 'COMPENSATED'
  | 'FAILED';

export interface SagaStep {
  stepId: string;
  serviceName: string;
  actionName: string;
  compensateName: string;
  status: StepStatus;
  executionTimeMs: number;
  retryCount: number;
  errorDetails?: string;
}

export interface TransactionSimulationConfig {
  scenarioId: string;
  protocol: CoordinationProtocol;
  isolationLevel: IsolationLevel;
  timeoutMs: number;
  retryLimit: number;
  hasIdempotencyKey: boolean;
  hasTransactionalOutbox: boolean;
  failureInjection: FailureInjection;
}

export interface TransactionScenario {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  stepCount: number;
  description: string;
  antiPatternSummary: string;
  defaultSteps: SagaStep[];
  goldenConfig: TransactionSimulationConfig;
  goldenExplanation: string;
  socraticHints: string[];
}

export interface TransactionSimulationResult {
  scenarioId: string;
  success: boolean;
  totalDurationMs: number;
  inconsistencyDetected: boolean;
  resourceLockDurationMs: number;
  compensationsTriggered: number;
  networkMessagesExchanged: number;
  steps: SagaStep[];
  score: number;
  grade: TransactionGrade;
  feedback: string;
  earnedBadges: string[];
  simulatedAt: string;
}

export interface SavedTransactionLabRecord {
  scenarioId: string;
  config: TransactionSimulationConfig;
  result: TransactionSimulationResult;
  timestamp: string;
}

export const TRANSACTION_LAB_STORAGE_KEY = 'sp_transaction_lab_v1';

/**
 * 6 Curated Enterprise Placement Transaction Scenarios
 */
export const TRANSACTION_SCENARIOS: TransactionScenario[] = [
  {
    id: 'ecommerce-order-checkout',
    title: 'E-Commerce Checkout & Inventory Reservation',
    domain: 'E-Commerce & Retail',
    difficulty: 'Intermediate',
    stepCount: 4,
    description:
      'An online retail checkout coordinates Order Creation, Payment Processing, Inventory Reservation, and Shipment Scheduling. When traditional Two-Phase Commit (2PC) is applied across microservices, a network hiccup or payment gateway delay holds exclusive database row locks on hot inventory SKUs, exhausting connection pools and causing cascading system downtime.',
    antiPatternSummary:
      'Using synchronous Two-Phase Commit (2PC) across distributed microservices creates blocking distributed locks. If any participant delays or coordinator drops, all service row locks remain frozen.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Order Service',
        actionName: 'Create Pending Order',
        compensateName: 'Cancel Order Status',
        status: 'PENDING',
        executionTimeMs: 25,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'Payment Service',
        actionName: 'Authorize & Charge Card',
        compensateName: 'Issue Card Refund',
        status: 'PENDING',
        executionTimeMs: 140,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Inventory Service',
        actionName: 'Deduct Item Stock',
        compensateName: 'Restock Reserved Item',
        status: 'PENDING',
        executionTimeMs: 35,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Shipping Service',
        actionName: 'Generate Delivery Waybill',
        compensateName: 'Void Shipping Manifest',
        status: 'PENDING',
        executionTimeMs: 50,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'ecommerce-order-checkout',
      protocol: 'ORCHESTRATED_SAGA',
      isolationLevel: 'EVENTUAL_CONSISTENCY',
      timeoutMs: 3000,
      retryLimit: 3,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'NONE',
    },
    goldenExplanation:
      'Orchestrated Saga coordinates local ACID transactions asynchronously. If payment or shipping fails, the central coordinator dispatches semantic compensating transactions (e.g. Restock Item) with zero blocking distributed locks.',
    socraticHints: [
      'What happens to database thread pools when 2PC prepare locks are held during an external payment gateway timeout?',
      'How do semantic compensating transactions achieve eventual consistency without holding physical database locks?',
      'Why must each compensating transaction be idempotent?',
    ],
  },
  {
    id: 'cross-border-wire-transfer',
    title: 'Cross-Border Multi-Currency Wire Transfer',
    domain: 'FinTech & Banking',
    difficulty: 'Advanced',
    stepCount: 4,
    description:
      'A digital banking platform processes international wire transfers across separate ledger services: Debit Sender Account, Lock Foreign Exchange (FX) Rate, Credit Beneficiary Account, and File Regulatory Audit Record. A classic dual-write anti-pattern (updating the local DB and publishing a message separately) causes funds to be debited without crediting the beneficiary when the network glitches between the two calls.',
    antiPatternSummary:
      'Dual-write anti-pattern: Modifying local database state and publishing an event to a message broker in two separate uncommitted network operations causes catastrophic money loss if the server crashes between them.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Debit Ledger',
        actionName: 'Debit Sender Balance',
        compensateName: 'Reverse Debit & Credit Back',
        status: 'PENDING',
        executionTimeMs: 30,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'FX Gateway',
        actionName: 'Lock Spot Exchange Rate',
        compensateName: 'Release Rate Contract',
        status: 'PENDING',
        executionTimeMs: 85,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Credit Ledger',
        actionName: 'Credit Beneficiary Balance',
        compensateName: 'Debit Chargeback Beneficiary',
        status: 'PENDING',
        executionTimeMs: 40,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Compliance Audit',
        actionName: 'Emit AML Compliance Record',
        compensateName: 'Annotate Audit Revocation',
        status: 'PENDING',
        executionTimeMs: 20,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'cross-border-wire-transfer',
      protocol: 'TRANSACTIONAL_OUTBOX',
      isolationLevel: 'SERIALIZABLE',
      timeoutMs: 5000,
      retryLimit: 5,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'DUAL_WRITE_OUTAGE',
    },
    goldenExplanation:
      'Transactional Outbox guarantees atomic state changes by committing the outbound event payload into an Outbox table in the exact same local ACID transaction as the account debit, guaranteeing zero funds loss.',
    socraticHints: [
      'Why is doing `await db.update(...)` followed by `await broker.publish(...)` fundamentally unsafe in financial systems?',
      'How does the Transactional Outbox Pattern leverage local database ACID properties to ensure reliable message delivery?',
      'Why are idempotency keys essential on the receiving consumer ledger?',
    ],
  },
  {
    id: 'rideshare-dispatch-booking',
    title: 'Ride-Sharing Driver Hold & Dispatch Flow',
    domain: 'Mobility & Logistics',
    difficulty: 'Advanced',
    stepCount: 4,
    description:
      'A ride-hailing dispatch workflow orchestrates Route Estimation, Driver Match & Hold, Customer Credit Pre-Authorization, and Vehicle Dispatch. Under Choreographed Sagas, services publish domain events without a central coordinator. When concurrent cancellations occur, services enter circular event cascades where drivers are dispatched to cancelled rides.',
    antiPatternSummary:
      'Choreographed Sagas become unmaintainable and cyclic under complex race conditions. Without a central state machine, concurrent passenger cancellations create zombie dispatches.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Pricing Engine',
        actionName: 'Lock Fare Estimate',
        compensateName: 'Expire Fare Quote',
        status: 'PENDING',
        executionTimeMs: 15,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'Driver Matcher',
        actionName: 'Place Temporary Driver Hold',
        compensateName: 'Release Driver to Pool',
        status: 'PENDING',
        executionTimeMs: 65,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Payments Service',
        actionName: 'Hold Credit Pre-Authorization',
        compensateName: 'Void Card Pre-Authorization',
        status: 'PENDING',
        executionTimeMs: 110,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Dispatch Service',
        actionName: 'Send Turn-by-Turn to Driver',
        compensateName: 'Broadcast Ride Cancel Notification',
        status: 'PENDING',
        executionTimeMs: 30,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'rideshare-dispatch-booking',
      protocol: 'ORCHESTRATED_SAGA',
      isolationLevel: 'EVENTUAL_CONSISTENCY',
      timeoutMs: 2500,
      retryLimit: 2,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'NONE',
    },
    goldenExplanation:
      'An Orchestrated Saga with a centralized workflow state machine enforces explicit state transitions, preventing circular event loops and guaranteeing immediate driver release if payment authorization fails.',
    socraticHints: [
      'Compare Choreographed Saga (implicit events) vs Orchestrated Saga (explicit command state machine).',
      'If a passenger cancels 200ms after clicking "Book", how does an Orchestrator cleanly halt forward execution and run compensations?',
      'Why is eventual consistency acceptable in ride-hailing while strict ACID is required in core banking?',
    ],
  },
  {
    id: 'flight-hotel-vacation-bundle',
    title: 'Vacation Package Multi-Vendor Aggregator',
    domain: 'Travel & Hospitality',
    difficulty: 'Intermediate',
    stepCount: 4,
    description:
      'An online travel agency books all-inclusive vacation packages consisting of Flight Seat Booking, Hotel Room Reservation, Rental Car Hold, and Consolidated Package Billing. Airline APIs require non-refundable commits within 60 seconds. If the hotel reservation fails, the platform must execute forward or backward recovery to avoid charging the customer for a broken trip.',
    antiPatternSummary:
      'Executing multi-vendor external API calls without a backward compensating rollback chain leaves the customer with half-booked trips (e.g. flight booked, but hotel unavailable) and irreversible vendor charges.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Airline Connector',
        actionName: 'Hold Airline Seat',
        compensateName: 'Cancel Flight PNR Reservation',
        status: 'PENDING',
        executionTimeMs: 120,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'Hotel Partner API',
        actionName: 'Reserve Deluxe Suite',
        compensateName: 'Void Hotel Room Booking',
        status: 'PENDING',
        executionTimeMs: 180,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Rental Fleet API',
        actionName: 'Lock SUV Rental',
        compensateName: 'Release Vehicle Reservation',
        status: 'PENDING',
        executionTimeMs: 90,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Package Billing',
        actionName: 'Charge Single Bundle Invoice',
        compensateName: 'Full Refund Package Charge',
        status: 'PENDING',
        executionTimeMs: 150,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'flight-hotel-vacation-bundle',
      protocol: 'ORCHESTRATED_SAGA',
      isolationLevel: 'EVENTUAL_CONSISTENCY',
      timeoutMs: 4000,
      retryLimit: 3,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'PARTICIPANT_CRASH',
    },
    goldenExplanation:
      'Orchestrated Saga with compensating workflows handles third-party vendor failures cleanly: if Hotel Booking crashes, the orchestrator automatically triggers compensating flight cancellation before charging the customer.',
    socraticHints: [
      'Why cannot external third-party vendor APIs (like airline reservation systems) participate in Two-Phase Commit?',
      'What is the difference between forward recovery (retry until success) and backward recovery (compensate back to clean state)?',
      'What happens if a compensating API call itself fails due to a network glitch?',
    ],
  },
  {
    id: 'supply-chain-warehouse-transfer',
    title: 'Multi-Warehouse Inventory Stock Rebalancing',
    domain: 'Supply Chain & Logistics',
    difficulty: 'Expert',
    stepCount: 4,
    description:
      'An enterprise ERP system transfers critical component inventory between regional warehouses: Origin Bin Picking, Cross-Dock In-Transit Hold, Customs Compliance Verification, and Destination Bin Ingestion. Three-Phase Commit (3PC) was implemented to avoid 2PC blocking locks; however, during a cross-datacenter network partition, split-brain consensus causes duplicate inventory creation.',
    antiPatternSummary:
      'Three-Phase Commit (3PC) attempts to be non-blocking using timeouts, but is mathematically vulnerable to split-brain data corruption when network partitions occur between cohorts.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Origin Warehouse',
        actionName: 'Pick & Deduct Pallet',
        compensateName: 'Restock Pallet at Origin',
        status: 'PENDING',
        executionTimeMs: 45,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'Transit Custody',
        actionName: 'Assign Seal & Vehicle ID',
        compensateName: 'De-assign Transit Manifest',
        status: 'PENDING',
        executionTimeMs: 30,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Customs Clearance',
        actionName: 'Validate Tariff Declaration',
        compensateName: 'Revoke Clearance Filing',
        status: 'PENDING',
        executionTimeMs: 95,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Destination Depot',
        actionName: 'Scan & Ingest to Destination Bin',
        compensateName: 'Reverse Depot Ingestion',
        status: 'PENDING',
        executionTimeMs: 40,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'supply-chain-warehouse-transfer',
      protocol: 'ORCHESTRATED_SAGA',
      isolationLevel: 'READ_COMMITTED',
      timeoutMs: 3500,
      retryLimit: 4,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'NETWORK_PARTITION',
    },
    goldenExplanation:
      'Orchestrated Saga with idempotent reconciliation survives network partitions: if customs clearance or destination times out, the saga initiates structured rollback without creating phantom duplicate inventory.',
    socraticHints: [
      'Why does 3PC fail in asynchronous networks when network partitions partition nodes into isolated quorums?',
      'How does an explicit "In-Transit" state prevent ghost inventory during cross-warehouse transfers?',
      'Why does idempotency prevent duplicate stock records when retrying timed-out RPC calls?',
    ],
  },
  {
    id: 'cloud-resource-provisioning',
    title: 'Cloud Multi-Region Infrastructure Provisioning',
    domain: 'Cloud Infrastructure & DevOps',
    difficulty: 'Expert',
    stepCount: 4,
    description:
      'An automated cloud control plane provisions an isolated customer tenant: Virtual Private Cloud (VPC) Creation, Subnet Allocation, Security Group Rules, and Compute Instance Spin-Up. If security group creation fails halfway through, lack of automated compensating rollback leaves "zombie VPCs" and unattached network interfaces silently consuming cloud budget.',
    antiPatternSummary:
      'Naive scripts without structured compensating transactions leave partially provisioned zombie infrastructure leaking money and security holes when intermediate steps fail.',
    defaultSteps: [
      {
        stepId: 'step-1',
        serviceName: 'Network Controller',
        actionName: 'Allocate VPC CIDR Block',
        compensateName: 'Delete Virtual Private Cloud',
        status: 'PENDING',
        executionTimeMs: 80,
        retryCount: 0,
      },
      {
        stepId: 'step-2',
        serviceName: 'Subnet Manager',
        actionName: 'Carve Availability Zone Subnets',
        compensateName: 'Deprovision Subnets',
        status: 'PENDING',
        executionTimeMs: 50,
        retryCount: 0,
      },
      {
        stepId: 'step-3',
        serviceName: 'Security Engine',
        actionName: 'Attach Zero-Trust Firewall Rules',
        compensateName: 'Purge Security Group Rules',
        status: 'PENDING',
        executionTimeMs: 60,
        retryCount: 0,
      },
      {
        stepId: 'step-4',
        serviceName: 'Compute Hypervisor',
        actionName: 'Launch Worker Node Instances',
        compensateName: 'Terminate Worker Instances',
        status: 'PENDING',
        executionTimeMs: 160,
        retryCount: 0,
      },
    ],
    goldenConfig: {
      scenarioId: 'cloud-resource-provisioning',
      protocol: 'ORCHESTRATED_SAGA',
      isolationLevel: 'EVENTUAL_CONSISTENCY',
      timeoutMs: 4000,
      retryLimit: 3,
      hasIdempotencyKey: true,
      hasTransactionalOutbox: true,
      failureInjection: 'COORDINATOR_CRASH',
    },
    goldenExplanation:
      'Orchestrated Saga backed by durable state persistence resumes gracefully even if the provisioner coordinator crashes mid-flight, cleaning up zombie resources with reverse teardown compensation.',
    socraticHints: [
      'How does a durable state log allow an Orchestrator to recover its position after an abrupt coordinator node crash?',
      'Why must infrastructure deprovisioning steps be guaranteed to succeed even if the resource was partially initialized?',
      'How does the Outbox Pattern prevent cloud orchestrators from dropping tenant lifecycle events?',
    ],
  },
];

/**
 * Deterministic PRNG for reliable, repeatable simulations ($0.00 spend)
 */
function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Main Deterministic Distributed Transaction Simulation Engine
 */
export function simulateTransactionExperiment(
  config: TransactionSimulationConfig,
  scenario: TransactionScenario
): TransactionSimulationResult {
  const seed = 101 + scenario.stepCount + config.timeoutMs;
  const prng = createPrng(seed);

  // Clone scenario steps
  const steps: SagaStep[] = scenario.defaultSteps.map((s) => ({
    ...s,
    status: 'PENDING',
    retryCount: 0,
  }));

  let totalDurationMs = 0;
  let resourceLockDurationMs = 0;
  let compensationsTriggered = 0;
  let networkMessagesExchanged = 0;
  let inconsistencyDetected = false;
  let success = true;

  // 1. Protocol Message Overhead Modeling
  // 2PC: 4 messages per participant (Prepare, Prepared, Commit, Ack)
  // 3PC: 6 messages per participant (Can-Commit, Yes, Pre-Commit, Ack, Do-Commit, Ack)
  // Choreographed: 2 messages per step (Event, Processed)
  // Orchestrated: 2 messages per step (Command, Reply) + 2 per compensation
  switch (config.protocol) {
    case 'TWO_PHASE_COMMIT':
      networkMessagesExchanged = steps.length * 4;
      break;
    case 'THREE_PHASE_COMMIT':
      networkMessagesExchanged = steps.length * 6;
      break;
    case 'CHOREOGRAPHED_SAGA':
      networkMessagesExchanged = steps.length * 2;
      break;
    case 'ORCHESTRATED_SAGA':
      networkMessagesExchanged = steps.length * 2;
      break;
    case 'TRANSACTIONAL_OUTBOX':
      networkMessagesExchanged = steps.length * 2 + 1; // Outbox poller message
      break;
  }

  // 2. Resource Lock Duration Modeling
  if (config.protocol === 'TWO_PHASE_COMMIT') {
    // 2PC holds locks from step 1 until coordinator issues commit for all
    const totalStepTimes = steps.reduce((acc, s) => acc + s.executionTimeMs, 0);
    resourceLockDurationMs = totalStepTimes * 1.8 + (config.failureInjection !== 'NONE' ? config.timeoutMs : 0);
  } else if (config.protocol === 'THREE_PHASE_COMMIT') {
    resourceLockDurationMs = steps.reduce((acc, s) => acc + s.executionTimeMs, 0) * 1.4;
  } else {
    // Sagas & Outbox hold zero distributed locks; only short local ACID transactions (~5-15ms)
    resourceLockDurationMs = 12;
  }

  // 3. Step Execution Simulation
  let failedStepIndex = -1;

  // Determine failure trigger based on failure injection
  if (config.failureInjection === 'PARTICIPANT_CRASH') {
    failedStepIndex = 1; // Service 2 crashes (e.g. Hotel / Payment)
  } else if (config.failureInjection === 'COORDINATOR_CRASH') {
    failedStepIndex = 2; // Coordinator dies mid-transaction
  } else if (config.failureInjection === 'NETWORK_PARTITION') {
    failedStepIndex = 2; // Network splits between cohorts
  } else if (config.failureInjection === 'DUAL_WRITE_OUTAGE') {
    failedStepIndex = 1; // Broker disconnects during DB-to-broker call
  }

  // Dual-write bug check: If broker down and Transactional Outbox is NOT enabled, data inconsistency is guaranteed!
  if (config.failureInjection === 'DUAL_WRITE_OUTAGE' && !config.hasTransactionalOutbox) {
    inconsistencyDetected = true;
    success = false;
  }

  // 2PC Coordinator Crash: Participants locked waiting for coordinator
  if (config.protocol === 'TWO_PHASE_COMMIT' && config.failureInjection === 'COORDINATOR_CRASH') {
    success = false;
    resourceLockDurationMs = config.timeoutMs * 2; // Stuck locks!
    inconsistencyDetected = true;
  }

  // 3PC Network Partition: Split-brain causes duplicate commit
  if (config.protocol === 'THREE_PHASE_COMMIT' && config.failureInjection === 'NETWORK_PARTITION') {
    success = false;
    inconsistencyDetected = true; // Split-brain!
  }

  // Execute forward steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    totalDurationMs += step.executionTimeMs;

    if (failedStepIndex === i) {
      step.status = 'FAILED';
      step.errorDetails = `Failure injected: ${config.failureInjection.replace(/_/g, ' ')}`;
      success = false;

      // Handle Retries if Idempotency Key enabled
      if (config.hasIdempotencyKey && config.retryLimit > 1 && config.failureInjection !== 'DUAL_WRITE_OUTAGE') {
        step.retryCount = 1;
        totalDurationMs += step.executionTimeMs * 0.5;
        // In transient crash, retry might resolve if configured
        if (config.failureInjection === 'PARTICIPANT_CRASH' && config.retryLimit >= 4) {
          step.status = 'COMMITTED';
          step.errorDetails = undefined;
          success = true;
          continue;
        }
      }

      break;
    } else {
      step.status = 'COMMITTED';
    }
  }

  // If failure occurred, execute backward compensations for Sagas
  if (!success) {
    if (config.protocol === 'ORCHESTRATED_SAGA' || config.protocol === 'CHOREOGRAPHED_SAGA') {
      // Compensate all previously committed steps in reverse order
      for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].status === 'COMMITTED') {
          steps[i].status = 'COMPENSATED';
          compensationsTriggered++;
          totalDurationMs += steps[i].executionTimeMs * 0.8;
          networkMessagesExchanged += 2;
        }
      }
      // If all committed steps were compensated, system returned to clean consistent state!
      if (!inconsistencyDetected) {
        // Safe backward recovery completed
      }
    } else if (config.protocol === 'TWO_PHASE_COMMIT') {
      // In 2PC, abort is sent
      if (config.failureInjection !== 'COORDINATOR_CRASH') {
        networkMessagesExchanged += steps.length * 2;
      }
    }
  }

  // Jitter
  totalDurationMs = Math.round(totalDurationMs + prng() * 15);

  // 4. Scoring, Grading, and Feedback Assessment
  let score = 50;
  const feedbackPoints: string[] = [];
  const earnedBadges: string[] = [];

  // Protocol selection score
  if (config.protocol === scenario.goldenConfig.protocol) {
    score += 20;
    feedbackPoints.push(`Optimal coordination protocol (${config.protocol}) chosen for ${scenario.domain}.`);
  } else if (
    (config.protocol === 'ORCHESTRATED_SAGA' && scenario.goldenConfig.protocol === 'TRANSACTIONAL_OUTBOX') ||
    (config.protocol === 'TRANSACTIONAL_OUTBOX' && scenario.goldenConfig.protocol === 'ORCHESTRATED_SAGA')
  ) {
    score += 15;
    feedbackPoints.push(`High-reliability pattern (${config.protocol}), tightly aligned with modern microservice standards.`);
  } else {
    score -= 15;
    feedbackPoints.push(`Protocol ${config.protocol} is vulnerable to distributed failure modes in this scenario.`);
  }

  // Dual-write defense check
  if (scenario.id === 'cross-border-wire-transfer') {
    if (config.hasTransactionalOutbox) {
      score += 15;
      feedbackPoints.push('Transactional Outbox ensured atomic message dispatch alongside database debit.');
    } else if (config.failureInjection === 'DUAL_WRITE_OUTAGE') {
      score -= 25;
      feedbackPoints.push('CRITICAL BUG: Dual-write outage without Transactional Outbox caused permanent ledger inconsistency.');
    }
  }

  // 2PC Lock Blocking penalty
  if (config.protocol === 'TWO_PHASE_COMMIT') {
    if (resourceLockDurationMs > 300) {
      score -= 20;
      feedbackPoints.push(`Severe distributed lock contention (${resourceLockDurationMs}ms). 2PC blocks participant row locks.`);
    }
  } else {
    score += 5;
    feedbackPoints.push('Zero distributed lock holding; local ACID transactions preserved database throughput.');
  }

  // 3PC Split-Brain penalty
  if (config.protocol === 'THREE_PHASE_COMMIT' && config.failureInjection === 'NETWORK_PARTITION') {
    score -= 25;
    feedbackPoints.push('CRITICAL FLAW: 3PC suffered split-brain consensus failure during cross-region network partition.');
  }

  // Consistency check
  if (!inconsistencyDetected) {
    score += 10;
    feedbackPoints.push('Data integrity maintained with zero cross-service inconsistency.');
  }

  // Compensation check
  if (compensationsTriggered > 0 && !inconsistencyDetected) {
    score += 10;
    feedbackPoints.push(`Clean backward recovery: ${compensationsTriggered} compensating transaction(s) restored consistency.`);
  }

  // Transactional Outbox bonus
  if (config.hasTransactionalOutbox && scenario.id !== 'cross-border-wire-transfer') {
    score += 5;
  }

  // Idempotency check
  if (config.hasIdempotencyKey) {
    score += 5;
    feedbackPoints.push('Idempotency keys protected services against duplicate RPC executions on network retry.');
  } else if (config.retryLimit > 1) {
    score -= 10;
    feedbackPoints.push('Retrying network requests without idempotency keys risks duplicate actions (e.g. double debit).');
  }

  score = Math.max(10, Math.min(100, score));

  // Determine Grade
  let grade: TransactionGrade = 'F';
  if (score >= 90) grade = 'S';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else grade = 'F';

  // Badges
  if (grade === 'S') earnedBadges.push('SAGA_ORCHESTRATOR');
  if (config.hasTransactionalOutbox) earnedBadges.push('OUTBOX_DEFENDER');
  if (!inconsistencyDetected && config.failureInjection === 'DUAL_WRITE_OUTAGE') {
    earnedBadges.push('ZERO_DUAL_WRITE');
  }
  if (compensationsTriggered > 0 && !inconsistencyDetected) {
    earnedBadges.push('COMPENSATION_HERO');
  }
  if (config.protocol === 'ORCHESTRATED_SAGA' && config.failureInjection === 'NETWORK_PARTITION') {
    earnedBadges.push('SPLIT_BRAIN_SURVIVOR');
  }

  return {
    scenarioId: scenario.id,
    success,
    totalDurationMs,
    inconsistencyDetected,
    resourceLockDurationMs,
    compensationsTriggered,
    networkMessagesExchanged,
    steps,
    score,
    grade,
    feedback: feedbackPoints.join(' '),
    earnedBadges,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Generate Markdown Report for transaction lab audit
 */
export function generateTransactionLabMarkdown(
  scenario: TransactionScenario,
  config: TransactionSimulationConfig,
  result: TransactionSimulationResult
): string {
  return `# Distributed Transactions & Saga Orchestration Assessment Report

**Scenario**: ${scenario.title} (${scenario.domain})  
**Evaluation Date**: ${result.simulatedAt}  
**Candidate Evaluation Grade**: **${result.grade}** (Score: ${result.score}/100)  

---

## 1. Executive Summary & Configuration

- **Coordination Protocol**: \`${config.protocol}\`
- **Isolation Level**: \`${config.isolationLevel}\`
- **Failure Injection**: \`${config.failureInjection}\`
- **Idempotency Key Protection**: \`${config.hasIdempotencyKey ? 'Enabled' : 'Disabled'}\`
- **Transactional Outbox Pattern**: \`${config.hasTransactionalOutbox ? 'Enabled' : 'Disabled'}\`
- **Timeout & Retries**: \`${config.timeoutMs}ms\` timeout, \`${config.retryLimit}\` retries

---

## 2. Step Execution Waterfall

| Step | Service | Action | Status | Exec Time |
| :--- | :--- | :--- | :--- | :--- |
${result.steps
  .map(
    (s) =>
      `| **${s.stepId}** | ${s.serviceName} | ${s.actionName} | **${s.status}** | ${s.executionTimeMs} ms |`
  )
  .join('\n')}

---

## 3. Telemetry & Reliability Metrics

| Metric | Measured Result | Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Transaction Outcome** | ${result.success ? 'SUCCESS (COMMITTED)' : 'ABORTED / ROLLED BACK'} | Clean State | ${result.inconsistencyDetected ? 'CRITICAL INCONSISTENCY 🚨' : 'CONSISTENT ✅'} |
| **End-to-End Latency** | **${result.totalDurationMs} ms** | < 1000 ms | OPTIMAL |
| **Resource Lock Duration** | **${result.resourceLockDurationMs} ms** | < 50 ms | ${result.resourceLockDurationMs <= 50 ? 'NON-BLOCKING' : 'BLOCKING LOCKS'} |
| **Compensations Executed** | **${result.compensationsTriggered}** steps | Safe Rollback | ${result.compensationsTriggered > 0 ? 'COMPENSATED' : 'N/A'} |
| **Network Messages Exchanged** | **${result.networkMessagesExchanged}** msgs | Efficient | BALANCED |

---

## 4. Evaluator Critique & Architecture Feedback

> ${result.feedback}

### Earned Industry Badges:
${result.earnedBadges.length > 0 ? result.earnedBadges.map((b) => `- \`[${b}]\``).join('\n') : '- None for this configuration.'}

---

## 5. Golden Reference Architecture

- **Golden Protocol**: \`${scenario.goldenConfig.protocol}\`
- **Isolation**: \`${scenario.goldenConfig.isolationLevel}\`
- **Rationale**: ${scenario.goldenExplanation}

---
*Report generated by Students-Preparation Distributed Transaction Studio. 100% Local Deterministic Compute.*
`;
}

/**
 * Escape text for raw PDF Type1 streams
 */
function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Build valid vector PDF 1.4 byte string without external dependencies ($0.00 spend)
 */
export function buildTransactionLabPdfString(
  scenario: TransactionScenario,
  config: TransactionSimulationConfig,
  result: TransactionSimulationResult
): string {
  const streamLines: string[] = [
    'BT',
    '/F1 16 Tf',
    '50 800 Td',
    '(Students-Preparation Distributed Transactions Studio Report) Tj',
    '/F2 10 Tf',
    '0 -25 Td',
    `(${escapePdfText(`Scenario: ${scenario.title} | Domain: ${scenario.domain}`)}) Tj`,
    '0 -15 Td',
    `(${escapePdfText(`Simulated: ${result.simulatedAt}`)}) Tj`,
    '0 -25 Td',
    '/F1 12 Tf',
    `(${escapePdfText(`Candidate Evaluation Grade: ${result.grade} (Score: ${result.score}/100)`)}) Tj`,
    '/F2 10 Tf',
    '0 -20 Td',
    `(${escapePdfText(`Protocol: ${config.protocol} | Isolation: ${config.isolationLevel}`)}) Tj`,
    '0 -15 Td',
    `(${escapePdfText(`Failure Injection: ${config.failureInjection} | Outbox: ${config.hasTransactionalOutbox ? 'Yes' : 'No'}`)}) Tj`,
    '0 -15 Td',
    `(${escapePdfText(`Outcome: ${result.success ? 'COMMITTED' : 'ROLLED BACK'} | Consistency: ${result.inconsistencyDetected ? 'INCONSISTENCY DETECTED' : 'CONSISTENT'}`)}) Tj`,
    '0 -25 Td',
    '/F1 12 Tf',
    '(Telemetry & Execution Results:) Tj',
    '/F2 9 Tf',
    '0 -18 Td',
    `(${escapePdfText(`- Total Duration: ${result.totalDurationMs} ms | Lock Holding Time: ${result.resourceLockDurationMs} ms`)}) Tj`,
    '0 -14 Td',
    `(${escapePdfText(`- Compensations Triggered: ${result.compensationsTriggered} | Network Messages: ${result.networkMessagesExchanged}`)}) Tj`,
    '0 -25 Td',
    '/F1 11 Tf',
    '(Saga Steps Summary:) Tj',
    '/F2 9 Tf',
  ];

  for (let i = 0; i < Math.min(result.steps.length, 4); i++) {
    const s = result.steps[i];
    streamLines.push(
      '0 -14 Td',
      `(${escapePdfText(`${s.stepId}: ${s.serviceName} - ${s.actionName} [${s.status}] (${s.executionTimeMs}ms)`)}) Tj`
    );
  }

  streamLines.push(
    '0 -25 Td',
    '/F1 11 Tf',
    '(Evaluator Feedback & Blueprint:) Tj',
    '/F2 8 Tf',
    '0 -15 Td',
    `(${escapePdfText(result.feedback.slice(0, 110))}) Tj`,
    '0 -12 Td',
    `(${escapePdfText(result.feedback.slice(110, 220))}) Tj`,
    '0 -20 Td',
    `(${escapePdfText(`Earned Badges: ${result.earnedBadges.join(', ') || 'None'}`)}) Tj`,
    '0 -30 Td',
    '/F2 8 Tf',
    '(End of Report | Students-Preparation Enterprise Placement Assessment) Tj',
    'ET'
  );

  const streamContent = streamLines.join('\n');
  const streamLength = streamContent.length;

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj',
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
  ];

  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  let offset = 9; // '%PDF-1.4\n'

  const bodyParts: string[] = ['%PDF-1.4\n'];
  for (let i = 0; i < objects.length; i++) {
    const objStr = objects[i] + '\n';
    xref += String(offset).padStart(10, '0') + ' 00000 n \n';
    bodyParts.push(objStr);
    offset += objStr.length;
  }

  const startXref = offset;
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  bodyParts.push(xref);
  bodyParts.push(trailer);

  return bodyParts.join('');
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  if (typeof URL.createObjectURL !== 'function') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

export function exportTransactionLabPdf(
  scenario: TransactionScenario,
  config: TransactionSimulationConfig,
  result: TransactionSimulationResult
): void {
  const pdfString = buildTransactionLabPdfString(scenario, config, result);
  const filename = `transaction-lab-${scenario.id}-report.pdf`;
  downloadFile(filename, pdfString, 'application/pdf');
}

/**
 * LocalStorage Persistence Helpers
 */
export function saveTransactionLabRecord(record: SavedTransactionLabRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedTransactionLabRecords();
    const filtered = existing.filter((r) => r.scenarioId !== record.scenarioId);
    filtered.push(record);
    localStorage.setItem(TRANSACTION_LAB_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Gracefully ignore storage quota errors
  }
}

export function loadSavedTransactionLabRecords(): SavedTransactionLabRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRANSACTION_LAB_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTransactionLabRecord[];
  } catch {
    return [];
  }
}
