/**
 * Students-Preparation Distributed Caching & Cache Invalidation Lab
 * 100% Deterministic Local Compute | Zero External AI Billing ($0.00 Spend)
 * Content Policy Compliant: Generic, Vendor-Neutral Distributed Architectures
 */

export type CacheTopology =
  | 'LOCAL_IN_MEMORY'
  | 'DISTRIBUTED_CLUSTERED'
  | 'MULTI_TIER_TWO_LEVEL'
  | 'EDGE_CDN';

export type CacheReadStrategy =
  | 'CACHE_ASIDE'
  | 'READ_THROUGH'
  | 'REFRESH_AHEAD';

export type CacheWriteStrategy =
  | 'WRITE_THROUGH'
  | 'WRITE_BEHIND'
  | 'WRITE_AROUND';

export type EvictionPolicy =
  | 'LRU'
  | 'LFU'
  | 'FIFO'
  | 'RANDOM';

export type StampedeProtection =
  | 'NONE'
  | 'MUTEX_LOCK'
  | 'PROBABILISTIC_XFETCH'
  | 'STALE_WHILE_REVALIDATE';

export type CacheGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface TrafficPattern {
  rps: number;
  readRatio: number; // e.g. 0.95
  writeRatio: number; // e.g. 0.05
  keyCardinality: number; // Total distinct items in database
  avgItemSizeBytes: number; // Size of each payload
}

export interface CacheSimulationConfig {
  scenarioId: string;
  topology: CacheTopology;
  readStrategy: CacheReadStrategy;
  writeStrategy: CacheWriteStrategy;
  evictionPolicy: EvictionPolicy;
  stampedeProtection: StampedeProtection;
  memoryLimitMb: number;
  baseTtlSeconds: number;
  jitterPercent: number;
  trafficRps: number;
}

export interface CacheSimulationScenario {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  targetSlaMs: number;
  description: string;
  trafficPattern: TrafficPattern;
  antiPatternSummary: string;
  goldenConfig: CacheSimulationConfig;
  goldenExplanation: string;
  socraticHints: string[];
}

export interface CacheSimulationResult {
  scenarioId: string;
  hitRatePercent: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  dbReadIops: number;
  dbWriteIops: number;
  dbLoadReductionPercent: number;
  stampedeSpikeCount: number;
  workingSetMb: number;
  memoryUsageMb: number;
  memoryUsagePercent: number;
  isOomViolated: boolean;
  dataFreshnessPercent: number;
  score: number;
  grade: CacheGrade;
  feedback: string;
  earnedBadges: string[];
  simulatedAt: string;
}

export interface SavedCacheLabRecord {
  scenarioId: string;
  lastRunAt: string;
  config: CacheSimulationConfig;
  result: CacheSimulationResult;
}

export const CACHE_LAB_STORAGE_KEY = 'sp_cache_lab_v1';

