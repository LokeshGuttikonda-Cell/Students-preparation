/**
 * Students-Preparation Event-Driven Message Streaming & Partitioning Lab
 * 100% Deterministic Local Compute | Zero External AI Billing ($0.00 Spend)
 * Content Policy Compliant: Generic, Vendor-Neutral Streaming Architectures
 */

export type PartitioningStrategy =
  | 'KEY_HASH'
  | 'ROUND_ROBIN'
  | 'CUSTOM_RANGE'
  | 'BROADCAST_ALL';

export type DeliverySemantics =
  | 'AT_LEAST_ONCE'
  | 'AT_MOST_ONCE'
  | 'EXACTLY_ONCE';

export type RebalanceProtocol =
  | 'EAGER_STOP_THE_WORLD'
  | 'COOPERATIVE_STICKY';

export type AckMode =
  | 'ALL_IN_SYNC_REPLICAS'
  | 'LEADER_ONLY_ACK'
  | 'NO_ACK_FIRE_FORGET';

export type StreamGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface TrafficProfile {
  mps: number; // Messages per second
  avgPayloadBytes: number;
  keyCardinality: number;
  burstMultiplier: number;
  hasPoisonPill?: boolean;
}

export interface StreamSimulationConfig {
  scenarioId: string;
  partitionCount: number;
  consumerCount: number;
  partitioningStrategy: PartitioningStrategy;
  deliverySemantics: DeliverySemantics;
  rebalanceProtocol: RebalanceProtocol;
  ackMode: AckMode;
  consumerBatchSize: number;
  consumerProcessingTimeMs: number;
  hasDeadLetterQueue: boolean;
  retryAttempts: number;
  trafficMps: number;
}

export interface StreamSimulationScenario {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  targetLagThreshold: number;
  description: string;
  trafficProfile: TrafficProfile;
  antiPatternSummary: string;
  goldenConfig: StreamSimulationConfig;
  goldenExplanation: string;
  socraticHints: string[];
}

export interface PartitionMetric {
  partitionId: number;
  assignedConsumerId: number | null;
  messageSharePercent: number;
  lagCount: number;
  isHotspot: boolean;
}

export interface StreamSimulationResult {
  scenarioId: string;
  throughputMps: number;
  avgProcessingLatencyMs: number;
  p99LatencyMs: number;
  maxConsumerLag: number;
  duplicateRatePercent: number;
  dataLossCount: number;
  poisonPillHandled: boolean;
  dlqMessageCount: number;
  rebalanceDowntimeMs: number;
  partitionMetrics: PartitionMetric[];
  score: number;
  grade: StreamGrade;
  feedback: string;
  earnedBadges: string[];
  simulatedAt: string;
}

export interface SavedStreamLabRecord {
  scenarioId: string;
  lastRunAt: string;
  config: StreamSimulationConfig;
  result: StreamSimulationResult;
}

export const STREAM_LAB_STORAGE_KEY = 'sp_stream_lab_v1';

