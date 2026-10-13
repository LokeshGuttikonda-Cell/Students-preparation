/**
 * Architecture Decision Visualizer (Trade-Off Calculators)
 * Pure simulation engines and analytical models for distributed systems,
 * storage engine internals, and database data layout trade-offs.
 *
 * Adheres strictly to docs/CONTENT_POLICY.md: 100% technical signal, zero vendor marketing.
 */

export interface QuorumSimulationInput {
  totalNodes: number;      // N: total replica nodes (e.g. 3, 5, 7, 9)
  readQuorum: number;      // R: nodes required for read acknowledgement
  writeQuorum: number;     // W: nodes required for write acknowledgement
  networkLatencyMs: number;// Base one-way network delay in ms
  packetLossPct: number;   // Network packet drop percentage (0 - 10%)
}

export interface QuorumSimulationResult {
  isStrongConsistency: boolean; // R + W > N
  consistencyLevel: 'Strong (Linearizable/Sequential)' | 'Eventual (Read Stale Window)';
  readLatencyMs: number;
  writeLatencyMs: number;
  tolerableNodeFailures: number;
  staleReadProbabilityPct: number;
  recommendation: string;
  bottleneck: string;
}

export function calculateQuorumTradeoff(input: QuorumSimulationInput): QuorumSimulationResult {
  const { totalNodes, readQuorum, writeQuorum, networkLatencyMs, packetLossPct } = input;
  
  const isStrong = (readQuorum + writeQuorum) > totalNodes;
  
  // Latency model: Client RTT = 2 * one-way latency + quantile tail penalty based on quorum size over total nodes
  const lossMultiplier = 1 + (packetLossPct / 100) * 1.8;
  const writeTailPenalty = ((writeQuorum - 1) / Math.max(1, totalNodes - 1)) * 0.45;
  const readTailPenalty = ((readQuorum - 1) / Math.max(1, totalNodes - 1)) * 0.45;

  const baseRtt = networkLatencyMs * 2;
  const writeLatency = Math.round(baseRtt * (1 + writeTailPenalty) * lossMultiplier * 10) / 10;
  const readLatency = Math.round(baseRtt * (1 + readTailPenalty) * lossMultiplier * 10) / 10;

  // Fault tolerance: Can tolerate loss of nodes until either R or W cannot be formed
  const tolerableFailures = Math.max(0, totalNodes - Math.max(readQuorum, writeQuorum));

  // Stale read probability if R + W <= N
  let staleReadProbability = 0;
  if (!isStrong) {
    const overlapDeficit = totalNodes - (readQuorum + writeQuorum) + 1;
    staleReadProbability = Math.min(95, Math.round((overlapDeficit / totalNodes) * 100 * 0.85));
  }

  let recommendation = '';
  let bottleneck = '';

  if (isStrong) {
    if (readQuorum === 1 && writeQuorum === totalNodes) {
      recommendation = 'Optimal for ultra-low latency reads (e.g. read-heavy caching caches), but any single node crash halts all writes.';
      bottleneck = 'Write availability: 0 node failures tolerated for writes.';
    } else if (writeQuorum === 1 && readQuorum === totalNodes) {
      recommendation = 'Optimal for high-throughput write ingestion (e.g. telemetry ingestion), but reads must query all replicas and suffer high tail latency.';
      bottleneck = 'Read latency & availability: single node crash halts reads.';
    } else {
      recommendation = 'Balanced majority quorum configuration (N/2 + 1). Guarantees overlap of read and write sets with symmetric resilience against node failure.';
      bottleneck = 'Network tail latency on the slowest replica within quorum.';
    }
  } else {
    recommendation = 'Eventual consistency mode (R + W <= N). Yields lowest possible latency and maximum fault tolerance, but application must tolerate reading uncommitted or stale versions.';
    bottleneck = 'Stale reads and split-brain merge resolution required via CRDTs or Vector Clocks.';
  }

  return {
    isStrongConsistency: isStrong,
    consistencyLevel: isStrong ? 'Strong (Linearizable/Sequential)' : 'Eventual (Read Stale Window)',
    readLatencyMs: readLatency,
    writeLatencyMs: writeLatency,
    tolerableNodeFailures: tolerableFailures,
    staleReadProbabilityPct: staleReadProbability,
    recommendation,
    bottleneck,
  };
}

export interface StorageEngineInput {
  writeIops: number;        // Total write operations per second
  readToWriteRatio: number; // E.g., 2.0 means 2 reads per 1 write
  recordSizeBytes: number;  // Size of each record in bytes (e.g., 512)
  bufferPoolMb: number;     // RAM buffer size (MemTable / Buffer Pool)
}

export interface StorageEngineResult {
  lsmWaf: number;           // Write Amplification Factor
  lsmRaf: number;           // Read Amplification Factor
  bTreeWaf: number;
  bTreeRaf: number;
  lsmDiskWriteThroughputMBps: number;
  bTreeDiskWriteThroughputMBps: number;
  preferredEngine: 'LSM-Tree' | 'B+ Tree';
  rationale: string;
  compactionOverheadWarning: boolean;
}