export const CACHE_SCENARIOS: CacheSimulationScenario[] = [
  {
    id: 'flash-sale-inventory',
    title: 'Flash-Sale High-Contention Inventory Counter',
    domain: 'E-Commerce & High-Frequency Checkout',
    difficulty: 'Expert',
    targetSlaMs: 2.5,
    description:
      'A high-concurrency flash sale introduces extreme read traffic (40,000 req/s) concentrated on only 50 hot catalog items. When inventory levels fluctuate, naive cache invalidation triggers catastrophic cache stampedes and database connection pool exhaustion.',
    trafficPattern: {
      rps: 40000,
      readRatio: 0.95,
      writeRatio: 0.05,
      keyCardinality: 50,
      avgItemSizeBytes: 1024,
    },
    antiPatternSummary:
      'Standard Cache-Aside with zero stampede protection and 0% jitter. When the 50 hot items expire simultaneously, 38,000 concurrent read requests bypass the cache and hammer the database directly (Thundering Herd), crashing database connection pools.',
    goldenConfig: {
      scenarioId: 'flash-sale-inventory',
      topology: 'DISTRIBUTED_CLUSTERED',
      readStrategy: 'CACHE_ASIDE',
      writeStrategy: 'WRITE_AROUND',
      evictionPolicy: 'LRU',
      stampedeProtection: 'MUTEX_LOCK',
      memoryLimitMb: 512,
      baseTtlSeconds: 30,
      jitterPercent: 25,
      trafficRps: 40000,
    },
    goldenExplanation:
      'Distributed Clustered Cache with Mutex / Single-Flight locking ensures that upon cache miss, exactly one request queries the database to repopulate the item counter while other requests await the mutex. 25% TTL Jitter desynchronizes key expirations, and Write-Around prevents write-amplification during active inventory locks.',
    socraticHints: [
      'Notice the key cardinality: with only 50 items under 40,000 RPS, every item receives 800 requests per second. What happens when one key expires?',
      'If 800 concurrent requests miss the cache in the same 10ms window, how many will run database queries if no concurrency lock is present?',
      'Consider Mutex Lock or Probabilistic XFetch to guarantee only one worker queries the database on key expiration.',
      'Add TTL Jitter to prevent all 50 items from expiring simultaneously.',
    ],
  },
  {
    id: 'user-session-store',
    title: 'Multi-Region User Session Token Store',
    domain: 'Authentication & Identity Infrastructure',
    difficulty: 'Intermediate',
    targetSlaMs: 1.5,
    description:
      'An authentication microservice verifies session tokens for 15,000 incoming requests per second across 500,000 active users. Memory budget is tightly constrained to 1,024 MB. Incorrect eviction or unbounded TTL causes out-of-memory crashes or premature user logouts.',
    trafficPattern: {
      rps: 15000,
      readRatio: 0.85,
      writeRatio: 0.15,
      keyCardinality: 500000,
      avgItemSizeBytes: 2048,
    },
    antiPatternSummary:
      'FIFO eviction policy with infinite TTL and 256MB memory cap. FIFO evicts actively browsing users simply because their session was created earlier in the day, causing forced session sign-outs. Low memory cap causes constant eviction thrashing.',
    goldenConfig: {
      scenarioId: 'user-session-store',
      topology: 'DISTRIBUTED_CLUSTERED',
      readStrategy: 'CACHE_ASIDE',
      writeStrategy: 'WRITE_THROUGH',
      evictionPolicy: 'LRU',
      stampedeProtection: 'STALE_WHILE_REVALIDATE',
      memoryLimitMb: 1536,
      baseTtlSeconds: 1800,
      jitterPercent: 15,
      trafficRps: 15000,
    },
    goldenExplanation:
      'Least Recently Used (LRU) eviction ensures active user sessions remain hot in RAM while dormant sessions are safely evicted. A 1,536 MB memory cap comfortably houses the 500k working set (~1,000 MB). Write-Through ensures session revoking and profile updates are immediately consistent across all instances.',
    socraticHints: [
      'Calculate the working set memory: 500,000 users * 2,048 bytes = ~1,024 MB. What happens if memory is limited to 256 MB?',
      'If an active user makes a request every 10 seconds, why does FIFO (First-In, First-Out) evict them even though they are actively engaged?',
      'Which eviction policy prioritizes recency of access over original insertion timestamp?',
      'Why is Write-Through critical for session revoking (e.g. password resets)?',
    ],
  },
  {
    id: 'high-volume-leaderboard',
    title: 'Real-Time Global Tournament Leaderboard',
    domain: 'Gaming Platforms & Live Contests',
    difficulty: 'Advanced',
    targetSlaMs: 2.0,
    description:
      'A global contest platform serves 25,000 RPS reading real-time tournament standings while 500 scores are updated per second. Read requests demand sub-2ms response times, but leaderboard aggregation queries take 120ms to execute in the database.',
    trafficPattern: {
      rps: 25000,
      readRatio: 0.98,
      writeRatio: 0.02,
      keyCardinality: 1000,
      avgItemSizeBytes: 8192,
    },
    antiPatternSummary:
      'Synchronous Write-Through on all score submissions coupled with a fixed 10-second TTL. The 120ms aggregation query runs synchronously on writes, stalling API threads, and the 10s TTL causes periodic 20,000-request thundering herds every 10 seconds.',
    goldenConfig: {
      scenarioId: 'high-volume-leaderboard',
      topology: 'MULTI_TIER_TWO_LEVEL',
      readStrategy: 'REFRESH_AHEAD',
      writeStrategy: 'WRITE_BEHIND',
      evictionPolicy: 'LRU',
      stampedeProtection: 'PROBABILISTIC_XFETCH',
      memoryLimitMb: 512,
      baseTtlSeconds: 60,
      jitterPercent: 20,
      trafficRps: 25000,
    },
    goldenExplanation:
      'Two-Level Cache (L1 local process memory + L2 distributed cluster) delivers sub-millisecond reads. Refresh-Ahead with XFetch Probabilistic Early Expiration proactively recomputes rankings in the background prior to TTL expiration, preventing read stall. Write-Behind batches score increments asynchronously to the database.',
    socraticHints: [
      'The leaderboard takes 120ms to calculate. If read traffic is 24,500 RPS, what happens if the cache expires completely before recomputation starts?',
      'What if a background worker or probabilistic trigger refreshed the leaderboard 2 seconds before it expired?',
      'How does Write-Behind (Write-Back) protect the database from 500 continuous individual write queries per second?',
      'Explore the XFetch Probabilistic Early Expiration algorithm: -beta * delta * ln(rand()).',
    ],
  },
  {
    id: 'feed-timeline-cache',
    title: 'Social Activity Timeline & Follower Feed',
    domain: 'Social Networks & Activity Feeds',
    difficulty: 'Advanced',
    targetSlaMs: 3.0,
    description:
      'A multi-tenant timeline feed service handles 12,000 requests per second across 100,000 users. Each timeline contains 50 post summaries (4 KB). Writes occur at 1,200 req/s as new posts are published to follower feeds.',
    trafficPattern: {
      rps: 12000,
      readRatio: 0.9,
      writeRatio: 0.1,
      keyCardinality: 100000,
      avgItemSizeBytes: 4096,
    },
    antiPatternSummary:
      'Direct Cache-Aside with Write-Through where every single post publish synchronously invalidates and rebuilds the timelines of 5,000 followers, triggering an avalanche of database joins and cache memory thrashing.',
    goldenConfig: {
      scenarioId: 'feed-timeline-cache',
      topology: 'MULTI_TIER_TWO_LEVEL',
      readStrategy: 'CACHE_ASIDE',
      writeStrategy: 'WRITE_AROUND',
      evictionPolicy: 'LRU',
      stampedeProtection: 'STALE_WHILE_REVALIDATE',
      memoryLimitMb: 1024,
      baseTtlSeconds: 300,
      jitterPercent: 20,
      trafficRps: 12000,
    },
    goldenExplanation:
      'Multi-Tier Two-Level topology keeps popular feeds in local service memory (L1) with distributed cluster backup (L2). Write-Around prevents fan-out write amplification on inactive followers. Stale-While-Revalidate serves the current timeline instantly while asynchronously merging new posts in the background.',
    socraticHints: [
      'If a user with 5,000 followers posts, should you synchronously update all 5,000 follower cache entries if 80% of them are offline?',
      'What is the benefit of Write-Around for fan-out architectures?',
      'How does Stale-While-Revalidate maintain a 3ms response time even when fresh content is arriving?',
      'Consider L1/L2 multi-tier caching to keep the most active feeds in local RAM.',
    ],
  },
  {
    id: 'api-gateway-edge-cache',
    title: 'Microservices Edge Gateway with Rate-Limited Upstream',
    domain: 'API Gateways & Partner Integrations',
    difficulty: 'Intermediate',
    targetSlaMs: 1.0,
    description:
      'An API gateway routes 8,000 RPS to a partner financial pricing API that enforces a strict rate limit of 100 calls per minute. Expiration synchronization causes simultaneous edge misses, tripping upstream rate limit 429 errors and service outages.',
    trafficPattern: {
      rps: 8000,
      readRatio: 0.99,
      writeRatio: 0.01,
      keyCardinality: 5000,
      avgItemSizeBytes: 16384,
    },
    antiPatternSummary:
      'Fixed 60-second TTL without jitter across all 5,000 pricing pairs. At the 60th second, all 5,000 keys expire simultaneously, causing thousands of gateway instances to flood the upstream provider with 8,000 requests, violating the 100 calls/min rate limit.',
    goldenConfig: {
      scenarioId: 'api-gateway-edge-cache',
      topology: 'EDGE_CDN',
      readStrategy: 'READ_THROUGH',
      writeStrategy: 'WRITE_AROUND',
      evictionPolicy: 'LRU',
      stampedeProtection: 'STALE_WHILE_REVALIDATE',
      memoryLimitMb: 512,
      baseTtlSeconds: 120,
      jitterPercent: 30,
      trafficRps: 8000,
    },
    goldenExplanation:
      'Edge CDN topology moves response caching close to clients. 30% TTL Jitter ensures key expiration timestamps are smoothly distributed over a 72-second window instead of collapsing onto a single second. Stale-While-Revalidate allows the edge to return slightly cached quotes while a single rate-controlled worker refreshes upstream.',
    socraticHints: [
      'Upstream only allows 100 requests per minute (~1.6 req/s). Your gateway receives 8,000 req/s. What cache hit rate is required?',
      'If all 5,000 keys have identical 60s TTLs, when do they all expire?',
      'How does adding 30% TTL Jitter (randomizing expiration between 84s and 156s) break the synchronization wave?',
      'What happens if you combine Jitter with Stale-While-Revalidate?',
    ],
  },
  {
    id: 'financial-exchange-rates',
    title: 'High-Frequency Foreign Exchange Quote Ticker',
    domain: 'Fintech & Trading Infrastructures',
    difficulty: 'Expert',
    targetSlaMs: 0.5,
    description:
      'A currency trading desk serves 30,000 quote checks per second for 200 currency pairs. Trading algorithms require sub-millisecond P99 latency and zero cache miss delays. Data stale tolerance is strictly capped at 5 seconds.',
    trafficPattern: {
      rps: 30000,
      readRatio: 0.995,
      writeRatio: 0.005,
      keyCardinality: 200,
      avgItemSizeBytes: 512,
    },
    antiPatternSummary:
      'Standard distributed Cache-Aside with 2-second TTL. Network latency to the remote cache cluster is 1.2ms, and every cache miss induces a 35ms database query. P99 latency is 38ms, violating the 0.5ms trading desk SLA.',
    goldenConfig: {
      scenarioId: 'financial-exchange-rates',
      topology: 'LOCAL_IN_MEMORY',
      readStrategy: 'REFRESH_AHEAD',
      writeStrategy: 'WRITE_THROUGH',
      evictionPolicy: 'LFU',
      stampedeProtection: 'PROBABILISTIC_XFETCH',
      memoryLimitMb: 256,
      baseTtlSeconds: 5,
      jitterPercent: 10,
      trafficRps: 30000,
    },
    goldenExplanation:
      'Local In-Memory Cache in the trading engine process space eliminates network roundtrips, delivering sub-0.05ms memory reads. Proactive Refresh-Ahead with XFetch background polling updates rates every 3 seconds before the 5-second TTL expires, guaranteeing 100% cache hits with zero miss latency.',
    socraticHints: [
      'Network roundtrip to a remote distributed cache takes 1.0 to 1.5ms. Can a remote cache ever satisfy a 0.5ms SLA?',
      'What topology keeps data directly in the application CPU process memory with 0ms network hop?',
      'Since key cardinality is tiny (200 pairs), how much memory is required for the entire dataset?',
      'Why is proactive Refresh-Ahead optimal when data stale SLA is strict and read traffic is extreme?',
    ],
  },
];