export const STREAM_SCENARIOS: StreamSimulationScenario[] = [
  {
    id: 'payment-webhook-ingestion',
    title: 'E-Commerce Payment Gateway Webhook Pipeline',
    domain: 'Fintech & Payment Orchestration',
    difficulty: 'Expert',
    targetLagThreshold: 800,
    description:
      'A payment processing service ingests 10,000 asynchronous payment status webhooks per second. Financial accuracy mandates zero double-processing (double credit/debit) and strict FIFO sequence per transaction order ID.',
    trafficProfile: {
      mps: 10000,
      avgPayloadBytes: 1536,
      keyCardinality: 10000,
      burstMultiplier: 1.5,
    },
    antiPatternSummary:
      'At-Least-Once delivery semantics with Round-Robin partitioning and no deduplication key. Network retries cause duplicate payment captures and out-of-order execution, charging customer cards twice.',
    goldenConfig: {
      scenarioId: 'payment-webhook-ingestion',
      partitionCount: 12,
      consumerCount: 12,
      partitioningStrategy: 'KEY_HASH',
      deliverySemantics: 'EXACTLY_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'ALL_IN_SYNC_REPLICAS',
      consumerBatchSize: 50,
      consumerProcessingTimeMs: 4,
      hasDeadLetterQueue: true,
      retryAttempts: 3,
      trafficMps: 10000,
    },
    goldenExplanation:
      'Key-Hash partitioning on order ID routes all events for a specific order to the exact same partition, guaranteeing chronological processing. Exactly-Once delivery with transactional producer idempotency eliminates duplicate captures, and All-In-Sync Replicas ACK guarantees zero data loss on node failure.',
    socraticHints: [
      'If two webhook events for the same order (AUTH_INITIATED, AUTH_CAPTURED) are sent to different partitions, can they be processed out of order?',
      'How does Key-Hash partitioning preserve event order for a single entity?',
      'What happens when a network timeout causes the payment gateway to retry sending a webhook? How does Exactly-Once idempotency prevent double billing?',
      'Why is All-In-Sync Replicas ACK essential for ledger financial compliance?',
    ],
  },
  {
    id: 'clickstream-analytics-burst',
    title: 'Real-Time User Clickstream & Interaction Telemetry',
    domain: 'High-Throughput Analytics & Product Telemetry',
    difficulty: 'Intermediate',
    targetLagThreshold: 1000,
    description:
      'A user interaction platform streams 50,000 click events per second during marketing campaigns. Inadequate log partitioning starves downstream consumers while consumer lag rapidly builds up into an multi-million message backlog.',
    trafficProfile: {
      mps: 50000,
      avgPayloadBytes: 512,
      keyCardinality: 50000,
      burstMultiplier: 2.2,
    },
    antiPatternSummary:
      'Only 2 partitions configured for a cluster of 12 consumer workers. 10 consumers sit completely idle because in a consumer group, a partition can only be read by at most one consumer. Consumer lag explodes to 150,000 messages.',
    goldenConfig: {
      scenarioId: 'clickstream-analytics-burst',
      partitionCount: 16,
      consumerCount: 16,
      partitioningStrategy: 'ROUND_ROBIN',
      deliverySemantics: 'AT_LEAST_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'LEADER_ONLY_ACK',
      consumerBatchSize: 200,
      consumerProcessingTimeMs: 2,
      hasDeadLetterQueue: true,
      retryAttempts: 2,
      trafficMps: 50000,
    },
    goldenExplanation:
      'Scaling the log to 16 partitions allows all 16 consumer workers to process messages in parallel. Round-Robin partitioning distributes click events evenly across all partitions with 0% key skew, and micro-batching (200 msgs/batch) easily clears 50,000 MPS with sub-second consumer lag.',
    socraticHints: [
      'Remember the core distributed log rule: In a single consumer group, how many consumers can simultaneously read from a single partition?',
      'If you have 12 consumers and only 2 partitions, how many consumers are actively working and how many are idle?',
      'Since individual click events do not require strict ordering, which partitioning strategy provides the smoothest load balance?',
      'How does micro-batching reduce per-message I/O overhead on consumers?',
    ],
  },
  {
    id: 'order-fulfillment-saga',
    title: 'Distributed Order Fulfillment Saga & Poison Pill Defense',
    domain: 'Supply Chain & Distributed Transactions',
    difficulty: 'Advanced',
    targetLagThreshold: 400,
    description:
      'An e-commerce order fulfillment pipeline coordinates inventory reservation, packing, and shipment dispatch across microservices. A corrupted malformed message enters the stream, crashing consumer pods in an infinite retry loop.',
    trafficProfile: {
      mps: 5000,
      avgPayloadBytes: 2048,
      keyCardinality: 5000,
      burstMultiplier: 1.3,
      hasPoisonPill: true,
    },
    antiPatternSummary:
      'No Dead-Letter Queue (DLQ) and infinite retry loop. When a corrupted poison-pill message arrives, the consumer worker crashes, restarts, reads the exact same message again, and crashes repeatedly (Head-of-Line blocking), halting all order processing.',
    goldenConfig: {
      scenarioId: 'order-fulfillment-saga',
      partitionCount: 8,
      consumerCount: 8,
      partitioningStrategy: 'KEY_HASH',
      deliverySemantics: 'AT_LEAST_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'ALL_IN_SYNC_REPLICAS',
      consumerBatchSize: 20,
      consumerProcessingTimeMs: 3,
      hasDeadLetterQueue: true,
      retryAttempts: 3,
      trafficMps: 5000,
    },
    goldenExplanation:
      'Configuring a Dead-Letter Queue (DLQ) with a bounded retry policy (3 attempts with exponential backoff) allows the consumer to quarantine corrupted poison-pill messages into an isolated DLQ topic. Once quarantined, the partition offset advances cleanly and normal order processing resumes without blocking.',
    socraticHints: [
      'What happens to a partition if a message causes a JSON parse syntax error or unhandled runtime exception in consumer code?',
      'Why does restarting the consumer worker fail to solve a deterministic poison pill?',
      'How does a Dead-Letter Queue (DLQ) isolate corrupted messages and protect healthy traffic?',
      'What retry policy should be configured before routing a failed message to the DLQ?',
    ],
  },
  {
    id: 'user-notification-fanout',
    title: 'Multi-Channel Push Notification Fan-Out',
    domain: 'Messaging & User Communications',
    difficulty: 'Intermediate',
    targetLagThreshold: 800,
    description:
      'A notification engine dispatches 15,000 notifications per second across SMS, Email, and Mobile Push. Consumer autoscaling events trigger frequent consumer group rebalances that stall message consumption for seconds at a time.',
    trafficProfile: {
      mps: 15000,
      avgPayloadBytes: 1024,
      keyCardinality: 15000,
      burstMultiplier: 1.8,
    },
    antiPatternSummary:
      'Eager (Stop-The-World) rebalance protocol. Whenever an autoscaled consumer joins or leaves the group, all active consumers revoke all their partitions and stop consuming for 2,800ms while waiting for group synchronization, producing massive lag spikes.',
    goldenConfig: {
      scenarioId: 'user-notification-fanout',
      partitionCount: 12,
      consumerCount: 12,
      partitioningStrategy: 'KEY_HASH',
      deliverySemantics: 'AT_LEAST_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'LEADER_ONLY_ACK',
      consumerBatchSize: 50,
      consumerProcessingTimeMs: 2,
      hasDeadLetterQueue: true,
      retryAttempts: 2,
      trafficMps: 15000,
    },
    goldenExplanation:
      'The Cooperative Sticky rebalance protocol allows healthy consumers to continue processing their assigned partitions uninterrupted during scaling events. Only the specific partitions being migrated to the new consumer are reassigned, dropping rebalance downtime from 2,800ms down to ~45ms.',
    socraticHints: [
      'In the legacy Eager Rebalance protocol, what happens to ongoing consumers when a single new worker joins the group?',
      'How does the Cooperative Sticky Rebalance protocol avoid a global stop-the-world pause?',
      'Why is Key-Hash on user ID beneficial for notification aggregation and rate limiting?',
      'Compare Leader-Only ACK vs All-In-Sync Replicas for non-financial notification delivery.',
    ],
  },
  {
    id: 'stock-trade-audit-trail',
    title: 'Financial Exchange Order Book & Trade Audit Log',
    domain: 'High-Frequency Trading & Market Infrastructure',
    difficulty: 'Expert',
    targetLagThreshold: 300,
    description:
      'A stock trading matching engine streams 30,000 trade execution events per second. Regulators require an immutable, strictly ordered audit log per trading account with sub-millisecond lag and zero out-of-order execution.',
    trafficProfile: {
      mps: 30000,
      avgPayloadBytes: 768,
      keyCardinality: 5000,
      burstMultiplier: 1.4,
    },
    antiPatternSummary:
      'Round-Robin partitioning on trade orders coupled with Leader-Only ACK. Round-Robin causes BUY and CANCEL actions for the same account to land on different partitions, executing them out of order. Leader-Only ACK risks data loss on broker crash.',
    goldenConfig: {
      scenarioId: 'stock-trade-audit-trail',
      partitionCount: 16,
      consumerCount: 16,
      partitioningStrategy: 'KEY_HASH',
      deliverySemantics: 'EXACTLY_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'ALL_IN_SYNC_REPLICAS',
      consumerBatchSize: 100,
      consumerProcessingTimeMs: 2,
      hasDeadLetterQueue: true,
      retryAttempts: 3,
      trafficMps: 30000,
    },
    goldenExplanation:
      'Key-Hash on account ID guarantees all transactions for any account are placed in the exact same partition in strict chronological order. Exactly-Once processing semantics with All-In-Sync Replicas ACK guarantees no trades are lost or double-counted during broker failover.',
    socraticHints: [
      'If Account A places a BUY order and immediately sends a CANCEL order, what happens if Round-Robin assigns them to different partitions processed at different speeds?',
      'Which partition key guarantees FIFO order for Account A?',
      'Why must a trade audit ledger enforce Exactly-Once semantics rather than At-Least-Once?',
      'What is the durability difference between Leader-Only ACK and All-In-Sync Replicas ACK?',
    ],
  },
  {
    id: 'iot-sensor-telemetry-fleet',
    title: 'Connected Vehicle Fleet Telemetry & Partition Skew',
    domain: 'Automotive IoT & Telematics',
    difficulty: 'Advanced',
    targetLagThreshold: 800,
    description:
      'A connected vehicle fleet streams 40,000 telemetry packets per second from 50,000 vehicles. Extreme key skew causes a single partition to receive 70% of all traffic, causing massive consumer lag on one worker while others sit idle.',
    trafficProfile: {
      mps: 40000,
      avgPayloadBytes: 1024,
      keyCardinality: 50000,
      burstMultiplier: 1.6,
    },
    antiPatternSummary:
      'Partitioning by coarse fleet region code (e.g. "REGION_NORTH") where 75% of vehicles operate in one region. Partition #0 receives 30,000 msgs/sec while partitions #1-7 receive only 1,400 msgs/sec, bottlenecking Consumer #0.',
    goldenConfig: {
      scenarioId: 'iot-sensor-telemetry-fleet',
      partitionCount: 16,
      consumerCount: 16,
      partitioningStrategy: 'ROUND_ROBIN',
      deliverySemantics: 'AT_LEAST_ONCE',
      rebalanceProtocol: 'COOPERATIVE_STICKY',
      ackMode: 'LEADER_ONLY_ACK',
      consumerBatchSize: 150,
      consumerProcessingTimeMs: 2,
      hasDeadLetterQueue: true,
      retryAttempts: 2,
      trafficMps: 40000,
    },
    goldenExplanation:
      'Switching from a coarse region key to Round-Robin or fine-grained vehicle ID hashing perfectly balances traffic across all 16 partitions. Each partition receives an equal 2,500 msgs/sec, eliminating consumer hotspot lag completely.',
    socraticHints: [
      'What is Key Skew in distributed stream processing?',
      'If 75% of events share the same partition key, how many partitions will receive that 75% of traffic under Key-Hash?',
      'How does switching to Round-Robin or fine-grained device hashing eliminate partition hotspots?',
      'Why should partition keys have high cardinality and uniform distribution?',
    ],
  },
];

