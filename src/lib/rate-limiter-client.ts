/**
 * Students-Preparation Distributed Rate Limiting, Throttling & Token Bucket Studio
 * 100% Deterministic Local Compute | Zero External AI Billing ($0.00 Spend)
 * Content Policy Compliant: Generic, Vendor-Neutral Rate Limiting Architectures
 */

export type RateLimitAlgorithm =
  | 'TOKEN_BUCKET'
  | 'LEAKY_BUCKET'
  | 'FIXED_WINDOW_COUNTER'
  | 'SLIDING_WINDOW_LOG'
  | 'SLIDING_WINDOW_COUNTER';

export type SyncArchitecture =
  | 'CENTRALIZED_DISTRIBUTED'
  | 'LOCAL_IN_MEMORY'
  | 'TWO_TIER_HIERARCHICAL'
  | 'EDGE_GATEWAY';

export type TenantTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export type TrafficDistribution =
  | 'UNIFORM_POISSON'
  | 'BURST_AT_BOUNDARY'
  | 'NOISY_NEIGHBOR_ATTACK'
  | 'PERSISTENT_DDOS';

export type RateLimiterGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface RateLimiterTrafficProfile {
  totalRequests: number;
  burstMultiplier: number;
  clientCount: number;
  windowSeconds: number;
  concurrencyRPS: number;
}

export interface RateLimiterConfig {
  scenarioId: string;
  algorithm: RateLimitAlgorithm;
  syncArchitecture: SyncArchitecture;
  rateLimitPerWindow: number;
  windowSeconds: number;
  burstCapacity: number;
  tenantTier: TenantTier;
  gatewayNodeCount: number;
  trafficDistribution: TrafficDistribution;
  hasDeductionLocking: boolean;
}

export interface RateLimiterScenario {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  targetAllowedRatePercent: number;
  description: string;
  trafficProfile: RateLimiterTrafficProfile;
  antiPatternSummary: string;
  goldenConfig: RateLimiterConfig;
  goldenExplanation: string;
  socraticHints: string[];
}

export interface SimulatedHttpHeaders {
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
  policy: string;
}

export interface RateLimiterResult {
  scenarioId: string;
  totalRequests: number;
  allowedRequests: number;
  droppedRequests: number;
  dropRatePercent: number;
  boundaryBurstPenetrationPercent: number;
  avgGatewayLatencyMs: number;
  p99LatencyMs: number;
  memoryUsagePerClientBytes: number;
  memoryUsagePer100kClientsMb: number;
  fairnessIndex: number;
  clusterSyncSkewPercent: number;
  simulatedHeaders: SimulatedHttpHeaders;
  score: number;
  grade: RateLimiterGrade;
  feedback: string;
  earnedBadges: string[];
  simulatedAt: string;
}

export interface SavedRateLimiterRecord {
  scenarioId: string;
  config: RateLimiterConfig;
  result: RateLimiterResult;
  timestamp: string;
}

export const RATE_LIMITER_STORAGE_KEY = 'sp_rate_limiter_v1';

/**
 * 6 Curated Enterprise Placement Rate Limiting Scenarios
 */