export function calculateStorageEngineTradeoff(input: StorageEngineInput): StorageEngineResult {
  const { writeIops, readToWriteRatio, recordSizeBytes, bufferPoolMb } = input;
  
  const rawWriteDataRateMBps = (writeIops * recordSizeBytes) / (1024 * 1024);

  // LSM-Tree Model:
  // Sequential append to WAL + MemTable.
  // Compaction tiers (Size-Tiered / Leveled). Level amplification factor = T = 10.
  // Levels L = ceil(log10(Dataset / MemTable)). Typical WAF between 8x and 25x.
  const estimatedLevels = Math.min(6, Math.max(3, Math.ceil(Math.log10(Math.max(10, writeIops / 1000 * 100)))));
  const lsmWaf = Math.round((1 + estimatedLevels * 3.2) * 10) / 10;
  // Read Amplification in LSM: Bloom filters reduce SSTable probes, typically 1.5 - 3.5 disk accesses for point lookups
  const lsmRaf = Math.round((1.2 + estimatedLevels * 0.45) * 10) / 10;
  const lsmDiskWrite = Math.round(rawWriteDataRateMBps * lsmWaf * 10) / 10;

  // B+ Tree Model:
  // Random page writes: When a 512B record is written, a full 4KB or 16KB page is flushed from buffer pool to disk.
  // WAL sequential write (1x) + Dirty Page Flush (4096 / recordSizeBytes) divided by buffer pool coalescing factor.
  const pageSizeBytes = 4096;
  const coalescingFactor = Math.min(8, Math.max(1.2, bufferPoolMb / 64));
  const bTreeWaf = Math.round((1.0 + (pageSizeBytes / recordSizeBytes) / coalescingFactor) * 10) / 10;
  // B+ Tree Read Amplification: Root + interior nodes cached in RAM buffer pool; leaf page fetched in 1 IOPS
  const bTreeRaf = 1.2;
  const bTreeDiskWrite = Math.round(rawWriteDataRateMBps * bTreeWaf * 10) / 10;

  const compactionOverhead = lsmDiskWrite > 120 || writeIops > 40000;

  const preferLsm = readToWriteRatio < 3.0 || bTreeDiskWrite > lsmDiskWrite * 1.4;
  const preferredEngine: 'LSM-Tree' | 'B+ Tree' = preferLsm ? 'LSM-Tree' : 'B+ Tree';

  const rationale = preferLsm
    ? `LSM-Tree delivers ${Math.round((bTreeDiskWrite / Math.max(0.1, lsmDiskWrite)) * 10) / 10}x less random I/O write stress via sequential append-only SSTable writes, ideal for write-heavy workload (R:W ratio ${readToWriteRatio}:1).`
    : `B+ Tree provides superior predictable point-read performance (RAF ${bTreeRaf} vs LSM's ${lsmRaf}) and avoids compaction I/O spikes in read-heavy access patterns (R:W ratio ${readToWriteRatio}:1).`;

  return {
    lsmWaf,
    lsmRaf,
    bTreeWaf,
    bTreeRaf,
    lsmDiskWriteThroughputMBps: lsmDiskWrite,
    bTreeDiskWriteThroughputMBps: bTreeDiskWrite,
    preferredEngine,
    rationale,
    compactionOverheadWarning: compactionOverhead,
  };
}

export interface DataLayoutInput {
  totalRows: number;         // Total rows in dataset (e.g. 5,000,000)
  totalColumns: number;      // Total columns in table schema (e.g. 40)
  queriedColumns: number;    // Number of columns projected in analytical query (e.g. 3)
  storageBandwidthMBps: number; // Storage read throughput (e.g. 2500 MB/s NVMe)
  avgBytesPerColumn: number; // Average width per column (e.g. 8 bytes)
}

export interface DataLayoutResult {
  rowScanBytesMB: number;
  columnarScanBytesMB: number;
  rowScanDurationMs: number;
  columnarScanDurationMs: number;
  speedupFactor: number;
  ioReductionPct: number;
  verdict: string;
}

export function calculateDataLayoutTradeoff(input: DataLayoutInput): DataLayoutResult {
  const { totalRows, totalColumns, queriedColumns, storageBandwidthMBps, avgBytesPerColumn } = input;
  
  // Row-oriented storage (slotted page):
  // Must scan all columns of all matching tuples or pages from disk.
  // 10% page header overhead.
  const rawRowBytes = totalRows * totalColumns * avgBytesPerColumn * 1.10;
  const rowScanMB = Math.round((rawRowBytes / (1024 * 1024)) * 10) / 10;

  // Columnar storage (Parquet / Arrow):
  // Reads only the requested column vectors.
  // Dictionary + RLE + Snappy/ZSTD compression reduces projected bytes by ~3.5x.
  const rawColBytes = totalRows * queriedColumns * avgBytesPerColumn;
  const compressionRatio = 3.5;
  const colScanMB = Math.round(((rawColBytes / compressionRatio) / (1024 * 1024)) * 10) / 10;

  const rowDurationMs = Math.round((rowScanMB / storageBandwidthMBps) * 1000 * 10) / 10;
  const colDurationMs = Math.round((colScanMB / storageBandwidthMBps) * 1000 * 10) / 10;

  const speedup = Math.max(1, Math.round((rowDurationMs / Math.max(0.01, colDurationMs)) * 10) / 10);
  const ioReduction = Math.min(99.9, Math.round(((rowScanMB - colScanMB) / rowScanMB) * 100 * 10) / 10);

  const verdict = queriedColumns <= totalColumns * 0.35
    ? `Columnar format achieves ${speedup}x scan speedup by eliminating ${(100 - Math.round((queriedColumns / totalColumns) * 100))}% unread tuple columns from NVMe bus transfer.`
    : `Wide analytical projection (${queriedColumns}/${totalColumns} cols). Columnar still benefits from compression, but row-oriented format may avoid column stitch overhead if updating single records.`;

  return {
    rowScanBytesMB: rowScanMB,
    columnarScanBytesMB: colScanMB,
    rowScanDurationMs: rowDurationMs,
    columnarScanDurationMs: colDurationMs,
    speedupFactor: speedup,
    ioReductionPct: ioReduction,
    verdict,
  };
}