/**
 * Deterministic Simulation Engine for Message Streaming & Partitioning
 */
export function simulateStreamExperiment(
  scenario: StreamSimulationScenario,
  config: StreamSimulationConfig
): StreamSimulationResult {
  const { trafficProfile } = scenario;
  const mps = config.trafficMps || trafficProfile.mps;
  const burstMps = mps * trafficProfile.burstMultiplier;

  // 1. Evaluate Partition Distribution & Hotspots
  const partitions: PartitionMetric[] = [];
  const numPartitions = Math.max(1, config.partitionCount);
  const numConsumers = Math.max(1, config.consumerCount);

  // Key skew factor
  const isSkewedScenario = scenario.id === 'iot-sensor-telemetry-fleet' && config.partitioningStrategy === 'KEY_HASH';
  let totalLag = 0;

  for (let i = 0; i < numPartitions; i++) {
    // Consumer assignment (1 consumer per partition max in consumer group)
    const assignedConsumerId = i < numConsumers ? i % numConsumers : null;

    let sharePercent = 100 / numPartitions;
    let isHotspot = false;

    if (isSkewedScenario) {
      if (i === 0) {
        sharePercent = 70.0;
        isHotspot = true;
      } else {
        sharePercent = 30.0 / (numPartitions - 1);
      }
    }

    // Partition processing capacity
    const consumerActive = assignedConsumerId !== null;
    const consumerCapacity = consumerActive
      ? (1000 / config.consumerProcessingTimeMs) * config.consumerBatchSize
      : 0;

    const partitionTrafficMps = (burstMps * sharePercent) / 100;
    const partitionLag = consumerCapacity >= partitionTrafficMps
      ? Math.round(partitionTrafficMps * 0.02)
      : Math.round((partitionTrafficMps - consumerCapacity) * 2.5);

    totalLag += partitionLag;

    partitions.push({
      partitionId: i,
      assignedConsumerId,
      messageSharePercent: Number(sharePercent.toFixed(1)),
      lagCount: partitionLag,
      isHotspot,
    });
  }

  // 2. Idle Consumers Penalty (Consumers > Partitions)
  const idleConsumers = Math.max(0, numConsumers - numPartitions);

  // 3. Rebalance Downtime Evaluation
  let rebalanceDowntimeMs = 45; // Cooperative Sticky baseline
  if (config.rebalanceProtocol === 'EAGER_STOP_THE_WORLD') {
    rebalanceDowntimeMs = 2800; // Stop-the-world stall
    totalLag += Math.round((mps * rebalanceDowntimeMs) / 1000);
  }

  // 4. Poison Pill Evaluation
  let poisonPillHandled = true;
  let dlqMessageCount = 0;
  if (trafficProfile.hasPoisonPill) {
    if (config.hasDeadLetterQueue) {
      poisonPillHandled = true;
      dlqMessageCount = 12; // Quarantined corrupted messages
    } else {
      poisonPillHandled = false;
      totalLag += 8500; // Head-of-line blocking on partition
    }
  }

  // 5. Delivery Semantics & Data Loss / Duplication
  let duplicateRatePercent = 0.0;
  let dataLossCount = 0;

  if (config.deliverySemantics === 'AT_LEAST_ONCE') {
    duplicateRatePercent = config.retryAttempts > 0 ? 3.2 : 0.4;
  } else if (config.deliverySemantics === 'AT_MOST_ONCE') {
    duplicateRatePercent = 0.0;
    dataLossCount = Math.round(mps * 0.025); // 2.5% message drop on transient faults
  } else {
    // EXACTLY_ONCE
    duplicateRatePercent = 0.0;
    dataLossCount = 0;
  }

  // 6. Latency Calculation
  let ackOverheadMs = 1.0;
  if (config.ackMode === 'ALL_IN_SYNC_REPLICAS') {
    ackOverheadMs = 4.5;
  } else if (config.ackMode === 'NO_ACK_FIRE_FORGET') {
    ackOverheadMs = 0.2;
  }

  const baseProcessingLatencyMs = config.consumerProcessingTimeMs + ackOverheadMs;
  const lagPenaltyMs = (totalLag / numPartitions) * 0.015;
  const avgProcessingLatencyMs = Number((baseProcessingLatencyMs + lagPenaltyMs).toFixed(2));
  const p99LatencyMs = Number(
    (avgProcessingLatencyMs * (config.rebalanceProtocol === 'EAGER_STOP_THE_WORLD' ? 4.2 : 2.1)).toFixed(2)
  );

  const throughputMps = Math.min(
    mps,
    Math.round((numConsumers * (1000 / config.consumerProcessingTimeMs) * config.consumerBatchSize) / 2)
  );

  // 7. Scoring & Grading
  let score = 55;

  // Lag threshold check (up to 25 pts)
  if (totalLag <= scenario.targetLagThreshold) {
    score += 25;
  } else if (totalLag <= scenario.targetLagThreshold * 2) {
    score += 10;
  } else {
    score -= 15;
  }

  // Rebalance protocol (up to 15 pts)
  if (config.rebalanceProtocol === 'COOPERATIVE_STICKY') {
    score += 15;
  } else {
    score -= 10;
  }

  // Poison pill resilience (up to 15 pts)
  if (poisonPillHandled) {
    score += 15;
  } else {
    score -= 30; // Critical failure if pipeline halts
  }

  // Ordering & Data Loss (up to 20 pts)
  if (dataLossCount === 0 && duplicateRatePercent === 0) {
    score += 20;
  } else if (dataLossCount === 0) {
    score += 10;
  } else {
    score -= 20;
  }

  // Skew & Idle workers check
  if (isSkewedScenario) {
    score -= 20;
  }
  if (idleConsumers > 0) {
    score -= 5;
  }

  const boundedScore = Math.min(100, Math.max(10, Math.round(score)));

  let grade: StreamGrade = 'F';
  if (boundedScore >= 90) grade = 'S';
  else if (boundedScore >= 80) grade = 'A';
  else if (boundedScore >= 70) grade = 'B';
  else if (boundedScore >= 55) grade = 'C';

  // 8. Earned Badges
  const earnedBadges: string[] = [];
  if (grade === 'S' || grade === 'A') {
    earnedBadges.push('STREAM_ARCHITECT');
  }
  if (totalLag <= scenario.targetLagThreshold) {
    earnedBadges.push('LAG_CRUSHER');
  }
  if (config.deliverySemantics === 'EXACTLY_ONCE' && duplicateRatePercent === 0) {
    earnedBadges.push('EXACTLY_ONCE_MASTER');
  }
  if (poisonPillHandled && config.hasDeadLetterQueue) {
    earnedBadges.push('DLQ_DEFENDER');
  }
  if (!isSkewedScenario && numPartitions >= 8) {
    earnedBadges.push('SKEW_ELIMINATOR');
  }

  // 9. Diagnostic Feedback
  let feedback = '';
  if (grade === 'S') {
    feedback = `Flawless streaming architecture! Maintained ${throughputMps.toLocaleString()} MPS throughput with low consumer lag (${totalLag} msgs), zero data loss, zero duplicate captures, and seamless cooperative sticky rebalancing.`;
  } else if (grade === 'A') {
    feedback = `Solid production pipeline. Handled ${throughputMps.toLocaleString()} MPS cleanly. Fine-tune partitioning keys or batch sizes to further compress consumer lag and P99 latency.`;
  } else if (grade === 'B') {
    feedback = `Acceptable throughput, but moderate lag (${totalLag} msgs) or rebalance downtime (${rebalanceDowntimeMs} ms) introduces queue backlog under peak traffic bursts.`;
  } else if (grade === 'C') {
    feedback = `Underperforming streaming topology. Bottlenecked by key skew, inadequate partition concurrency, or eager rebalance pauses.`;
  } else {
    feedback = !poisonPillHandled
      ? `Critical Outage: Poison pill message crashed consumer worker without a Dead-Letter Queue (DLQ). Partition offset was blocked, stalling the entire pipeline.`
      : `Critical Bottleneck: Consumer lag exploded to ${totalLag.toLocaleString()} messages due to partition starvation (${numPartitions} partitions for ${numConsumers} consumers).`;
  }

  return {
    scenarioId: scenario.id,
    throughputMps,
    avgProcessingLatencyMs,
    p99LatencyMs,
    maxConsumerLag: totalLag,
    duplicateRatePercent,
    dataLossCount,
    poisonPillHandled,
    dlqMessageCount,
    rebalanceDowntimeMs,
    partitionMetrics: partitions,
    score: boundedScore,
    grade,
    feedback,
    earnedBadges,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Generate Clean Markdown Audit Report for Streaming Lab
 */
export function generateStreamLabMarkdown(
  scenario: StreamSimulationScenario,
  config: StreamSimulationConfig,
  result: StreamSimulationResult
): string {
  return `# Event-Driven Message Streaming & Partitioning Report
**Scenario**: ${scenario.title}  
**Domain**: ${scenario.domain}  
**Target Lag**: $\\le$ ${scenario.targetLagThreshold} msgs | **Simulated At**: ${new Date(result.simulatedAt).toLocaleString()}  
**Composite Score**: ${result.score}/100 (**Grade ${result.grade}**)

---

## 1. Executive Summary
${result.feedback}

- **Earned Badges**: ${result.earnedBadges.length > 0 ? result.earnedBadges.join(', ') : 'None'}

---

## 2. Configuration Parameters
| Parameter | Tested Value | Golden Reference |
|---|---|---|
| **Partition Count** | ${config.partitionCount} partitions | ${scenario.goldenConfig.partitionCount} partitions |
| **Consumer Count** | ${config.consumerCount} consumers | ${scenario.goldenConfig.consumerCount} consumers |
| **Partitioning Strategy** | \`${config.partitioningStrategy}\` | \`${scenario.goldenConfig.partitioningStrategy}\` |
| **Delivery Semantics** | \`${config.deliverySemantics}\` | \`${scenario.goldenConfig.deliverySemantics}\` |
| **Rebalance Protocol** | \`${config.rebalanceProtocol}\` | \`${scenario.goldenConfig.rebalanceProtocol}\` |
| **ACK Mode** | \`${config.ackMode}\` | \`${scenario.goldenConfig.ackMode}\` |
| **Dead-Letter Queue (DLQ)** | ${config.hasDeadLetterQueue ? 'Enabled' : 'Disabled'} | ${scenario.goldenConfig.hasDeadLetterQueue ? 'Enabled' : 'Disabled'} |
| **Batch Size** | ${config.consumerBatchSize} msgs/batch | ${scenario.goldenConfig.consumerBatchSize} msgs/batch |
| **Traffic Load** | ${config.trafficMps.toLocaleString()} MPS | ${scenario.goldenConfig.trafficMps.toLocaleString()} MPS |

---

## 3. Performance & Consumer Lag Telemetry
| Metric | Benchmark Result | Health Status |
|---|---|---|
| **Pipeline Throughput** | **${result.throughputMps.toLocaleString()} MPS** | Optimal |
| **Consumer Group Lag** | **${result.maxConsumerLag.toLocaleString()} messages** | ${result.maxConsumerLag <= scenario.targetLagThreshold ? 'Below Threshold' : 'Backlog Alert'} |
| **Average Latency** | **${result.avgProcessingLatencyMs} ms** | Optimal |
| **P99 Tail Latency** | **${result.p99LatencyMs} ms** | ${result.rebalanceDowntimeMs > 1000 ? 'Rebalance Stalled' : 'Smooth'} |
| **Duplicate Message Rate** | **${result.duplicateRatePercent}%** | ${result.duplicateRatePercent === 0 ? 'Zero Duplication' : 'Retried'} |
| **Data Loss Count** | **${result.dataLossCount} messages** | ${result.dataLossCount === 0 ? 'Zero Loss' : 'Uncommitted Loss'} |
| **Poison Pill Quarantined** | **${result.poisonPillHandled ? 'Handled (DLQ)' : 'FAILED (Stalled)'}** | ${result.poisonPillHandled ? 'Safe' : 'Critical Hazard'} |
| **Rebalance Downtime** | **${result.rebalanceDowntimeMs} ms** | ${result.rebalanceDowntimeMs < 100 ? 'Cooperative' : 'Stop-The-World'} |

---

## 4. Golden Architectural Blueprint
${scenario.goldenExplanation}

*Report generated by Students-Preparation Platform Event Streaming Lab ($0.00 Cloud/AI spend).*
`;
}

/**
 * Clean Vector PDF 1.4 Exporter for Stream Lab Benchmark
 */
export function buildStreamLabPdfString(
  scenario: StreamSimulationScenario,
  config: StreamSimulationConfig,
  result: StreamSimulationResult
): string {
  const sanitize = (text: string) => text.replace(/[()\\]/g, ' ');

  const scenarioTitle = sanitize(scenario.title);
  const scenarioDomain = sanitize(scenario.domain);
  const feedbackText = sanitize(result.feedback);
  const dateStr = sanitize(new Date(result.simulatedAt).toLocaleDateString());

  const streamLines: string[] = [
    'BT',
    // Header Banner
    '/F1 18 Tf',
    '40 790 Td',
    '(Event-Driven Message Streaming Architecture Report) Tj',
    '/F2 9 Tf',
    '0 -16 Td',
    '(Students-Preparation Platform | High-Throughput Stream Systems Studio) Tj',
    '0 -14 Td',
    `(${dateStr} | Zero-AI Local Compute Benchmark | Target Lag: <= ${scenario.targetLagThreshold} msgs) Tj`,

    // Scenario Box
    '/F1 12 Tf',
    '0 -32 Td',
    `(${scenarioTitle}) Tj`,
    '/F2 9 Tf',
    '0 -14 Td',
    `(Domain: ${scenarioDomain}) Tj`,

    // Score & Grade
    '/F1 14 Tf',
    '0 -28 Td',
    `(Performance Grade: ${result.grade}  |  Composite Score: ${result.score} / 100) Tj`,
    '/F2 9 Tf',
    '0 -16 Td',
    `(${feedbackText}) Tj`,

    // Benchmark Metrics Table
    '/F1 11 Tf',
    '0 -30 Td',
    '(Simulated Stream Telemetry Metrics:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(- Throughput: ${result.throughputMps} MPS  |  Consumer Lag: ${result.maxConsumerLag} messages) Tj`,
    '0 -13 Td',
    `(- Average Latency: ${result.avgProcessingLatencyMs} ms  |  P99 Tail Latency: ${result.p99LatencyMs} ms) Tj`,
    '0 -13 Td',
    `(- Duplicate Message Rate: ${result.duplicateRatePercent}%  |  Data Loss: ${result.dataLossCount} msgs) Tj`,
    '0 -13 Td',
    `(- Poison Pill Status: ${result.poisonPillHandled ? 'Handled (DLQ)' : 'FAILED (Stalled)'}  |  DLQ Messages: ${result.dlqMessageCount}) Tj`,
    '0 -13 Td',
    `(- Rebalance Protocol: ${config.rebalanceProtocol}  |  Rebalance Pause: ${result.rebalanceDowntimeMs} ms) Tj`,

    // Configuration
    '/F1 11 Tf',
    '0 -26 Td',
    '(Configured Pipeline Architecture:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(- Partitions: ${config.partitionCount}  |  Consumers: ${config.consumerCount}  |  Strategy: ${config.partitioningStrategy}) Tj`,
    '0 -13 Td',
    `(- Delivery Semantics: ${config.deliverySemantics}  |  ACK Mode: ${config.ackMode}) Tj`,
    '0 -13 Td',
    `(- Dead-Letter Queue: ${config.hasDeadLetterQueue ? 'Enabled' : 'Disabled'}  |  Retries: ${config.retryAttempts}  |  Batch: ${config.consumerBatchSize}) Tj`,

    // Badges & Reference
    '/F1 11 Tf',
    '0 -26 Td',
    '(Earned Competency Badges:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(${result.earnedBadges.length > 0 ? result.earnedBadges.join(', ') : 'None'}) Tj`,

    // Footer
    '/F2 8 Tf',
    '0 -45 Td',
    '(End of Report | Students-Preparation Engineering Assessment) Tj',
    'ET',
  ];

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
    const objOffset = offset;
    xref += String(objOffset).padStart(10, '0') + ' 00000 n \n';
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

export function exportStreamLabPdf(
  scenario: StreamSimulationScenario,
  config: StreamSimulationConfig,
  result: StreamSimulationResult
): void {
  const pdfString = buildStreamLabPdfString(scenario, config, result);
  const filename = `stream-lab-${scenario.id}-report.pdf`;
  downloadFile(filename, pdfString, 'application/pdf');
}

/**
 * LocalStorage Helpers
 */
export function saveStreamLabRecord(record: SavedStreamLabRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedStreamLabRecords();
    const filtered = existing.filter((r) => r.scenarioId !== record.scenarioId);
    filtered.push(record);
    localStorage.setItem(STREAM_LAB_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Gracefully ignore quota issues
  }
}

export function loadSavedStreamLabRecords(): SavedStreamLabRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STREAM_LAB_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedStreamLabRecord[];
  } catch {
    return [];
  }
}