/**
 * Deterministic Simulation Engine for Distributed Caching & Invalidation
 */
export function simulateCacheExperiment(
  scenario: CacheSimulationScenario,
  config: CacheSimulationConfig
): CacheSimulationResult {
  const { trafficPattern } = scenario;
  const rps = config.trafficRps || trafficPattern.rps;
  const readRps = rps * trafficPattern.readRatio;
  const writeRps = rps * trafficPattern.writeRatio;

  // 1. Calculate Working Set & Memory Pressure
  const workingSetBytes = trafficPattern.keyCardinality * trafficPattern.avgItemSizeBytes;
  const workingSetMb = Number((workingSetBytes / (1024 * 1024)).toFixed(2));
  const memoryPressureRatio = workingSetMb / config.memoryLimitMb;
  const memoryUsageMb = Math.min(workingSetMb, config.memoryLimitMb);
  const memoryUsagePercent = Number(
    Math.min(100, memoryPressureRatio * 100).toFixed(1)
  );
  const isOomViolated = workingSetMb > config.memoryLimitMb * 1.5;

  // 2. Base Network Latency by Topology
  let baseNetworkLatencyMs = 1.2; // Distributed Clustered default
  if (config.topology === 'LOCAL_IN_MEMORY') {
    baseNetworkLatencyMs = 0.08;
  } else if (config.topology === 'MULTI_TIER_TWO_LEVEL') {
    // 85% L1 local hit (0.08ms) + 15% L2 cluster hit (1.2ms)
    baseNetworkLatencyMs = 0.35;
  } else if (config.topology === 'EDGE_CDN') {
    baseNetworkLatencyMs = 0.75;
  }

  // 3. Eviction Policy Impact on Hit Rate
  let evictionEfficiency = 1.0;
  if (memoryPressureRatio > 1.0) {
    // Memory constraint forces eviction
    const overage = memoryPressureRatio - 1.0;
    if (config.evictionPolicy === 'LRU') {
      evictionEfficiency = Math.max(0.65, 1.0 - overage * 0.25);
    } else if (config.evictionPolicy === 'LFU') {
      evictionEfficiency = Math.max(0.6, 1.0 - overage * 0.3);
    } else if (config.evictionPolicy === 'FIFO') {
      evictionEfficiency = Math.max(0.4, 1.0 - overage * 0.55);
    } else {
      // RANDOM
      evictionEfficiency = Math.max(0.25, 1.0 - overage * 0.75);
    }
  }

  // 4. Jitter and Stampede Analysis
  const jitterEffective = Math.min(1.0, config.jitterPercent / 20); // 20% jitter is ideal
  let stampedeSpikeCount = 0;
  let stampedeLatencyPenaltyMs = 0;

  if (config.stampedeProtection === 'NONE') {
    // High RPS and low jitter trigger massive thundering herds
    const thunderingMultiplier = rps > 10000 ? 1.0 : rps / 10000;
    const syncPenalty = 1.0 - jitterEffective * 0.7;
    stampedeSpikeCount = Math.round(
      (trafficPattern.keyCardinality < 100 ? 450 : 120) * thunderingMultiplier * syncPenalty
    );
    stampedeLatencyPenaltyMs = Math.min(65, (stampedeSpikeCount / 10) * 1.5);
  } else if (config.stampedeProtection === 'MUTEX_LOCK') {
    // Locks eliminate DB stampedes; small thread lock waiting time on miss
    stampedeSpikeCount = 0;
    stampedeLatencyPenaltyMs = 0.3;
  } else if (config.stampedeProtection === 'PROBABILISTIC_XFETCH') {
    // XFetch refreshes ahead of time; 0 stampede spikes and 0 lock waiting!
    stampedeSpikeCount = 0;
    stampedeLatencyPenaltyMs = 0.05;
  } else if (config.stampedeProtection === 'STALE_WHILE_REVALIDATE') {
    // Serves stale value immediately; 0 stampede spikes and 0 waiting
    stampedeSpikeCount = 0;
    stampedeLatencyPenaltyMs = 0.1;
  }

  // 5. Read Strategy Hit Rate Calculation
  let baseHitRate = 0.94;
  if (config.readStrategy === 'REFRESH_AHEAD') {
    baseHitRate = config.stampedeProtection === 'PROBABILISTIC_XFETCH' ? 0.995 : 0.98;
  } else if (config.readStrategy === 'READ_THROUGH') {
    baseHitRate = 0.96;
  } else {
    // CACHE_ASIDE
    baseHitRate = 0.94;
  }

  // TTL decay factor
  if (config.baseTtlSeconds < 10) {
    baseHitRate -= 0.08;
  } else if (config.baseTtlSeconds > 300) {
    baseHitRate += 0.02;
  }

  let finalHitRate = Math.min(0.999, Math.max(0.15, baseHitRate * evictionEfficiency));
  if (isOomViolated) {
    finalHitRate *= 0.5; // OOM causes crash/flush
  }

  const hitRatePercent = Number((finalHitRate * 100).toFixed(1));

  // 6. Database IOPS Evaluation
  const cacheMissRps = readRps * (1 - finalHitRate);
  let dbReadIops = Math.round(cacheMissRps);
  if (config.stampedeProtection === 'NONE' && stampedeSpikeCount > 0) {
    dbReadIops = Math.round(dbReadIops + (stampedeSpikeCount * 8));
  }

  let dbWriteIops = Math.round(writeRps);
  let writeLatencyMs = 2.0;
  let dataFreshnessPercent = 99.0;

  if (config.writeStrategy === 'WRITE_BEHIND') {
    // Batched asynchronous writes reduce DB IOPS by ~85%
    dbWriteIops = Math.max(1, Math.round(writeRps * 0.15));
    writeLatencyMs = 0.2;
    dataFreshnessPercent = 95.5; // Eventual consistency
  } else if (config.writeStrategy === 'WRITE_THROUGH') {
    dbWriteIops = Math.round(writeRps);
    writeLatencyMs = 18.0; // Synchronous DB write roundtrip
    dataFreshnessPercent = 99.9;
  } else {
    // WRITE_AROUND
    dbWriteIops = Math.round(writeRps);
    writeLatencyMs = 12.0;
    dataFreshnessPercent = 97.5;
  }

  const dbLoadReductionPercent = Number(
    Math.max(0, ((rps - (dbReadIops + dbWriteIops)) / rps) * 100).toFixed(1)
  );

  // 7. Latency Computation (P50 & P99)
  const dbQueryLatencyMs = 28.0;
  const avgReadLatencyMs =
    (finalHitRate * baseNetworkLatencyMs) +
    ((1 - finalHitRate) * (baseNetworkLatencyMs + dbQueryLatencyMs)) +
    stampedeLatencyPenaltyMs;

  const avgLatencyMs = Number(
    (avgReadLatencyMs * trafficPattern.readRatio + writeLatencyMs * trafficPattern.writeRatio).toFixed(2)
  );

  const p99Multiplier = stampedeSpikeCount > 0 ? 5.5 : 2.2;
  const p99LatencyMs = Number(
    Math.max(avgLatencyMs * 1.5, avgLatencyMs * p99Multiplier).toFixed(2)
  );

  // 8. Scoring & Grading
  let score = 50;

  // Hit rate contribution (up to 30 pts)
  score += (finalHitRate - 0.7) * 100;

  // Latency SLA contribution (up to 25 pts)
  if (avgLatencyMs <= scenario.targetSlaMs) {
    score += 25;
  } else if (avgLatencyMs <= scenario.targetSlaMs * 2) {
    score += 15;
  } else if (avgLatencyMs <= scenario.targetSlaMs * 4) {
    score += 5;
  } else {
    score -= 15;
  }

  // Stampede protection contribution (up to 20 pts)
  if (stampedeSpikeCount === 0) {
    score += 20;
  } else {
    score -= Math.min(25, stampedeSpikeCount / 10);
  }

  // Memory & OOM stability (up to 15 pts)
  if (isOomViolated) {
    score -= 30;
  } else if (memoryUsagePercent <= 90) {
    score += 15;
  } else {
    score += 5;
  }

  // DB Load reduction contribution (up to 10 pts)
  if (dbLoadReductionPercent >= 90) {
    score += 10;
  } else if (dbLoadReductionPercent >= 75) {
    score += 5;
  }

  const boundedScore = Math.min(100, Math.max(10, Math.round(score)));

  let grade: CacheGrade = 'F';
  if (boundedScore >= 90) grade = 'S';
  else if (boundedScore >= 80) grade = 'A';
  else if (boundedScore >= 70) grade = 'B';
  else if (boundedScore >= 55) grade = 'C';

  // 9. Earned Badges
  const earnedBadges: string[] = [];
  if (grade === 'S' || grade === 'A') {
    earnedBadges.push('CACHE_ARCHITECT');
  }
  if (stampedeSpikeCount === 0 && rps >= 15000) {
    earnedBadges.push('STAMPEDE_DEFENDER');
  }
  if (config.stampedeProtection === 'PROBABILISTIC_XFETCH' && hitRatePercent >= 98) {
    earnedBadges.push('XFETCH_MASTER');
  }
  if (avgLatencyMs < 1.0) {
    earnedBadges.push('SUB_MILLISECOND_LATENCY');
  }
  if (!isOomViolated && memoryUsagePercent >= 40 && memoryUsagePercent <= 90) {
    earnedBadges.push('MEMORY_OPTIMIZER');
  }

  // 10. Diagnostic Feedback
  let feedback = '';
  if (grade === 'S') {
    feedback = `Exceptional caching architecture! Attained a ${hitRatePercent}% cache hit rate, reduced DB pressure by ${dbLoadReductionPercent}%, and held average latency to ${avgLatencyMs} ms (P99: ${p99LatencyMs} ms) with zero stampede spikes.`;
  } else if (grade === 'A') {
    feedback = `Strong production-ready topology. Achieved ${hitRatePercent}% hit rate with ${dbLoadReductionPercent}% DB offload. Consider fine-tuning jitter or memory allocation to reach sub-millisecond latency.`;
  } else if (grade === 'B') {
    feedback = `Acceptable performance under moderate load, but latency (${avgLatencyMs} ms) or memory pressure (${memoryUsagePercent}%) indicates bottlenecks during traffic spikes.`;
  } else if (grade === 'C') {
    feedback = `Sub-optimal configuration. Unmitigated stampedes (${stampedeSpikeCount} spikes) or eviction thrashing (${config.evictionPolicy}) degraded overall throughput.`;
  } else {
    feedback = isOomViolated
      ? `Critical Failure: Memory limit exceeded (${memoryUsagePercent}%). Working set (${workingSetMb} MB) exhausted the ${config.memoryLimitMb} MB budget, causing cache eviction thrashing and process OOM.`
      : `Critical Bottleneck: Thundering herd spikes (${stampedeSpikeCount}) hammered the database with ${dbReadIops} read IOPS. Review stampede protection (Mutex Lock or XFetch) and add TTL jitter.`;
  }

  return {
    scenarioId: scenario.id,
    hitRatePercent,
    avgLatencyMs,
    p99LatencyMs,
    dbReadIops,
    dbWriteIops,
    dbLoadReductionPercent,
    stampedeSpikeCount,
    workingSetMb,
    memoryUsageMb,
    memoryUsagePercent,
    isOomViolated,
    dataFreshnessPercent,
    score: boundedScore,
    grade,
    feedback,
    earnedBadges,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Generate Clean Markdown Audit Report for Caching Simulation
 */
export function generateCacheLabMarkdown(
  scenario: CacheSimulationScenario,
  config: CacheSimulationConfig,
  result: CacheSimulationResult
): string {
  return `# Cache Architecture & Invalidation Benchmark Report
**Scenario**: ${scenario.title}  
**Domain**: ${scenario.domain}  
**Target SLA**: $\\le$ ${scenario.targetSlaMs} ms | **Simulated At**: ${new Date(result.simulatedAt).toLocaleString()}  
**Composite Score**: ${result.score}/100 (**Grade ${result.grade}**)

---

## 1. Executive Summary
${result.feedback}

- **Earned Badges**: ${result.earnedBadges.length > 0 ? result.earnedBadges.join(', ') : 'None'}

---

## 2. Configuration Parameters
| Parameter | Tested Value | Golden Reference |
|---|---|---|
| **Topology** | \`${config.topology}\` | \`${scenario.goldenConfig.topology}\` |
| **Read Strategy** | \`${config.readStrategy}\` | \`${scenario.goldenConfig.readStrategy}\` |
| **Write Strategy** | \`${config.writeStrategy}\` | \`${scenario.goldenConfig.writeStrategy}\` |
| **Eviction Policy** | \`${config.evictionPolicy}\` | \`${scenario.goldenConfig.evictionPolicy}\` |
| **Stampede Protection** | \`${config.stampedeProtection}\` | \`${scenario.goldenConfig.stampedeProtection}\` |
| **Allocated Memory** | ${config.memoryLimitMb} MB | ${scenario.goldenConfig.memoryLimitMb} MB |
| **Base TTL** | ${config.baseTtlSeconds} s | ${scenario.goldenConfig.baseTtlSeconds} s |
| **TTL Jitter** | $\\pm$ ${config.jitterPercent}% | $\\pm$ ${scenario.goldenConfig.jitterPercent}% |
| **Traffic Load** | ${config.trafficRps.toLocaleString()} RPS | ${scenario.goldenConfig.trafficRps.toLocaleString()} RPS |

---

## 3. Performance & Resilience Telemetry
| Metric | Benchmark Result | Health Status |
|---|---|---|
| **Cache Hit Rate** | **${result.hitRatePercent}%** | ${result.hitRatePercent >= 95 ? 'Optimal' : 'Needs Tuning'} |
| **Average Latency** | **${result.avgLatencyMs} ms** | ${result.avgLatencyMs <= scenario.targetSlaMs ? 'Meets SLA' : 'Violates SLA'} |
| **P99 Latency** | **${result.p99LatencyMs} ms** | ${result.p99LatencyMs <= scenario.targetSlaMs * 3 ? 'Stable' : 'Tail Degradation'} |
| **Database Read IOPS** | **${result.dbReadIops.toLocaleString()} IOPS** | ${result.dbReadIops < 1000 ? 'Low Load' : 'High DB Contention'} |
| **Database Write IOPS** | **${result.dbWriteIops.toLocaleString()} IOPS** | ${config.writeStrategy === 'WRITE_BEHIND' ? 'Batched' : 'Direct'} |
| **Database Offload** | **${result.dbLoadReductionPercent}%** | ${result.dbLoadReductionPercent >= 90 ? 'Exceptional' : 'Fair'} |
| **Thundering Herd Spikes** | **${result.stampedeSpikeCount}** | ${result.stampedeSpikeCount === 0 ? 'Zero Stampede' : 'Active Hazard'} |
| **Memory Utilization** | **${result.memoryUsagePercent}%** (${result.memoryUsageMb} / ${config.memoryLimitMb} MB) | ${result.isOomViolated ? 'OOM VIOLATION' : 'Within Budget'} |
| **Data Freshness** | **${result.dataFreshnessPercent}%** | ${result.dataFreshnessPercent >= 98 ? 'Consistent' : 'Eventual Consistency'} |

---

## 4. Golden Architectural Blueprint
${scenario.goldenExplanation}

*Report generated by Students-Preparation Platform Distributed Caching Lab ($0.00 Cloud/AI spend).*
`;
}

/**
 * Clean Vector PDF 1.4 Exporter for Cache Lab Benchmark
 */
export function buildCacheLabPdfString(
  scenario: CacheSimulationScenario,
  config: CacheSimulationConfig,
  result: CacheSimulationResult
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
    '(Distributed Caching & Invalidation Architecture Report) Tj',
    '/F2 9 Tf',
    '0 -16 Td',
    '(Students-Preparation Platform | High-Throughput Distributed Systems Studio) Tj',
    '0 -14 Td',
    `(${dateStr} | Zero-AI Local Compute Benchmark | Target SLA: <= ${scenario.targetSlaMs} ms) Tj`,

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
    '(Simulated Telemetry Metrics:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(- Cache Hit Rate: ${result.hitRatePercent}%  |  DB Offload: ${result.dbLoadReductionPercent}%) Tj`,
    '0 -13 Td',
    `(- Average Latency: ${result.avgLatencyMs} ms  |  P99 Tail Latency: ${result.p99LatencyMs} ms) Tj`,
    '0 -13 Td',
    `(- Database Read Load: ${result.dbReadIops} IOPS  |  Database Write Load: ${result.dbWriteIops} IOPS) Tj`,
    '0 -13 Td',
    `(- Thundering Herd Stampede Spikes: ${result.stampedeSpikeCount}  |  Data Freshness: ${result.dataFreshnessPercent}%) Tj`,
    '0 -13 Td',
    `(- Memory Allocated: ${config.memoryLimitMb} MB  |  Working Set: ${result.workingSetMb} MB  |  Memory Used: ${result.memoryUsagePercent}%) Tj`,

    // Configuration
    '/F1 11 Tf',
    '0 -26 Td',
    '(Configured Architecture Details:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(- Topology: ${config.topology}  |  Read Strategy: ${config.readStrategy}) Tj`,
    '0 -13 Td',
    `(- Write Strategy: ${config.writeStrategy}  |  Eviction Policy: ${config.evictionPolicy}) Tj`,
    '0 -13 Td',
    `(- Stampede Protection: ${config.stampedeProtection}  |  TTL: ${config.baseTtlSeconds}s (+/- ${config.jitterPercent}% jitter)) Tj`,

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

export function exportCacheLabPdf(
  scenario: CacheSimulationScenario,
  config: CacheSimulationConfig,
  result: CacheSimulationResult
): void {
  const pdfString = buildCacheLabPdfString(scenario, config, result);
  const filename = `cache-lab-${scenario.id}-report.pdf`;
  downloadFile(filename, pdfString, 'application/pdf');
}

/**
 * LocalStorage Helpers
 */
export function saveCacheLabRecord(record: SavedCacheLabRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedCacheLabRecords();
    const filtered = existing.filter((r) => r.scenarioId !== record.scenarioId);
    filtered.push(record);
    localStorage.setItem(CACHE_LAB_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Gracefully ignore quota issues
  }
}

export function loadSavedCacheLabRecords(): SavedCacheLabRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_LAB_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCacheLabRecord[];
  } catch {
    return [];
  }
}