export const RATE_LIMITER_SCENARIOS: RateLimiterScenario[] = [
  {
    id: 'public-search-api-burst',
    title: 'Public Search API Scraper Defense',
    domain: 'E-Commerce & Search',
    difficulty: 'Intermediate',
    targetAllowedRatePercent: 90,
    description:
      'A high-traffic e-commerce search endpoint receives 30,000 requests/minute. Aggressive scrapers cluster requests right at the boundary (00:59 and 01:01). If a Fixed Window Counter is used, scrapers exploit the boundary window to push double the allowable traffic (60,000 requests in 2 seconds), crashing downstream Elasticsearch worker clusters.',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 3.5,
      clientCount: 120,
      windowSeconds: 60,
      concurrencyRPS: 500,
    },
    antiPatternSummary:
      'Fixed Window Counter allows 2x boundary traffic spikes because requests arriving at window T-1s and window T+1s reset the counter immediately.',
    goldenConfig: {
      scenarioId: 'public-search-api-burst',
      algorithm: 'SLIDING_WINDOW_COUNTER',
      syncArchitecture: 'CENTRALIZED_DISTRIBUTED',
      rateLimitPerWindow: 600,
      windowSeconds: 60,
      burstCapacity: 150,
      tenantTier: 'FREE',
      gatewayNodeCount: 8,
      trafficDistribution: 'BURST_AT_BOUNDARY',
      hasDeductionLocking: true,
    },
    goldenExplanation:
      'Sliding Window Counter weights the previous window against the elapsed time in the current window, completely smoothing boundary spikes with O(1) memory overhead.',
    socraticHints: [
      'Why does an algorithm with a sharp counter reset at midnight or minute boundaries allow double bursts?',
      'Consider how Sliding Window Counter computes weighted traffic: Count = CurrentCount + (PreviousCount * (1 - ElapsedPercentage)).',
      'Does centralized distributed synchronization prevent scraping botnets from bypassing per-node local quotas?',
    ],
  },
  {
    id: 'payment-checkout-gateway',
    title: 'Financial Payment Processing Gateway',
    domain: 'FinTech & Payments',
    difficulty: 'Advanced',
    targetAllowedRatePercent: 95,
    description:
      'A global card payment processing gateway processes authorized transactions across 16 independent edge gateway nodes. Card networks enforce strict per-merchant velocity limits (e.g. 50 tx/sec). If gateway nodes use asynchronous local memory counters, concurrent checkouts slip past the threshold, triggering credit card network velocity fines and merchant suspension.',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 2.0,
      clientCount: 50,
      windowSeconds: 10,
      concurrencyRPS: 1000,
    },
    antiPatternSummary:
      'Independent local in-memory counters split the quota arbitrarily. Round-robin load balancers can saturate one node while others are idle, or leak 16x velocity bursts across all nodes.',
    goldenConfig: {
      scenarioId: 'payment-checkout-gateway',
      algorithm: 'TOKEN_BUCKET',
      syncArchitecture: 'CENTRALIZED_DISTRIBUTED',
      rateLimitPerWindow: 500,
      windowSeconds: 10,
      burstCapacity: 75,
      tenantTier: 'ENTERPRISE',
      gatewayNodeCount: 16,
      trafficDistribution: 'UNIFORM_POISSON',
      hasDeductionLocking: true,
    },
    goldenExplanation:
      'Centralized Distributed Token Bucket with atomic script deduction guarantees strictly serialized token consumption cluster-wide, eliminating cluster sync skew.',
    socraticHints: [
      'What happens when 16 gateway nodes each assume they have 50 tokens available without centralized coordination?',
      'Atomic distributed scripts ensure that checking token balance and decrementing tokens occur as an indivisible atomic operation.',
      'Why is Token Bucket preferred over Leaky Bucket when customers occasionally purchase bundles with sudden legitimate checkout bursts?',
    ],
  },
  {
    id: 'service-to-service-mesh',
    title: 'Microservices East-West Service Mesh',
    domain: 'Distributed Infrastructure',
    difficulty: 'Advanced',
    targetAllowedRatePercent: 98,
    description:
      'Internal microservices handle 50,000 RPC requests/sec across a deep 6-layer call hierarchy. Querying a centralized distributed cache for every internal RPC rate check adds 1.8ms network round-trip per hop, ballooning cumulative end-to-end API response time from 15ms to over 26ms.',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 1.5,
      clientCount: 300,
      windowSeconds: 1,
      concurrencyRPS: 5000,
    },
    antiPatternSummary:
      'Calling a centralized cache cluster synchronously on high-throughput east-west RPC calls introduces severe network latency overhead and turns the cache into a single point of failure.',
    goldenConfig: {
      scenarioId: 'service-to-service-mesh',
      algorithm: 'TOKEN_BUCKET',
      syncArchitecture: 'TWO_TIER_HIERARCHICAL',
      rateLimitPerWindow: 5000,
      windowSeconds: 1,
      burstCapacity: 500,
      tenantTier: 'ENTERPRISE',
      gatewayNodeCount: 32,
      trafficDistribution: 'UNIFORM_POISSON',
      hasDeductionLocking: false,
    },
    goldenExplanation:
      'Two-Tier Hierarchical architecture leases token tranches from the central cluster into local gateway memory batches, achieving sub-0.1ms local checks while retaining cluster-wide quota boundaries.',
    socraticHints: [
      'How does token tranche leasing reduce centralized cache QPS while bounding quota overages?',
      'What is the latency difference between in-process memory lookups (~20 microseconds) versus network cache calls (~2 milliseconds)?',
      'In internal service meshes, is a small momentary quota fuzziness acceptable in exchange for 20x lower latency?',
    ],
  },
  {
    id: 'third-party-sms-dispatcher',
    title: 'Telecom SMS & Notification Dispatcher',
    domain: 'Communications & Alerts',
    difficulty: 'Intermediate',
    targetAllowedRatePercent: 88,
    description:
      'An emergency notification dispatcher delivers SMS OTP codes and order updates via upstream carrier telecom partners. The telecom carrier contractually drops any traffic spike above 30 messages/sec with a carrier penalty fee. A standard Token Bucket allows burst spikes that instantly trigger carrier drops.',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 4.0,
      clientCount: 15,
      windowSeconds: 5,
      concurrencyRPS: 200,
    },
    antiPatternSummary:
      'Token Bucket permits burst releases up to bucket capacity. When downstream carriers enforce a rigid maximum rate, burst releases trigger instant carrier throttling and financial penalties.',
    goldenConfig: {
      scenarioId: 'third-party-sms-dispatcher',
      algorithm: 'LEAKY_BUCKET',
      syncArchitecture: 'CENTRALIZED_DISTRIBUTED',
      rateLimitPerWindow: 150,
      windowSeconds: 5,
      burstCapacity: 30,
      tenantTier: 'PRO',
      gatewayNodeCount: 4,
      trafficDistribution: 'BURST_AT_BOUNDARY',
      hasDeductionLocking: true,
    },
    goldenExplanation:
      'Leaky Bucket uses a FIFO queue that drains at a constant, steady rate regardless of input burstiness, perfectly shaping traffic for strict upstream telecommunication partners.',
    socraticHints: [
      'Compare Token Bucket (burst allowed, rate refills) vs Leaky Bucket (smooth output rate, burst queued).',
      'When an external vendor contractually caps instantaneous throughput, why must traffic be smoothed?',
      'What happens to requests that arrive when the Leaky Bucket buffer queue is completely full?',
    ],
  },
  {
    id: 'multi-tenant-saas-api',
    title: 'Multi-Tenant B2B SaaS API Gateway',
    domain: 'Cloud SaaS Platform',
    difficulty: 'Expert',
    targetAllowedRatePercent: 92,
    description:
      'A multi-tenant SaaS provider hosts 500 business customers on shared API gateway infrastructure. A single Free-Tier customer executes an automated crawler script, consuming 85% of total cluster throughput and starving high-paying Enterprise customers (the classic "Noisy Neighbor" dilemma).',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 5.0,
      clientCount: 500,
      windowSeconds: 60,
      concurrencyRPS: 2500,
    },
    antiPatternSummary:
      'Global or unpartitioned IP rate limiting fails to isolate customer tenants. A rogue tenant can monopolize cluster capacity, causing unfair 429 drops for premium subscribers.',
    goldenConfig: {
      scenarioId: 'multi-tenant-saas-api',
      algorithm: 'SLIDING_WINDOW_COUNTER',
      syncArchitecture: 'CENTRALIZED_DISTRIBUTED',
      rateLimitPerWindow: 2000,
      windowSeconds: 60,
      burstCapacity: 400,
      tenantTier: 'ENTERPRISE',
      gatewayNodeCount: 16,
      trafficDistribution: 'NOISY_NEIGHBOR_ATTACK',
      hasDeductionLocking: true,
    },
    goldenExplanation:
      'Tenant-keyed rate limiting with tiered quotas isolates noisy neighbors, maintaining a high Jain Fairness Index (J > 0.95) and guaranteeing SLA compliance for enterprise tiers.',
    socraticHints: [
      'How should rate limit cache keys be partitioned? (e.g. `rl:{tenant_id}:{tier}:{window}` vs global IP).',
      'What is Jain\'s Fairness Index, and how does it prove that Free-Tier abuse does not impact Enterprise clients?',
      'Why is Sliding Window Counter superior to Sliding Window Log when tracking 100,000 multi-tenant clients?',
    ],
  },
  {
    id: 'ddos-defense-login-edge',
    title: 'Authentication & Credential-Stuffing Edge Defense',
    domain: 'Security & IAM',
    difficulty: 'Expert',
    targetAllowedRatePercent: 75,
    description:
      'An identity and login service faces distributed botnet credential-stuffing attacks. Attackers rotate residential IP proxies every 3 requests and hop across window boundaries. Storing granular sliding logs per IP is vulnerable to proxy rotation and risks memory exhaustion, while basic fixed counters fail to identify coordinated attacks.',
    trafficProfile: {
      totalRequests: 10000,
      burstMultiplier: 6.0,
      clientCount: 1500,
      windowSeconds: 30,
      concurrencyRPS: 3000,
    },
    antiPatternSummary:
      'Basic IP-based rate limiting fails when bots distribute attempts across thousands of IP addresses. Unbounded timestamp logging causes catastrophic memory explosion under high IP churn.',
    goldenConfig: {
      scenarioId: 'ddos-defense-login-edge',
      algorithm: 'SLIDING_WINDOW_COUNTER',
      syncArchitecture: 'EDGE_GATEWAY',
      rateLimitPerWindow: 300,
      windowSeconds: 30,
      burstCapacity: 50,
      tenantTier: 'FREE',
      gatewayNodeCount: 64,
      trafficDistribution: 'PERSISTENT_DDOS',
      hasDeductionLocking: true,
    },
    goldenExplanation:
      'Edge Gateway deployment drops distributed botnet floods at the network perimeter before hitting origin database servers, using Sliding Window Counter to maintain O(1) memory per client key.',
    socraticHints: [
      'Why is Sliding Window Log dangerously expensive (O(N) memory) during a high-volume distributed attack?',
      'How does edge rate limiting protect central database connections from thread starvation?',
      'What compound rate limiting keys (e.g. IP + Username hash + TLS fingerprint) mitigate rotating proxy attacks?',
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
 * Main Deterministic Rate Limiting Simulation Engine
 */
export function simulateRateLimiterExperiment(
  config: RateLimiterConfig,
  scenario: RateLimiterScenario
): RateLimiterResult {
  const seed = 42 + scenario.trafficProfile.clientCount + config.gatewayNodeCount;
  const prng = createPrng(seed);

  const totalRequests = scenario.trafficProfile.totalRequests;
  const windowSec = Math.max(1, config.windowSeconds);
  const limit = Math.max(1, config.rateLimitPerWindow);
  const burstCap = Math.max(1, config.burstCapacity);

  // 1. Architecture Latency Modeling
  let baseLatencyMs = 0.05; // Base application processing
  let latencyJitterMs = 0.02;

  switch (config.syncArchitecture) {
    case 'CENTRALIZED_DISTRIBUTED':
      baseLatencyMs = 1.65; // Network round-trip to distributed cache
      latencyJitterMs = 0.55;
      if (config.hasDeductionLocking) {
        baseLatencyMs += 0.45; // Distributed atomic script / lock overhead
      }
      break;
    case 'LOCAL_IN_MEMORY':
      baseLatencyMs = 0.02; // In-memory atomic integer / pointer lookup
      latencyJitterMs = 0.01;
      break;
    case 'TWO_TIER_HIERARCHICAL':
      baseLatencyMs = 0.12; // In-memory tranche check + async refill batch
      latencyJitterMs = 0.04;
      break;
    case 'EDGE_GATEWAY':
      baseLatencyMs = 0.35; // Edge reverse proxy intercept
      latencyJitterMs = 0.1;
      break;
  }

  // 2. Memory Footprint Modeling (bytes per tracked client key)
  let bytesPerClient = 16;
  switch (config.algorithm) {
    case 'FIXED_WINDOW_COUNTER':
      bytesPerClient = 8; // int64 counter
      break;
    case 'TOKEN_BUCKET':
      bytesPerClient = 16; // timestamp (float64) + counter (int64)
      break;
    case 'LEAKY_BUCKET':
      bytesPerClient = 24; // lastLeakTime (float64) + queueCount (int64) + lock (int64)
      break;
    case 'SLIDING_WINDOW_COUNTER':
      bytesPerClient = 24; // prevWindowCount (int64) + currWindowCount (int64) + timestamp (float64)
      break;
    case 'SLIDING_WINDOW_LOG': {
      // O(N) memory: stores each request timestamp in window
      const estimatedRequestsPerClient = Math.ceil(limit / Math.max(1, scenario.trafficProfile.clientCount));
      bytesPerClient = Math.max(64, estimatedRequestsPerClient * 8 + 32);
      break;
    }
  }

  const memoryUsagePer100kClientsMb = Number(((bytesPerClient * 100000) / (1024 * 1024)).toFixed(2));

  // 3. Cluster Synchronization Skew & Boundary Burst Modeling
  let clusterSyncSkewPercent = 0.0;
  if (config.syncArchitecture === 'LOCAL_IN_MEMORY') {
    // Local memory splits quota across N nodes. With hashing/load-balancer skew, skew increases with node count.
    clusterSyncSkewPercent = Math.min(65.0, Number((config.gatewayNodeCount * 1.8 + 5.0).toFixed(1)));
  } else if (config.syncArchitecture === 'TWO_TIER_HIERARCHICAL') {
    clusterSyncSkewPercent = 4.2; // Leased tranche drift
  } else if (config.syncArchitecture === 'EDGE_GATEWAY') {
    clusterSyncSkewPercent = 8.5; // Eventual edge sync propagation delay
  } else {
    clusterSyncSkewPercent = config.hasDeductionLocking ? 0.2 : 3.8;
  }

  // 4. Request Arrival & Outcome Simulation
  let allowedRequests = 0;
  let droppedRequests = 0;
  let boundaryWindowRequestsAllowed = 0;
  let boundaryWindowRequestsTotal = 0;

  // Simulate token bucket / counter state
  let currentTokens = burstCap;
  let leakyQueue = 0;
  const leakRatePerMs = limit / (windowSec * 1000);
  let lastTimestampMs = 0;

  // Track client distribution for Jain's Fairness Index
  const clientRequestedMap: Record<number, number> = {};
  const clientApprovedMap: Record<number, number> = {};

  // Boundary burst test parameters: window boundary occurs at T = 50% through total time
  const totalSimulationDurationMs = windowSec * 1000;
  const boundaryIntervalStartMs = totalSimulationDurationMs - 1000;
  const boundaryIntervalEndMs = 1000; // Across the wrap

  for (let i = 0; i < totalRequests; i++) {
    // Calculate simulated timestamp
    let tNorm: number;
    let clientId = i % scenario.trafficProfile.clientCount;

    if (config.trafficDistribution === 'BURST_AT_BOUNDARY') {
      // 50% of traffic concentrated right around the boundary
      if (prng() < 0.5) {
        tNorm = prng() < 0.5 ? 0.99 + prng() * 0.01 : 0.00 + prng() * 0.01;
      } else {
        tNorm = prng();
      }
    } else if (config.trafficDistribution === 'NOISY_NEIGHBOR_ATTACK') {
      // Client 0 (attacker) generates 85% of traffic
      if (prng() < 0.85) {
        clientId = 0; // Attacker
      } else {
        clientId = 1 + Math.floor(prng() * (scenario.trafficProfile.clientCount - 1));
      }
      tNorm = (i / totalRequests) + (prng() - 0.5) * 0.02;
    } else if (config.trafficDistribution === 'PERSISTENT_DDOS') {
      // Heavy continuous flood
      clientId = Math.floor(prng() * scenario.trafficProfile.clientCount);
      tNorm = (i / totalRequests) + (prng() - 0.5) * 0.01;
    } else {
      // Uniform Poisson
      tNorm = (i / totalRequests) + (prng() - 0.5) * 0.05;
    }

    clientRequestedMap[clientId] = (clientRequestedMap[clientId] || 0) + 1;

    tNorm = Math.max(0, Math.min(0.9999, tNorm));
    const currentTimestampMs = tNorm * totalSimulationDurationMs;
    const deltaMs = Math.max(0, currentTimestampMs - lastTimestampMs);
    lastTimestampMs = currentTimestampMs;

    const isBoundaryWindow =
      currentTimestampMs >= boundaryIntervalStartMs || currentTimestampMs <= boundaryIntervalEndMs;

    if (isBoundaryWindow) {
      boundaryWindowRequestsTotal++;
    }

    // Evaluate rate limiter algorithm
    let allowed = false;

    // Tenant tier quota multiplier
    let tierQuotaMultiplier = 1.0;
    if (config.tenantTier === 'FREE') tierQuotaMultiplier = 0.5;
    if (config.tenantTier === 'ENTERPRISE') tierQuotaMultiplier = 2.0;

    const effectiveLimit = limit * tierQuotaMultiplier;

    if (config.algorithm === 'TOKEN_BUCKET') {
      const refillTokens = deltaMs * (effectiveLimit / (windowSec * 1000));
      currentTokens = Math.min(burstCap, currentTokens + refillTokens);

      if (currentTokens >= 1.0) {
        currentTokens -= 1.0;
        allowed = true;
      } else {
        allowed = false;
      }
    } else if (config.algorithm === 'LEAKY_BUCKET') {
      const leaked = deltaMs * leakRatePerMs;
      leakyQueue = Math.max(0, leakyQueue - leaked);

      if (leakyQueue < burstCap) {
        leakyQueue += 1.0;
        allowed = true;
      } else {
        allowed = false;
      }
    } else if (config.algorithm === 'FIXED_WINDOW_COUNTER') {
      // Resets strictly at tNorm = 0
      // Vulnerability: Boundary traffic allows double limit!
      const normalizedBoundaryFactor =
        config.trafficDistribution === 'BURST_AT_BOUNDARY' && isBoundaryWindow ? 1.95 : 1.0;
      const effectiveCap = (effectiveLimit / config.gatewayNodeCount) * normalizedBoundaryFactor;

      if (i < effectiveCap * (config.gatewayNodeCount * 0.95)) {
        allowed = true;
      } else {
        allowed = prng() < 0.15; // some packets slip through
      }
    } else if (config.algorithm === 'SLIDING_WINDOW_LOG') {
      // 100% accurate, zero boundary leak
      allowed = allowedRequests < effectiveLimit;
    } else {
      // SLIDING_WINDOW_COUNTER: weighted approximation
      const estimatedCountInWindow =
        allowedRequests * (1.0 - currentTimestampMs / totalSimulationDurationMs);
      allowed = estimatedCountInWindow < effectiveLimit;
    }

    // Account for cluster skew leakage on local memory architectures
    if (config.syncArchitecture === 'LOCAL_IN_MEMORY' && !allowed) {
      // Skewed load balancing leaks requests to under-utilized nodes
      if (prng() < clusterSyncSkewPercent / 100) {
        allowed = true;
      }
    }

    // Noisy neighbor isolation check
    if (config.trafficDistribution === 'NOISY_NEIGHBOR_ATTACK') {
      if (config.tenantTier === 'ENTERPRISE') {
        const clientApproved = clientApprovedMap[clientId] || 0;
        const maxPerTenantQuota = Math.max(30, Math.ceil(effectiveLimit / 40));
        if (clientId === 0 && clientApproved >= maxPerTenantQuota) {
          allowed = false;
        }
      } else {
        // Free / unpartitioned: client 0 exhausts global quota early, dropping subsequent legitimate tenants
        if (clientId !== 0 && allowedRequests >= effectiveLimit) {
          allowed = false;
        }
      }
    }

    if (allowed) {
      allowedRequests++;
      if (isBoundaryWindow) {
        boundaryWindowRequestsAllowed++;
      }
      clientApprovedMap[clientId] = (clientApprovedMap[clientId] || 0) + 1;
    } else {
      droppedRequests++;
    }
  }

  // 5. Boundary Burst Penetration Calculation
  let boundaryBurstPenetrationPercent = 100.0;
  if (boundaryWindowRequestsTotal > 0) {
    const rawPenetration = (boundaryWindowRequestsAllowed / (limit * 0.33)) * 100;
    if (config.algorithm === 'FIXED_WINDOW_COUNTER' && config.trafficDistribution === 'BURST_AT_BOUNDARY') {
      boundaryBurstPenetrationPercent = Math.min(200.0, Number((180.0 + prng() * 18.0).toFixed(1)));
    } else if (config.algorithm === 'SLIDING_WINDOW_COUNTER' || config.algorithm === 'SLIDING_WINDOW_LOG') {
      boundaryBurstPenetrationPercent = Math.min(101.5, Number((98.0 + prng() * 3.0).toFixed(1)));
    } else {
      boundaryBurstPenetrationPercent = Number(Math.min(150.0, rawPenetration).toFixed(1));
    }
  }

  // 6. Jain's Fairness Index Calculation on Quota Satisfaction: J = (sum x_i)^2 / (n * sum x_i^2)
  const clientIds = Object.keys(clientRequestedMap).map(Number);
  let fairnessIndex = 0.96;
  if (clientIds.length > 1) {
    const satisfactionRatios = clientIds.map((id) => {
      const req = clientRequestedMap[id] || 1;
      const app = clientApprovedMap[id] || 0;
      return app / req;
    });
    const sum = satisfactionRatios.reduce((acc, r) => acc + r, 0);
    const sumSq = satisfactionRatios.reduce((acc, r) => acc + r * r, 0);
    fairnessIndex = sumSq > 0 ? Number(((sum * sum) / (satisfactionRatios.length * sumSq)).toFixed(3)) : 0.5;
  }
  if (config.trafficDistribution === 'NOISY_NEIGHBOR_ATTACK' && config.tenantTier === 'FREE') {
    fairnessIndex = Math.min(fairnessIndex, 0.38);
  }

  // 7. Latency Calculations
  const avgGatewayLatencyMs = Number((baseLatencyMs + prng() * latencyJitterMs).toFixed(3));
  const p99LatencyMs = Number((avgGatewayLatencyMs * 2.4 + latencyJitterMs * 1.5).toFixed(3));
  const dropRatePercent = Number(((droppedRequests / totalRequests) * 100).toFixed(1));

  // 8. Simulated Live HTTP Response Headers
  const simulatedRemaining = Math.max(0, Math.floor(burstCap - (allowedRequests % burstCap)));
  const simulatedHeaders: SimulatedHttpHeaders = {
    limit: limit,
    remaining: simulatedRemaining,
    resetSeconds: Math.ceil(windowSec * (1 - (lastTimestampMs / totalSimulationDurationMs))),
    retryAfterSeconds: droppedRequests > 0 ? Math.ceil(windowSec / 2) : undefined,
    policy: `${limit};w=${windowSec};burst=${burstCap}`,
  };

  // 9. Scoring, Grading, and Feedback Assessment
  let score = 50;
  const feedbackPoints: string[] = [];
  const earnedBadges: string[] = [];

  // Algorithm match
  if (config.algorithm === scenario.goldenConfig.algorithm) {
    score += 20;
    feedbackPoints.push(`Optimal algorithm selection (${config.algorithm}) for ${scenario.domain}.`);
  } else if (
    (config.algorithm === 'SLIDING_WINDOW_COUNTER' && scenario.goldenConfig.algorithm === 'TOKEN_BUCKET') ||
    (config.algorithm === 'TOKEN_BUCKET' && scenario.goldenConfig.algorithm === 'SLIDING_WINDOW_COUNTER')
  ) {
    score += 10;
    feedbackPoints.push(`Acceptable algorithm (${config.algorithm}), though ${scenario.goldenConfig.algorithm} is preferred.`);
  } else {
    score -= 15;
    feedbackPoints.push(`Algorithm ${config.algorithm} sub-optimal for this traffic pattern; vulnerable to architectural flaws.`);
  }

  // Architecture match
  if (config.syncArchitecture === scenario.goldenConfig.syncArchitecture) {
    score += 15;
    feedbackPoints.push(`Synchronization architecture (${config.syncArchitecture}) aligns with SLA requirements.`);
  } else {
    score -= 10;
    feedbackPoints.push(`Architecture ${config.syncArchitecture} misaligned with latency/consistency tradeoff.`);
  }

  // Concurrency locking match
  if (config.hasDeductionLocking === scenario.goldenConfig.hasDeductionLocking) {
    score += 5;
  }

  // Boundary burst protection bonus or penalty
  if (boundaryBurstPenetrationPercent <= 105) {
    score += 10;
    feedbackPoints.push('Boundary burst penetration remained tightly bounded (<= 102%), preventing cascade failures.');
  } else if (config.algorithm === 'FIXED_WINDOW_COUNTER' && boundaryBurstPenetrationPercent > 130) {
    score -= 20;
    feedbackPoints.push(
      `CRITICAL VULNERABILITY: Fixed Window allowed ${boundaryBurstPenetrationPercent}% burst across boundary, risking backend outage.`
    );
  }

  // Memory usage check
  if (bytesPerClient <= 32) {
    score += 5;
    feedbackPoints.push('Memory footprint per tracked client key is optimal (O(1)).');
  } else if (config.algorithm === 'SLIDING_WINDOW_LOG' && scenario.trafficProfile.clientCount > 100) {
    score -= 15;
    feedbackPoints.push(
      `High memory footprint (${memoryUsagePer100kClientsMb} MB per 100k clients) for Sliding Window Log; prefer Sliding Window Counter.`
    );
  }

  // Latency penalty for East-West mesh
  if (scenario.id === 'service-to-service-mesh' && config.syncArchitecture === 'CENTRALIZED_DISTRIBUTED') {
    score -= 20;
    feedbackPoints.push('Synchronous cache calls add excessive 1.8ms hop overhead to internal service-to-service RPC chains.');
  }

  // Leaky bucket smoothing for telecom SMS
  if (scenario.id === 'third-party-sms-dispatcher') {
    if (config.algorithm === 'LEAKY_BUCKET') {
      score += 10;
      feedbackPoints.push('Leaky Bucket ensures flat, constant-rate dispatch to upstream telecom aggregator.');
    } else {
      score -= 15;
      feedbackPoints.push('Burst-capable algorithm violated carrier TPS caps, resulting in upstream message rejection.');
    }
  }

  // Noisy neighbor defense check
  if (scenario.id === 'multi-tenant-saas-api') {
    if (config.tenantTier === 'ENTERPRISE' && fairnessIndex >= 0.85) {
      score += 10;
      feedbackPoints.push('Enterprise tier reservation successfully isolated noisy neighbor traffic.');
    }
  }

  score = Math.max(10, Math.min(100, score));

  // Determine Grade
  let grade: RateLimiterGrade = 'F';
  if (score >= 90) grade = 'S';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else grade = 'F';

  // Badges
  if (grade === 'S') earnedBadges.push('RATE_LIMIT_ARCHITECT');
  if (boundaryBurstPenetrationPercent <= 102 && config.trafficDistribution === 'BURST_AT_BOUNDARY') {
    earnedBadges.push('BURST_CONTROLLER');
  }
  if (config.algorithm === 'SLIDING_WINDOW_COUNTER') {
    earnedBadges.push('SLIDING_WINDOW_MASTER');
  }
  if (fairnessIndex >= 0.90 && scenario.id === 'multi-tenant-saas-api') {
    earnedBadges.push('NOISY_NEIGHBOR_DEFENDER');
  }
  if (avgGatewayLatencyMs < 0.20) {
    earnedBadges.push('SUB_MILLI_THROTTLER');
  }

  return {
    scenarioId: scenario.id,
    totalRequests,
    allowedRequests,
    droppedRequests,
    dropRatePercent,
    boundaryBurstPenetrationPercent,
    avgGatewayLatencyMs,
    p99LatencyMs,
    memoryUsagePerClientBytes: bytesPerClient,
    memoryUsagePer100kClientsMb,
    fairnessIndex,
    clusterSyncSkewPercent,
    simulatedHeaders,
    score,
    grade,
    feedback: feedbackPoints.join(' '),
    earnedBadges,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Generate Markdown Report for rate limiter audit
 */
export function generateRateLimiterMarkdown(
  scenario: RateLimiterScenario,
  config: RateLimiterConfig,
  result: RateLimiterResult
): string {
  return `# Distributed Rate Limiting & Throttling Assessment Report

**Scenario**: ${scenario.title} (${scenario.domain})  
**Evaluation Date**: ${result.simulatedAt}  
**Candidate Composite Grade**: **${result.grade}** (Score: ${result.score}/100)  

---

## 1. Executive Summary & Configuration

- **Algorithm**: \`${config.algorithm}\`
- **Synchronization Architecture**: \`${config.syncArchitecture}\`
- **Quota Limit**: \`${config.rateLimitPerWindow}\` reqs / \`${config.windowSeconds}\`s (Burst: \`${config.burstCapacity}\`)
- **Tenant Tier**: \`${config.tenantTier}\`
- **Gateway Node Count**: \`${config.gatewayNodeCount}\` nodes
- **Traffic Pattern**: \`${config.trafficDistribution}\`
- **Atomic Locking / Scripting**: \`${config.hasDeductionLocking ? 'Enabled' : 'Disabled'}\`

---

## 2. Telemetry & Performance Metrics

| Metric | Measured Result | Reference Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Total Requests Simulated** | ${result.totalRequests.toLocaleString()} | ${scenario.trafficProfile.totalRequests.toLocaleString()} | Observed |
| **Allowed Requests (200 OK)** | ${result.allowedRequests.toLocaleString()} (${(100 - result.dropRatePercent).toFixed(1)}%) | ~${scenario.targetAllowedRatePercent}% | ${result.allowedRequests > 0 ? 'ACTIVE' : 'BLOCKED'} |
| **Dropped Requests (429 Too Many)** | ${result.droppedRequests.toLocaleString()} (${result.dropRatePercent}%) | Expected | CAPPED |
| **Boundary Burst Penetration** | **${result.boundaryBurstPenetrationPercent}%** | <= 102.0% | ${result.boundaryBurstPenetrationPercent <= 105 ? 'HEALTHY' : 'CRITICAL PENETRATION'} |
| **Average Gateway Overhead** | **${result.avgGatewayLatencyMs} ms** | < 2.0 ms | ${result.avgGatewayLatencyMs < 2.0 ? 'FAST' : 'HIGH LATENCY'} |
| **p99 Gateway Overhead** | **${result.p99LatencyMs} ms** | < 5.0 ms | ${result.p99LatencyMs < 5.0 ? 'OPTIMAL' : 'DEGRADED'} |
| **Memory Footprint (100k clients)** | **${result.memoryUsagePer100kClientsMb} MB** | < 50 MB | ${result.memoryUsagePer100kClientsMb < 50 ? 'EFFICIENT' : 'MEMORY HEAVY'} |
| **Jain's Fairness Index (J)** | **${result.fairnessIndex}** | >= 0.85 | ${result.fairnessIndex >= 0.85 ? 'BALANCED' : 'UNFAIR'} |
| **Cluster Sync Skew** | **${result.clusterSyncSkewPercent}%** | < 5.0% | ${result.clusterSyncSkewPercent < 5.0 ? 'TIGHT' : 'DRIFT'} |

---

## 3. Simulated HTTP Response Headers

\`\`\`http
HTTP/1.1 ${result.droppedRequests > 0 ? '429 Too Many Requests' : '200 OK'}
X-RateLimit-Limit: ${result.simulatedHeaders.limit}
X-RateLimit-Remaining: ${result.simulatedHeaders.remaining}
X-RateLimit-Reset: ${result.simulatedHeaders.resetSeconds}
${result.simulatedHeaders.retryAfterSeconds ? `Retry-After: ${result.simulatedHeaders.retryAfterSeconds}\n` : ''}RateLimit-Policy: ${result.simulatedHeaders.policy}
\`\`\`

---

## 4. Evaluator Critique & Architecture Feedback

> ${result.feedback}

### Earned Industry Badges:
${result.earnedBadges.length > 0 ? result.earnedBadges.map((b) => `- \`[${b}]\``).join('\n') : '- None for this configuration.'}

---

## 5. Golden Reference Architecture

- **Golden Algorithm**: \`${scenario.goldenConfig.algorithm}\`
- **Golden Architecture**: \`${scenario.goldenConfig.syncArchitecture}\`
- **Rationale**: ${scenario.goldenExplanation}

---
*Report generated by Students-Preparation Distributed Rate Limiting Studio. 100% Local Deterministic Compute.*
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
export function buildRateLimiterPdfString(
  scenario: RateLimiterScenario,
  config: RateLimiterConfig,
  result: RateLimiterResult
): string {
  const streamLines: string[] = [
    'BT',
    '/F1 16 Tf',
    '50 800 Td',
    '(Students-Preparation Distributed Rate Limiting Studio Report) Tj',
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
    `(${escapePdfText(`Algorithm: ${config.algorithm} | Sync: ${config.syncArchitecture}`)}) Tj`,
    '0 -15 Td',
    `(${escapePdfText(`Quota: ${config.rateLimitPerWindow} reqs/${config.windowSeconds}s | Burst Capacity: ${config.burstCapacity}`)}) Tj`,
    '0 -15 Td',
    `(${escapePdfText(`Tenant Tier: ${config.tenantTier} | Gateway Nodes: ${config.gatewayNodeCount} | Pattern: ${config.trafficDistribution}`)}) Tj`,
    '0 -25 Td',
    '/F1 12 Tf',
    '(Telemetry & Performance Results:) Tj',
    '/F2 9 Tf',
    '0 -18 Td',
    `(${escapePdfText(`- Total Simulated: ${result.totalRequests.toLocaleString()} | Allowed: ${result.allowedRequests.toLocaleString()} | Dropped: ${result.droppedRequests.toLocaleString()} (${result.dropRatePercent}%)`)}) Tj`,
    '0 -14 Td',
    `(${escapePdfText(`- Boundary Burst Penetration: ${result.boundaryBurstPenetrationPercent}% (Target: <= 102%)`)}) Tj`,
    '0 -14 Td',
    `(${escapePdfText(`- Gateway Latency Overhead: Avg ${result.avgGatewayLatencyMs} ms | p99 ${result.p99LatencyMs} ms`)}) Tj`,
    '0 -14 Td',
    `(${escapePdfText(`- Memory Footprint: ${result.memoryUsagePerClientBytes} bytes/client | ${result.memoryUsagePer100kClientsMb} MB per 100k clients`)}) Tj`,
    '0 -14 Td',
    `(${escapePdfText(`- Jain Fairness Index (J): ${result.fairnessIndex} | Cluster Skew: ${result.clusterSyncSkewPercent}%`)}) Tj`,
    '0 -25 Td',
    '/F1 11 Tf',
    '(Simulated HTTP Headers Preview:) Tj',
    '/F2 9 Tf',
    '0 -15 Td',
    `(${escapePdfText(`X-RateLimit-Limit: ${result.simulatedHeaders.limit}`)}) Tj`,
    '0 -12 Td',
    `(${escapePdfText(`X-RateLimit-Remaining: ${result.simulatedHeaders.remaining}`)}) Tj`,
    '0 -12 Td',
    `(${escapePdfText(`X-RateLimit-Reset: ${result.simulatedHeaders.resetSeconds} seconds`)}) Tj`,
    '0 -22 Td',
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

export function exportRateLimiterPdf(
  scenario: RateLimiterScenario,
  config: RateLimiterConfig,
  result: RateLimiterResult
): void {
  const pdfString = buildRateLimiterPdfString(scenario, config, result);
  const filename = `rate-limiter-${scenario.id}-report.pdf`;
  downloadFile(filename, pdfString, 'application/pdf');
}

/**
 * LocalStorage Persistence Helpers
 */
export function saveRateLimiterRecord(record: SavedRateLimiterRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedRateLimiterRecords();
    const filtered = existing.filter((r) => r.scenarioId !== record.scenarioId);
    filtered.push(record);
    localStorage.setItem(RATE_LIMITER_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Gracefully ignore storage quota errors
  }
}

export function loadSavedRateLimiterRecords(): SavedRateLimiterRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RATE_LIMITER_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedRateLimiterRecord[];
  } catch {
    return [];
  }
}
