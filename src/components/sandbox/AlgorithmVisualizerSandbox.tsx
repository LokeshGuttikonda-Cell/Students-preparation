'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type VisualizerAlgorithm =
  | 'BINARY_SEARCH'
  | 'TWO_POINTER_SUM'
  | 'STACK_DELIMITERS'
  | 'SLIDING_WINDOW'
  | 'BUBBLE_SORT'
  | 'GRAPH_BFS_TRAVERSAL'
  | 'GRAPH_DFS_TRAVERSAL'
  | 'BST_INSERTION_INORDER'
  | 'AVL_TREE_ROTATIONS'
  | 'RED_BLACK_TREE'
  | 'B_TREE_SPLIT'
  | 'B_PLUS_TREE_RANGE_SCAN'
  | 'BLOOM_FILTER_HASHING'
  | 'TRIE_PREFIX_TREE'
  | 'INVERTED_INDEX_BM25'
  | 'POSTING_SKIP_LIST_ELIAS_FANO'
  | 'COLUMNAR_VECTORIZED_ENGINE'
  | 'QUERY_COST_OPTIMIZER_CBO';

export type StorageLayoutMode = 'ROW_ORIENTED_NSM' | 'COLUMN_ORIENTED_DSM';
export type ExecutionEngineMode = 'VOLCANO_ITERATOR' | 'VECTORIZED_SIMD';
export type ColumnCompressionMode = 'UNCOMPRESSED' | 'RLE_COMPRESSED' | 'DICTIONARY_COMPRESSED';

export interface ColumnarOrderRecord {
  rowId: number;
  orderId: number;
  customerId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  discount: number;
  netRevenue?: number;
}

export interface ColumnVector {
  name: string;
  type: string;
  isProjected: boolean;
  isFiltered: boolean;
  values: Array<string | number>;
  compressedRepresentation?: string;
  compressionRatio?: string;
  memoryBytes: number;
}

export interface RowPageSlot {
  slotId: number;
  rowId: number;
  tupleBytes: string;
  isProjected: boolean;
  isStatusMatch: boolean;
}

export interface RowPage {
  pageId: number;
  slots: RowPageSlot[];
  totalPageBytes: number;
}

export interface RleRunItem {
  value: string;
  count: number;
}

export interface DictionaryItem {
  code: number;
  value: string;
}

export interface SelectionVectorBit {
  index: number;
  rowId: number;
  bit: 0 | 1;
  status: string;
  isInspected?: boolean;
}


export type QueryPlanId = 'PLAN_A_NAIVE_NLJ' | 'PLAN_B_FILTER_HASH' | 'PLAN_C_SYSTEM_R_DP_MERGE';

export interface PlanOperatorNode {
  id: string;
  name: string;
  type: 'SCAN' | 'FILTER' | 'HASH_JOIN' | 'NESTED_LOOP' | 'SORT_MERGE' | 'PROJECT';
  relation?: string;
  predicate?: string;
  outputCardinality: number;
  inputCardinality?: number;
  cost: number;
  ioCost: number;
  cpuCost: number;
  operatorCost: number;
  memoryMb: number;
  pipelined: boolean;
  interestingOrder?: string;
  depth: number;
}

export interface CandidateQueryPlan {
  id: QueryPlanId;
  name: string;
  strategy: string;
  totalCost: number;
  totalPageIo: number;
  totalTuplesProcessed: number;
  totalOperatorCalls: number;
  estimatedRuntimeMs: number;
  memoryFootprintMb: number;
  joinTreeShape: 'LEFT_DEEP' | 'CARTESIAN_CROSS' | 'INTERESTING_ORDER_PIPELINED';
  operatorNodes: PlanOperatorNode[];
  advantages: string[];
  disadvantages: string[];
}

export interface SystemRSearchStage {
  level: number;
  title: string;
  subsetsEvaluated: string[];
  optimalSubplan: string;
  prunedSubplans: string[];
  cost: number;
  cardinality: number;
  order: string;
}

export interface TargetRelationCatalog {
  name: string;
  alias: string;
  cardinality: number;
  pages: number;
  filterPredicate?: string;
  filterSelectivity?: number;
  indexes: string[];
}

export interface VisualizerOptimizerState {
  activePlanId: QueryPlanId;
  sqlQuery: string;
  targetRelations: TargetRelationCatalog[];
  activePlan: CandidateQueryPlan;
  allPlans: CandidateQueryPlan[];
  systemRStages?: SystemRSearchStage[];
  costFormulaWeights: {
    wIo: number;
    wCpu: number;
    wOp: number;
  };
  banner?: {
    type: 'SETUP' | 'NAIVE_WARNING' | 'PUSHDOWN_IMPACT' | 'OPERATOR_SELECT' | 'DP_PRUNING' | 'INTERESTING_ORDER' | 'SUMMARY';
    title: string;
    description: string;
  };
  metrics?: {
    estimatedTotalCost: string;
    speedupVsNaive: string;
    pageIoTransferred: string;
    memoryRequired: string;
    joinAlgorithm: string;
  };
}

export interface VisualizerColumnarState {
  storageLayout: StorageLayoutMode;
  executionEngine: ExecutionEngineMode;
  compression: ColumnCompressionMode;
  querySql: string;
  rows: ColumnarOrderRecord[];
  rowPages: RowPage[];
  columns: ColumnVector[];
  selectionVector: SelectionVectorBit[];
  activeIndices?: number[];
  rleRuns?: RleRunItem[];
  dictionary?: DictionaryItem[];
  dictEncodedIndices?: number[];
  volcanoCalls?: number;
  vectorizedCalls?: number;
  memoryScannedBytes?: number;
  cacheMisses?: number;
  banner?: {
    type: 'SETUP' | 'NSM_WASTE' | 'DSM_EFFICIENCY' | 'COMPRESSION_SAVINGS' | 'VOLCANO_OVERHEAD' | 'SIMD_SPEEDUP' | 'SUMMARY';
    title: string;
    description: string;
  };
  metrics?: {
    storageModel: string;
    executionModel: string;
    memoryBandwidthScanned: string;
    virtualCalls: number;
    l1CacheMisses: number;
    simdVectorWidth: string;
  };
}

export interface InvertedIndexPosting {
  docId: string;
  tf: number;
}

export interface InvertedIndexTerm {
  term: string;
  df: number; // document frequency
  idf: number; // calculated IDF
  postings: InvertedIndexPosting[];
  isActive?: boolean;
  isIntersecting?: boolean;
}

export interface BM25DocScore {
  docId: string;
  docTitle: string;
  docLength: number;
  matchedTerms: string[];
  termScores: Record<string, { tf: number; idf: number; tfNorm: number; score: number }>;
  totalScore: number;
  rank: number;
}

export interface SkipBlock {
  blockIndex: number;
  startIndex: number;
  endIndex: number;
  skipDocId: number;
  docIds: number[];
  isSkipped?: boolean;
  isActive?: boolean;
  isInspected?: boolean;
}

export interface EliasFanoEncoding {
  universeU: number;
  m: number;
  lowBitsL: number;
  elements: Array<{
    docId: number;
    highBits: number;
    lowBits: number;
    lowBitsBinary: string;
    unaryGap: string;
  }>;
  lowBitsArray: string[];
  highBitsVector: string;
  totalBits: number;
  rawBits: number;
  compressionRatio: string;
}

export interface VisualizerPostingSkipState {
  postingListA: number[];
  postingListB: number[];
  skipBlocksA: SkipBlock[];
  activeStep?: {
    ptrA: number;
    ptrB: number;
    targetDocId: number;
    action: 'CHECK_SKIP' | 'SKIP_JUMP' | 'LINEAR_SCAN' | 'MATCH' | 'ADVANCE';
    skipJumpCount: number;
    linearScanCount: number;
  };
  matchedDocIds: number[];
  eliasFano?: EliasFanoEncoding;
  banner?: {
    type: 'SKIP_JUMP' | 'MATCH' | 'ELIAS_FANO_ENCODED' | 'SUMMARY';
    title: string;
    description: string;
  };
}

export interface VisualizerInvertedIndexState {
  corpus: Array<{ id: string; title: string; text: string; length: number }>;
  avgdl: number;
  terms: InvertedIndexTerm[];
  activeQuery?: string;
  queryType?: 'BOOLEAN_AND' | 'BOOLEAN_OR' | 'BM25_RANKED' | 'KEYWORD_STUFFING_DEFENSE';
  twoPointerState?: {
    term1: string;
    term2: string;
    ptr1: number;
    ptr2: number;
    matchedDocIds: string[];
  };
  rankedResults?: BM25DocScore[];
  k1: number;
  b: number;
  banner?: {
    type: 'INDEX_BUILT' | 'INTERSECTION_MATCH' | 'BM25_RANKING' | 'ANTI_STUFFING';
    title: string;
    description: string;
  };
}

export interface VisualizerTrieNode {
  id: string;
  char: string;
  fullPrefix: string;
  isEndOfWord: boolean;
  x: number;
  y: number;
  children?: string[];
  isCompressed?: boolean;
  status?: 'IDLE' | 'ACTIVE' | 'MATCHED' | 'MISMATCH' | 'AUTOCOMPLETE_MATCH';
}

export interface VisualizerTrieState {
  isRadixMode?: boolean;
  nodes: VisualizerTrieNode[];
  edges: Array<{
    from: string;
    to: string;
    label: string;
    isActive?: boolean;
    isCompressed?: boolean;
  }>;
  activeQuery?: string;
  matchedPrefix?: string;
  operation: 'INITIAL' | 'INSERT' | 'SEARCH' | 'AUTOCOMPLETE' | 'RADIX_COMPRESS';
  registeredWords: string[];
  autocompleteSuggestions?: string[];
  metrics: {
    totalNodes: number;
    wordCount: number;
    longestPrefixLength: number;
    compressionRatio?: string;
  };
  banner?: {
    type: 'SEARCH_HIT' | 'SEARCH_MISS' | 'PREFIX_MATCH' | 'RADIX_COMPRESSION';
    title: string;
    description: string;
  };
}

export interface VisualizerBloomFilterState {
  bitArraySize: number;
  bits: number[];
  activeBits?: number[];
  collidedBits?: number[];
  operation: 'INITIAL' | 'INSERT' | 'QUERY';
  targetKey?: string;
  hashComputations?: Array<{
    name: string;
    formula: string;
    bitIndex: number;
    bitValue: number;
  }>;
  insertedKeys: Array<{
    key: string;
    indices: number[];
  }>;
  queryResult?: {
    isPositive: boolean;
    isFalsePositive?: boolean;
    reason: string;
  };
  filterMetrics: {
    bitsSet: number;
    saturation: number;
    theoreticalFpr: number;
    elementsCount: number;
  };
}

export interface VisualizerBTreeNode {
  id: string;
  keys: number[];
  x: number;
  y: number;
  children?: string[]; // IDs of child nodes
  nodeType?: 'ROUTER' | 'LEAF';
  isFull?: boolean;
  isOverflow?: boolean;
  isElevating?: boolean;
  activeKeyVal?: number;
  highlightedKeys?: number[];
}

export interface VisualizerBTreeState {
  order: number; // e.g. 4 (2-3-4 tree or order-4 B+ tree)
  isBPlusTree?: boolean;
  nodes: VisualizerBTreeNode[];
  activeNodeId?: string;
  targetKey?: number;
  promotedKey?: number;
  treeHeight: number;
  siblingLinks?: Array<{ from: string; to: string; active?: boolean }>;
  rangeQuery?: {
    min: number;
    max: number;
    currentKey?: number;
    results: number[];
    isTerminated?: boolean;
  };
  pageReads?: number;
  splitBanner?: {
    type: 'LEAF_SPLIT' | 'ROOT_SPLIT' | 'MEDIAN_ELEVATION' | 'RANGE_HOP' | 'RANGE_MATCH';
    title: string;
    description: string;
  };
}

export interface VisualizerGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface VisualizerGraphEdge {
  from: string;
  to: string;
  directed?: boolean;
}

export interface VisualizerGraphState {
  nodes: VisualizerGraphNode[];
  edges: VisualizerGraphEdge[];
  visitedNodes: string[];
  activeNodeId?: string;
  frontierQueue?: string[];
  frontierLabel?: string;
  traversalOrder: string[];
  activeEdge?: { from: string; to: string };
}

export interface VisualizerTreeNode {
  id: string;
  val: number;
  x: number;
  y: number;
  left?: string;
  right?: string;
  isNew?: boolean;
  balanceFactor?: number;
  height?: number;
  isImbalanced?: boolean;
  isPivot?: boolean;
  color?: 'RED' | 'BLACK';
  blackHeight?: number;
  recolorWarning?: boolean;
}

export interface VisualizerTreeRotationBanner {
  type: 'LL' | 'RR' | 'LR' | 'RL' | 'RECOLOR' | 'ROTATION';
  title: string;
  description: string;
  pivotVal?: number;
}

export interface VisualizerTreeState {
  nodes: VisualizerTreeNode[];
  activeNodeId?: string;
  comparedNodeId?: string;
  targetVal?: number;
  traversalOrder?: number[];
  traversalLabel?: string;
  rotationBanner?: VisualizerTreeRotationBanner;
}

interface StepFrame {
  stepIndex: number;
  title: string;
  explanation: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'MISMATCH' | 'COMPLETE';
  // Algorithm-specific state snapshots
  array?: number[];
  activeIndices?: number[];
  pointers?: Record<string, number>;
  eliminatedRange?: [number, number]; // start and end indices eliminated
  stack?: string[];
  windowRange?: [number, number];
  graphState?: VisualizerGraphState;
  treeState?: VisualizerTreeState;
  bTreeState?: VisualizerBTreeState;
  bloomFilterState?: VisualizerBloomFilterState;
  trieState?: VisualizerTrieState;
  invertedIndexState?: VisualizerInvertedIndexState;
  postingSkipState?: VisualizerPostingSkipState;
  columnarState?: VisualizerColumnarState;
  optimizerState?: VisualizerOptimizerState;
  metrics?: Record<string, string | number | undefined>;
}

interface AlgorithmConfig {
  id: VisualizerAlgorithm;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  generateFrames: () => StepFrame[];
}


// ==========================================
// SESSION 68: QUERY OPTIMIZATION CBO DATA MODELS
// ==========================================

const TARGET_RELATION_CATALOG: TargetRelationCatalog[] = [
  {
    name: 'Customers',
    alias: 'c',
    cardinality: 100000,
    pages: 2000,
    filterPredicate: "c.tier = 'VIP'",
    filterSelectivity: 0.01,
    indexes: ['PRIMARY KEY (id)', 'INDEX (tier)'],
  },
  {
    name: 'Orders',
    alias: 'o',
    cardinality: 1000000,
    pages: 25000,
    filterPredicate: "o.total_amount > 500",
    filterSelectivity: 0.05,
    indexes: ['PRIMARY KEY (customer_id, id)', 'INDEX (total_amount)'],
  },
  {
    name: 'LineItems',
    alias: 'l',
    cardinality: 5000000,
    pages: 125000,
    indexes: ['PRIMARY KEY (order_id, item_id)'],
  },
];

const PLAN_A_NAIVE_NLJ: CandidateQueryPlan = {
  id: 'PLAN_A_NAIVE_NLJ',
  name: 'Plan A: Naive Unoptimized (Cartesian / Late Filter Nested Loop Join)',
  strategy: 'Late Filter + Cartesian Nested Loop Join (Full Table Scans)',
  totalCost: 20400000,
  totalPageIo: 20152000,
  totalTuplesProcessed: 605100000,
  totalOperatorCalls: 20000000,
  estimatedRuntimeMs: 180000, // ~3 minutes
  memoryFootprintMb: 12.0,
  joinTreeShape: 'CARTESIAN_CROSS',
  advantages: ['Zero compilation overhead', 'No catalog statistics needed'],
  disadvantages: [
    '20,152,000 Page I/Os completely thrashes buffer pool',
    'Cartesian product generates 100,000,000 intermediate pairs before filtering',
    'Runs for ~3 minutes on a simple 3-table analytical query',
  ],
  operatorNodes: [
    {
      id: 'n1',
      name: 'Physical Plan Root: Project [c.name, o.order_date, l.product, l.quantity, l.price]',
      type: 'PROJECT',
      outputCardinality: 2500,
      inputCardinality: 2500,
      cost: 20400000,
      ioCost: 20152000,
      cpuCost: 248000,
      operatorCost: 0,
      memoryMb: 1.0,
      pipelined: true,
      depth: 0,
    },
    {
      id: 'n2',
      name: "Late Filter: WHERE c.tier = 'VIP' AND o.total_amount > 500",
      type: 'FILTER',
      predicate: "c.tier = 'VIP' AND o.total_amount > 500",
      outputCardinality: 2500,
      inputCardinality: 500000000,
      cost: 20380000,
      ioCost: 20152000,
      cpuCost: 228000,
      operatorCost: 0,
      memoryMb: 2.0,
      pipelined: true,
      depth: 1,
    },
    {
      id: 'n3',
      name: 'Nested Loop Join: LineItems ON o.id = l.order_id',
      type: 'NESTED_LOOP',
      predicate: 'o.id = l.order_id',
      outputCardinality: 500000000,
      inputCardinality: 100000000,
      cost: 20160000,
      ioCost: 20027000,
      cpuCost: 133000,
      operatorCost: 0,
      memoryMb: 4.0,
      pipelined: false,
      depth: 2,
    },
    {
      id: 'n4',
      name: 'Cartesian Nested Loop Join: Customers CROSS JOIN Orders',
      type: 'NESTED_LOOP',
      predicate: 'c.id = o.customer_id',
      outputCardinality: 100000000,
      inputCardinality: 100000,
      cost: 20025000,
      ioCost: 20025000,
      cpuCost: 0,
      operatorCost: 0,
      memoryMb: 8.0,
      pipelined: false,
      depth: 3,
    },
    {
      id: 'n5',
      name: 'Seq Scan Customers (Full Table Scan)',
      type: 'SCAN',
      relation: 'Customers',
      outputCardinality: 100000,
      cost: 2000,
      ioCost: 2000,
      cpuCost: 100,
      operatorCost: 0,
      memoryMb: 1.0,
      pipelined: true,
      depth: 4,
    },
    {
      id: 'n6',
      name: 'Seq Scan Orders (Repeated Inner Scan 100,000 times)',
      type: 'SCAN',
      relation: 'Orders',
      outputCardinality: 1000000,
      cost: 20000000,
      ioCost: 20000000,
      cpuCost: 1000,
      operatorCost: 0,
      memoryMb: 4.0,
      pipelined: true,
      depth: 4,
    },
    {
      id: 'n7',
      name: 'Seq Scan LineItems (Repeated Inner Scan for Joined Tuples)',
      type: 'SCAN',
      relation: 'LineItems',
      outputCardinality: 5000000,
      cost: 125000,
      ioCost: 125000,
      cpuCost: 5000,
      operatorCost: 0,
      memoryMb: 4.0,
      pipelined: true,
      depth: 3,
    },
  ],
};

const PLAN_B_FILTER_HASH: CandidateQueryPlan = {
  id: 'PLAN_B_FILTER_HASH',
  name: 'Plan B: Predicate Pushdown + In-Memory Grace Hash Join',
  strategy: 'Filter Pushdown to Scans + Hash Join on Filtered Relations',
  totalCost: 12400,
  totalPageIo: 152000,
  totalTuplesProcessed: 5051000,
  totalOperatorCalls: 51500,
  estimatedRuntimeMs: 110,
  memoryFootprintMb: 4.8,
  joinTreeShape: 'LEFT_DEEP',
  advantages: [
    'Pushes filters below joins, slashing Customers by 99% and Orders by 95%',
    'In-memory hash table on 1,000 VIP customers takes only 64 KB RAM',
    '1,650x faster than Naive Plan A (110ms vs 180s)',
  ],
  disadvantages: [
    'Requires full sequential scan of LineItems (125,000 pages)',
    'Hash tables require dynamic memory allocation and hash collision management',
    'Cannot exploit physical index sort orders',
  ],
  operatorNodes: [
    {
      id: 'nb1',
      name: 'Physical Plan Root: Project [c.name, o.order_date, l.product, l.quantity, l.price]',
      type: 'PROJECT',
      outputCardinality: 2500,
      inputCardinality: 2500,
      cost: 12400,
      ioCost: 152000,
      cpuCost: 5100,
      operatorCost: 7300,
      memoryMb: 1.0,
      pipelined: true,
      depth: 0,
    },
    {
      id: 'nb2',
      name: 'Hash Join: Probe LineItems ON o.id = l.order_id',
      type: 'HASH_JOIN',
      predicate: 'o.id = l.order_id',
      outputCardinality: 2500,
      inputCardinality: 5000000,
      cost: 12150,
      ioCost: 152000,
      cpuCost: 5000,
      operatorCost: 7150,
      memoryMb: 3.5,
      pipelined: false,
      depth: 1,
    },
    {
      id: 'nb3',
      name: 'Hash Join: Build Customers (VIP), Probe Orders ON c.id = o.customer_id',
      type: 'HASH_JOIN',
      predicate: 'c.id = o.customer_id',
      outputCardinality: 500,
      inputCardinality: 50000,
      cost: 2200,
      ioCost: 27000,
      cpuCost: 100,
      operatorCost: 2100,
      memoryMb: 1.3,
      pipelined: false,
      depth: 2,
    },
    {
      id: 'nb4',
      name: "Filter Predicate: c.tier = 'VIP' (Selectivity 0.01 -> 1,000 rows)",
      type: 'FILTER',
      relation: 'Customers',
      predicate: "c.tier = 'VIP'",
      outputCardinality: 1000,
      inputCardinality: 100000,
      cost: 2100,
      ioCost: 2000,
      cpuCost: 100,
      operatorCost: 0,
      memoryMb: 0.1,
      pipelined: true,
      depth: 3,
    },
    {
      id: 'nb5',
      name: 'Seq Scan Customers (2,000 Pages)',
      type: 'SCAN',
      relation: 'Customers',
      outputCardinality: 100000,
      cost: 2000,
      ioCost: 2000,
      cpuCost: 0,
      operatorCost: 0,
      memoryMb: 0.5,
      pipelined: true,
      depth: 4,
    },
    {
      id: 'nb6',
      name: 'Filter Predicate: o.total_amount > 500 (Selectivity 0.05 -> 50,000 rows)',
      type: 'FILTER',
      relation: 'Orders',
      predicate: 'o.total_amount > 500',
      outputCardinality: 50000,
      inputCardinality: 1000000,
      cost: 26000,
      ioCost: 25000,
      cpuCost: 1000,
      operatorCost: 0,
      memoryMb: 0.2,
      pipelined: true,
      depth: 3,
    },
    {
      id: 'nb7',
      name: 'Seq Scan Orders (25,000 Pages)',
      type: 'SCAN',
      relation: 'Orders',
      outputCardinality: 1000000,
      cost: 25000,
      ioCost: 25000,
      cpuCost: 0,
      operatorCost: 0,
      memoryMb: 1.0,
      pipelined: true,
      depth: 4,
    },
    {
      id: 'nb8',
      name: 'Seq Scan LineItems (125,000 Pages)',
      type: 'SCAN',
      relation: 'LineItems',
      outputCardinality: 5000000,
      cost: 125000,
      ioCost: 125000,
      cpuCost: 0,
      operatorCost: 0,
      memoryMb: 2.0,
      pipelined: true,
      depth: 2,
    },
  ],
};

const PLAN_C_SYSTEM_R_DP_MERGE: CandidateQueryPlan = {
  id: 'PLAN_C_SYSTEM_R_DP_MERGE',
  name: 'Plan C: System R Dynamic Programming Optimal (Sort-Merge + Clustered Index Pipelining)',
  strategy: 'System R Left-Deep DP Tree + Clustered Index Sort-Merge Join (Interesting Orders)',
  totalCost: 3880,
  totalPageIo: 1790,
  totalTuplesProcessed: 4000,
  totalOperatorCalls: 4000,
  estimatedRuntimeMs: 12,
  memoryFootprintMb: 0.4,
  joinTreeShape: 'INTERESTING_ORDER_PIPELINED',
  advantages: [
    'Zero intermediate materialization or hash tables - pure Volcano streaming pipeline',
    'Exploits Clustered B+Tree index order (Interesting Order on join keys) for Sort-Merge Join',
    'Index seeks prune LineItems from 125,000 pages to only 500 pages (99.6% I/O reduction)',
    '5,250x faster than Naive Plan A, 9.2x faster than Plan B',
  ],
  disadvantages: [
    'Requires clustered composite B+Tree indexes on join keys',
    'Dynamic programming optimizer search space evaluation overhead (1.2 ms compilation)',
  ],
  operatorNodes: [
    {
      id: 'nc1',
      name: 'Physical Plan Root: Project [c.name, o.order_date, l.product, l.quantity, l.price]',
      type: 'PROJECT',
      outputCardinality: 2500,
      inputCardinality: 2500,
      cost: 3880,
      ioCost: 1790,
      cpuCost: 40,
      operatorCost: 2050,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'c.id, o.id ASC',
      depth: 0,
    },
    {
      id: 'nc2',
      name: 'Merge Join: Pipelined Stream ON o.id = l.order_id (Zero-Sort Merge)',
      type: 'SORT_MERGE',
      predicate: 'o.id = l.order_id',
      outputCardinality: 2500,
      inputCardinality: 3000,
      cost: 3820,
      ioCost: 1790,
      cpuCost: 30,
      operatorCost: 2000,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'o.id ASC',
      depth: 1,
    },
    {
      id: 'nc3',
      name: 'Merge Join: Clustered Stream ON c.id = o.customer_id (Zero-Sort Merge)',
      type: 'SORT_MERGE',
      predicate: 'c.id = o.customer_id',
      outputCardinality: 500,
      inputCardinality: 1500,
      cost: 3250,
      ioCost: 1290,
      cpuCost: 10,
      operatorCost: 1950,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'c.id ASC',
      depth: 2,
    },
    {
      id: 'nc4',
      name: "Index Range Scan: Customers (PK id, filter tier = 'VIP')",
      type: 'SCAN',
      relation: 'Customers',
      predicate: "c.tier = 'VIP'",
      outputCardinality: 1000,
      cost: 45,
      ioCost: 40,
      cpuCost: 5,
      operatorCost: 0,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'c.id ASC',
      depth: 3,
    },
    {
      id: 'nc5',
      name: 'Clustered Index Seek: Orders (customer_id, id; filter total_amount > 500)',
      type: 'SCAN',
      relation: 'Orders',
      predicate: 'o.total_amount > 500',
      outputCardinality: 500,
      cost: 1450,
      ioCost: 1250,
      cpuCost: 20,
      operatorCost: 180,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'customer_id, id ASC',
      depth: 3,
    },
    {
      id: 'nc6',
      name: 'Clustered Index Seek: LineItems (order_id, item_id)',
      type: 'SCAN',
      relation: 'LineItems',
      predicate: 'l.order_id = o.id',
      outputCardinality: 2500,
      cost: 550,
      ioCost: 500,
      cpuCost: 10,
      operatorCost: 40,
      memoryMb: 0.1,
      pipelined: true,
      interestingOrder: 'order_id ASC',
      depth: 2,
    },
  ],
};

const SYSTEM_R_STAGES: SystemRSearchStage[] = [
  {
    level: 1,
    title: 'Stage 1: Single-Relation Access Path Selection (k = 1)',
    subsetsEvaluated: ['{Customers}', '{Orders}', '{LineItems}'],
    optimalSubplan: 'Customers: IndexScan(tier) [40 I/Os], Orders: ClusteredIndex(customer_id) [1,250 I/Os], LineItems: ClusteredIndex(order_id) [500 I/Os]',
    prunedSubplans: ['Full Table Scan Customers (2,000 I/Os)', 'Full Table Scan Orders (25,000 I/Os)', 'Full Table Scan LineItems (125,000 I/Os)'],
    cost: 1790,
    cardinality: 4000,
    order: 'c.id ASC, o.id ASC, l.order_id ASC',
  },
  {
    level: 2,
    title: 'Stage 2: Two-Relation Subsets Join Enumeration (k = 2)',
    subsetsEvaluated: ['{Customers, Orders}', '{Orders, LineItems}', '{Customers, LineItems}'],
    optimalSubplan: '{Customers} ⋈ {Orders} via Sort-Merge Join on c.id = o.customer_id (Interesting Order preserved)',
    prunedSubplans: [
      '{Customers, LineItems} pruned (Cartesian cross-product, no join predicate)',
      '{Customers} ⋈ {Orders} via Nested Loops (cost 20.0M pruned)',
      '{Customers} ⋈ {Orders} via Grace Hash Join (cost 2.2K with materialization pruned in favor of pipelined merge)',
    ],
    cost: 3250,
    cardinality: 500,
    order: 'c.id, o.id ASC (Interesting Order)',
  },
  {
    level: 3,
    title: 'Stage 3: Optimal Left-Deep Tree Formulation (k = 3)',
    subsetsEvaluated: ['({Customers, Orders}) ⋈ LineItems', '({Orders, LineItems}) ⋈ Customers'],
    optimalSubplan: '({Customers ⋈ Orders}) ⋈ LineItems via Pipelined Zero-Sort Merge Join',
    prunedSubplans: [
      'Bushy Tree (Customers ⋈ Orders) ⋈ (LineItems ⋈ ...) - pruned to enforce left-deep pipelining',
      'Hash Join probing 5M unindexed LineItems - pruned (cost 12.4K vs 3.8K)',
    ],
    cost: 3880,
    cardinality: 2500,
    order: 'c.id, o.id, l.order_id ASC',
  },
];

const ALGORITHM_CONFIGS: AlgorithmConfig[] = [
  {
    id: 'BINARY_SEARCH',
    name: 'Binary Search (Logarithmic Range Elimination)',
    category: 'Search & Divide-and-Conquer',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    description:
      'Search for a target value in a sorted array by repeatedly dividing the search interval in half. At each step, comparing the middle element allows eliminating half the remaining candidate values.',
    generateFrames: () => {
      const arr = [4, 9, 15, 23, 38, 47, 56, 68, 79, 88, 95];
      const target = 68;
      return [
        {
          stepIndex: 0,
          title: 'Initial State: Full Search Interval',
          explanation: `Initializing pointers: low = 0 (value ${arr[0]}), high = 10 (value ${arr[10]}). Middle index mid = floor((0 + 10) / 2) = 5 (value ${arr[5]}). Comparing arr[mid] (${arr[5]}) with target (${target}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 0, mid: 5, high: 10 },
          activeIndices: [5],
          metrics: { Target: target, 'arr[mid]': arr[5], Subarray: '[0..10]' },
        },
        {
          stepIndex: 1,
          title: 'Eliminate Left Half: 47 < 68',
          explanation: `Because array is sorted and arr[mid] (47) < target (68), the target cannot exist at indices 0 through 5. We discard the left half and advance low = mid + 1 = 6. New mid = floor((6 + 10) / 2) = 8 (value ${arr[8]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 6, mid: 8, high: 10 },
          eliminatedRange: [0, 5],
          activeIndices: [8],
          metrics: { Target: target, 'arr[mid]': arr[8], Subarray: '[6..10]' },
        },
        {
          stepIndex: 2,
          title: 'Eliminate Right Half: 79 > 68',
          explanation: `arr[mid] (79) > target (68). The target cannot exist at indices 8 through 10. We discard the right partition and decrement high = mid - 1 = 7. New mid = floor((6 + 7) / 2) = 6 (value ${arr[6]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 6, mid: 6, high: 7 },
          eliminatedRange: [8, 10],
          activeIndices: [6],
          metrics: { Target: target, 'arr[mid]': arr[6], Subarray: '[6..7]' },
        },
        {
          stepIndex: 3,
          title: 'Narrow Interval: 56 < 68',
          explanation: `arr[mid] (56) < target (68). Advance low = mid + 1 = 7. Now low = 7, high = 7. Mid index mid = floor((7 + 7) / 2) = 7 (value ${arr[7]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 7, mid: 7, high: 7 },
          eliminatedRange: [0, 6],
          activeIndices: [7],
          metrics: { Target: target, 'arr[mid]': arr[7], Subarray: '[7..7]' },
        },
        {
          stepIndex: 4,
          title: 'Target Element Located!',
          explanation: `arr[mid] (${arr[7]}) strictly equals target (${target})! Binary search terminates successfully at index 7 in only 4 iterations (well within log2(11) ≈ 3.45).`,
          status: 'SUCCESS',
          array: [...arr],
          pointers: { low: 7, mid: 7, high: 7 },
          activeIndices: [7],
          metrics: { 'Target Found At': 'Index 7', Iterations: '4', Result: 'SUCCESS' },
        },
      ];
    },
  },
  {
    id: 'TWO_POINTER_SUM',
    name: 'Two-Pointer Target Sum Traversal',
    category: 'Two-Pointer Linear Scan',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    description:
      'Given a sorted array and a target sum, position two pointers at the boundaries (left at start, right at end) and move them inward based on whether the current sum is less than or greater than the target.',
    generateFrames: () => {
      const arr = [2, 5, 8, 12, 17, 23, 31, 40];
      const target = 25;
      return [
        {
          stepIndex: 0,
          title: 'Initial Extremes: left = 0, right = 7',
          explanation: `left = index 0 (value 2), right = index 7 (value 40). Current sum = 2 + 40 = 42. Since 42 > target (25), we must decrease the sum by moving right pointer inward: right = right - 1.`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { left: 0, right: 7 },
          activeIndices: [0, 7],
          metrics: { Target: target, 'arr[left]': 2, 'arr[right]': 40, 'Current Sum': 42 },
        },
        {
          stepIndex: 1,
          title: 'Decrement Right: right = 6',
          explanation: `left = 0 (2), right = 6 (31). Current sum = 2 + 31 = 33. Since 33 > target (25), decrement right again: right = 5.`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { left: 0, right: 6 },
          activeIndices: [0, 6],
          metrics: { Target: target, 'arr[left]': 2, 'arr[right]': 31, 'Current Sum': 33 },
        },
        {
          stepIndex: 2,
          title: 'Complementary Pair Found!',
          explanation: `left = 0 (2), right = 5 (23). Current sum = 2 + 23 = 25, which matches target (25) exactly! Pair found at indices (0, 5) with zero auxiliary memory.`,
          status: 'SUCCESS',
          array: [...arr],
          pointers: { left: 0, right: 5 },
          activeIndices: [0, 5],
          metrics: { Target: target, 'Found Pair': 'arr[0] + arr[5] = 25', Result: 'SUCCESS' },
        },
      ];
    },
  },
  {
    id: 'STACK_DELIMITERS',
    name: 'Stack Delimiter & Parentheses Validator',
    category: 'Stack LIFO Grammar Evaluation',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    description:
      'Verify whether nested brackets in a string are syntactically valid by pushing opening brackets onto a LIFO stack and popping them when matching closing brackets are encountered.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Start: Empty Stack, Scan char "{"',
          explanation: 'Stack is empty. Encountered opening bracket "{". Push "{" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{'],
          metrics: { 'Current Char': '{', StackSize: 1, Action: 'PUSH' },
        },
        {
          stepIndex: 1,
          title: 'Scan char "[": Nested Opening Bracket',
          explanation: 'Encountered opening bracket "[". Push "[" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '['],
          metrics: { 'Current Char': '[', StackSize: 2, Action: 'PUSH' },
        },
        {
          stepIndex: 2,
          title: 'Scan char "(": Deep Nested Opening Bracket',
          explanation: 'Encountered opening bracket "(". Push "(" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '[', '('],
          metrics: { 'Current Char': '(', StackSize: 3, Action: 'PUSH' },
        },
        {
          stepIndex: 3,
          title: 'Scan char ")": Pop Matching "("',
          explanation: 'Encountered closing bracket ")". Stack top is "(". They match! Pop "(" from stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '['],
          metrics: { 'Current Char': ')', 'Matched Bracket': '()', Action: 'POP' },
        },
        {
          stepIndex: 4,
          title: 'Scan char "]": Pop Matching "["',
          explanation: 'Encountered closing bracket "]". Stack top is "[". They match! Pop "[" from stack.',
          status: 'IN_PROGRESS',
          stack: ['{'],
          metrics: { 'Current Char': ']', 'Matched Bracket': '[]', Action: 'POP' },
        },
        {
          stepIndex: 5,
          title: 'Scan char "}": Pop Matching "{"',
          explanation: 'Encountered closing bracket "}". Stack top is "{". They match! Pop "{" from stack.',
          status: 'IN_PROGRESS',
          stack: [],
          metrics: { 'Current Char': '}', 'Matched Bracket': '{}', Action: 'POP' },
        },
        {
          stepIndex: 6,
          title: 'Validation Complete: Perfectly Balanced!',
          explanation: 'String scanning completed and stack is completely empty. All nested syntactic scopes are balanced and valid.',
          status: 'SUCCESS',
          stack: [],
          metrics: { 'Stack Empty': 'YES', Status: 'SYNTACTICALLY_VALID' },
        },
      ];
    },
  },
  {
    id: 'SLIDING_WINDOW',
    name: 'Fixed Sliding Window Maximum Subarray (K = 3)',
    category: 'Sliding Window Optimization',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    description:
      'Find the maximum contiguous subarray sum of fixed window size K = 3 in linear time by adding the incoming element and subtracting the outgoing element, avoiding O(N*K) recomputations.',
    generateFrames: () => {
      const arr = [2, 1, 5, 1, 3, 2];
      return [
        {
          stepIndex: 0,
          title: 'Initial Window: [0..2] -> [2, 1, 5]',
          explanation: 'Calculate base sum of first K = 3 elements: 2 + 1 + 5 = 8. Initialize maxSum = 8.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [0, 2],
          activeIndices: [0, 1, 2],
          metrics: { 'Window Elements': '[2, 1, 5]', 'Window Sum': 8, 'Max Sum So Far': 8 },
        },
        {
          stepIndex: 1,
          title: 'Slide Window: [1..3] -> [1, 5, 1]',
          explanation: 'Slide window right: subtract outgoing element arr[0] (2), add incoming element arr[3] (1). New sum = 8 - 2 + 1 = 7. Since 7 < 8, maxSum remains 8.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [1, 3],
          activeIndices: [1, 2, 3],
          metrics: { 'Subtracted (out)': 2, 'Added (in)': 1, 'Window Sum': 7, 'Max Sum': 8 },
        },
        {
          stepIndex: 2,
          title: 'Slide Window: [2..4] -> [5, 1, 3] (New Optimal!)',
          explanation: 'Slide right: subtract arr[1] (1), add arr[4] (3). New sum = 7 - 1 + 3 = 9. Since 9 > 8, update maxSum = 9!',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [2, 4],
          activeIndices: [2, 3, 4],
          metrics: { 'Subtracted (out)': 1, 'Added (in)': 3, 'Window Sum': 9, 'Max Sum': 9 },
        },
        {
          stepIndex: 3,
          title: 'Slide Window: [3..5] -> [1, 3, 2]',
          explanation: 'Slide right: subtract arr[2] (5), add arr[5] (2). New sum = 9 - 5 + 2 = 6. Since 6 < 9, maxSum remains 9.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [3, 5],
          activeIndices: [3, 4, 5],
          metrics: { 'Subtracted (out)': 5, 'Added (in)': 2, 'Window Sum': 6, 'Max Sum': 9 },
        },
        {
          stepIndex: 4,
          title: 'Traversal Complete: Maximum Window Sum = 9',
          explanation: 'Sliding window scan terminated across full array in O(N) linear time. Optimal window is [2..4] containing elements [5, 1, 3] with max sum 9.',
          status: 'COMPLETE',
          array: [...arr],
          windowRange: [2, 4],
          activeIndices: [2, 3, 4],
          metrics: { 'Optimal Window': '[2..4] (5, 1, 3)', 'Max Sum': 9, Runtime: 'O(N)' },
        },
      ];
    },
  },
  {
    id: 'BUBBLE_SORT',
    name: 'Bubble Sort Invariant Stepper',
    category: 'Sorting & Invariants',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    description:
      'Observe adjacent element pair comparisons and swaps. At the end of each pass, the largest remaining unsorted element bubbles up to its final sorted position at the end of the array.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Pass 1, Compare indices [0, 1]: 64 > 25 (Swap Required)',
          explanation: 'Comparing 64 and 25. Because 64 > 25, swap them so the larger element bubbles rightward.',
          status: 'IN_PROGRESS',
          array: [25, 64, 12, 22, 11],
          activeIndices: [0, 1],
          metrics: { Comparison: '64 > 25', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 1,
          title: 'Pass 1, Compare indices [1, 2]: 64 > 12 (Swap Required)',
          explanation: 'Comparing 64 and 12. Because 64 > 12, swap them.',
          status: 'IN_PROGRESS',
          array: [25, 12, 64, 22, 11],
          activeIndices: [1, 2],
          metrics: { Comparison: '64 > 12', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 2,
          title: 'Pass 1, Compare indices [2, 3]: 64 > 22 (Swap Required)',
          explanation: 'Comparing 64 and 22. Swap them.',
          status: 'IN_PROGRESS',
          array: [25, 12, 22, 64, 11],
          activeIndices: [2, 3],
          metrics: { Comparison: '64 > 22', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 3,
          title: 'Pass 1, Compare indices [3, 4]: 64 > 11 (Swap Required)',
          explanation: 'Comparing 64 and 11. Swap them. Element 64 has reached its final sorted position at index 4!',
          status: 'IN_PROGRESS',
          array: [25, 12, 22, 11, 64],
          activeIndices: [3, 4],
          metrics: { Comparison: '64 > 11', Action: 'SWAP', 'Sorted Partition': '[4] (64)' },
        },
        {
          stepIndex: 4,
          title: 'Pass 2-4 Completed: Array Fully Sorted',
          explanation: 'Following successive passes, smaller elements bubble leftward. Final sorted array: [11, 12, 22, 25, 64].',
          status: 'COMPLETE',
          array: [11, 12, 22, 25, 64],
          activeIndices: [0, 1, 2, 3, 4],
          metrics: { Status: 'SORTED', Array: '[11, 12, 22, 25, 64]', Complexity: 'O(N²)' },
        },
      ];
    },
  },
  {
    id: 'GRAPH_BFS_TRAVERSAL',
    name: 'Breadth-First Search (Queue Frontier & Shortest Paths)',
    category: 'Graphs & Networks',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
      'Explore vertices level-by-level using a FIFO queue. In unweighted graphs, BFS is guaranteed to discover the shortest hop-count path from the source vertex to any reachable destination.',
    generateFrames: () => {
      const nodes: VisualizerGraphNode[] = [
        { id: 'A', label: 'A', x: 60, y: 100 },
        { id: 'B', label: 'B', x: 160, y: 40 },
        { id: 'C', label: 'C', x: 160, y: 160 },
        { id: 'D', label: 'D', x: 270, y: 40 },
        { id: 'E', label: 'E', x: 270, y: 160 },
        { id: 'F', label: 'F', x: 370, y: 100 },
      ];
      const edges: VisualizerGraphEdge[] = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'B', to: 'E' },
        { from: 'C', to: 'E' },
        { from: 'D', to: 'F' },
        { from: 'E', to: 'F' },
      ];

      return [
        {
          stepIndex: 0,
          title: 'BFS Initialization: Enqueue Source Vertex A',
          explanation:
            'Initialize BFS with source node A at hop distance 0. Node A is pushed to the FIFO exploration queue. Visited set = {}, Queue = [A].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: [],
            activeNodeId: 'A',
            frontierQueue: ['A'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: [],
          },
          metrics: {
            'Current Level': '0',
            'Queue Length': 1,
            'Visited Count': '0 / 6',
          },
        },
        {
          stepIndex: 1,
          title: 'Dequeue A: Discover Neighbors B and C (Hop 1)',
          explanation:
            'A is dequeued and marked visited. Adjacent unvisited nodes B and C are discovered and enqueued to the FIFO queue frontier at distance 1. Visited = {A}, Queue = [B, C].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A'],
            activeNodeId: 'A',
            frontierQueue: ['B', 'C'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A'],
          },
          metrics: {
            'Current Level': '1',
            'Queue Length': 2,
            'Visited Count': '1 / 6',
          },
        },
        {
          stepIndex: 2,
          title: 'Dequeue B: Discover Neighbors D and E (Hop 2)',
          explanation:
            'B is dequeued from front of queue and marked visited. B inspects neighbors: D and E are unvisited. Both are enqueued. Queue = [C, D, E]. Traversal order: A → B.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B'],
            activeNodeId: 'B',
            frontierQueue: ['C', 'D', 'E'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B'],
          },
          metrics: {
            'Current Level': '1 → 2',
            'Queue Length': 3,
            'Visited Count': '2 / 6',
          },
        },
        {
          stepIndex: 3,
          title: 'Dequeue C: Inspect Neighbor E (Already Enqueued)',
          explanation:
            'C is dequeued and marked visited. C inspects neighbor E, but E is already in the frontier queue (discovered via B). No new nodes added. Queue = [D, E]. Traversal order: A → B → C.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C'],
            activeNodeId: 'C',
            frontierQueue: ['D', 'E'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C'],
          },
          metrics: {
            'Current Level': '1 Completed',
            'Queue Length': 2,
            'Visited Count': '3 / 6',
          },
        },
        {
          stepIndex: 4,
          title: 'Dequeue D: Discover Target F (Hop 3)',
          explanation:
            'D is dequeued and marked visited. D inspects unvisited neighbor F (the destination node!). F is enqueued at hop distance 3. Queue = [E, F]. Traversal order: A → B → C → D.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D'],
            activeNodeId: 'D',
            frontierQueue: ['E', 'F'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D'],
          },
          metrics: {
            'Current Level': '2 → 3',
            'Queue Length': 2,
            'Visited Count': '4 / 6',
          },
        },
        {
          stepIndex: 5,
          title: 'Dequeue E: Inspect Neighbor F (Already Enqueued)',
          explanation:
            'E is dequeued and marked visited. E checks its edges: F is already in the queue. No new nodes added. Queue = [F]. Traversal order: A → B → C → D → E.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D', 'E'],
            activeNodeId: 'E',
            frontierQueue: ['F'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D', 'E'],
          },
          metrics: {
            'Current Level': '2 Completed',
            'Queue Length': 1,
            'Visited Count': '5 / 6',
          },
        },
        {
          stepIndex: 6,
          title: 'Dequeue F: Destination Reached & BFS Completed',
          explanation:
            'F is dequeued and marked visited! Destination reached with minimum hop count = 3. All reachable nodes visited. Queue is empty. Full traversal sequence: A → B → C → D → E → F.',
          status: 'SUCCESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'],
            activeNodeId: 'F',
            frontierQueue: [],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D', 'E', 'F'],
          },
          metrics: {
            'Shortest Path Hops': 3,
            'Queue Length': 0,
            'Visited Count': '6 / 6 (100%)',
          },
        },
      ];
    },
  },
  {
    id: 'GRAPH_DFS_TRAVERSAL',
    name: 'Depth-First Search (Recursive Backtracking & Call Stack)',
    category: 'Graphs & Networks',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
      'Traverse directed graph branches to maximum depth before backtracking using a LIFO call stack. Essential for cycle detection, topological sorting, and strongly connected components.',
    generateFrames: () => {
      const nodes: VisualizerGraphNode[] = [
        { id: '1', label: '1', x: 60, y: 100 },
        { id: '2', label: '2', x: 160, y: 40 },
        { id: '3', label: '3', x: 160, y: 160 },
        { id: '4', label: '4', x: 270, y: 40 },
        { id: '5', label: '5', x: 270, y: 160 },
      ];
      const edges: VisualizerGraphEdge[] = [
        { from: '1', to: '2', directed: true },
        { from: '1', to: '3', directed: true },
        { from: '2', to: '4', directed: true },
        { from: '3', to: '5', directed: true },
        { from: '4', to: '5', directed: true },
      ];

      return [
        {
          stepIndex: 0,
          title: 'DFS Invocation: Push Node 1 to Call Stack',
          explanation:
            'Begin DFS traversal at root vertex 1. Node 1 is pushed onto the recursion call stack. Call Stack = [1]. Visited = [1].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1'],
            activeNodeId: '1',
            frontierQueue: ['1'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1'],
          },
          metrics: { 'Call Depth': 1, 'Top of Stack': '1', Visited: '1 / 5' },
        },
        {
          stepIndex: 1,
          title: 'Explore Edge (1 → 2): Descend to Node 2',
          explanation:
            'Node 1 investigates outgoing edges. First unvisited neighbor is 2. Recursive call dfs(2) invoked. Push 2 onto stack. Call Stack = [1, 2].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2'],
            activeNodeId: '2',
            frontierQueue: ['1', '2'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2'],
            activeEdge: { from: '1', to: '2' },
          },
          metrics: { 'Call Depth': 2, 'Top of Stack': '2', Visited: '2 / 5' },
        },
        {
          stepIndex: 2,
          title: 'Explore Edge (2 → 4): Descend to Node 4',
          explanation:
            'Node 2 investigates outgoing edge (2 → 4). Node 4 is unvisited. Recursive call dfs(4) invoked. Push 4 onto stack. Call Stack = [1, 2, 4].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4'],
            activeNodeId: '4',
            frontierQueue: ['1', '2', '4'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4'],
            activeEdge: { from: '2', to: '4' },
          },
          metrics: { 'Call Depth': 3, 'Top of Stack': '4', Visited: '3 / 5' },
        },
        {
          stepIndex: 3,
          title: 'Explore Edge (4 → 5): Deepest Vertex Reached',
          explanation:
            'Node 4 follows directed edge to node 5. Recursive call dfs(5) invoked. Push 5 onto stack. Call Stack = [1, 2, 4, 5]. Node 5 has no unvisited outgoing edges (sink node).',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5'],
            activeNodeId: '5',
            frontierQueue: ['1', '2', '4', '5'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5'],
            activeEdge: { from: '4', to: '5' },
          },
          metrics: { 'Call Depth': 4, 'Top of Stack': '5', Visited: '4 / 5' },
        },
        {
          stepIndex: 4,
          title: 'Backtrack: Pop 5, Pop 4, Pop 2 → Return to Node 1',
          explanation:
            'dfs(5), dfs(4), and dfs(2) complete their loops with all outgoing edges explored. Stack unwinds: pop 5, pop 4, pop 2. Control returns to node 1 at recursion root.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5'],
            activeNodeId: '1',
            frontierQueue: ['1'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5'],
          },
          metrics: { 'Call Depth': 1, 'Top of Stack': '1', Status: 'Backtracked' },
        },
        {
          stepIndex: 5,
          title: 'Explore Edge (1 → 3): Branch into Node 3',
          explanation:
            'Node 1 now inspects its second outgoing edge (1 → 3). Node 3 is unvisited. Recursive call dfs(3) invoked. Push 3 onto stack. Call Stack = [1, 3].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5', '3'],
            activeNodeId: '3',
            frontierQueue: ['1', '3'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5', '3'],
            activeEdge: { from: '1', to: '3' },
          },
          metrics: { 'Call Depth': 2, 'Top of Stack': '3', Visited: '5 / 5' },
        },
        {
          stepIndex: 6,
          title: 'Cross-Edge (3 → 5) & DFS Traversal Complete',
          explanation:
            'Node 3 checks edge (3 → 5): Node 5 is already marked visited (cross-edge detected; no cycle). dfs(3) returns, pop 3. dfs(1) returns, pop 1. Entire graph traversed!',
          status: 'SUCCESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5', '3'],
            activeNodeId: '1',
            frontierQueue: [],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5', '3'],
          },
          metrics: { 'Call Depth': 0, 'Stack Size': 0, Visited: '5 / 5 (100%)' },
        },
      ];
    },
  },
  {
    id: 'BST_INSERTION_INORDER',
    name: 'Binary Search Tree (Insertion & In-Order Sorted Walk)',
    category: 'Trees & Hierarchies',
    timeComplexity: 'Search/Insert: O(H), In-Order: O(N)',
    spaceComplexity: 'O(H)',
    description:
      'Insert key 25 into a balanced BST by comparing values down to a leaf position, preserving the BST invariant (Left < Root < Right), followed by an In-Order traversal that extracts all values in monotonically sorted ascending order.',
    generateFrames: () => {
      const baseNodes: VisualizerTreeNode[] = [
        { id: 'n40', val: 40, x: 200, y: 30, left: 'n20', right: 'n60' },
        { id: 'n20', val: 20, x: 110, y: 85, left: 'n10', right: 'n30' },
        { id: 'n60', val: 60, x: 290, y: 85, left: 'n50', right: 'n70' },
        { id: 'n10', val: 10, x: 65, y: 140 },
        { id: 'n30', val: 30, x: 155, y: 140 },
        { id: 'n50', val: 50, x: 245, y: 140 },
        { id: 'n70', val: 70, x: 335, y: 140 },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Insert Key 25: Compare with Root (40)',
          explanation:
            'Target key to insert: 25. Starting at root node 40. Comparison: 25 < 40. Because 25 is smaller than root, the BST invariant requires descending into the LEFT subtree.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n40',
            comparedNodeId: 'n40',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 40, Decision: '25 < 40 → Go Left' },
        },
        {
          stepIndex: 1,
          title: 'Compare with Node 20: 25 > 20 → Go Right',
          explanation:
            'Current node is 20. Comparison: 25 > 20. Because target key is strictly greater than 20, the BST invariant requires branching into the RIGHT subtree.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n20',
            comparedNodeId: 'n20',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 20, Decision: '25 > 20 → Go Right' },
        },
        {
          stepIndex: 2,
          title: 'Compare with Node 30: 25 < 30 → Check Left Child',
          explanation:
            'Current node is 30. Comparison: 25 < 30. BST rule dictates branching left. Inspecting node 30’s left child: pointer is NULL (empty slot found!).',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n30',
            comparedNodeId: 'n30',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 30, Decision: '30.left is null → Insert here' },
        },
        {
          stepIndex: 3,
          title: 'Node Inserted: 30.left = New Node(25)',
          explanation:
            'New node with key 25 is allocated and linked as the left child of 30. The binary search tree invariant (Left < Root < Right) is strictly preserved across all 8 nodes.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190, isNew: true },
            ],
            activeNodeId: 'n25',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { 'Inserted Key': 25, 'Parent Node': 30, 'Tree Size': '8 Nodes' },
        },
        {
          stepIndex: 4,
          title: 'In-Order Traversal: Traverse Left Subtree',
          explanation:
            'Initiate In-Order traversal (Left → Root → Right). Recursively visit leftmost leaves: 10, then parent 20, then right child’s left child 25, then parent 30. Accumulated: [10, 20, 25, 30].',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190 },
            ],
            activeNodeId: 'n30',
            traversalOrder: [10, 20, 25, 30],
            traversalLabel: 'In-Order Sorted Stream: Left Subtree',
          },
          metrics: { Visited: '4 / 8', 'Stream Output': '[10, 20, 25, 30]' },
        },
        {
          stepIndex: 5,
          title: 'In-Order Traversal Complete: Monotonically Ascending',
          explanation:
            'In-order visits Root (40), then right subtree (50, 60, 70). Resulting sequence: [10, 20, 25, 30, 40, 50, 60, 70]. In-Order walk on a BST produces a strictly sorted array in O(N) linear time!',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190 },
            ],
            traversalOrder: [10, 20, 25, 30, 40, 50, 60, 70],
            traversalLabel: 'In-Order Monotonically Sorted Sequence',
          },
          metrics: { 'Traversal Property': 'Strictly Ascending', 'Total Elements': 8, Complexity: 'O(N)' },
        },
      ];
    },
  },
  {
    id: 'AVL_TREE_ROTATIONS',
    name: 'Self-Balancing AVL Tree Rotations (Balance Factor Maintenance)',
    category: 'Self-Balancing Search Trees',
    timeComplexity: 'Lookup/Insert/Delete: O(log N), Rotation: O(1)',
    spaceComplexity: 'O(N) storage, O(log N) stack recursion',
    description:
      'Maintain the strict AVL balance invariant: for every node, the balance factor BF = height(left) - height(right) must satisfy BF ∈ {-1, 0, +1}. When an insertion causes |BF| ≥ 2, tree balance is restored in O(1) time using Single Right (LL), Single Left (RR), or Double (LR / RL) Rotations while preserving the BST ordering invariant.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial Balanced State: AVL Invariant Satisfied',
          explanation:
            'Every node in an AVL tree satisfies the strict height-balance invariant: Balance Factor BF = height(left) - height(right) ∈ {-1, 0, +1}. Root 50 has BF = 1 - 1 = 0. Children 25 and 75 have BF = 0. Tree height is 2, guaranteeing O(log N) worst-case search and mutation.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 0, height: 2 },
              { id: 'n25', val: 25, x: 120, y: 105, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n50',
          },
          metrics: { 'Tree State': 'Balanced AVL', 'Tree Height': 2, 'Root BF': 0, Invariant: '|BF| ≤ 1' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key 15: Single Left Descent',
          explanation:
            'Key 15 is smaller than 50 and smaller than 25, inserted as 25\'s left child. Post-insertion backtracking updates node heights: node 15 (h=1, BF=0), node 25 (h=2, BF=+1), root 50 (h=3, left h=2, right h=1 → BF=+1). All balance factors remain within {-1, 0, +1}. No rotation needed.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 1, height: 3 },
              { id: 'n25', val: 25, x: 120, y: 105, left: 'n15', balanceFactor: 1, height: 2 },
              { id: 'n15', val: 15, x: 70, y: 170, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n15',
            targetVal: 15,
          },
          metrics: { 'Inserted Key': 15, 'Node 25 BF': '+1', 'Root 50 BF': '+1', Status: 'Balanced' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key 10: Left-Left (LL) Heavy Imbalance Triggered!',
          explanation:
            'Key 10 is inserted as 15\'s left child. Recalculating heights: node 10 has h=1, BF=0. Node 15 has h=2, BF=+1. At node 25, left height is 2, right height is 0 → BF(25) = 2 - 0 = +2! Invariant violated (|BF| ≥ 2). Since BF(25) = +2 and BF(15) = +1 (both positive), this is a classic Left-Left (LL) case requiring a Single Right Rotation.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 2, height: 4 },
              { id: 'n25', val: 25, x: 120, y: 105, left: 'n15', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n15', val: 15, x: 70, y: 170, left: 'n10', balanceFactor: 1, height: 2 },
              { id: 'n10', val: 10, x: 35, y: 225, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n25',
            comparedNodeId: 'n15',
            targetVal: 10,
            rotationBanner: {
              type: 'LL',
              title: 'Single Right Rotation Required',
              description: 'BF(25) = +2 and BF(15) = +1 (LL pattern). Rotate node 15 to the right over pivot 25.',
              pivotVal: 25,
            },
          },
          metrics: { 'Violating Node': 25, 'Node 25 BF': '+2 (VIOLATION)', 'Case': 'Left-Left (LL)', Action: 'Rotate Right' },
        },
        {
          stepIndex: 3,
          title: 'Single Right Rotation Complete: Node 15 Elevated',
          explanation:
            'Right rotation around pivot 25 rebalances the subtree in O(1) pointer operations. Node 15 elevates to become root 50\'s left child. Node 25 becomes 15\'s right child, and node 10 remains 15\'s left child. Balance factors are restored: BF(10)=0, BF(25)=0, BF(15)=0. Root 50 BF drops from +2 to +1. In-order key ordering (10 < 15 < 25 < 50 < 75) is strictly preserved.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: 1, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n15',
            rotationBanner: {
              type: 'LL',
              title: 'Single Right Rotation Completed',
              description: 'Node 15 is new subtree root. BST invariant 10 < 15 < 25 < 50 < 75 preserved.',
              pivotVal: 15,
            },
          },
          metrics: { 'Subtree Root': 15, 'Node 15 BF': 0, 'Subtree Height': 2, 'Time Complexity': 'O(1)' },
        },
        {
          stepIndex: 4,
          title: 'Insert Key 85: Right Subtree Growth',
          explanation:
            'Key 85 is inserted as node 75\'s right child. Updating heights along the search path: node 85 (h=1, BF=0), node 75 (h=2, BF=-1). Root 50 now has left subtree height 2 (rooted at 15) and right subtree height 2 (rooted at 75) → BF(50) = 2 - 2 = 0. The entire tree is balanced.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, right: 'n85', balanceFactor: -1, height: 2 },
              { id: 'n85', val: 85, x: 350, y: 170, isNew: true, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n85',
            targetVal: 85,
          },
          metrics: { 'Inserted Key': 85, 'Node 75 BF': '-1', 'Root 50 BF': 0, Status: 'Balanced' },
        },
        {
          stepIndex: 5,
          title: 'Insert Key 95: Right-Right (RR) Heavy Imbalance Triggered!',
          explanation:
            'Key 95 is inserted as 85\'s right child. At node 75, left height is 0 and right height is 2, yielding BF(75) = 0 - 2 = -2! Balance invariant violated. Since BF(75) = -2 and child BF(85) = -1 (both negative), this is a classic Right-Right (RR) case requiring a Single Left Rotation.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: -1, height: 4 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, right: 'n85', isImbalanced: true, isPivot: true, balanceFactor: -2, height: 3 },
              { id: 'n85', val: 85, x: 350, y: 165, right: 'n95', balanceFactor: -1, height: 2 },
              { id: 'n95', val: 95, x: 385, y: 220, isNew: true, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n75',
            comparedNodeId: 'n85',
            targetVal: 95,
            rotationBanner: {
              type: 'RR',
              title: 'Single Left Rotation Required',
              description: 'BF(75) = -2 and BF(85) = -1 (RR pattern). Rotate node 85 to the left over pivot 75.',
              pivotVal: 75,
            },
          },
          metrics: { 'Violating Node': 75, 'Node 75 BF': '-2 (VIOLATION)', 'Case': 'Right-Right (RR)', Action: 'Rotate Left' },
        },
        {
          stepIndex: 6,
          title: 'Single Left Rotation Complete: Node 85 Elevated',
          explanation:
            'Left rotation around pivot 75 rebalances the subtree in O(1) time. Node 85 elevates to become root 50\'s right child. Node 75 becomes 85\'s left child, and node 95 remains 85\'s right child. Recalculated balance factors: BF(75)=0, BF(95)=0, BF(85)=0. Root 50 has left height 2, right height 2 → BF(50) = 0.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n85', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 300, y: 105, left: 'n75', right: 'n95', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 250, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 170, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n85',
            rotationBanner: {
              type: 'RR',
              title: 'Single Left Rotation Completed',
              description: 'Node 85 is new subtree root. BST order 50 < 75 < 85 < 95 preserved.',
              pivotVal: 85,
            },
          },
          metrics: { 'Subtree Root': 85, 'Node 85 BF': 0, 'Subtree Height': 2, 'Time Complexity': 'O(1)' },
        },
        {
          stepIndex: 7,
          title: 'Insert Key 18: Inner Subtree Growth',
          explanation:
            'Target key 18 is inserted: 15 < 18 < 25, placing 18 as node 25\'s left child. Heights update: node 18 (h=1, BF=0), node 25 (h=2, BF=+1). Node 15 has left child 10 (h=1) and right child 25 (h=2) → BF(15) = 1 - 2 = -1. Tree remains balanced.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 4 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -1, height: 3 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n18', balanceFactor: 1, height: 2 },
              { id: 'n18', val: 18, x: 140, y: 190, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n18',
            targetVal: 18,
          },
          metrics: { 'Inserted Key': 18, 'Node 25 BF': '+1', 'Node 15 BF': '-1', Status: 'Balanced' },
        },
        {
          stepIndex: 8,
          title: 'Insert Key 19: Left-Right (LR) Opposite-Sign Imbalance!',
          explanation:
            'Key 19 is inserted as 18\'s right child (18 < 19 < 25). Height updates: node 18 has h=2, right=19 → BF(18) = 0 - 1 = -1. At node 25, left height is 2, right height is 0 → BF(25) = +2! Because BF(25) = +2 (positive) and child BF(18) = -1 (negative), signs conflict: this is a Left-Right (LR) "elbow" case! A single right rotation would fail; a Double Rotation is required.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 5 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -2, height: 4 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n18', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n18', val: 18, x: 140, y: 185, right: 'n19', balanceFactor: -1, height: 2 },
              { id: 'n19', val: 19, x: 175, y: 225, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n25',
            comparedNodeId: 'n18',
            targetVal: 19,
            rotationBanner: {
              type: 'LR',
              title: 'Double Rotation (LR Case) Required',
              description: 'BF(25) = +2 and child BF(18) = -1. Opposite signs require Phase 1 (Left Rotation on 18) then Phase 2 (Right Rotation on 25).',
              pivotVal: 25,
            },
          },
          metrics: { 'Violating Node': 25, 'Node 25 BF': '+2', 'Child 18 BF': '-1', Case: 'Left-Right (LR)' },
        },
        {
          stepIndex: 9,
          title: 'LR Phase 1: Left Rotate Child 18 (Straighten the Elbow)',
          explanation:
            'Phase 1 of Double Rotation: Perform a Left Rotation on child node 18. Node 19 rotates upward to become node 25\'s direct left child, while node 18 becomes node 19\'s left child. The zig-zag shape (25 → 18 → 19) is straightened into a linear left-heavy chain (25 → 19 → 18). Now BF(25) = +2 and BF(19) = +1: the LR case is transformed into an LL case!',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 5 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -2, height: 4 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n19', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n19', val: 19, x: 140, y: 185, left: 'n18', isPivot: true, balanceFactor: 1, height: 2 },
              { id: 'n18', val: 18, x: 115, y: 225, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n19',
            rotationBanner: {
              type: 'LR',
              title: 'Phase 1 Complete: Left Rotation on Node 18',
              description: 'Zig-zag straightened to linear chain 25 → 19 → 18. Case converted to LL.',
              pivotVal: 18,
            },
          },
          metrics: { 'Phase': '1 of 2 Complete', 'Transformed Case': 'Left-Left (LL)', 'Node 19 BF': '+1', 'Node 25 BF': '+2' },
        },
        {
          stepIndex: 10,
          title: 'LR Phase 2: Right Rotate Parent 25 (Balance Restored)',
          explanation:
            'Phase 2 of Double Rotation: Perform a Single Right Rotation on node 25 around pivot 19. Node 19 elevates to become node 15\'s right child. Node 18 remains 19\'s left child, and node 25 becomes 19\'s right child. Balance factors: BF(18)=0, BF(25)=0, BF(19)=0! Root 50 and node 15 heights and balance factors are perfectly restored. Total operations: O(1) pointer updates.',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n85', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 115, y: 95, left: 'n10', right: 'n19', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 65, y: 150, balanceFactor: 0, height: 1 },
              { id: 'n19', val: 19, x: 165, y: 150, left: 'n18', right: 'n25', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n18', val: 18, x: 135, y: 205, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 195, y: 205, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 95, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 150, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 150, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n19',
            rotationBanner: {
              type: 'LR',
              title: 'Double Rotation Complete: Balance Restored',
              description: 'Node 19 is now root of balanced subtree. All nodes satisfy |BF| ≤ 1.',
              pivotVal: 19,
            },
          },
          metrics: { 'Subtree Root': 19, 'Node 19 BF': 0, 'Subtree Height': 2, Status: 'Globally Balanced AVL' },
        },
      ];
    },
  },
  {
    id: 'RED_BLACK_TREE',
    name: 'Red-Black Tree Invariants (Node Recoloring & Rotations)',
    category: 'Self-Balancing Search Trees',
    timeComplexity: 'Lookup/Insert/Delete: O(log N), Max Rotations: O(1)',
    spaceComplexity: 'O(N) space, 1 bit per node color overhead',
    description:
      'Maintain the 5 canonical Red-Black tree invariants: (1) Every node is RED or BLACK, (2) Root is BLACK, (3) Leaves (NIL) are BLACK, (4) No two RED nodes can be adjacent (RED node cannot have RED child), and (5) Every simple path from any node to descendant leaves contains the exact same number of BLACK nodes (Black-Height invariant bh(x)). Violations are resolved in O(1) rotations and O(log N) recolorings.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial State: 5 Canonical Red-Black Invariants Satisfied',
          explanation:
            'A valid Red-Black Tree satisfies 5 invariants: 1. Nodes are RED or BLACK. 2. Root is BLACK (Node 20). 3. Leaves (NIL) are BLACK. 4. Red nodes cannot have Red children (No consecutive REDs). 5. All paths from root to leaves have equal Black-Height (bh = 2). Both 10 and 30 are BLACK.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n20',
          },
          metrics: { 'Tree State': 'Valid RB Tree', 'Black-Height (bh)': 2, 'Root Color': 'BLACK', Invariant: 'bh(x) Equal' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key 5: Inserted as RED Leaf',
          explanation:
            'New keys always insert as RED to avoid violating Invariant 5 (Black-Height). Key 5 is inserted as 10.left. Parent 10 is BLACK, so Invariant 4 (no consecutive REDs) is satisfied without modification.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, color: 'RED', isNew: true },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n5',
            targetVal: 5,
          },
          metrics: { 'Inserted Key': 5, Color: 'RED', 'Parent 10': 'BLACK', Status: 'Valid RB Tree' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key 15: Inserted as RED Leaf',
          explanation:
            'Key 15 is inserted as 10.right with color RED. Because parent 10 is BLACK, no consecutive RED violation occurs. All simple paths to leaves still pass through exactly 2 BLACK nodes (20 and 10).',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, color: 'RED' },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'RED', isNew: true },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n15',
            targetVal: 15,
          },
          metrics: { 'Inserted Key': 15, Color: 'RED', 'Parent 10': 'BLACK', Status: 'Valid RB Tree' },
        },
        {
          stepIndex: 3,
          title: 'Insert Key 2: Case 1 Triggered (Uncle 15 is RED)',
          explanation:
            'Key 2 is inserted as 5.left (RED). Violation: Node 2 is RED and parent 5 is RED (Consecutive RED nodes!). Uncle check: Grandparent 10 has right child 15, which is RED. Case 1 Rule: When uncle is RED, recolor parent (5) and uncle (15) to BLACK, and grandparent (10) to RED.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, left: 'n2', color: 'RED', recolorWarning: true },
              { id: 'n2', val: 2, x: 35, y: 225, color: 'RED', isNew: true, recolorWarning: true },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'RED' },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n2',
            comparedNodeId: 'n5',
            targetVal: 2,
            rotationBanner: {
              type: 'RECOLOR',
              title: 'Case 1: Uncle 15 is RED (Recolor)',
              description: 'Uncle 15 is RED. Recolor Parent 5 and Uncle 15 to BLACK. Recolor Grandparent 10 to RED.',
              pivotVal: 10,
            },
          },
          metrics: { 'Violating Nodes': '5 & 2 (RED-RED)', 'Uncle 15': 'RED', Case: 'Case 1 (Recolor)', Action: 'Flip Colors' },
        },
        {
          stepIndex: 4,
          title: 'Case 1 Complete: Colors Updated Without Rotations',
          explanation:
            'Parent 5 and Uncle 15 are recolored BLACK. Grandparent 10 is recolored RED. Root 20 is BLACK, so consecutive RED check passes. Notice: Case 1 requires 0 rotations! Black-Height along all paths through 10 is preserved.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 225, color: 'RED' },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n10',
            rotationBanner: {
              type: 'RECOLOR',
              title: 'Case 1 Recolor Applied Successfully',
              description: 'Nodes 5 & 15 recolored BLACK; Node 10 recolored RED. All invariants restored in O(1) time.',
              pivotVal: 10,
            },
          },
          metrics: { 'Parent 5': 'BLACK', 'Uncle 15': 'BLACK', 'Grandparent 10': 'RED', Rotations: 0 },
        },
        {
          stepIndex: 5,
          title: 'Insert Key 35 & 32: Case 2 Triggered (Uncle is NIL & RL Triangle)',
          explanation:
            'Key 35 is inserted as 30.right (RED). Then key 32 is inserted as 35.left (RED). Consecutive RED violation: 35 and 32 are both RED! Uncle check: Node 30.left is NIL (BLACK). Since 32 is an inner child (left child of right child), this is Case 2 (RL Triangle / Zig-Zag). Case 2 Rule: Right-rotate child 32 over parent 35 to straighten into a line.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 305, y: 85, right: 'n35', color: 'BLACK', blackHeight: 1 },
              { id: 'n35', val: 35, x: 355, y: 140, left: 'n32', color: 'RED', recolorWarning: true },
              { id: 'n32', val: 32, x: 325, y: 195, color: 'RED', isNew: true, recolorWarning: true },
            ],
            activeNodeId: 'n32',
            comparedNodeId: 'n35',
            targetVal: 32,
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 2: Uncle is NIL (BLACK) & RL Zig-Zag',
              description: 'Uncle is NIL (BLACK). Inner child 32 forms an RL triangle. Right-rotate parent 35 around pivot 32.',
              pivotVal: 35,
            },
          },
          metrics: { 'Violating Nodes': '35 & 32 (RED-RED)', 'Uncle 30.left': 'NIL (BLACK)', Case: 'Case 2 (RL Triangle)', Action: 'Rotate Right' },
        },
        {
          stepIndex: 6,
          title: 'Case 2 Complete: Converted to Case 3 (RR Linear Chain)',
          explanation:
            'Right rotation on node 35 around pivot 32 elevates 32 as 30\'s right child. Node 35 becomes 32\'s right child. The zig-zag (30 → 35 → 32) is straightened into a linear chain (30 → 32 → 35). Both 32 and 35 are RED. This is now Case 3 (Line Case)!',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 305, y: 85, right: 'n32', color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 355, y: 140, right: 'n35', color: 'RED', isPivot: true, recolorWarning: true },
              { id: 'n35', val: 35, x: 385, y: 195, color: 'RED', recolorWarning: true },
            ],
            activeNodeId: 'n32',
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 2 Complete: Converted to Case 3 (RR Line)',
              description: 'Elbow straightened into 30 → 32 → 35. Case 3 requires Left Rotation on Grandparent 30 and color swap.',
              pivotVal: 32,
            },
          },
          metrics: { 'Converted Case': 'Case 3 (RR Line)', 'Linear Chain': '30 → 32 → 35', Action: 'Left Rotate 30 & Swap Colors' },
        },
        {
          stepIndex: 7,
          title: 'Case 3 Applied: Left Rotate Grandparent 30 & Color Swap',
          explanation:
            'Left rotation on grandparent 30 around pivot 32 elevates 32 to replace 30. Color Swap: Elevating node 32 is recolored BLACK; former grandparent 30 is recolored RED. Node 35 remains RED. Both children of 32 (30 and 35) are RED, but parent 32 is BLACK. Invariant 4 satisfied!',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n32', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 305, y: 85, left: 'n30', right: 'n35', color: 'BLACK', isPivot: true, blackHeight: 1 },
              { id: 'n30', val: 30, x: 265, y: 140, color: 'RED' },
              { id: 'n35', val: 35, x: 355, y: 140, color: 'RED' },
            ],
            activeNodeId: 'n32',
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 3 Complete: Balanced Red-Black Subtree',
              description: 'Left rotation elevated 32 to BLACK. Node 30 swapped to RED. Invariants 4 and 5 fully satisfied!',
              pivotVal: 32,
            },
          },
          metrics: { 'Subtree Root': 32, 'Node 32 Color': 'BLACK', 'Left Child 30': 'RED', 'Right Child 35': 'RED' },
        },
        {
          stepIndex: 8,
          title: 'Global Verification: All 5 Red-Black Invariants Proven',
          explanation:
            'Final verification of the 5 canonical invariants: 1. Nodes are RED or BLACK (5 Black, 3 Red). 2. Root 20 is BLACK. 3. Leaves (NIL) are BLACK. 4. No consecutive RED nodes (all Red nodes 10, 2, 30, 35 have Black parents). 5. All paths from root 20 to any NIL leaf pass through exactly 2 BLACK nodes (e.g. 20→10→5→NIL has 20 and 5; 20→32→30→NIL has 20 and 32). Height is bounded by 2 log(N+1).',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n32', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 305, y: 85, left: 'n30', right: 'n35', color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 265, y: 140, color: 'RED' },
              { id: 'n35', val: 35, x: 355, y: 140, color: 'RED' },
            ],
            activeNodeId: 'n20',
          },
          metrics: { 'Total Nodes': 8, 'Black-Height (bh)': 2, 'Consecutive REDs': '0 (None)', Status: 'Globally Valid RB Tree' },
        },
      ];
    },
  },
  {
    id: 'B_TREE_SPLIT',
    name: 'B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation',
    category: 'External Memory & Multi-Way Trees',
    timeComplexity: 'Search/Insert/Delete: O(log_B N) disk block I/Os, Node split: O(B)',
    spaceComplexity: 'O(N) keys, minimum 50% storage occupancy guarantee',
    description:
      'B-Trees and 2-3-4 trees (Order M=4) maintain perfect height balance for disk-oriented databases by allowing multi-key nodes. When an insertion exceeds node capacity (M-1 = 3 keys), a preemptive split promotes the median key upward. When the root splits, the tree height increases uniformly from the top down.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial State: Balanced 2-3-4 Multi-Way Tree (Order M=4)',
          explanation:
            'Tree order M = 4 (2-3-4 tree). Nodes contain between 1 and 3 keys (2-nodes, 3-nodes, or 4-nodes). Root node contains keys [20, 50] (a 3-node). Multi-way child intervals: Left [10] holds keys < 20; Middle [30, 40] holds keys in (20, 50); Right [60, 70, 80] holds keys > 50. Notice the Right child is already a full 4-node (3 keys). Tree height h = 1.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 80], x: 360, y: 170, isFull: true },
            ],
            activeNodeId: 'n_root',
          },
          metrics: { 'Tree Height (h)': 1, 'Order M': 4, 'Max Keys/Node': 3, Status: 'Balanced' },
        },
        {
          stepIndex: 1,
          title: 'Insertion Search: Traverse Multi-Way Range for Key 75',
          explanation:
            'Inserting key 75. Search starts at root [20, 50]. Compare 75 with root keys: 75 > 20 and 75 > 50. Following the right child pointer (keys > 50) leads to leaf node [60, 70, 80]. Active node selected: n_right.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 75,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 80], x: 360, y: 170, isFull: true },
            ],
            activeNodeId: 'n_right',
          },
          metrics: { 'Target Key': 75, 'Active Child': 'Right [60, 70, 80]', 'Key Comparison': '75 > 50' },
        },
        {
          stepIndex: 2,
          title: 'Node Overflow Detected: 4-Node Capacity Exceeded (4 Keys)',
          explanation:
            'Attempting to insert key 75 into node [60, 70, 80]. The resulting key set would be [60, 70, 75, 80] (4 keys). In order M=4, a node can hold at most M - 1 = 3 keys! An overflow condition has occurred. The node must split preemptively before the insert can proceed.',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 75,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 75, 80], x: 360, y: 170, isOverflow: true },
            ],
            activeNodeId: 'n_right',
            splitBanner: {
              type: 'LEAF_SPLIT',
              title: 'Node Overflow in Leaf',
              description: 'Node holds 4 keys [60, 70, 75, 80], exceeding max capacity of 3 keys.',
            },
          },
          metrics: { 'Node Keys': 4, 'Max Allowed': 3, Violation: 'Capacity Overflow', 'Action Required': 'Split Node' },
        },
        {
          stepIndex: 3,
          title: 'Preemptive Node Split: Median Key 70 Chosen for Promotion',
          explanation:
            'To resolve the overflow, the 4 keys [60, 70, 75, 80] are partitioned around the median key (index 1 = key 70). Key 70 is selected to elevate to the parent root. Keys lower than 70 ([60]) form the left sibling. Keys higher than 70 ([75, 80]) form the right sibling.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 70,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 75, 80], x: 360, y: 170, isElevating: true, highlightedKeys: [70] },
            ],
            activeNodeId: 'n_right',
            splitBanner: {
              type: 'MEDIAN_ELEVATION',
              title: 'Median Key 70 Selected',
              description: 'Partitioning into Left [60], Promoted Key 70, and Right [75, 80].',
            },
          },
          metrics: { 'Promoted Median': 70, 'Left Partition': '[60]', 'Right Partition': '[75, 80]' },
        },
        {
          stepIndex: 4,
          title: 'Elevation & Re-Hooking: Parent Absorbs 70, Siblings Created',
          explanation:
            'Median key 70 is inserted into parent root, which expands from [20, 50] to [20, 50, 70] (now a full 4-node). The overflowing leaf is replaced by two valid siblings: n_r1 [60] and n_r2 [75, 80]. All 4 leaves remain at exact depth 1! Perfect height balance maintained.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 70,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 160, y: 170 },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_root',
            splitBanner: {
              type: 'MEDIAN_ELEVATION',
              title: 'Leaf Split Complete',
              description: 'Root now holds [20, 50, 70]. Leaf nodes [60] and [75, 80] cleanly separated.',
            },
          },
          metrics: { 'Root Keys': '[20, 50, 70]', 'Total Leaves': 4, 'Leaf Depth': 'Uniform (1)', Status: 'Balanced' },
        },
        {
          stepIndex: 5,
          title: 'Next Insertion Search: Key 35 Traversal',
          explanation:
            'Now inserting key 35. Comparing with root keys [20, 50, 70]: 20 < 35 < 50. Key 35 falls between key 20 and key 50. Following child pointer 1 brings us to middle node [30, 40].',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 160, y: 170 },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
          },
          metrics: { 'Target Key': 35, 'Search Range': '20 < 35 < 50', 'Target Node': 'n_mid [30, 40]' },
        },
        {
          stepIndex: 6,
          title: 'Direct Leaf Insertion: Node [30, 40] Absorbs Key 35',
          explanation:
            'Node [30, 40] is a 3-node with capacity remaining (length 2 < 3). Key 35 is inserted in sorted sequence: [30, 35, 40]. The node is now a full 4-node. No split required! Insertion completes in O(1) leaf time.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 35, 40], x: 160, y: 170, isFull: true },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
          },
          metrics: { 'Inserted Key': 35, 'Node Status': '4-node (FULL)', 'Split Triggered': 'No (Within Capacity)' },
        },
        {
          stepIndex: 7,
          title: 'Third Insertion Search: Key 25 Traversal',
          explanation:
            'Next, inserting key 25. Compare with root [20, 50, 70]: 20 < 25 < 50. Traversal routes to node [30, 35, 40]. But node [30, 35, 40] is already full! Inserting 25 causes an overflow with 4 keys: [25, 30, 35, 40].',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 25,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [25, 30, 35, 40], x: 160, y: 170, isOverflow: true },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
            splitBanner: {
              type: 'LEAF_SPLIT',
              title: 'Middle Leaf Overflow',
              description: 'Keys [25, 30, 35, 40] exceed capacity. Median 35 must elevate.',
            },
          },
          metrics: { 'Target Key': 25, 'Overflow Node': 'n_mid', 'Median Key': 35, Issue: 'Parent Root is Full!' },
        },
        {
          stepIndex: 8,
          title: 'Cascading Overflow: Parent Root [20, 50, 70] is Also Full!',
          explanation:
            'Middle leaf partition yields: Left [25, 30], Median key 35, Right [40]. However, when key 35 tries to elevate into the parent root [20, 50, 70], the root is ALREADY FULL (3 keys)! The root itself would overflow to [20, 35, 50, 70]. In top-down 2-3-4 trees, the root MUST split preemptively!',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 35, 50, 70], x: 230, y: 50, isOverflow: true, children: ['n_left', 'n_mid', 'n_mid2', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [25, 30], x: 140, y: 170 },
              { id: 'n_mid2', keys: [40], x: 220, y: 170 },
              { id: 'n_r1', keys: [60], x: 300, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 400, y: 170 },
            ],
            activeNodeId: 'n_root',
            splitBanner: {
              type: 'ROOT_SPLIT',
              title: 'Root Node Overflows!',
              description: 'Root has 4 keys [20, 35, 50, 70]. Median 50 elevates to create a NEW root level.',
            },
          },
          metrics: { 'Root Keys': 4, 'Split Type': 'Root Split', 'New Root Key': 50, 'Height Growth': '+1' },
        },
        {
          stepIndex: 9,
          title: 'Root Split Complete: Tree Height Grows by +1 From the Top',
          explanation:
            'The root splits! Median key 50 elevates to form the NEW root [50] at level 0. The old root keys partition into two internal children: Left [20, 35] and Right [70] at level 1. All 5 leaves ([10], [25, 30], [40], [60], [75, 80]) reside at level 2. Tree height grows from h = 1 to h = 2 from the root up, guaranteeing that every single leaf remains at the exact same depth! This external memory property guarantees O(log_B N) worst-case disk I/Os.',
          status: 'COMPLETE',
          bTreeState: {
            order: 4,
            treeHeight: 2,
            promotedKey: 50,
            nodes: [
              { id: 'n_top_root', keys: [50], x: 230, y: 35, children: ['n_l1_left', 'n_l1_right'] },
              { id: 'n_l1_left', keys: [20, 35], x: 130, y: 110, children: ['n_leaf1', 'n_leaf2', 'n_leaf3'] },
              { id: 'n_l1_right', keys: [70], x: 330, y: 110, children: ['n_leaf4', 'n_leaf5'] },
              { id: 'n_leaf1', keys: [10], x: 50, y: 195 },
              { id: 'n_leaf2', keys: [25, 30], x: 135, y: 195 },
              { id: 'n_leaf3', keys: [40], x: 220, y: 195 },
              { id: 'n_leaf4', keys: [60], x: 300, y: 195 },
              { id: 'n_leaf5', keys: [75, 80], x: 390, y: 195 },
            ],
            activeNodeId: 'n_top_root',
            splitBanner: {
              type: 'ROOT_SPLIT',
              title: 'Global Balance Achieved: Height 2',
              description: 'Tree grew uniformly at root. All 5 leaf nodes reside at uniform depth 2.',
            },
          },
          metrics: { 'Tree Height (h)': 2, 'Root Key': '[50]', 'Total Leaves': 5, 'Leaf Depth': 'Uniform (Depth 2)', Status: 'Perfect Multi-Way Balance' },
        },
      ];
    },
  },
  {
    id: 'B_PLUS_TREE_RANGE_SCAN',
    name: 'B+ Tree Range Scan & Leaf Sibling Pointers',
    category: 'Database Indexing & External Memory',
    timeComplexity: 'Point: O(log_B N), Range: O(log_B N + K/B) I/Os',
    spaceComplexity: 'O(N) data in leaves, O(N/B) internal router keys',
    description:
      'In database storage engines, internal nodes store guidepost keys to route point lookups, while all records reside in leaves linked by horizontal sibling pointers. Range scans locate the starting leaf once via root traversal, then seamlessly hop along sibling pointers without repeatedly querying parent levels.',
    generateFrames: () => {
      const baseNodes: VisualizerBTreeNode[] = [
        {
          id: 'n_root',
          keys: [35, 70],
          x: 230,
          y: 60,
          nodeType: 'ROUTER',
          children: ['leaf_1', 'leaf_2', 'leaf_3'],
        },
        {
          id: 'leaf_1',
          keys: [10, 20],
          x: 75,
          y: 175,
          nodeType: 'LEAF',
        },
        {
          id: 'leaf_2',
          keys: [35, 50, 60],
          x: 230,
          y: 175,
          nodeType: 'LEAF',
        },
        {
          id: 'leaf_3',
          keys: [70, 85, 95],
          x: 385,
          y: 175,
          nodeType: 'LEAF',
        },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial B+ Tree Topology: Internal Routers & Sibling Chains',
          explanation:
            'In a B+ Tree, internal nodes act purely as router keys (guideposts), while 100% of actual data records reside in the leaf level. Furthermore, leaf pages are chained together via bidirectional sibling pointers. This enables point lookups in O(log_B N) and sequential range queries in O(log_B N + K/B) disk I/Os without re-querying the tree root.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 0,
          },
          metrics: { 'Query Range': '[25 .. 80]', 'Internal Index': '[35, 70]', 'Leaf Pages': 3, 'Page I/Os': 0 },
        },
        {
          stepIndex: 1,
          title: 'Initiate Range Query: Target Lower Bound 25',
          explanation:
            'Query requested: SELECT * WHERE key >= 25 AND key <= 80. To begin the range scan, the engine must perform ONE point lookup from the root to locate the starting leaf page containing keys >= 25.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'n_root',
            targetKey: 25,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 1,
          },
          metrics: { 'Query Range': '[25 .. 80]', 'Starting Key': 25, 'Active Node': 'Root [35, 70]', 'Page I/Os': 1 },
        },
        {
          stepIndex: 2,
          title: 'Root Routing Comparison: 25 < 35 Routes to Child 0',
          explanation:
            'Comparing target lower bound 25 with root separator keys [35, 70]. Since 25 < 35, the search engine follows left child pointer C0 down to leaf page L1. Only 1 disk I/O was consumed to route through the internal level.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'n_root',
            targetKey: 25,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 1,
          },
          metrics: { 'Separator Key': 35, Decision: '25 < 35 (Branch C0)', 'Next Hop': 'Leaf L1', 'Page I/Os': 1 },
        },
        {
          stepIndex: 3,
          title: 'Fetch First Leaf Page L1 [10, 20]: Search Lower Bound',
          explanation:
            'Leaf page L1 is fetched into the buffer pool (Page I/O: 2). Examining keys: 10 < 25 and 20 < 25. Neither key satisfies the range condition. The end of page L1 is reached without any matching keys.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_1',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, currentKey: 20, results: [] },
            pageReads: 2,
          },
          metrics: { 'Current Page': 'L1 [10, 20]', 'Keys Checked': '10, 20 (Both < 25)', 'Buffer Result': 'Empty', 'Page I/Os': 2 },
        },
        {
          stepIndex: 4,
          title: 'Horizontal Leaf Sibling Hop: L1 -> L2 (Zero Root Traversal!)',
          explanation:
            'Crucial B+ Tree Optimization: Instead of performing a costly new point search through the root for the next key, the iterator follows the horizontal sibling pointer directly from L1 to L2! This circumvents internal index navigation entirely.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: true },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_HOP',
              title: 'Horizontal Sibling Hop: L1 → L2',
              description: 'Followed leaf-level next pointer directly. Root index bypassed.',
            },
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 3,
          },
          metrics: { Navigation: 'Leaf Sibling Link (L1 -> L2)', 'Traversed Root?': 'No (Bypassed)', 'Page I/Os': 3 },
        },
        {
          stepIndex: 5,
          title: 'Leaf L2 Match: Key 35 Satisfies Predicate',
          explanation:
            'Page L2 is loaded into cache (Page I/O: 3). First key 35 is evaluated: 25 <= 35 <= 80 is TRUE! Key 35 is emitted into the Range Query Result Buffer.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 35,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 35',
              description: '25 <= 35 <= 80: Emitted record 35 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 35, results: [35] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 35, Condition: '25 <= 35 <= 80 (MATCH)', 'Result Count': 1, 'Page I/Os': 3 },
        },
        {
          stepIndex: 6,
          title: 'Leaf L2 Sequential Scan: Key 50 Satisfies Predicate',
          explanation:
            'The iterator advances sequentially to the next slot inside page L2: key 50. Condition 25 <= 50 <= 80 is TRUE! Key 50 is appended to the Result Buffer without any additional disk I/O (already in CPU buffer).',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 50,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35, 50] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 50',
              description: 'Sequential intra-page read: Emitted record 50 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 50, results: [35, 50] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 50, Condition: '25 <= 50 <= 80 (MATCH)', 'Result Count': 2, 'Page I/Os': 3 },
        },
        {
          stepIndex: 7,
          title: 'Leaf L2 Sequential Scan: Key 60 Satisfies Predicate',
          explanation:
            'Iterator advances to the final slot of page L2: key 60. Condition 25 <= 60 <= 80 is TRUE! Key 60 is emitted. Leaf page L2 is now exhausted.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 60,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35, 50, 60] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 60',
              description: 'End of page L2 reached: Emitted record 60 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 60, results: [35, 50, 60] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 60, Condition: '25 <= 60 <= 80 (MATCH)', 'Result Count': 3, 'Page L2 Status': 'Exhausted' },
        },
        {
          stepIndex: 8,
          title: 'Horizontal Leaf Sibling Hop: L2 -> L3',
          explanation:
            'To continue the scan, the iterator traverses the next sibling link L2 -> L3. Page L3 is fetched into the buffer pool (Page I/O: 4). Again, no root or parent node lookups are required!',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: true },
            ],
            splitBanner: {
              type: 'RANGE_HOP',
              title: 'Horizontal Sibling Hop: L2 → L3',
              description: 'Fetched next sequential page via leaf sibling pointer.',
            },
            rangeQuery: { min: 25, max: 80, results: [35, 50, 60] },
            pageReads: 4,
          },
          metrics: { Navigation: 'Leaf Sibling Link (L2 -> L3)', 'Active Page': 'L3 [70, 85, 95]', 'Page I/Os': 4 },
        },
        {
          stepIndex: 9,
          title: 'Leaf L3 Match: Key 70 Satisfies Predicate',
          explanation:
            'Inspecting first key of page L3: 70. Condition 25 <= 70 <= 80 is TRUE! Key 70 is emitted into the Result Buffer.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            targetKey: 70,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_3' ? { ...n, highlightedKeys: [70] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 70',
              description: '25 <= 70 <= 80: Emitted record 70 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 70, results: [35, 50, 60, 70] },
            pageReads: 4,
          },
          metrics: { 'Active Key': 70, Condition: '25 <= 70 <= 80 (MATCH)', 'Result Count': 4, 'Page I/Os': 4 },
        },
        {
          stepIndex: 10,
          title: 'Boundary Guard Exceeded: 85 > 80 Terminates Scan!',
          explanation:
            'Iterator advances to next key in L3: 85. Checking predicate: 85 <= 80 is FALSE (85 > 80)! Because leaves are strictly sorted, ALL subsequent keys in the database are guaranteed to be > 80. The range scan halts immediately!',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            targetKey: 85,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_3' ? { ...n, highlightedKeys: [70] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Boundary Guard Exceeded (85 > 80)',
              description: 'Predicate violated: 85 exceeds upper bound 80. Iterator terminates immediately.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 85, results: [35, 50, 60, 70], isTerminated: true },
            pageReads: 4,
          },
          metrics: { 'Key Evaluated': 85, 'Upper Bound': 80, Predicate: '85 > 80 (VIOLATED)', 'Scan Action': 'EARLY_HALT' },
        },
        {
          stepIndex: 11,
          title: 'Range Scan Complete: O(log_B N + K/B) I/O Invariant Proven',
          explanation:
            'Range scan complete! Emitted records: [35, 50, 60, 70]. Total disk pages fetched: 4 (1 root page + 3 leaf pages). Without leaf sibling links, a naive B-tree would require 4 independent point lookups (4 * 2 = 8 page I/Os). The B+ tree sibling chaining reduces I/O cost to O(log_B N + K/B), enabling massive high-throughput range scans in production storage engines.',
          status: 'COMPLETE',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2'
                ? { ...n, highlightedKeys: [35, 50, 60] }
                : n.id === 'leaf_3'
                ? { ...n, highlightedKeys: [70] }
                : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Range Scan Complete',
              description: 'Emitted 4 records with only 4 page reads. Optimal external memory efficiency.',
            },
            rangeQuery: { min: 25, max: 80, results: [35, 50, 60, 70], isTerminated: true },
            pageReads: 4,
          },
          metrics: { 'Total Emitted': 4, 'Total Page I/Os': 4, 'Naive B-Tree I/Os': 8, 'I/O Savings': '50% Disk Reduction', Status: 'COMPLETE' },
        },
      ];
    },
  },
  {
    id: 'BLOOM_FILTER_HASHING',
    name: 'Bloom Filter Bit-Array Hashing & False Positive Invariants',
    category: 'Probabilistic Data Structures & Distributed Caching',
    timeComplexity: 'Insert: O(k), Lookup: O(k) CPU ops',
    spaceComplexity: 'O(m) bits, independent of element key size',
    description:
      'Bloom filters are space-efficient probabilistic bit arrays used in distributed storage systems (LSM-trees, Cassandra, RocksDB, web proxies) to test set membership. They guarantee 0% false negatives (if a bit is 0, the item is definitely absent, avoiding disk seeks), while tolerating a tunable false positive rate p ≈ (1 - e^(-kn/m))^k.',
    generateFrames: () => {
      const emptyBits = Array(18).fill(0);
      const afterKey1 = [...emptyBits];
      [3, 7, 14].forEach((i) => (afterKey1[i] = 1));

      const afterKey2 = [...afterKey1];
      [7, 11, 15].forEach((i) => (afterKey2[i] = 1));

      const afterKey3 = [...afterKey2];
      [1, 14, 17].forEach((i) => (afterKey3[i] = 1));

      const registeredKeys = [
        { key: 'user:101', indices: [3, 7, 14] },
        { key: 'user:202', indices: [7, 11, 15] },
        { key: 'user:303', indices: [1, 14, 17] },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial State: Empty Bit Array & 3 Independent Hash Functions',
          explanation:
            'A Bloom filter consists of an m-bit array initialized to all zeros and k independent, uniformly distributed hash functions. Here, m = 18 bits and k = 3 (h1: MurmurHash3, h2: FNV-1a, h3: Jenkins). At saturation S = 0%, no elements have been registered.',
          status: 'IN_PROGRESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: emptyBits,
            operation: 'INITIAL',
            insertedKeys: [],
            filterMetrics: { bitsSet: 0, saturation: 0, theoreticalFpr: 0, elementsCount: 0 },
          },
          metrics: { 'Bit Array Size (m)': 18, 'Hash Count (k)': 3, 'Inserted Items (n)': 0, 'Bits Set': 0, 'Saturation': '0.0%', 'Theoretical FPR': '0.0%' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key "user:101": Compute 3 Hashes & Flip Bits',
          explanation:
            'Inserting key "user:101". The engine computes 3 independent hash functions modulo 18: h1("user:101") = 3, h2("user:101") = 7, h3("user:101") = 14. Bits at indices 3, 7, and 14 are flipped from 0 to 1. Total bits set = 3.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey1,
            activeBits: [3, 7, 14],
            operation: 'INSERT',
            targetKey: 'user:101',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:101") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:101") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:101") % 18', bitIndex: 14, bitValue: 1 },
            ],
            insertedKeys: [registeredKeys[0]],
            filterMetrics: { bitsSet: 3, saturation: 16.7, theoreticalFpr: 0.3, elementsCount: 1 },
          },
          metrics: { 'Inserted Key': '"user:101"', 'Flipped Bits': '[3, 7, 14]', 'Total Bits Set': 3, 'Saturation': '16.7%', 'Theoretical FPR': '0.3%' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key "user:202": Shared Bit Collision on Index 7',
          explanation:
            'Inserting key "user:202". Hash outputs: h1("user:202") = 7, h2("user:202") = 11, h3("user:202") = 15. Notice that bit 7 was ALREADY set to 1 by "user:101"! In Bloom filters, bit collisions are expected and idempotent—bit 7 remains 1, while bits 11 and 15 are flipped to 1.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey2,
            activeBits: [7, 11, 15],
            collidedBits: [7],
            operation: 'INSERT',
            targetKey: 'user:202',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:202") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:202") % 18', bitIndex: 11, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:202") % 18', bitIndex: 15, bitValue: 1 },
            ],
            insertedKeys: registeredKeys.slice(0, 2),
            filterMetrics: { bitsSet: 5, saturation: 27.8, theoreticalFpr: 1.8, elementsCount: 2 },
          },
          metrics: { 'Inserted Key': '"user:202"', 'Collided Bit': '7 (Shared with user:101)', 'New Bits Flipped': '[11, 15]', 'Total Bits Set': 5, 'Saturation': '27.8%', 'Theoretical FPR': '1.8%' },
        },
        {
          stepIndex: 3,
          title: 'Insert Key "user:303": Bit Array Saturation Increases',
          explanation:
            'Inserting key "user:303". Hashes: h1 = 1, h2 = 14, h3 = 17. Bit 14 was already 1 (set by "user:101"). Bits 1 and 17 are flipped to 1. The filter now holds 3 distinct elements across 7 set bits (saturation: 38.9%).',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [1, 14, 17],
            collidedBits: [14],
            operation: 'INSERT',
            targetKey: 'user:303',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:303") % 18', bitIndex: 1, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:303") % 18', bitIndex: 14, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:303") % 18', bitIndex: 17, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Inserted Key': '"user:303"', 'Collided Bit': '14 (Shared with user:101)', 'Total Keys (n)': 3, 'Total Bits Set': 7, 'Saturation': '38.9%', 'Theoretical FPR': '4.5%' },
        },
        {
          stepIndex: 4,
          title: 'Query Key "user:101": All Bits True -> Member Detected',
          explanation:
            'Querying membership for "user:101". Hashes evaluated: h1 = 3, h2 = 7, h3 = 14. Probing bit array: B[3] = 1, B[7] = 1, B[14] = 1. Since ALL k bits are 1, the filter returns POSITIVE ("Probably in set"). The system proceeds to retrieve the user profile from cache/memory.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [3, 7, 14],
            operation: 'QUERY',
            targetKey: 'user:101',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:101") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:101") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:101") % 18', bitIndex: 14, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: true,
              isFalsePositive: false,
              reason: 'All 3 probed bits (B[3], B[7], B[14]) are 1. True member match confirmed.',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:101"', 'Probed Bits': 'B[3]=1, B[7]=1, B[14]=1', 'Query Result': 'POSITIVE (True Member)', 'Disk I/O Needed': 'Yes (Expected)' },
        },
        {
          stepIndex: 5,
          title: 'Query Key "user:999": Bit 4 is 0 -> Definite Non-Member (Zero False Negatives!)',
          explanation:
            'Querying non-existent key "user:999". Hashes: h1 = 4, h2 = 7, h3 = 12. Probing bit array: B[4] = 0! Because every member inserted MUST have its bits set to 1, finding even a SINGLE 0 bit mathematically GUARANTEES that "user:999" has NEVER been inserted! Result: NEGATIVE (100% confidence). The system short-circuits immediately, completely avoiding an expensive disk seek or database read!',
          status: 'MISMATCH',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [4, 7, 12],
            operation: 'QUERY',
            targetKey: 'user:999',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:999") % 18', bitIndex: 4, bitValue: 0 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:999") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:999") % 18', bitIndex: 12, bitValue: 0 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: false,
              isFalsePositive: false,
              reason: 'Bit B[4] = 0 and B[12] = 0. Definite non-member: 0% false negative guarantee. Disk seek avoided!',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:999"', 'Probed Bits': 'B[4]=0, B[7]=1, B[12]=0', 'Zero Bit Found': 'Index 4 & 12', 'Query Result': 'DEFINITE NEGATIVE', 'Disk I/O Saved': '100% (Avoided)' },
        },
        {
          stepIndex: 6,
          title: 'Query Key "user:404": False Positive! Bits Overlap Across Distinct Keys',
          explanation:
            'Demonstrating the fundamental trade-off: Querying key "user:404" (which was NEVER inserted). Hashes: h1 = 3, h2 = 11, h3 = 17. Probing bit array: B[3] = 1 (set by user:101), B[11] = 1 (set by user:202), B[17] = 1 (set by user:303). Because all 3 bits happen to be 1 from OTHER keys, the filter falsely reports POSITIVE! The database performs an unnecessary disk seek only to discover "user:404" is missing. This is a False Positive with theoretical probability p ≈ 4.5%.',
          status: 'MISMATCH',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [3, 11, 17],
            operation: 'QUERY',
            targetKey: 'user:404',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:404") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:404") % 18', bitIndex: 11, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:404") % 18', bitIndex: 17, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: true,
              isFalsePositive: true,
              reason: 'B[3], B[11], B[17] are all 1, but set by different keys! False positive collision triggered.',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:404"', 'Probed Bits': 'B[3]=1, B[11]=1, B[17]=1', 'All Bits 1?': 'Yes (Collision)', 'Query Result': 'FALSE POSITIVE', 'Root Cause': 'Inter-key overlap' },
        },
        {
          stepIndex: 7,
          title: 'Mathematical Invariants & Optimal Sizing Formula: k = (m/n) * ln(2)',
          explanation:
            'Bloom filter invariants summary: 1) False Negative Rate = 0.00% (Guaranteed). 2) False Positive Rate p ≈ (1 - e^(-kn/m))^k. 3) To achieve a 1% false positive rate (p = 0.01), approximately 9.6 bits per element (m/n ≈ 10) and k = 7 hash functions are required. In Cassandra, RocksDB, and Bigtable, Bloom filters reside in RAM (typically 10 bits/key = ~1.2 bytes/key) to eliminate >99% of pointless disk seeks for non-existent row keys.',
          status: 'COMPLETE',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            operation: 'INITIAL',
            insertedKeys: registeredKeys,
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'False Negative Rate': '0.0% (Zero)', 'Optimal k Formula': '(m/n) * ln(2)', 'Rule of Thumb': '10 bits/key for 1% FPR', 'Primary Use Case': 'LSM SSTable & Cache Filtering', 'Status': 'COMPLETE' },
        },
      ];
    },
  },
  {
    id: 'TRIE_PREFIX_TREE',
    name: 'Trie Prefix Tree & Compressed Radix Tree Autocomplete Studio',
    category: 'String Algorithms & Retrieval Data Structures',
    timeComplexity: 'Search/Insert: O(L), Autocomplete: O(L + K)',
    spaceComplexity: 'Standard Trie: O(Σ · N · L) → Radix: O(N)',
    description:
      'Trie (prefix tree / retrieval tree) and Radix Tree (compact / Patricia trie) structures store associative arrays where keys are strings. Characters are represented along edges and nodes, enabling O(L) search time strictly proportional to key length L, independent of dictionary size N. Radix compression merges single-child chains into composite strings, slashing memory by >40% in IP routing and HTTP path multiplexers.',
    generateFrames: () => {
      // Standard Trie Nodes (12 nodes)
      const baseTrieNodes: VisualizerTrieNode[] = [
        { id: 'root', char: 'ROOT', fullPrefix: '', isEndOfWord: false, x: 360, y: 35, status: 'IDLE' },
        { id: 'n_a', char: 'a', fullPrefix: 'a', isEndOfWord: false, x: 360, y: 95, status: 'IDLE' },
        { id: 'n_ap', char: 'p', fullPrefix: 'ap', isEndOfWord: false, x: 240, y: 155, status: 'IDLE' },
        { id: 'n_au', char: 'u', fullPrefix: 'au', isEndOfWord: false, x: 500, y: 155, status: 'IDLE' },
        { id: 'n_api', char: 'i', fullPrefix: 'api', isEndOfWord: true, x: 150, y: 215, status: 'IDLE' },
        { id: 'n_app', char: 'p', fullPrefix: 'app', isEndOfWord: true, x: 290, y: 215, status: 'IDLE' },
        { id: 'n_aut', char: 't', fullPrefix: 'aut', isEndOfWord: false, x: 500, y: 215, status: 'IDLE' },
        { id: 'n_appl', char: 'l', fullPrefix: 'appl', isEndOfWord: false, x: 290, y: 275, status: 'IDLE' },
        { id: 'n_auth', char: 'h', fullPrefix: 'auth', isEndOfWord: true, x: 500, y: 275, status: 'IDLE' },
        { id: 'n_apple', char: 'e', fullPrefix: 'apple', isEndOfWord: true, x: 240, y: 335, status: 'IDLE' },
        { id: 'n_apply', char: 'y', fullPrefix: 'apply', isEndOfWord: true, x: 340, y: 335, status: 'IDLE' },
        { id: 'n_autho', char: 'o', fullPrefix: 'autho', isEndOfWord: false, x: 500, y: 335, status: 'IDLE' },
        { id: 'n_author', char: 'r', fullPrefix: 'author', isEndOfWord: true, x: 500, y: 385, status: 'IDLE' },
      ];

      const baseTrieEdges = [
        { from: 'root', to: 'n_a', label: 'a' },
        { from: 'n_a', to: 'n_ap', label: 'p' },
        { from: 'n_a', to: 'n_au', label: 'u' },
        { from: 'n_ap', to: 'n_api', label: 'i' },
        { from: 'n_ap', to: 'n_app', label: 'p' },
        { from: 'n_au', to: 'n_aut', label: 't' },
        { from: 'n_app', to: 'n_appl', label: 'l' },
        { from: 'n_aut', to: 'n_auth', label: 'h' },
        { from: 'n_appl', to: 'n_apple', label: 'e' },
        { from: 'n_appl', to: 'n_apply', label: 'y' },
        { from: 'n_auth', to: 'n_autho', label: 'o' },
        { from: 'n_autho', to: 'n_author', label: 'r' },
      ];

      // Radix Tree Nodes (Compressed: 9 nodes)
      const radixNodes: VisualizerTrieNode[] = [
        { id: 'root', char: 'ROOT', fullPrefix: '', isEndOfWord: false, x: 360, y: 40, status: 'IDLE' },
        { id: 'r_a', char: 'a', fullPrefix: 'a', isEndOfWord: false, x: 360, y: 110, status: 'IDLE' },
        { id: 'r_ap', char: 'p', fullPrefix: 'ap', isEndOfWord: false, x: 240, y: 180, status: 'IDLE' },
        { id: 'r_api', char: 'i', fullPrefix: 'api', isEndOfWord: true, x: 150, y: 260, status: 'MATCHED' },
        { id: 'r_app', char: 'p', fullPrefix: 'app', isEndOfWord: true, x: 290, y: 260, status: 'MATCHED' },
        { id: 'r_appl', char: 'l', fullPrefix: 'appl', isEndOfWord: false, x: 290, y: 320, status: 'IDLE' },
        { id: 'r_apple', char: 'e', fullPrefix: 'apple', isEndOfWord: true, x: 240, y: 380, status: 'MATCHED' },
        { id: 'r_apply', char: 'y', fullPrefix: 'apply', isEndOfWord: true, x: 340, y: 380, status: 'MATCHED' },
        { id: 'r_auth', char: 'auth', fullPrefix: 'auth', isEndOfWord: true, isCompressed: true, x: 520, y: 200, status: 'MATCHED' },
        { id: 'r_author', char: 'author', fullPrefix: 'author', isEndOfWord: true, isCompressed: true, x: 520, y: 310, status: 'MATCHED' },
      ];

      const radixEdges = [
        { from: 'root', to: 'r_a', label: 'a' },
        { from: 'r_a', to: 'r_ap', label: 'p' },
        { from: 'r_ap', to: 'r_api', label: 'i' },
        { from: 'r_ap', to: 'r_app', label: 'p' },
        { from: 'r_app', to: 'r_appl', label: 'l' },
        { from: 'r_appl', to: 'r_apple', label: 'e' },
        { from: 'r_appl', to: 'r_apply', label: 'y' },
        { from: 'r_a', to: 'r_auth', label: 'uth', isCompressed: true, isActive: true },
        { from: 'r_auth', to: 'r_author', label: 'or', isCompressed: true, isActive: true },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial State: Empty Root & Character Alphabet (Σ = 26)',
          explanation:
            'A Trie (prefix tree) represents associative strings where the root node represents the empty prefix \"\". Outgoing edges represent single character transitions over alphabet Σ = {a..z}. Nodes with double concentric rings denote valid dictionary terminal words (isEndOfWord = true). At initialization, dictionary size N = 0.',
          status: 'IN_PROGRESS',
          trieState: {
            isRadixMode: false,
            nodes: [baseTrieNodes[0]],
            edges: [],
            operation: 'INITIAL',
            registeredWords: [],
            metrics: { totalNodes: 1, wordCount: 0, longestPrefixLength: 0 },
          },
          metrics: { 'Total Nodes': 1, 'Word Count (N)': 0, 'Longest Depth (L)': 0, 'Alphabet (Σ)': 26 },
        },
        {
          stepIndex: 1,
          title: 'Insert "api" & "app": Shared Prefix "ap" & Branching',
          explanation:
            'Inserting \"api\" and \"app\". Traversal begins at Root. Character \"a\" is added, followed by \"p\", establishing common prefix \"ap\". At node \"ap\", the path splits into child \"i\" (forming \"api\") and child \"p\" (forming \"app\"). Both terminal nodes are marked isEndOfWord = true (double rings).',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: false,
            nodes: baseTrieNodes.slice(0, 6).map((n) => {
              if (n.id === 'n_api' || n.id === 'n_app') return { ...n, status: 'MATCHED' };
              if (n.id === 'n_a' || n.id === 'n_ap') return { ...n, status: 'ACTIVE' };
              return n;
            }),
            edges: [
              baseTrieEdges[0],
              baseTrieEdges[1],
              baseTrieEdges[3],
              baseTrieEdges[4],
            ],
            operation: 'INSERT',
            registeredWords: ['api', 'app'],
            metrics: { totalNodes: 5, wordCount: 2, longestPrefixLength: 3 },
          },
          metrics: { 'Total Nodes': 5, 'Word Count (N)': 2, 'Longest Depth (L)': 3, 'Branch Point': 'node "ap"' },
        },
        {
          stepIndex: 2,
          title: 'Insert "apple" & "apply": Suffix Extension from Terminal Node',
          explanation:
            'Inserting \"apple\" and \"apply\". Traversal matches existing prefix \"app\". From terminal node \"app\", single-child \"l\" is appended (\"appl\"). At \"appl\", two child branches emerge: \"e\" (yielding \"apple\") and \"y\" (yielding \"apply\"). Notice \"app\" remains a valid word while acting as prefix to longer words.',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: false,
            nodes: [
              ...baseTrieNodes.slice(0, 6),
              baseTrieNodes[7], // n_appl
              baseTrieNodes[9], // n_apple
              baseTrieNodes[10], // n_apply
            ].map((n) => {
              if (['n_apple', 'n_apply', 'n_app', 'n_api'].includes(n.id)) return { ...n, status: 'MATCHED' };
              if (['n_a', 'n_ap', 'n_appl'].includes(n.id)) return { ...n, status: 'ACTIVE' };
              return n;
            }),
            edges: [
              baseTrieEdges[0],
              baseTrieEdges[1],
              baseTrieEdges[3],
              baseTrieEdges[4],
              baseTrieEdges[6],
              baseTrieEdges[8],
              baseTrieEdges[9],
            ],
            operation: 'INSERT',
            registeredWords: ['api', 'app', 'apple', 'apply'],
            metrics: { totalNodes: 8, wordCount: 4, longestPrefixLength: 5 },
          },
          metrics: { 'Total Nodes': 8, 'Word Count (N)': 4, 'Longest Depth (L)': 5, 'Shared Prefix': '"appl"' },
        },
        {
          stepIndex: 3,
          title: 'Insert "auth" & "author": Independent Sibling Branch from Root',
          explanation:
            'Inserting \"auth\" and \"author\". From node \"a\", a new branch \"u\" is created, leading to \"t\" and terminal node \"h\" (\"auth\"). To insert \"author\", the path continues from \"auth\" through \"o\" to terminal \"r\" (\"author\"). The full 6-word trie is now constructed.',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: false,
            nodes: baseTrieNodes.map((n) => {
              if (n.isEndOfWord) return { ...n, status: 'MATCHED' };
              return n;
            }),
            edges: baseTrieEdges,
            operation: 'INSERT',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            metrics: { totalNodes: 12, wordCount: 6, longestPrefixLength: 6 },
          },
          metrics: { 'Total Nodes': 12, 'Word Count (N)': 6, 'Longest Depth (L)': 6, 'Trie Leaves': 4 },
        },
        {
          stepIndex: 4,
          title: 'Point Search Query "app": Exact Match in O(L) Time',
          explanation:
            'Query: search(\"app\"). Starting at Root, we follow edge \"a\" -> \"p\" -> \"p\". All L = 3 characters match, and node \"app\" has isEndOfWord = true. The query succeeds in exactly O(L) = 3 character transitions, completely independent of the dictionary size N = 6.',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: false,
            nodes: baseTrieNodes.map((n) => {
              if (['root', 'n_a', 'n_ap'].includes(n.id)) return { ...n, status: 'ACTIVE' };
              if (n.id === 'n_app') return { ...n, status: 'MATCHED' };
              return { ...n, status: 'IDLE' };
            }),
            edges: baseTrieEdges.map((e) => {
              if (
                (e.from === 'root' && e.to === 'n_a') ||
                (e.from === 'n_a' && e.to === 'n_ap') ||
                (e.from === 'n_ap' && e.to === 'n_app')
              ) {
                return { ...e, isActive: true };
              }
              return e;
            }),
            activeQuery: 'app',
            matchedPrefix: 'app',
            operation: 'SEARCH',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            metrics: { totalNodes: 12, wordCount: 6, longestPrefixLength: 6 },
            banner: {
              type: 'SEARCH_HIT',
              title: '✓ Search Hit: Word "app" Found',
              description: 'Matched Root -> a -> p -> p in O(3) steps. Terminal flag isEndOfWord = true confirms valid word.',
            },
          },
          metrics: { 'Search Query': '"app"', 'Steps Taken': 3, 'Result': 'HIT', 'Time Complexity': 'O(L) = O(3)' },
        },
        {
          stepIndex: 5,
          title: 'Point Search Query "apt": Early Mismatch Short-Circuit',
          explanation:
            'Query: search(\"apt\"). Starting at Root, we match \"a\" -> \"p\". At node \"ap\", the query requests child \"t\". Only children \"i\" and \"p\" exist; child \"t\" is null. The search terminates immediately as FALSE in 3 operations without traversing the rest of the trie or dictionary.',
          status: 'MISMATCH',
          trieState: {
            isRadixMode: false,
            nodes: baseTrieNodes.map((n) => {
              if (['root', 'n_a'].includes(n.id)) return { ...n, status: 'ACTIVE' };
              if (n.id === 'n_ap') return { ...n, status: 'MISMATCH' };
              return { ...n, status: 'IDLE' };
            }),
            edges: baseTrieEdges.map((e) => {
              if (
                (e.from === 'root' && e.to === 'n_a') ||
                (e.from === 'n_a' && e.to === 'n_ap')
              ) {
                return { ...e, isActive: true };
              }
              return e;
            }),
            activeQuery: 'apt',
            matchedPrefix: 'ap',
            operation: 'SEARCH',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            metrics: { totalNodes: 12, wordCount: 6, longestPrefixLength: 6 },
            banner: {
              type: 'SEARCH_MISS',
              title: '✗ Search Miss: "apt" Missing',
              description: 'Child edge "t" not found under prefix "ap". Short-circuited in O(3) steps without full scan.',
            },
          },
          metrics: { 'Search Query': '"apt"', 'Steps Taken': 3, 'Result': 'MISMATCH', 'Short-Circuit': 'At prefix "ap"' },
        },
        {
          stepIndex: 6,
          title: 'Autocomplete Query "ap": Subtree DFS Collects 4 Suggestions',
          explanation:
            'Query: autocomplete(\"ap\"). 1. Traversal locates prefix node \"ap\" in O(|P| = 2) steps. 2. A Depth-First Search (DFS) explores the subtree rooted at \"ap\". 3. Collects all terminal descendants: \"api\", \"app\", \"apple\", \"apply\". Time complexity is O(|P| + K) where K is the total nodes in the prefix subtree.',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: false,
            nodes: baseTrieNodes.map((n) => {
              if (['root', 'n_a'].includes(n.id)) return { ...n, status: 'ACTIVE' };
              if (['n_ap', 'n_api', 'n_app', 'n_appl', 'n_apple', 'n_apply'].includes(n.id)) {
                return { ...n, status: 'AUTOCOMPLETE_MATCH' };
              }
              return { ...n, status: 'IDLE' };
            }),
            edges: baseTrieEdges.map((e) => {
              if (
                ['n_api', 'n_app', 'n_appl', 'n_apple', 'n_apply'].includes(e.to) ||
                (e.from === 'root' && e.to === 'n_a') ||
                (e.from === 'n_a' && e.to === 'n_ap')
              ) {
                return { ...e, isActive: true };
              }
              return e;
            }),
            activeQuery: 'ap',
            matchedPrefix: 'ap',
            operation: 'AUTOCOMPLETE',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            autocompleteSuggestions: ['api', 'app', 'apple', 'apply'],
            metrics: { totalNodes: 12, wordCount: 6, longestPrefixLength: 6 },
            banner: {
              type: 'PREFIX_MATCH',
              title: '🔍 4 Autocomplete Matches for "ap"',
              description: 'Subtree DFS collected: "api", "app", "apple", "apply" with 0 dictionary scanning.',
            },
          },
          metrics: { 'Prefix Query': '"ap"', 'Matches Found': 4, 'Time Complexity': 'O(|P| + K)', 'DFS Subtree Nodes': 6 },
        },
        {
          stepIndex: 7,
          title: 'Radix Tree (Patricia Trie) Compression: Coalescing Linear Chains',
          explanation:
            'Converting standard Trie to Radix Tree. Non-branching single-child paths are compressed into composite string edges. The linear path \"u\" -> \"t\" -> \"h\" becomes single edge \"uth\" (node \"auth\"), and \"o\" -> \"r\" becomes single edge \"or\" (node \"author\"). Total nodes drop from 12 to 7 (41.7% memory reduction!).',
          status: 'SUCCESS',
          trieState: {
            isRadixMode: true,
            nodes: radixNodes,
            edges: radixEdges,
            operation: 'RADIX_COMPRESS',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            metrics: { totalNodes: 7, wordCount: 6, longestPrefixLength: 6, compressionRatio: '41.7% Reduction' },
            banner: {
              type: 'RADIX_COMPRESSION',
              title: '⚡ Radix Compression Applied: 12 → 7 Nodes',
              description: 'Merged single-child chains: "uth" and "or". Memory footprint slashed while preserving O(L) lookup.',
            },
          },
          metrics: { 'Original Nodes': 12, 'Radix Nodes': 7, 'Compression Ratio': '41.7% Savings', 'Space Bound': 'O(N)' },
        },
        {
          stepIndex: 8,
          title: 'Mathematical Invariants & Systems Engineering Applications',
          explanation:
            'Trie and Radix tree invariants proven: 1. Lookup and insertion time is strictly O(L) where L is string length, outperforming hash tables with large key collisions. 2. Radix tree space is bounded by O(N) where N is number of stored words. 3. Used universally in CIDR IP routing (longest prefix match) and HTTP URL routers (Go Gin, Rust Actix).',
          status: 'COMPLETE',
          trieState: {
            isRadixMode: true,
            nodes: radixNodes,
            edges: radixEdges,
            operation: 'RADIX_COMPRESS',
            registeredWords: ['api', 'app', 'apple', 'apply', 'auth', 'author'],
            metrics: { totalNodes: 7, wordCount: 6, longestPrefixLength: 6, compressionRatio: '41.7% Reduction' },
            banner: {
              type: 'RADIX_COMPRESSION',
              title: '✓ Global Verification: Radix Invariants Proven',
              description: 'O(L) search guarantees, O(N) compressed edges, zero false lookups, and CIDR prefix optimization.',
            },
          },
          metrics: { 'Search Time': 'O(L)', 'Prefix Lookup': 'O(L + K)', 'Radix Space': 'O(N)', 'Memory Savings': '41.7%' },
        },
      ];
    },
  },

  {
    id: 'INVERTED_INDEX_BM25',
    name: 'Inverted Index & Okapi BM25 Search Relevance Scoring Studio',
    category: 'Information Retrieval & Full-Text Search Engines',
    timeComplexity: 'Index Lookup: O(1), Intersection: O(L1 + L2), Ranking: O(Q · D)',
    spaceComplexity: 'Index: O(V + Σ L_i), Skip Lists: O(L / √L)',
    description:
      'Inverted indexes map vocabulary terms to posting lists of document IDs and term frequencies, powering search engines (Lucene, Elasticsearch). Okapi BM25 scores relevance by combining Robertson-Spärck Jones IDF with non-linear term frequency saturation (k1) and document length normalization (b), neutralizing keyword stuffing and prioritizing concise documents.',
    generateFrames: () => {
      const corpus = [
        { id: 'D1', title: 'Raft Consensus Cluster', text: 'distributed consensus raft quorum replication', length: 5 },
        { id: 'D2', title: 'Distributed Cache Tier', text: 'distributed caching redis memcached sharding', length: 5 },
        { id: 'D3', title: 'Leader Election Protocol', text: 'raft leader election consensus log replication heartbeat', length: 7 },
        { id: 'D4', title: 'Database Index Engine', text: 'caching query optimization database indexing index', length: 6 },
      ];
      const avgdl = 5.75;
      const k1 = 1.2;
      const b = 0.75;

      const baseTerms: InvertedIndexTerm[] = [
        { term: 'distributed', df: 2, idf: 0.693, postings: [{ docId: 'D1', tf: 1 }, { docId: 'D2', tf: 1 }] },
        { term: 'consensus', df: 2, idf: 0.693, postings: [{ docId: 'D1', tf: 1 }, { docId: 'D3', tf: 1 }] },
        { term: 'raft', df: 2, idf: 0.693, postings: [{ docId: 'D1', tf: 1 }, { docId: 'D3', tf: 1 }] },
        { term: 'quorum', df: 1, idf: 1.204, postings: [{ docId: 'D1', tf: 1 }] },
        { term: 'replication', df: 2, idf: 0.693, postings: [{ docId: 'D1', tf: 1 }, { docId: 'D3', tf: 1 }] },
        { term: 'caching', df: 2, idf: 0.693, postings: [{ docId: 'D2', tf: 1 }, { docId: 'D4', tf: 1 }] },
        { term: 'redis', df: 1, idf: 1.204, postings: [{ docId: 'D2', tf: 1 }] },
        { term: 'leader', df: 1, idf: 1.204, postings: [{ docId: 'D3', tf: 1 }] },
        { term: 'election', df: 1, idf: 1.204, postings: [{ docId: 'D3', tf: 1 }] },
        { term: 'database', df: 1, idf: 1.204, postings: [{ docId: 'D4', tf: 1 }] },
        { term: 'indexing', df: 1, idf: 1.204, postings: [{ docId: 'D4', tf: 2 }] },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial State: Document Corpus Ingestion & Token Stream Extraction',
          explanation:
            'A text corpus of N = 4 technical documents is ingested. Text is tokenized into word streams with stop-word removal. Corpus statistics: total tokens = 23, average document length avgdl = (5 + 5 + 7 + 6) / 4 = 5.75 words. Document lengths vary between 5 and 7 words.',
          status: 'IN_PROGRESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: [],
            k1,
            b,
          },
          metrics: { 'Total Documents (N)': 4, 'Avg Doc Length (avgdl)': 5.75, 'Vocabulary Size (V)': 11, 'Total Tokens': 23 },
        },
        {
          stepIndex: 1,
          title: 'Inverted Index Construction: Vocabulary Terms & Posting Lists',
          explanation:
            'The inverted index is constructed. Each distinct vocabulary term maps to a sorted Posting List containing document IDs (docId) and within-document Term Frequency (tf). For example, "consensus" maps to [D1 (tf=1), D3 (tf=1)], with Document Frequency df = 2. Postings are sorted by docId to enable fast linear intersections.',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms,
            k1,
            b,
            banner: {
              type: 'INDEX_BUILT',
              title: '✓ Inverted Index Built (11 Vocabulary Terms)',
              description: 'All 4 documents indexed into posting lists with term frequencies and document frequencies.',
            },
          },
          metrics: { 'Indexed Terms': 11, 'Total Postings': 16, 'Posting Compression': 'Sorted docIDs', 'Lookup Bound': 'O(1) FST' },
        },
        {
          stepIndex: 2,
          title: 'Boolean Conjunctive Query: "distributed AND consensus"',
          explanation:
            'Executing boolean query: "distributed AND consensus". The search engine retrieves posting lists for "distributed" [D1, D2] and "consensus" [D1, D3]. A Two-Pointer Leapfrog Algorithm advances pointers: ptr1=0 (D1) matches ptr2=0 (D1) -> Doc D1 emitted to result set! ptr1 advances to D2 while ptr2 advances to D3 (mismatch, D2 < D3). Intersection finishes in O(L1 + L2) = O(4) steps.',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms.map((t) => {
              if (t.term === 'distributed' || t.term === 'consensus') {
                return { ...t, isActive: true, isIntersecting: true };
              }
              return t;
            }),
            activeQuery: 'distributed AND consensus',
            queryType: 'BOOLEAN_AND',
            twoPointerState: {
              term1: 'distributed',
              term2: 'consensus',
              ptr1: 0,
              ptr2: 0,
              matchedDocIds: ['D1'],
            },
            k1,
            b,
            banner: {
              type: 'INTERSECTION_MATCH',
              title: '✓ Intersection Match: Document D1 Matches Both Terms',
              description: 'Two-pointer leapfrog scan matched docId D1 in O(L1 + L2) time without scanning full corpus.',
            },
          },
          metrics: { 'Query': '"distributed AND consensus"', 'Matching Docs': 'D1 only', 'Algorithm': 'Two-Pointer Leapfrog', 'Complexity': 'O(L1 + L2)' },
        },
        {
          stepIndex: 3,
          title: 'Multi-Term Disjunctive Candidate Retrieval: "raft consensus"',
          explanation:
            'Executing disjunctive multi-term query: "raft consensus". The query planner retrieves postings for "raft" [D1, D3] and "consensus" [D1, D3]. Taking the posting union yields candidate set {D1, D3}. Both documents match both query terms. Next, the scoring engine must determine which document is more relevant using Okapi BM25.',
          status: 'IN_PROGRESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms.map((t) => {
              if (t.term === 'raft' || t.term === 'consensus') {
                return { ...t, isActive: true };
              }
              return t;
            }),
            activeQuery: 'raft consensus',
            queryType: 'BOOLEAN_OR',
            k1,
            b,
            banner: {
              type: 'INTERSECTION_MATCH',
              title: 'Disjunctive Candidates Retrieved: {D1, D3}',
              description: 'Both D1 and D3 match terms "raft" and "consensus". BM25 scoring will rank candidate relevance.',
            },
          },
          metrics: { 'Candidate Docs': 2, 'Query Terms': 2, 'Candidate Set': '{D1, D3}', 'Scoring Pipeline': 'Okapi BM25' },
        },
        {
          stepIndex: 4,
          title: 'Computing Robertson-Spärck Jones IDF: Term Rarity Weighting',
          explanation:
            'BM25 calculates Inverse Document Frequency (IDF) using Robertson-Spärck Jones smoothing: IDF(q) = ln((N - n + 0.5) / (n + 0.5) + 1). For terms with df = 2 (e.g. "raft", "consensus"), IDF = ln((4 - 2 + 0.5)/(2 + 0.5) + 1) = ln(2.0) = 0.693. Rare terms with df = 1 (e.g. "quorum") receive higher IDF = ln(3.5/1.5 + 1) = ln(3.33) = 1.204.',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms.map((t) => {
              if (['raft', 'consensus', 'quorum'].includes(t.term)) {
                return { ...t, isActive: true };
              }
              return t;
            }),
            activeQuery: 'raft consensus',
            queryType: 'BM25_RANKED',
            k1,
            b,
            banner: {
              type: 'BM25_RANKING',
              title: 'IDF Calculated: df=2 -> IDF=0.693 | df=1 -> IDF=1.204',
              description: 'Rare terms across the corpus receive exponentially higher relevance weights.',
            },
          },
          metrics: { 'IDF ("raft")': 0.693, 'IDF ("consensus")': 0.693, 'IDF ("quorum")': 1.204, 'Corpus Size (N)': 4 },
        },
        {
          stepIndex: 5,
          title: 'BM25 Scoring & Document Length Normalization (D1 vs D3)',
          explanation:
            'Ranking query "raft consensus" across D1 (|D1|=5) and D3 (|D3|=7). Both contain 1 occurrence of each term. Document length normalization factor B_norm = 1 - b + b * (|D| / avgdl). For D1: B_norm = 1 - 0.75 + 0.75*(5/5.75) = 0.902. TF_norm = (1 * 2.2) / (1 + 1.2 * 0.902) = 1.056 -> BM25(D1) = 2 * (0.693 * 1.056) = 1.464. For D3: B_norm = 1 - 0.75 + 0.75*(7/5.75) = 1.163. TF_norm = (1 * 2.2) / (1 + 1.2 * 1.163) = 0.918 -> BM25(D3) = 2 * (0.693 * 0.918) = 1.272. Result: D1 outranks D3 because it is more concise!',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms.map((t) => {
              if (['raft', 'consensus'].includes(t.term)) {
                return { ...t, isActive: true };
              }
              return t;
            }),
            activeQuery: 'raft consensus',
            queryType: 'BM25_RANKED',
            rankedResults: [
              {
                docId: 'D1',
                docTitle: 'Raft Consensus Cluster',
                docLength: 5,
                matchedTerms: ['raft', 'consensus'],
                termScores: {
                  raft: { tf: 1, idf: 0.693, tfNorm: 1.056, score: 0.732 },
                  consensus: { tf: 1, idf: 0.693, tfNorm: 1.056, score: 0.732 },
                },
                totalScore: 1.464,
                rank: 1,
              },
              {
                docId: 'D3',
                docTitle: 'Leader Election Protocol',
                docLength: 7,
                matchedTerms: ['raft', 'consensus'],
                termScores: {
                  raft: { tf: 1, idf: 0.693, tfNorm: 0.918, score: 0.636 },
                  consensus: { tf: 1, idf: 0.693, tfNorm: 0.918, score: 0.636 },
                },
                totalScore: 1.272,
                rank: 2,
              },
            ],
            k1,
            b,
            banner: {
              type: 'BM25_RANKING',
              title: '✓ BM25 Ranking Complete: D1 (1.464) > D3 (1.272)',
              description: 'Concise document D1 (|D1|=5) outranks longer document D3 (|D3|=7) via length normalization penalty (b=0.75).',
            },
          },
          metrics: { 'Rank 1 Score (D1)': 1.464, 'Rank 2 Score (D3)': 1.272, 'Length Penalty (b)': 0.75, 'Saturation (k1)': 1.2 },
        },
        {
          stepIndex: 6,
          title: 'Single-Term Precision Query: "quorum" (High IDF Boost)',
          explanation:
            'Executing precision query: "quorum". Term "quorum" appears in only 1 document (df = 1), yielding maximum IDF = 1.204. For D1 (|D1|=5): TF_norm = 1.056. Total BM25 score = 1.204 * 1.056 = 1.271. D1 is returned as the sole top-ranked match with high confidence.',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms.map((t) => {
              if (t.term === 'quorum') return { ...t, isActive: true };
              return t;
            }),
            activeQuery: 'quorum',
            queryType: 'BM25_RANKED',
            rankedResults: [
              {
                docId: 'D1',
                docTitle: 'Raft Consensus Cluster',
                docLength: 5,
                matchedTerms: ['quorum'],
                termScores: {
                  quorum: { tf: 1, idf: 1.204, tfNorm: 1.056, score: 1.271 },
                },
                totalScore: 1.271,
                rank: 1,
              },
            ],
            k1,
            b,
            banner: {
              type: 'BM25_RANKING',
              title: '✓ Precision Match: D1 Matched on Rare Term "quorum"',
              description: 'Term with df=1 yielded strong IDF weight (1.204), producing precise single-document match.',
            },
          },
          metrics: { 'Query': '"quorum"', 'IDF Weight': 1.204, 'Rank 1 Doc': 'D1', 'Precision': '100%' },
        },
        {
          stepIndex: 7,
          title: 'Keyword Stuffing Resistance: BM25 Saturation vs Raw TF',
          explanation:
            'Simulating an adversarial document D_spam that repeats keyword "consensus" 10 times in a 100-word spam document. Under linear TF (raw TF-IDF), D_spam achieves a score 10x higher than D1, polluting search rankings. Under Okapi BM25, TF_norm = (10 * 2.2) / (10 + 1.2 * (1 - 0.75 + 0.75*(100/5.75))) = 22.0 / (10 + 1.2 * 13.29) = 22.0 / 25.95 = 0.847. Despite having 10x more occurrences, D_spam\'s BM25 term score is ONLY 0.587 (lower than D1\'s 0.732!). BM25 completely neutralizes keyword stuffing.',
          status: 'SUCCESS',
          invertedIndexState: {
            corpus: [
              ...corpus,
              { id: 'D_spam', title: 'Adversarial Keyword Spammer', text: 'consensus consensus consensus ... (100 words)', length: 100 },
            ],
            avgdl: 24.6,
            terms: baseTerms.map((t) => {
              if (t.term === 'consensus') return { ...t, isActive: true };
              return t;
            }),
            activeQuery: 'consensus',
            queryType: 'KEYWORD_STUFFING_DEFENSE',
            rankedResults: [
              {
                docId: 'D1',
                docTitle: 'Raft Consensus Cluster (tf=1, len=5)',
                docLength: 5,
                matchedTerms: ['consensus'],
                termScores: { consensus: { tf: 1, idf: 0.693, tfNorm: 1.056, score: 0.732 } },
                totalScore: 0.732,
                rank: 1,
              },
              {
                docId: 'D_spam',
                docTitle: 'Adversarial Spammer (tf=10, len=100)',
                docLength: 100,
                matchedTerms: ['consensus'],
                termScores: { consensus: { tf: 10, idf: 0.693, tfNorm: 0.847, score: 0.587 } },
                totalScore: 0.587,
                rank: 2,
              },
            ],
            k1,
            b,
            banner: {
              type: 'ANTI_STUFFING',
              title: '🛡️ Keyword Stuffing Defeated: D1 (0.732) > D_spam (0.587)',
              description: 'BM25 term saturation (k1=1.2) and document length penalty (b=0.75) suppressed the 10x keyword spammer.',
            },
          },
          metrics: { 'Raw TF Spammer Score': '10.0 (Unfair)', 'BM25 Spammer Score': '0.587 (Neutralized)', 'Legitimate Doc Score': '0.732 (Wins)', 'Defense Invariant': 'Proven' },
        },
        {
          stepIndex: 8,
          title: 'Mathematical Invariants & Production Search Engine Architecture',
          explanation:
            'Key Information Retrieval invariants proven: 1. Term Frequency Saturation (k1=1.2) enforces that 10 occurrences never score 10x higher than 1. 2. Document Length Normalization (b=0.75) guarantees information density over verbose fluff. 3. Inverted indexes compress posting lists using Elias-Fano and Frame-of-Reference (FoR) bit-packing, allowing Lucene and Elasticsearch to query billions of documents in sub-millisecond latencies.',
          status: 'COMPLETE',
          invertedIndexState: {
            corpus,
            avgdl,
            terms: baseTerms,
            k1,
            b,
            banner: {
              type: 'BM25_RANKING',
              title: '✓ Search Relevance Architecture Proven',
              description: 'Inverted index, posting lists, RSJ-smoothed IDF, length normalization, and Okapi BM25 verified.',
            },
          },
          metrics: { 'Relevance Model': 'Okapi BM25', 'Saturation Ceiling': 'k1 + 1 = 2.2', 'Length Factor (b)': 0.75, 'Industrial Standard': 'Lucene / ES' },
        },
      ];
    },
  },

  {
    id: 'POSTING_SKIP_LIST_ELIAS_FANO',
    name: 'Inverted Index Skip Lists & Elias-Fano Quasi-Succinct Compression Studio',
    category: 'Information Retrieval & Search Engine Storage Internals',
    timeComplexity: 'Intersection: O(L_B · √L_A), Decode: O(1) select/rank',
    spaceComplexity: 'Elias-Fano: m·(2 + ⌈log₂(U/m)⌉) bits (≤ 2 bits from Shannon lower bound)',
    description:
      'Search engine posting lists divide sorted document IDs into blocks of √L with skip pointers to bypass non-matching postings during multi-term intersections. Elias-Fano quasi-succinct encoding compresses sorted sequences into lower fixed-width bit arrays and high-bit unary vectors, enabling O(1) random access via CPU POPCNT with near-optimal information-theoretic compression.',
    generateFrames: () => {
      const listA = [3, 8, 14, 19, 27, 34, 42, 58, 65, 78, 89, 95, 112, 128, 145, 160];
      const listB = [42, 95, 160];

      const initialBlocks: SkipBlock[] = [
        { blockIndex: 0, startIndex: 0, endIndex: 3, skipDocId: 19, docIds: [3, 8, 14, 19] },
        { blockIndex: 1, startIndex: 4, endIndex: 7, skipDocId: 58, docIds: [27, 34, 42, 58] },
        { blockIndex: 2, startIndex: 8, endIndex: 11, skipDocId: 95, docIds: [65, 78, 89, 95] },
        { blockIndex: 3, startIndex: 12, endIndex: 15, skipDocId: 160, docIds: [112, 128, 145, 160] },
      ];

      const efSample: EliasFanoEncoding = {
        universeU: 64,
        m: 6,
        lowBitsL: 3,
        elements: [
          { docId: 3, highBits: 0, lowBits: 3, lowBitsBinary: '011', unaryGap: '1' },
          { docId: 11, highBits: 1, lowBits: 3, lowBitsBinary: '011', unaryGap: '01' },
          { docId: 19, highBits: 2, lowBits: 3, lowBitsBinary: '011', unaryGap: '01' },
          { docId: 34, highBits: 4, lowBits: 2, lowBitsBinary: '010', unaryGap: '001' },
          { docId: 42, highBits: 5, lowBits: 2, lowBitsBinary: '010', unaryGap: '01' },
          { docId: 58, highBits: 7, lowBits: 2, lowBitsBinary: '010', unaryGap: '001' },
        ],
        lowBitsArray: ['011', '011', '011', '010', '010', '010'],
        highBitsVector: '1010100101001',
        totalBits: 31,
        rawBits: 192,
        compressionRatio: '83.8% Space Savings',
      };

      return [
        {
          stepIndex: 0,
          title: 'Initial State: Inverted Posting Lists & √L Skip Block Partitioning',
          explanation:
            'Sorted document ID list L_A (length N = 16) is partitioned into intervals of size k = ⌊√16⌋ = 4. Each block maintains a skip pointer storing the maximum docID in the block. Conjunctive search query intersects L_A with query term posting list L_B = [42, 95, 160].',
          status: 'IN_PROGRESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks,
            matchedDocIds: [],
            banner: {
              type: 'SUMMARY',
              title: 'Skip Blocks Initialized: k = 4 (√16)',
              description: '4 blocks created. Skip pointers link max docIDs: [19, 58, 95, 160].',
            },
          },
          metrics: { 'List A Size': 16, 'List B Size': 3, 'Block Size (√L)': 4, 'Skip Blocks': 4 },
        },
        {
          stepIndex: 1,
          title: 'Target DocID 42: Skip Pointer Leapfrog Bypasses Block 0',
          explanation:
            'Searching for target docID 42 in L_A. The iterator evaluates Block 0 skip pointer: skipDocId = 19 < 42. Because all postings in Block 0 are ≤ 19, docID 42 cannot exist in Block 0! The iterator executes a skip jump in O(1) directly to Block 1, bypassing 4 linear element comparisons.',
          status: 'SUCCESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks.map((b) => (b.blockIndex === 0 ? { ...b, isSkipped: true } : b.blockIndex === 1 ? { ...b, isActive: true } : b)),
            activeStep: {
              ptrA: 4,
              ptrB: 0,
              targetDocId: 42,
              action: 'SKIP_JUMP',
              skipJumpCount: 1,
              linearScanCount: 1,
            },
            matchedDocIds: [],
            banner: {
              type: 'SKIP_JUMP',
              title: '⚡ Skip Jump Executed: Block 0 Bypassed',
              description: 'Evaluated skipDocId 19 < 42. Bypassed docIDs [3, 8, 14, 19] in O(1) time.',
            },
          },
          metrics: { 'Target DocID': 42, 'Skip Pointer': 19, 'Skip Result': 'Jump to Block 1', 'Comparisons Saved': 3 },
        },
        {
          stepIndex: 2,
          title: 'Candidate Block 1 Scan & Match: DocID 42 Found',
          explanation:
            'In Block 1, the iterator inspects skip pointer: skipDocId = 58 ≥ 42. The target must reside within Block 1. Linear scan checks: 27 < 42, 34 < 42, 42 == 42 -> Match found! DocID 42 is added to the conjunctive result set. Pointer B advances to next target 95.',
          status: 'SUCCESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks.map((b) => (b.blockIndex === 0 ? { ...b, isSkipped: true } : b.blockIndex === 1 ? { ...b, isInspected: true } : b)),
            activeStep: {
              ptrA: 6,
              ptrB: 1,
              targetDocId: 42,
              action: 'MATCH',
              skipJumpCount: 1,
              linearScanCount: 4,
            },
            matchedDocIds: [42],
            banner: {
              type: 'MATCH',
              title: '✓ Conjunctive Match: DocID 42',
              description: 'Scanned Block 1: matched docID 42 in 3 comparisons instead of 7.',
            },
          },
          metrics: { 'Matched DocID': 42, 'Next Target': 95, 'Cumulative Matches': 1, 'Search Work': '4 steps total' },
        },
        {
          stepIndex: 3,
          title: 'Target DocID 95: Skip Pointer Direct Match at Block 2 Boundary',
          explanation:
            'Next target docID is 95. Advancing from Block 1, iterator inspects Block 2 skip pointer: skipDocId = 95 ≥ 95. Because the skip pointer exactly equals target 95, the iterator lands directly on the boundary element without scanning [65, 78, 89]! DocID 95 is emitted.',
          status: 'SUCCESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks.map((b) => (b.blockIndex < 2 ? { ...b, isSkipped: true } : b.blockIndex === 2 ? { ...b, isInspected: true } : b)),
            activeStep: {
              ptrA: 11,
              ptrB: 2,
              targetDocId: 95,
              action: 'MATCH',
              skipJumpCount: 2,
              linearScanCount: 5,
            },
            matchedDocIds: [42, 95],
            banner: {
              type: 'MATCH',
              title: '✓ Boundary Match: DocID 95',
              description: 'Skip pointer 95 directly matched target! Bypassed internal postings [65, 78, 89].',
            },
          },
          metrics: { 'Matched DocID': 95, 'Next Target': 160, 'Cumulative Matches': 2, 'Comparisons Saved': 6 },
        },
        {
          stepIndex: 4,
          title: 'Target DocID 160: Intersection Complete (60% Comparisons Saved)',
          explanation:
            'Final target docID 160. Iterator checks Block 3 skip pointer: skipDocId = 160 ≥ 160 -> Direct match at Block 3 boundary! Conjunctive query evaluation complete. Matches: [42, 95, 160]. Total comparisons: 6 steps vs 16 steps in raw linear traversal (62.5% reduction).',
          status: 'COMPLETE',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks.map((b) => ({ ...b, isInspected: true })),
            activeStep: {
              ptrA: 15,
              ptrB: 3,
              targetDocId: 160,
              action: 'MATCH',
              skipJumpCount: 3,
              linearScanCount: 6,
            },
            matchedDocIds: [42, 95, 160],
            banner: {
              type: 'SUMMARY',
              title: '✓ Full Intersection Complete: [42, 95, 160]',
              description: '6 total comparisons vs 16 linear scans. Skip lists achieved 62.5% traversal savings.',
            },
          },
          metrics: { 'Final Match Set': '[42, 95, 160]', 'Total Comparisons': 6, 'Linear Traversal': 16, 'Work Reduction': '62.5%' },
        },
        {
          stepIndex: 5,
          title: 'Elias-Fano Quasi-Succinct Compression: Mathematical Partitioning',
          explanation:
            'Production search engines cannot store raw 32-bit integers. Elias-Fano encoding (1974) represents m = 6 sorted integers bounded by universe U = 64: [3, 11, 19, 34, 42, 58]. Lower bit width L = ⌊log₂(U / m)⌋ = ⌊log₂(64 / 6)⌋ = 3 bits. Each docID is split into low 3 bits (x & 7) and high quotient (x >> 3).',
          status: 'SUCCESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks,
            matchedDocIds: [42, 95, 160],
            eliasFano: efSample,
            banner: {
              type: 'ELIAS_FANO_ENCODED',
              title: 'Elias-Fano Partitioning: L = 3 Bits',
              description: 'Universe U = 64, m = 6 integers. Lower bits L = ⌊log₂(64/6)⌋ = 3 bits per integer.',
            },
          },
          metrics: { 'Universe (U)': 64, 'Elements (m)': 6, 'Lower Bits (L)': 3, 'Theoretical Bound': 'Near-Shannon Optimal' },
        },
        {
          stepIndex: 6,
          title: 'Elias-Fano Bit Vector Encoding: 31 Bits vs 192 Bits (83.8% Savings)',
          explanation:
            'Lower bits stored in fixed 3-bit array: [011, 011, 011, 010, 010, 010] (18 bits total). High quotients [0, 1, 2, 4, 5, 7] stored via unary differences: write (h_i - h_{i-1}) zeros followed by a 1. High bit vector: "1 01 01 001 01 001" (13 bits). Total size: 18 + 13 = 31 bits vs 192 bits raw (83.8% compression).',
          status: 'SUCCESS',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks,
            matchedDocIds: [42, 95, 160],
            eliasFano: efSample,
            banner: {
              type: 'ELIAS_FANO_ENCODED',
              title: '✓ Quasi-Succinct Compression: 31 Bits Total',
              description: '18 bits lower array + 13 bits unary vector. Compresses within 2 bits of Shannon lower bound.',
            },
          },
          metrics: { 'Raw Size': '192 bits (6×32b)', 'Compressed Size': '31 bits', 'Space Savings': '83.8%', 'Overhead': '0 bytes metadata' },
        },
        {
          stepIndex: 7,
          title: 'Constant-Time O(1) Random Access via Hardware POPCNT & select₁',
          explanation:
            'To read element index 4 (docID 42) without decompressing: 1. Read 3 bits at offset 4 × 3 = 12 in low bit array -> 010₂ = 2. 2. Locate 4th set bit in high vector using select₁(H, 4) via hardware POPCNT. Count preceding zeros -> high quotient = 5. Reconstruct: (5 << 3) + 2 = 40 + 2 = 42! O(1) random access proven.',
          status: 'COMPLETE',
          postingSkipState: {
            postingListA: listA,
            postingListB: listB,
            skipBlocksA: initialBlocks,
            matchedDocIds: [42, 95, 160],
            eliasFano: efSample,
            banner: {
              type: 'SUMMARY',
              title: '✓ O(1) Random Access: Reconstructed DocID 42',
              description: 'select₁(H, 4) yields high=5, low=2. (5 << 3) + 2 = 42 in O(1) hardware instructions.',
            },
          },
          metrics: { 'Random Access': 'O(1) CPU select', 'Decode Instructions': 'POPCNT + bitshift', 'Shannon Proximity': '≤ 2 bits/elem', 'Invariants': 'Proven' },
        },
      ];
    },
  },

  {
    id: 'COLUMNAR_VECTORIZED_ENGINE',
    name: 'Database Columnar Storage & Vectorized SIMD Execution Engine',
    category: 'Database Storage & Query Processing Internals',
    timeComplexity: 'Row NSM: O(N · C) scalar calls, Vectorized DSM: O(N / SIMD_WIDTH) parallel bitwise ops',
    spaceComplexity: 'DSM + RLE/Dict: 3x-10x compression over uncompressed NSM',
    description:
      'Analytical OLAP databases abandon row-oriented N-ary Storage Models (NSM) and tuple-at-a-time Volcano iterators. By decomposing tables into contiguous column vectors (Decomposition Storage Model / DSM) and executing queries via vectorized batches with SIMD bitmasks, CPU cache miss rates drop by 90% and virtual function call overhead is completely eliminated.',
    generateFrames: () => {
      const baseRows: ColumnarOrderRecord[] = [
        { rowId: 0, orderId: 1001, customerId: 'CUST_A', amount: 150, status: 'PAID', discount: 0.10, netRevenue: 135.0 },
        { rowId: 1, orderId: 1002, customerId: 'CUST_B', amount: 420, status: 'PAID', discount: 0.00, netRevenue: 420.0 },
        { rowId: 2, orderId: 1003, customerId: 'CUST_A', amount: 85,  status: 'PAID', discount: 0.05, netRevenue: 80.75 },
        { rowId: 3, orderId: 1004, customerId: 'CUST_C', amount: 310, status: 'PENDING', discount: 0.15, netRevenue: 0 },
        { rowId: 4, orderId: 1005, customerId: 'CUST_B', amount: 50,  status: 'PAID', discount: 0.00, netRevenue: 50.0 },
        { rowId: 5, orderId: 1006, customerId: 'CUST_A', amount: 200, status: 'PAID', discount: 0.20, netRevenue: 160.0 },
        { rowId: 6, orderId: 1007, customerId: 'CUST_D', amount: 950, status: 'REFUNDED', discount: 0.10, netRevenue: 0 },
        { rowId: 7, orderId: 1008, customerId: 'CUST_B', amount: 120, status: 'PAID', discount: 0.05, netRevenue: 114.0 },
        { rowId: 8, orderId: 1009, customerId: 'CUST_A', amount: 60,  status: 'PAID', discount: 0.00, netRevenue: 60.0 },
        { rowId: 9, orderId: 1010, customerId: 'CUST_C', amount: 400, status: 'PAID', discount: 0.10, netRevenue: 360.0 },
        { rowId: 10, orderId: 1011, customerId: 'CUST_A', amount: 180, status: 'PENDING', discount: 0.25, netRevenue: 0 },
        { rowId: 11, orderId: 1012, customerId: 'CUST_B', amount: 250, status: 'PAID', discount: 0.00, netRevenue: 250.0 },
        { rowId: 12, orderId: 1013, customerId: 'CUST_D', amount: 600, status: 'PAID', discount: 0.15, netRevenue: 510.0 },
        { rowId: 13, orderId: 1014, customerId: 'CUST_A', amount: 90,  status: 'PAID', discount: 0.05, netRevenue: 85.5 },
        { rowId: 14, orderId: 1015, customerId: 'CUST_C', amount: 320, status: 'REFUNDED', discount: 0.10, netRevenue: 0 },
        { rowId: 15, orderId: 1016, customerId: 'CUST_B', amount: 110, status: 'PAID', discount: 0.00, netRevenue: 110.0 },
      ];

      const initialPages: RowPage[] = [
        {
          pageId: 0,
          totalPageBytes: 4096,
          slots: [
            { slotId: 0, rowId: 0, tupleBytes: '[1001, CUST_A, $150, PAID, 0.10]', isProjected: true, isStatusMatch: true },
            { slotId: 1, rowId: 1, tupleBytes: '[1002, CUST_B, $420, PAID, 0.00]', isProjected: true, isStatusMatch: true },
            { slotId: 2, rowId: 2, tupleBytes: '[1003, CUST_A, $85,  PAID, 0.05]', isProjected: true, isStatusMatch: true },
            { slotId: 3, rowId: 3, tupleBytes: '[1004, CUST_C, $310, PEND, 0.15]', isProjected: false, isStatusMatch: false },
            { slotId: 4, rowId: 4, tupleBytes: '[1005, CUST_B, $50,  PAID, 0.00]', isProjected: true, isStatusMatch: true },
            { slotId: 5, rowId: 5, tupleBytes: '[1006, CUST_A, $200, PAID, 0.20]', isProjected: true, isStatusMatch: true },
            { slotId: 6, rowId: 6, tupleBytes: '[1007, CUST_D, $950, REFU, 0.10]', isProjected: false, isStatusMatch: false },
            { slotId: 7, rowId: 7, tupleBytes: '[1008, CUST_B, $120, PAID, 0.05]', isProjected: true, isStatusMatch: true },
          ],
        },
        {
          pageId: 1,
          totalPageBytes: 4096,
          slots: [
            { slotId: 0, rowId: 8,  tupleBytes: '[1009, CUST_A, $60,  PAID, 0.00]', isProjected: true, isStatusMatch: true },
            { slotId: 1, rowId: 9,  tupleBytes: '[1010, CUST_C, $400, PAID, 0.10]', isProjected: true, isStatusMatch: true },
            { slotId: 2, rowId: 10, tupleBytes: '[1011, CUST_A, $180, PEND, 0.25]', isProjected: false, isStatusMatch: false },
            { slotId: 3, rowId: 11, tupleBytes: '[1012, CUST_B, $250, PAID, 0.00]', isProjected: true, isStatusMatch: true },
            { slotId: 4, rowId: 12, tupleBytes: '[1013, CUST_D, $600, PAID, 0.15]', isProjected: true, isStatusMatch: true },
            { slotId: 5, rowId: 13, tupleBytes: '[1014, CUST_A, $90,  PAID, 0.05]', isProjected: true, isStatusMatch: true },
            { slotId: 6, rowId: 14, tupleBytes: '[1015, CUST_C, $320, REFU, 0.10]', isProjected: false, isStatusMatch: false },
            { slotId: 7, rowId: 15, tupleBytes: '[1016, CUST_B, $110, PAID, 0.00]', isProjected: true, isStatusMatch: true },
          ],
        },
      ];

      const baseColumns: ColumnVector[] = [
        { name: 'row_id', type: 'INT32', isProjected: false, isFiltered: false, memoryBytes: 64, values: baseRows.map((r) => r.rowId) },
        { name: 'order_id', type: 'INT32', isProjected: false, isFiltered: false, memoryBytes: 64, values: baseRows.map((r) => r.orderId) },
        { name: 'customer_id', type: 'VARCHAR', isProjected: true, isFiltered: false, memoryBytes: 96, values: baseRows.map((r) => r.customerId) },
        { name: 'amount', type: 'FLOAT64', isProjected: true, isFiltered: false, memoryBytes: 128, values: baseRows.map((r) => r.amount) },
        { name: 'status', type: 'ENUM8', isProjected: false, isFiltered: true, memoryBytes: 16, values: baseRows.map((r) => r.status) },
        { name: 'discount', type: 'FLOAT64', isProjected: true, isFiltered: false, memoryBytes: 128, values: baseRows.map((r) => r.discount) },
      ];

      const initialBits: SelectionVectorBit[] = baseRows.map((r, idx) => ({
        index: idx,
        rowId: r.rowId,
        bit: r.status === 'PAID' ? 1 : 0,
        status: r.status,
      }));

      const rleRuns: RleRunItem[] = [
        { value: 'PAID', count: 3 },
        { value: 'PENDING', count: 1 },
        { value: 'PAID', count: 2 },
        { value: 'REFUNDED', count: 1 },
        { value: 'PAID', count: 3 },
        { value: 'PENDING', count: 1 },
        { value: 'PAID', count: 3 },
        { value: 'REFUNDED', count: 1 },
        { value: 'PAID', count: 1 },
      ];

      const dictionary: DictionaryItem[] = [
        { code: 0, value: 'CUST_A' },
        { code: 1, value: 'CUST_B' },
        { code: 2, value: 'CUST_C' },
        { code: 3, value: 'CUST_D' },
      ];

      const dictEncodedIndices = [0, 1, 0, 2, 1, 0, 3, 1, 0, 2, 0, 1, 3, 0, 2, 1];

      const sqlQuery = "SELECT customer_id, SUM(amount * (1 - discount)) AS net_rev FROM orders WHERE status = 'PAID' GROUP BY customer_id;";

      return [
        {
          stepIndex: 0,
          title: 'Analytical Query Target & Relational Table Model',
          explanation:
            'Target analytical query: "SELECT customer_id, SUM(amount * (1 - discount)) AS net_rev FROM orders WHERE status = \'PAID\' GROUP BY customer_id". Table contains 16 rows and 6 attributes. Notice that while 6 columns exist on disk, the query only requires customer_id, amount, and discount for computation, and status for filtering. Columns row_id and order_id are completely unreferenced.',
          status: 'IN_PROGRESS',
          columnarState: {
            storageLayout: 'ROW_ORIENTED_NSM',
            executionEngine: 'VOLCANO_ITERATOR',
            compression: 'UNCOMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            banner: {
              type: 'SETUP',
              title: 'Target Query: Analytical Aggregation & Filter Scan',
              description: 'Evaluating SQL query over 16 orders. 3 columns projected, 1 filtered, 2 unreferenced.',
            },
            metrics: {
              storageModel: 'Row-Oriented (NSM)',
              executionModel: 'Volcano Iterator (next())',
              memoryBandwidthScanned: '1,280 bytes',
              virtualCalls: 48,
              l1CacheMisses: 18,
              simdVectorWidth: 'None (Scalar)',
            },
          },
          metrics: { 'Storage Architecture': 'Row NSM', 'Execution Engine': 'Volcano Iterator', 'Active Filter': 'status = PAID', 'Projected Columns': 'customer, amount, discount' },
        },
        {
          stepIndex: 1,
          title: 'Row-Oriented (NSM) Slotted Pages: The 80% Cache Pollution Penalty',
          explanation:
            'In traditional N-ary Storage Model (NSM, e.g. PostgreSQL, MySQL InnoDB, SQLite), entire tuples are packed contiguously across 4KB slotted pages. When the CPU executes WHERE status = \'PAID\', the storage engine cannot read status in isolation: hardware fetches full 64-byte L1/L2 cache lines containing unused attributes (order_id, row_id, strings). Out of 80 bytes read per tuple, 64 bytes (80%) are discarded garbage that evicts useful data from L1 cache!',
          status: 'MISMATCH',
          columnarState: {
            storageLayout: 'ROW_ORIENTED_NSM',
            executionEngine: 'VOLCANO_ITERATOR',
            compression: 'UNCOMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            memoryScannedBytes: 1280,
            cacheMisses: 18,
            banner: {
              type: 'NSM_WASTE',
              title: 'High Cache Line Pollution: 80% of Memory Bandwidth Wasted',
              description: 'Hardware fetches full 64-byte cache lines for every tuple. Discarded columns clog memory bus bandwidth.',
            },
            metrics: {
              storageModel: 'Row-Oriented (NSM)',
              executionModel: 'Volcano Iterator',
              memoryBandwidthScanned: '1,280 bytes (80 B/tuple)',
              virtualCalls: 48,
              l1CacheMisses: 18,
              simdVectorWidth: 'None (Scalar)',
            },
          },
          metrics: { 'Storage Layout': 'Row-Oriented NSM', 'Memory Bus Wasted': '80% (64 B/tuple)', 'L1 Cache Misses': 18, 'Cache Pollution': 'Severe' },
        },
        {
          stepIndex: 2,
          title: 'Column-Oriented (DSM) Decomposition: 100% Cache Line Utilization',
          explanation:
            'Decomposition Storage Model (DSM, e.g. MonetDB, ClickHouse, DuckDB) stores each column as an independent, contiguous array. To evaluate status = \'PAID\', the scan engine reads ONLY the status column vector. 16 single-byte status values occupy just 16 contiguous bytes—fitting entirely inside a single 64-byte L1 cache line (25% of one cache line)! Zero memory bandwidth is wasted on order_id or customer_id during predicate evaluation.',
          status: 'SUCCESS',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VOLCANO_ITERATOR',
            compression: 'UNCOMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            memoryScannedBytes: 16,
            cacheMisses: 1,
            banner: {
              type: 'DSM_EFFICIENCY',
              title: 'Pure Columnar Access: 100% Cache Line Density & Zero Memory Waste',
              description: 'Only 16 bytes fetched across the bus to evaluate all 16 rows. Unreferenced columns never touched.',
            },
            metrics: {
              storageModel: 'Column-Oriented (DSM)',
              executionModel: 'Volcano Iterator',
              memoryBandwidthScanned: '16 bytes (1 B/tuple)',
              virtualCalls: 48,
              l1CacheMisses: 1,
              simdVectorWidth: 'Ready for SIMD',
            },
          },
          metrics: { 'Storage Layout': 'Columnar DSM', 'Status Scan Memory': '16 bytes', 'L1 Cache Misses': 1, 'Bandwidth Efficiency': '98.8% Saved' },
        },
        {
          stepIndex: 3,
          title: 'Columnar Lightweight Compression: Run-Length (RLE) & Dictionary Encoding',
          explanation:
            'Homogeneous columnar arrays exhibit massive redundancy. Status column compresses with Run-Length Encoding (RLE): 16 values compress into 9 run tuples (e.g. (PAID, 3)). Customer IDs compress with Dictionary Encoding: 4 distinct strings map to 2-bit integer tokens [0, 1, 2, 3], reducing customer_id column from 96 bytes to 4 bytes (95.8% space savings!). The engine filters directly on integer codes without string decoding.',
          status: 'SUCCESS',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VOLCANO_ITERATOR',
            compression: 'DICTIONARY_COMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns.map((c) => {
              if (c.name === 'customer_id') return { ...c, compressionRatio: '95.8% (4 B)', memoryBytes: 4 };
              if (c.name === 'status') return { ...c, compressionRatio: '43.8% (9 B)', memoryBytes: 9 };
              return c;
            }),
            selectionVector: initialBits,
            rleRuns,
            dictionary,
            dictEncodedIndices,
            memoryScannedBytes: 9,
            cacheMisses: 1,
            banner: {
              type: 'COMPRESSION_SAVINGS',
              title: 'Lightweight Compression: 95.8% String Savings & Direct Code Filtering',
              description: 'Dictionary token array [0..3] enables SIMD integer comparisons without decompressing strings.',
            },
            metrics: {
              storageModel: 'Columnar DSM + RLE/Dict',
              executionModel: 'Volcano Iterator',
              memoryBandwidthScanned: '9 bytes RLE',
              virtualCalls: 48,
              l1CacheMisses: 1,
              simdVectorWidth: '2-bit integer codes',
            },
          },
          metrics: { 'Status RLE Runs': '9 runs (from 16)', 'Dict Token Size': '2 bits / customer', 'Compression Savings': '78.5% total', 'Direct Execution': 'Enabled' },
        },
        {
          stepIndex: 4,
          title: 'Volcano Iterator Engine: 48 Virtual Function Calls & Branch Thrashing',
          explanation:
            'The classical Volcano Iterator Model (Goetz Graefe 1994) evaluates queries tuple-at-a-time via next(). For 16 rows, calling ScanFilter.next() -> Project.next() -> Aggregate.next() triggers 48 virtual function calls! Each virtual call causes pointer indirection, invalidates the CPU instruction pipeline, and incurs unpredictable branch misprediction penalties on non-matching rows.',
          status: 'MISMATCH',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VOLCANO_ITERATOR',
            compression: 'DICTIONARY_COMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            volcanoCalls: 48,
            vectorizedCalls: 0,
            memoryScannedBytes: 288,
            cacheMisses: 12,
            banner: {
              type: 'VOLCANO_OVERHEAD',
              title: 'Volcano Iterator Bottleneck: 48 Virtual Calls for 16 Rows',
              description: 'Dynamic virtual dispatch per tuple halts CPU superscalar pipelining and prevents vectorization.',
            },
            metrics: {
              storageModel: 'Columnar DSM',
              executionModel: 'Volcano Iterator (next())',
              memoryBandwidthScanned: '288 bytes',
              virtualCalls: 48,
              l1CacheMisses: 12,
              simdVectorWidth: 'None (Scalar next())',
            },
          },
          metrics: { 'Execution Model': 'Volcano Iterator', 'Virtual Function Calls': '48 calls', 'CPU Cycles / Tuple': '82 cycles', 'Branch Predictor': 'Stalled' },
        },
        {
          stepIndex: 5,
          title: 'Boncz Vectorized SIMD Engine: 1024-Element Batch & Selection Bitmasks',
          explanation:
            'Peter Boncz\'s Vectorized Execution Engine (MonetDB/X100, SIGMOD 2005) operates on primitive vector batches (1024 elements). Instead of calling next() 48 times, a single vector call evaluates the entire batch. Filter status == \'PAID\' is compiled into a single hardware SIMD vector instruction (_mm256_cmpeq_epi8), producing a 16-bit selection bitmask in 1 CPU cycle: [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1]. Branchless and zero virtual call tax!',
          status: 'SUCCESS',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VECTORIZED_SIMD',
            compression: 'DICTIONARY_COMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits.map((b) => ({ ...b, isInspected: true })),
            volcanoCalls: 0,
            vectorizedCalls: 1,
            memoryScannedBytes: 16,
            cacheMisses: 1,
            banner: {
              type: 'SIMD_SPEEDUP',
              title: 'Branchless SIMD Evaluation: 1 Virtual Call & 1-Cycle Bitmask',
              description: '_mm256_cmpeq_epi8 evaluates all 16 status bytes in parallel, producing a 16-bit selection vector.',
            },
            metrics: {
              storageModel: 'Columnar DSM',
              executionModel: 'Vectorized SIMD (X100)',
              memoryBandwidthScanned: '16 bytes',
              virtualCalls: 1,
              l1CacheMisses: 1,
              simdVectorWidth: '256-bit AVX2 (16 lanes)',
            },
          },
          metrics: { 'Execution Engine': 'Boncz Vectorized SIMD', 'Selection Vector': '12 / 16 active bits', 'Virtual Function Calls': '1 call', 'SIMD Parallelism': '16 elements / cycle' },
        },
        {
          stepIndex: 6,
          title: 'SIMD Parallel Projection: Masked Arithmetic on Selected Rows',
          explanation:
            'Vectorized projection computes net revenue amount * (1 - discount) in parallel across active lanes in the selection vector using AVX2 Fused Multiply-Add (_mm256_fmadd_ps). Inactive rows (rows 3, 6, 10, 14) are masked out in hardware without scalar branching. Net revenues are summed directly into dictionary bins: CUST_A: $555.75, CUST_B: $780.00, CUST_C: $360.00, CUST_D: $510.00.',
          status: 'SUCCESS',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VECTORIZED_SIMD',
            compression: 'DICTIONARY_COMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            activeIndices: [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 15],
            volcanoCalls: 0,
            vectorizedCalls: 1,
            memoryScannedBytes: 112,
            cacheMisses: 2,
            banner: {
              type: 'SIMD_SPEEDUP',
              title: 'Vectorized FMA Arithmetic: 4 Parallel Lanes with Zero Scalar Branches',
              description: 'Active rows compute amount * (1 - discount) via AVX2 instructions with direct dictionary aggregation.',
            },
            metrics: {
              storageModel: 'Columnar DSM + Vectorized',
              executionModel: 'Vectorized SIMD (AVX2)',
              memoryBandwidthScanned: '112 bytes total',
              virtualCalls: 1,
              l1CacheMisses: 2,
              simdVectorWidth: '256-bit AVX2 FMA',
            },
          },
          metrics: { 'Vector Arithmetic': 'AVX2 _mm256_fmadd_ps', 'Active Rows Computed': 12, 'Dictionary Aggregation': 'Zero String Hash Overhead', 'Hardware Masking': 'Branchless' },
        },
        {
          stepIndex: 7,
          title: 'Columnar Vectorized Engine Verification: 9.2x OLAP Speedup',
          explanation:
            'Verification complete: By combining Decomposition Storage Model (DSM) column pruning with Boncz Vectorized SIMD batch execution and lightweight dictionary encoding, analytical queries bypass the memory bandwidth wall and eliminate virtual function call overhead, achieving 9.2x throughput speedups over traditional row-oriented Volcano engines.',
          status: 'COMPLETE',
          columnarState: {
            storageLayout: 'COLUMN_ORIENTED_DSM',
            executionEngine: 'VECTORIZED_SIMD',
            compression: 'DICTIONARY_COMPRESSED',
            querySql: sqlQuery,
            rows: baseRows,
            rowPages: initialPages,
            columns: baseColumns,
            selectionVector: initialBits,
            activeIndices: [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 15],
            volcanoCalls: 0,
            vectorizedCalls: 1,
            memoryScannedBytes: 112,
            cacheMisses: 2,
            banner: {
              type: 'SUMMARY',
              title: '✓ Columnar Storage & Vectorized Execution Engine Proven',
              description: '91.2% memory bandwidth reduction, 97.9% virtual call reduction, 9.2x query execution speedup.',
            },
            metrics: {
              storageModel: 'DSM (Columnar)',
              executionModel: 'Vectorized SIMD',
              memoryBandwidthScanned: '112 B vs 1,280 B',
              virtualCalls: 1,
              l1CacheMisses: 2,
              simdVectorWidth: 'AVX2 256-bit',
            },
          },
          metrics: { 'Bandwidth Saved': '91.2% (112B vs 1280B)', 'Virtual Calls Cut': '97.9% (1 vs 48)', 'L1 Miss Reduction': '88.9% (2 vs 18)', 'Speedup Factor': '9.2x Faster' },
        },
      ];
    },
  },
  {
    id: 'QUERY_COST_OPTIMIZER_CBO',
    name: 'Query Optimization Internals: Cost-Based Optimizer (CBO) & System R Dynamic Programming',
    category: 'Database Storage & Query Processing Internals',
    timeComplexity: 'Naive NLJ: O(N · M · L), System R DP: O(3^N) search, Pipelined Merge: O(N + M + L)',
    spaceComplexity: 'Grace Hash: O(M) memory, Pipelined Merge: O(1) streaming (0 temp files)',
    description:
      'Relational databases transform declarative SQL into optimal physical execution trees. Using System R dynamic programming join enumeration, predicate pushdown, catalog selectivity estimation, and interesting orders, the Cost-Based Optimizer (CBO) prunes catastrophic Cartesian explosions and slashes query latency by 5,250x.',
    generateFrames: () => {
      const sqlText = "SELECT c.name, o.order_date, l.product, l.quantity, l.price\nFROM Customers c\nJOIN Orders o ON c.id = o.customer_id\nJOIN LineItems l ON o.id = l.order_id\nWHERE c.tier = 'VIP' AND o.total_amount > 500;";
      const allPlans = [PLAN_A_NAIVE_NLJ, PLAN_B_FILTER_HASH, PLAN_C_SYSTEM_R_DP_MERGE];
      const baseWeights = { wIo: 1.0, wCpu: 0.001, wOp: 0.005 };

      return [
        // Frame 1: Declarative Query Setup
        {
          stepIndex: 1,
          title: 'Declarative SQL Query & Relational Calculus Model',
          explanation:
            'Relational database engines receive declarative SQL queries specifying *what* data to retrieve, not *how* to retrieve it. The optimizer must choose among equivalent relational algebra trees and physical operators (Scan, Hash Join, Nested Loop, Sort-Merge) across three relations: Customers (100K rows), Orders (1M rows), and LineItems (5M rows).',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_A_NAIVE_NLJ',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_A_NAIVE_NLJ,
            allPlans,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'SETUP',
              title: 'Declarative Query Analysis: 3-Way Join Across 6.1M Total Tuples',
              description:
                'Targeting Customers (100,000 rows / 2,000 pages), Orders (1,000,000 rows / 25,000 pages), and LineItems (5,000,000 rows / 125,000 pages). The search space contains dozens of candidate physical execution trees.',
            },
            metrics: {
              estimatedTotalCost: '20,400,000 units',
              speedupVsNaive: '1.0x (Baseline)',
              pageIoTransferred: '20,152,000 Pages',
              memoryRequired: '12.0 MB (Buffer Pool)',
              joinAlgorithm: 'Nested Loop Join (Cartesian)',
            },
          },
          metrics: {
            'Search Space': '3! = 6 Permutations x Operators',
            'Relations Target': '3 Tables (6.1M Rows)',
            'Filter Predicates': '2 (VIP tier, Amount > 500)',
            'Optimizer Phase': 'Parsing & AST Formulation',
          },
        },

        // Frame 2: Plan A - Naive Cartesian / Nested Loop Disaster
        {
          stepIndex: 2,
          title: 'Plan A: Naive Cartesian & Nested Loop Disaster (20,000,000 Page I/Os)',
          explanation:
            'Without optimization, a naive engine performs late filtering: cross-joining Customers (100K) with Orders (1M) and LineItems (5M) via unindexed nested loop joins. Every outer tuple rescans the inner table. The Cartesian product attempts 100,000,000 intermediate pairs before filtering, causing 20,152,000 page I/Os, thrashing the buffer pool for 180 seconds (~3 minutes).',
          status: 'MISMATCH',
          optimizerState: {
            activePlanId: 'PLAN_A_NAIVE_NLJ',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_A_NAIVE_NLJ,
            allPlans,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'NAIVE_WARNING',
              title: '⚠️ Critical Performance Failure: 20,152,000 Page I/Os & Cartesian Explosion',
              description:
                'Evaluating filters at the top of the tree forces 500,000,000 unindexed comparisons. Nested loops repeatedly rescan 25,000 Orders pages 100,000 times, drowning the memory bus.',
            },
            metrics: {
              estimatedTotalCost: '20,400,000 units',
              speedupVsNaive: '1.0x (Disaster)',
              pageIoTransferred: '20,152,000 Pages',
              memoryRequired: '12.0 MB',
              joinAlgorithm: 'Cartesian Nested Loops',
            },
          },
          metrics: {
            'Cartesian Tuples': '100,000,000 Intermediate',
            'Disk Page Scans': '20,152,000 Pages',
            'Estimated Runtime': '180,000 ms (~3 min)',
            'Buffer Pool Hit Rate': '< 4.2% (Severe Thrashing)',
          },
        },

        // Frame 3: Relational Algebra Equivalence & Predicate Pushdown
        {
          stepIndex: 3,
          title: 'Relational Algebra Equivalence & Predicate Pushdown (99% Reduction)',
          explanation:
            'By applying the relational algebraic rewrite rule σ_P(R ⋈ S) ≡ σ_P(R) ⋈ S, selection filters are pushed down directly to the physical table scan operators. Pushing c.tier = "VIP" filters Customers from 100,000 to only 1,000 tuples (99% reduction). Pushing o.total_amount > 500 filters Orders from 1,000,000 to 50,000 tuples (95% reduction) *before* any join operator executes.',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_B_FILTER_HASH',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_B_FILTER_HASH,
            allPlans,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'PUSHDOWN_IMPACT',
              title: 'Predicate Pushdown: 99% of Unqualified Tuples Filtered at Scan Layer',
              description:
                'Customers cardinality slashes from 100,000 to 1,000. Orders cardinality slashes from 1,000,000 to 50,000. Only 50,000 inner tuples enter the join engine instead of 100,000,000,000 Cartesian comparisons.',
            },
            metrics: {
              estimatedTotalCost: '12,400 units',
              speedupVsNaive: '1,650x Faster',
              pageIoTransferred: '152,000 Pages',
              memoryRequired: '4.8 MB (Hash Table)',
              joinAlgorithm: 'Predicate Pushdown + Hash Join',
            },
          },
          metrics: {
            'Customers Pruned': '100,000 -> 1,000 (99.0%)',
            'Orders Pruned': '1,000,000 -> 50,000 (95.0%)',
            'Algebraic Invariant': 'σ_P(R ⋈ S) ≡ σ_P(R) ⋈ S',
            'Data Bus Saved': '98.5% Tuples Pruned Early',
          },
        },

        // Frame 4: Physical Operator Selection: Nested Loops vs Grace Hash vs Sort-Merge
        {
          stepIndex: 4,
          title: 'Physical Operator Selection: Nested Loops vs Grace Hash vs Sort-Merge',
          explanation:
            'The optimizer maps logical joins to physical algorithms based on data scale: (1) Nested Loop Join: O(M · N) I/Os, optimal only when inner relation has an index; (2) Grace Hash Join: O(M + N) I/Os, builds in-memory hash table on smaller outer relation and probes inner tuples; (3) Sort-Merge Join: O(M log M + N log N) if unsorted, but O(M + N) linear scan if inputs are already sorted by clustered indexes.',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_B_FILTER_HASH',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_B_FILTER_HASH,
            allPlans,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'OPERATOR_SELECT',
              title: 'Operator Mapping: Evaluating Memory Footprint & Asymptotic Bounds',
              description:
                'With 1,000 VIP customers, the hash table occupies only 64 KB RAM, easily fitting in L2/L3 cache. Grace Hash Join slashes execution time from 180 seconds to 110 milliseconds.',
            },
            metrics: {
              estimatedTotalCost: '12,400 units',
              speedupVsNaive: '1,650x Faster',
              pageIoTransferred: '152,000 Pages',
              memoryRequired: '4.8 MB (Hash Table)',
              joinAlgorithm: 'Grace Hash Join (In-Memory)',
            },
          },
          metrics: {
            'Hash Table Size': '1,000 keys x 64B = 64 KB',
            'Probe Complexity': 'O(1) per inner tuple',
            'Spill-to-Disk': 'None (Fits in L3 Cache)',
            'Latency Target': '110 ms (1,650x vs Naive)',
          },
        },

        // Frame 5: System R Dynamic Programming Join Tree Enumeration
        {
          stepIndex: 5,
          title: 'System R Dynamic Programming Join Tree Enumeration (Pruning Cartesian & Bushy)',
          explanation:
            'Pat Selinger’s System R algorithm constructs the search space bottom-up using dynamic programming: Stage 1 (k=1) evaluates all single-table access paths (Scans vs Indexes). Stage 2 (k=2) evaluates 2-table subsets, immediately pruning Cartesian products like {Customers, LineItems}. Stage 3 (k=3) evaluates optimal left-deep combinations, pruning suboptimal plans with identical interesting orders. The search space shrinks from N! factorial trees to O(3^N) evaluated subplans.',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_C_SYSTEM_R_DP_MERGE',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_C_SYSTEM_R_DP_MERGE,
            allPlans,
            systemRStages: SYSTEM_R_STAGES,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'DP_PRUNING',
              title: 'System R DP Engine: Subproblems Pruned at Level k=2 and k=3',
              description:
                'Cartesian cross-products and high-cost nested loops are pruned at stage boundaries. The optimal left-deep tree (Customers ⋈ Orders) ⋈ LineItems emerges as the cost-optimal winner.',
            },
            metrics: {
              estimatedTotalCost: '3,880 units',
              speedupVsNaive: '5,250x Faster',
              pageIoTransferred: '1,790 Pages',
              memoryRequired: '0.4 MB (Pipelined Stream)',
              joinAlgorithm: 'Left-Deep Sort-Merge Join',
            },
          },
          metrics: {
            'DP Search Space': 'Pruned from N! to O(3^N)',
            'Cartesian Pruned': '{Customers, LineItems} eliminated',
            'Intermediate Buffers': 'Zero (Left-Deep Pipelined)',
            'Optimal Join Order': '(Customers ⋈ Orders) ⋈ LineItems',
          },
        },

        // Frame 6: Cost-Based Evaluation & Statistical Catalog Selectivity Estimation
        {
          stepIndex: 6,
          title: 'Cost-Based Optimizer (CBO) & Statistical Catalog Selectivity Estimation',
          explanation:
            'The CBO computes total cost using catalog statistics (cardinality, page count, distinct values, histograms): Cost = N_page_io · W_IO + N_tuples · W_CPU + N_ops · W_Op. Equality selectivity sel(tier = "VIP") = 1 / Distinct(tier) = 0.01. Range selectivity sel(total_amount > 500) = (Max - 500) / (Max - Min) = 0.05. Using these statistical estimates, Plan C achieves an estimated cost of 3,880 vs Plan A’s 20,400,000.',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_C_SYSTEM_R_DP_MERGE',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_C_SYSTEM_R_DP_MERGE,
            allPlans,
            systemRStages: SYSTEM_R_STAGES,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'SETUP',
              title: 'Selinger Cost Formulation: Arithmetic Breakdown & Weights',
              description:
                'Cost = (1,790 Pages · 1.0) + (4,000 Tuples · 0.001) + (4,000 Operators · 0.005) = 1,790 + 4 + 20 = 1,814 base + seek overhead = 3,880 Selinger cost units.',
            },
            metrics: {
              estimatedTotalCost: '3,880 units',
              speedupVsNaive: '5,250x Faster',
              pageIoTransferred: '1,790 Pages',
              memoryRequired: '0.4 MB',
              joinAlgorithm: 'System R DP Cost Winner',
            },
          },
          metrics: {
            'Cost Formula': 'N_io · 1.0 + N_cpu · 0.001 + N_op · 0.005',
            'VIP Selectivity': '0.01 (1,000 / 100,000)',
            'Amount Selectivity': '0.05 (50,000 / 1,000,000)',
            'Cost Accuracy': 'Calibrated against B+Tree Depth',
          },
        },

        // Frame 7: Pipelined Execution & The Power of "Interesting Orders"
        {
          stepIndex: 7,
          title: 'Pipelined Execution & The Power of "Interesting Orders"',
          explanation:
            'A central breakthrough of the System R optimizer is "Interesting Orders": physical clustered B+Tree indexes naturally output tuples pre-sorted on primary keys (c.id, o.customer_id, l.order_id). Even though an index scan might have a slightly higher individual cost than a raw sequential scan, preserving sort order allows the Sort-Merge Join to execute in pure streaming pipelined fashion with zero sorting passes and zero in-memory hash tables.',
          status: 'IN_PROGRESS',
          optimizerState: {
            activePlanId: 'PLAN_C_SYSTEM_R_DP_MERGE',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_C_SYSTEM_R_DP_MERGE,
            allPlans,
            systemRStages: SYSTEM_R_STAGES,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'INTERESTING_ORDER',
              title: 'Interesting Order Exploit: Zero-Materialization Sort-Merge Pipeline',
              description:
                'Customers PK (id) matches Orders composite index (customer_id, id). LineItems clustered index (order_id) matches upstream output stream. Zero temporary files or hash buckets required.',
            },
            metrics: {
              estimatedTotalCost: '3,880 units',
              speedupVsNaive: '5,250x Faster',
              pageIoTransferred: '1,790 Pages',
              memoryRequired: '0.4 MB (Pipelined)',
              joinAlgorithm: 'Sort-Merge (Interesting Orders)',
            },
          },
          metrics: {
            'Order Match': 'c.id == o.customer_id',
            'Sort Passes': '0 (Eliminated by B+Tree)',
            'Pipeline Depth': '3 Streaming Iterators',
            'Temp File Spills': '0 Bytes to Disk',
          },
        },

        // Frame 8: Quantitative Optimizer Benchmark & Physical Plan Diff
        {
          stepIndex: 8,
          title: 'Quantitative Optimizer Benchmark: 5,250x CBO Speedup & Invariants',
          explanation:
            'The Cost-Based Optimizer achieves a 5,250x reduction in query cost: from 20,400,000 units (180s runtime, 20.1M page I/Os) down to 3,880 units (12ms runtime, 1,790 page I/Os). Intermediate materialization is reduced by 99.9%, and buffer pool thrashing is completely eliminated through left-deep pipelining and interesting orders.',
          status: 'COMPLETE',
          optimizerState: {
            activePlanId: 'PLAN_C_SYSTEM_R_DP_MERGE',
            sqlQuery: sqlText,
            targetRelations: TARGET_RELATION_CATALOG,
            activePlan: PLAN_C_SYSTEM_R_DP_MERGE,
            allPlans,
            systemRStages: SYSTEM_R_STAGES,
            costFormulaWeights: baseWeights,
            banner: {
              type: 'SUMMARY',
              title: '✓ Cost-Based Query Optimizer Verified: 5,250x End-to-End Speedup',
              description:
                'Plan C (System R Dynamic Programming Sort-Merge Join) decisively wins: 1,790 Page I/Os vs 20,152,000 Page I/Os, 12 ms latency vs 180,000 ms, with 0 bytes spilled to temporary disk.',
            },
            metrics: {
              estimatedTotalCost: '3,880 units (5,250x)',
              speedupVsNaive: '5,250x Faster',
              pageIoTransferred: '1,790 Pages (99.99% Cut)',
              memoryRequired: '0.4 MB vs 12.0 MB',
              joinAlgorithm: 'System R DP Pipelined Merge',
            },
          },
          metrics: {
            'Speedup Factor': '5,250x vs Naive NLJ',
            'Page I/O Reduction': '99.99% (1,790 vs 20.1M)',
            'Latency Drop': '180,000 ms -> 12 ms',
            'Physical Invariants': 'All 4 Formulations Proven',
          },
        },
      ];
    },
  },
];

export function AlgorithmVisualizerSandbox() {
  const [selectedAlgoId, setSelectedAlgoId] = useState<VisualizerAlgorithm>('BINARY_SEARCH');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per step
  const [activePlanTabOverride, setActivePlanTabOverride] = useState<QueryPlanId | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedAlgo =
    ALGORITHM_CONFIGS.find((a) => a.id === selectedAlgoId) || ALGORITHM_CONFIGS[0];
  const frames = selectedAlgo.generateFrames();
  const currentFrame = frames[currentFrameIndex] || frames[0];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, frames.length, playbackSpeed]);

  const handleSelectAlgo = (id: VisualizerAlgorithm) => {
    setIsPlaying(false);
    setSelectedAlgoId(id);
    setCurrentFrameIndex(0);
    setActivePlanTabOverride(null);
  };

  const handleStepForward = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setActivePlanTabOverride(null);
  };

  return (
    <Card className="p-5 sm:p-7 border-border shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
            Interactive State Stepper &amp; Memory Inspector
          </span>
          <h3 className="text-xl font-bold text-text">
            {selectedAlgo.name}
          </h3>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            {selectedAlgo.description}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-xs font-mono bg-primary-50 text-primary-800 border border-primary-200 px-2.5 py-1 rounded-md font-semibold">
            Time: {selectedAlgo.timeComplexity}
          </span>
          <span className="text-xs font-mono bg-canvas text-text-muted border border-border px-2.5 py-1 rounded-md font-semibold">
            Space: {selectedAlgo.spaceComplexity}
          </span>
        </div>
      </div>

      {/* Algorithm Selection Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Choose Algorithm Scenario:
        </span>
        <div className="flex flex-wrap gap-2">
          {ALGORITHM_CONFIGS.map((algo) => {
            const isSelected = algo.id === selectedAlgoId;
            return (
              <button
                key={algo.id}
                type="button"
                onClick={() => handleSelectAlgo(algo.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-50 text-primary-900 border-primary-400 shadow-xs'
                    : 'bg-canvas text-text-muted border-border hover:text-text hover:border-border-hover'
                }`}
              >
                {algo.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="bg-canvas border border-border rounded-xl p-5 space-y-5 min-h-[220px] flex flex-col justify-center">
        {/* Frame / Array Display */}
        {currentFrame.array && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Array Memory Buffer (Elements &amp; Indices)</span>
              <span>Total Length: {currentFrame.array.length}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-3">
              {currentFrame.array.map((val, idx) => {
                const isActive = currentFrame.activeIndices?.includes(idx);
                const isEliminated =
                  currentFrame.eliminatedRange &&
                  idx >= currentFrame.eliminatedRange[0] &&
                  idx <= currentFrame.eliminatedRange[1];

                const isWindow =
                  currentFrame.windowRange &&
                  idx >= currentFrame.windowRange[0] &&
                  idx <= currentFrame.windowRange[1];

                let boxClass = 'bg-surface border-border text-text';
                if (isActive) {
                  boxClass =
                    currentFrame.status === 'SUCCESS'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold scale-105 shadow-sm'
                      : 'bg-primary-100 border-primary-500 text-primary-950 font-bold scale-105 shadow-sm';
                } else if (isWindow) {
                  boxClass = 'bg-accent-50 border-accent-400 text-accent-950 font-semibold';
                } else if (isEliminated) {
                  boxClass = 'bg-neutral-100 border-neutral-200 text-neutral-400 line-through opacity-60';
                }

                // Identify pointers pointing here
                const pointerNames = currentFrame.pointers
                  ? Object.entries(currentFrame.pointers)
                      .filter(([, pIdx]) => pIdx === idx)
                      .map(([pName]) => pName)
                  : [];

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    {/* Value Tile */}
                    <div
                      className={`w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-base transition-all duration-200 ${boxClass}`}
                    >
                      {val}
                    </div>

                    {/* Index */}
                    <span className="text-[10px] font-mono text-text-muted">
                      [{idx}]
                    </span>

                    {/* Pointer Badges */}
                    {pointerNames.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {pointerNames.map((pName) => (
                          <span
                            key={pName}
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-primary-800 text-white font-mono"
                          >
                            {pName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stack Display (for STACK_DELIMITERS) */}
        {currentFrame.stack !== undefined && (
          <div className="flex flex-col items-center space-y-3">
            <span className="text-xs text-text-muted font-semibold">
              LIFO Call Stack (Bottom → Top)
            </span>
            <div className="w-48 min-h-[120px] max-h-[160px] border-2 border-dashed border-border rounded-lg p-2 flex flex-col-reverse items-center gap-1.5 bg-surface">
              {currentFrame.stack.length === 0 ? (
                <span className="text-xs text-text-muted my-auto italic">
                  Stack is empty
                </span>
              ) : (
                currentFrame.stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full py-1.5 rounded-md bg-primary-100 border border-primary-300 text-center font-mono font-bold text-primary-900 shadow-2xs"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Graph Display (for GRAPH_BFS_TRAVERSAL & GRAPH_DFS_TRAVERSAL) */}
        {currentFrame.graphState && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold">Interactive Graph Topology &amp; Frontier</span>
              <span className="font-mono">
                Visited: {currentFrame.graphState.visitedNodes.length} /{' '}
                {currentFrame.graphState.nodes.length} Vertices
              </span>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg
                viewBox="0 0 420 200"
                className="w-full max-w-[500px] h-48 bg-surface rounded-lg border border-border shadow-2xs"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                  </marker>
                </defs>

                {/* Edges */}
                {currentFrame.graphState.edges.map((edge, idx) => {
                  const fromNode = currentFrame.graphState!.nodes.find((n) => n.id === edge.from);
                  const toNode = currentFrame.graphState!.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isActiveEdge =
                    currentFrame.graphState!.activeEdge &&
                    currentFrame.graphState!.activeEdge.from === edge.from &&
                    currentFrame.graphState!.activeEdge.to === edge.to;

                  return (
                    <line
                      key={`edge-${idx}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActiveEdge ? '#2563eb' : '#94a3b8'}
                      strokeWidth={isActiveEdge ? 3 : 2}
                      strokeDasharray={isActiveEdge ? '4 2' : undefined}
                      markerEnd={
                        edge.directed
                          ? isActiveEdge
                            ? 'url(#arrowhead-active)'
                            : 'url(#arrowhead)'
                          : undefined
                      }
                    />
                  );
                })}

                {/* Nodes */}
                {currentFrame.graphState.nodes.map((node) => {
                  const isActive = currentFrame.graphState!.activeNodeId === node.id;
                  const isVisited = currentFrame.graphState!.visitedNodes.includes(node.id);
                  const isInFrontier = currentFrame.graphState!.frontierQueue?.includes(node.id);

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (isActive) {
                    fill = '#2563eb';
                    stroke = '#1d4ed8';
                    textFill = '#ffffff';
                  } else if (isVisited) {
                    fill = '#059669';
                    stroke = '#047857';
                    textFill = '#ffffff';
                  } else if (isInFrontier) {
                    fill = '#f59e0b';
                    stroke = '#d97706';
                    textFill = '#ffffff';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="24"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dy=".32em"
                        fill={textFill}
                        className="text-xs font-bold font-mono select-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Frontier Queue/Stack & Traversal Sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {currentFrame.graphState.frontierLabel || 'Frontier Queue'}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                  {currentFrame.graphState.frontierQueue &&
                  currentFrame.graphState.frontierQueue.length > 0 ? (
                    currentFrame.graphState.frontierQueue.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">Empty</span>
                  )}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Traversal Order / Visited Path:
                </span>
                <div className="flex items-center gap-1 flex-wrap min-h-[28px]">
                  {currentFrame.graphState.traversalOrder.length > 0 ? (
                    currentFrame.graphState.traversalOrder.map((nodeId, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {nodeId}
                        </span>
                        {idx < currentFrame.graphState!.traversalOrder.length - 1 && (
                          <span className="text-text-muted text-xs">→</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">None visited yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SESSION 68: QUERY OPTIMIZER (CBO & SYSTEM R) VISUALIZER */}
        {/* ======================================================== */}
        {currentFrame.optimizerState && (() => {
          const opt = currentFrame.optimizerState;
          const currentPlan =
            opt.allPlans.find((p) => p.id === (activePlanTabOverride || opt.activePlanId)) ||
            opt.activePlan;

          return (
            <div className="space-y-6">
              {/* Informational Banner */}
              {opt.banner && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    opt.banner.type === 'SUMMARY'
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : opt.banner.type === 'NAIVE_WARNING'
                      ? 'bg-red-50/80 border-red-300 text-red-950'
                      : opt.banner.type === 'PUSHDOWN_IMPACT'
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : opt.banner.type === 'INTERESTING_ORDER'
                      ? 'bg-sky-50/80 border-sky-300 text-sky-950'
                      : 'bg-primary-50/80 border-primary-300 text-primary-950'
                  }`}
                >
                  <div className="text-lg">
                    {opt.banner.type === 'SUMMARY'
                      ? '✓'
                      : opt.banner.type === 'NAIVE_WARNING'
                      ? '⚠️'
                      : opt.banner.type === 'PUSHDOWN_IMPACT'
                      ? '⚡'
                      : opt.banner.type === 'INTERESTING_ORDER'
                      ? '🔄'
                      : 'ℹ️'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold">{opt.banner.title}</div>
                    <div className="text-xs text-text-muted leading-relaxed">
                      {opt.banner.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Target SQL Query Bar & Relation Catalog Cards */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                      Target Declarative SQL Query
                    </span>
                    <span className="text-[10px] bg-primary-100 text-primary-800 font-semibold px-2 py-0.5 rounded">
                      Relational Calculus Input
                    </span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    Catalog: 3 Relations | 6,100,000 Total Tuples
                  </span>
                </div>

                {/* Syntax-styled Query Box */}
                <div className="bg-surface border border-border rounded-lg p-3 font-mono text-xs text-text overflow-x-auto shadow-inner">
                  <pre className="text-text-muted leading-relaxed">
                    <span className="text-primary-700 font-bold">SELECT</span> <span className="text-text">c.name, o.order_date, l.product, l.quantity, l.price</span>{"\n"}
                    <span className="text-primary-700 font-bold">FROM</span> <span className="text-amber-700 font-semibold">Customers c</span>{"\n"}
                    <span className="text-primary-700 font-bold">JOIN</span> <span className="text-sky-700 font-semibold">Orders o</span> <span className="text-primary-700 font-bold">ON</span> <span className="text-text">c.id = o.customer_id</span>{"\n"}
                    <span className="text-primary-700 font-bold">JOIN</span> <span className="text-purple-700 font-semibold">LineItems l</span> <span className="text-primary-700 font-bold">ON</span> <span className="text-text">o.id = l.order_id</span>{"\n"}
                    <span className="text-primary-700 font-bold">WHERE</span> <span className="text-emerald-700 font-semibold">c.tier = &apos;VIP&apos;</span> <span className="text-primary-700 font-bold">AND</span> <span className="text-emerald-700 font-semibold">o.total_amount &gt; 500;</span>
                  </pre>
                </div>

                {/* Target Catalog Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {opt.targetRelations.map((rel) => (
                    <div
                      key={rel.name}
                      className="bg-surface border border-border rounded-lg p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-1.5">
                        <span className="font-bold text-text font-mono">
                          {rel.name} ({rel.alias})
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">
                          {rel.pages.toLocaleString()} Pages (4KB)
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Cardinality:</span>
                          <span className="font-mono font-bold text-text">
                            {rel.cardinality.toLocaleString()} rows
                          </span>
                        </div>
                        {rel.filterPredicate && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">Predicate Filter:</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              {rel.filterPredicate}
                            </span>
                          </div>
                        )}
                        {rel.filterSelectivity !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">Selectivity (sel):</span>
                            <span className="font-mono text-primary-700 font-semibold">
                              {(rel.filterSelectivity * 100).toFixed(1)}% ({Math.round(rel.cardinality * rel.filterSelectivity).toLocaleString()} rows)
                            </span>
                          </div>
                        )}
                        <div className="pt-1 text-[10px] text-text-muted">
                          <span className="font-semibold">Indexes: </span>
                          {rel.indexes.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Execution Plan Candidates Selector */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Physical Execution Plan Candidates (Cost-Based Comparison):
                  </span>
                  <span className="text-xs font-mono text-text-muted">
                    Click plan tabs below to inspect execution tree &amp; cost breakdown
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {opt.allPlans.map((plan) => {
                    const isSelected = plan.id === currentPlan.id;
                    const isOptimal = plan.id === 'PLAN_C_SYSTEM_R_DP_MERGE';

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setActivePlanTabOverride(plan.id)}
                        className={`text-left rounded-xl border p-3.5 space-y-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? isOptimal
                              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                              : plan.id === 'PLAN_A_NAIVE_NLJ'
                              ? 'bg-red-50/80 border-red-400 ring-2 ring-red-500/20 shadow-xs'
                              : 'bg-primary-50/80 border-primary-400 ring-2 ring-primary-500/20 shadow-xs'
                            : 'bg-surface border-border hover:bg-canvas'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-text">
                            {plan.id === 'PLAN_A_NAIVE_NLJ'
                              ? 'Plan A (Naive NLJ)'
                              : plan.id === 'PLAN_B_FILTER_HASH'
                              ? 'Plan B (Predicate Hash)'
                              : 'Plan C (System R Merge)'}
                          </span>
                          {isOptimal && (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              5,250x OPTIMAL
                            </span>
                          )}
                          {plan.id === 'PLAN_A_NAIVE_NLJ' && (
                            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                              CARTESIAN
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-text-muted line-clamp-1">
                          {plan.strategy}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-[11px] font-mono">
                          <div>
                            <span className="text-text-muted block text-[10px]">Total Cost:</span>
                            <span
                              className={`font-bold ${
                                isOptimal
                                  ? 'text-emerald-700'
                                  : plan.id === 'PLAN_A_NAIVE_NLJ'
                                  ? 'text-red-700'
                                  : 'text-primary-700'
                              }`}
                            >
                              {plan.totalCost.toLocaleString()} units
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted block text-[10px]">Page I/O:</span>
                            <span className="font-bold text-text">
                              {plan.totalPageIo.toLocaleString()} pages
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted block text-[10px]">Est. Runtime:</span>
                            <span className="font-bold text-text">
                              {plan.estimatedRuntimeMs >= 1000
                                ? `${(plan.estimatedRuntimeMs / 1000).toFixed(0)}s`
                                : `${plan.estimatedRuntimeMs}ms`}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted block text-[10px]">Memory RAM:</span>
                            <span className="font-bold text-text">{plan.memoryFootprintMb} MB</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Plan AST Physical Operator Tree */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text">{currentPlan.name}</h4>
                      <span className="text-[10px] font-mono bg-canvas border border-border px-2 py-0.5 rounded text-text-muted">
                        Shape: {currentPlan.joinTreeShape}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{currentPlan.strategy}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="bg-primary-50 text-primary-800 border border-primary-200 px-2 py-1 rounded">
                      Cost: {currentPlan.totalCost.toLocaleString()}
                    </span>
                    <span className="bg-canvas border border-border text-text-muted px-2 py-1 rounded">
                      I/O: {currentPlan.totalPageIo.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Operator Tree Diagram */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Volcano Iterator Physical Operator Tree:
                  </span>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    {currentPlan.operatorNodes.map((node) => {
                      const depthIndent =
                        node.depth === 0
                          ? ''
                          : node.depth === 1
                          ? 'ml-4 sm:ml-6'
                          : node.depth === 2
                          ? 'ml-8 sm:ml-12'
                          : node.depth === 3
                          ? 'ml-12 sm:ml-18'
                          : 'ml-16 sm:ml-24';

                      return (
                        <div
                          key={node.id}
                          className={`${depthIndent} border rounded-lg p-3 bg-canvas/60 space-y-2 transition-all ${
                            node.type === 'SORT_MERGE'
                              ? 'border-emerald-300 bg-emerald-50/30'
                              : node.type === 'HASH_JOIN'
                              ? 'border-purple-300 bg-purple-50/30'
                              : node.type === 'NESTED_LOOP'
                              ? 'border-red-300 bg-red-50/30'
                              : node.type === 'FILTER'
                              ? 'border-amber-300 bg-amber-50/30'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase ${
                                  node.type === 'SORT_MERGE'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : node.type === 'HASH_JOIN'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : node.type === 'NESTED_LOOP'
                                    ? 'bg-red-100 text-red-900 border border-red-300'
                                    : node.type === 'FILTER'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : node.type === 'PROJECT'
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                                }`}
                              >
                                {node.type}
                              </span>
                              <span className="font-bold text-text text-xs">{node.name}</span>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              {node.interestingOrder && (
                                <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-semibold">
                                  Order: {node.interestingOrder}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                  node.pipelined
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                              >
                                {node.pipelined ? 'Streaming' : 'Materialized'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-text-muted font-sans">
                            <div className="flex items-center gap-3">
                              {node.inputCardinality !== undefined && (
                                <span>
                                  In: <strong className="text-text font-mono">{node.inputCardinality.toLocaleString()}</strong>
                                </span>
                              )}
                              <span>
                                Out: <strong className="text-text font-mono">{node.outputCardinality.toLocaleString()} rows</strong>
                              </span>
                              <span>
                                RAM: <strong className="text-text font-mono">{node.memoryMb} MB</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-[10px]">
                              <span>I/O: {node.ioCost.toLocaleString()}</span>
                              <span>CPU: {node.cpuCost.toLocaleString()}</span>
                              <span>Cost: <strong className="text-text">{node.cost.toLocaleString()}</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan Tradeoffs Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      Architectural Advantages:
                    </span>
                    <ul className="space-y-1 text-emerald-950 text-[11px]">
                      {currentPlan.advantages.map((adv, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 space-y-1.5">
                    <span className="font-bold text-amber-900 block text-[11px]">
                      Cost &amp; Complexity Trade-offs:
                    </span>
                    <ul className="space-y-1 text-amber-950 text-[11px]">
                      {currentPlan.disadvantages.map((dis, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">⚠</span>
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* System R Dynamic Programming Search Stage Card */}
              {opt.systemRStages && (
                <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                      System R Dynamic Programming Join Tree Enumeration (Selinger Algorithm)
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      Search Space: O(3^N) Left-Deep DP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {opt.systemRStages.map((stg) => (
                      <div
                        key={stg.level}
                        className="bg-surface border border-border rounded-lg p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-1">
                          <span className="font-bold text-text">{stg.title}</span>
                          <span className="text-[10px] font-mono text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded font-bold">
                            Stage {stg.level}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-text-muted block text-[10px]">Optimal Subplan:</span>
                            <span className="font-semibold text-emerald-800 font-mono text-[10.5px]">
                              {stg.optimalSubplan}
                            </span>
                          </div>

                          <div>
                            <span className="text-text-muted block text-[10px]">Subplans Pruned (Discarded):</span>
                            <div className="space-y-0.5">
                              {stg.prunedSubplans.map((prune, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="text-[10px] text-red-700/90 font-mono line-through"
                                >
                                  ✕ {prune}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between pt-1 border-t border-border font-mono text-[10px]">
                            <span>Cost: <strong>{stg.cost.toLocaleString()}</strong></span>
                            <span>Order: <strong className="text-sky-700">{stg.order}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selinger Cost Model & Selectivity Mathematical Breakdown */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Selinger Cost Formulation &amp; Selectivity Calculus
                  </span>
                  <span className="text-xs font-mono text-text-muted">
                    W_IO = 1.0, W_CPU = 0.001, W_Op = 0.005
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-canvas border border-border rounded-lg space-y-1.5">
                    <span className="font-bold text-primary-800 font-sans block text-[11px]">
                      General Cost Model Formula:
                    </span>
                    <div className="text-text text-[11px]">
                      Cost = (N_page_io · W_IO) + (N_tuples · W_CPU) + (N_ops · W_Op)
                    </div>
                    <div className="text-text-muted text-[10px] pt-1">
                      Where N_page_io accounts for buffer cache misses, N_tuples represents iterator projection steps, and N_ops represents hash lookups and key comparisons.
                    </div>
                  </div>

                  <div className="p-3 bg-canvas border border-border rounded-lg space-y-1.5">
                    <span className="font-bold text-primary-800 font-sans block text-[11px]">
                      Catalog Selectivity Formulations:
                    </span>
                    <div className="text-emerald-800 text-[11px]">
                      sel(tier = &apos;VIP&apos;) = 1 / Distinct(tier) = 1 / 100 = 0.01 (1,000 rows)
                    </div>
                    <div className="text-emerald-800 text-[11px]">
                      sel(amount &gt; 500) = (Max - 500) / (Max - Min) = 500 / 10000 = 0.05 (50,000 rows)
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantitative Benchmark Comparison Table */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Quantitative Architectural Optimizer Benchmark
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    Plan C Speedup: 5,250x Faster
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-text-muted">
                        <th className="py-1.5 pr-4 font-semibold">Optimization Metric</th>
                        <th className="py-1.5 px-4 font-semibold">Plan A: Naive Cartesian NLJ</th>
                        <th className="py-1.5 px-4 font-semibold">Plan B: Predicate Pushdown Hash</th>
                        <th className="py-1.5 px-4 font-semibold">Plan C: System R DP Merge</th>
                        <th className="py-1.5 pl-4 font-semibold text-right">Optimizer Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Total Selinger Cost</td>
                        <td className="py-2 px-4 text-red-700">20,400,000 units</td>
                        <td className="py-2 px-4 text-primary-700">12,400 units</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">3,880 units</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">5,250x Lower Cost</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Page I/O Loaded</td>
                        <td className="py-2 px-4 text-red-700">20,152,000 pages</td>
                        <td className="py-2 px-4 text-primary-700">152,000 pages</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">1,790 pages</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">99.99% I/O Saved</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Intermediate Tuples</td>
                        <td className="py-2 px-4 text-red-700">100,000,000 (Cartesian)</td>
                        <td className="py-2 px-4 text-primary-700">50,000 tuples</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">0 (Pure Stream)</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">100% Cartesian Cut</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Memory Footprint (RAM)</td>
                        <td className="py-2 px-4 text-red-700">12.0 MB (Buffer Pool)</td>
                        <td className="py-2 px-4 text-primary-700">4.8 MB (Hash Table)</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">0.4 MB</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">96.7% Memory Cut</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Temp File Sort Spills</td>
                        <td className="py-2 px-4 text-red-700">Buffer Thrashing</td>
                        <td className="py-2 px-4 text-primary-700">Zero (Fits in RAM)</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">Zero (B+Tree Clustered)</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">Zero Disk Spills</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-sans font-medium text-text">Estimated Query Latency</td>
                        <td className="py-2 px-4 text-red-700">~180,000 ms (3 min)</td>
                        <td className="py-2 px-4 text-primary-700">110 ms</td>
                        <td className="py-2 px-4 text-emerald-700 font-bold">12 ms</td>
                        <td className="py-2 pl-4 text-right text-emerald-700 font-bold">15,000x Speedup</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4 Socratic Invariant Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                  <span className="font-bold text-text block text-[11px]">
                    1. Relational Algebra Equivalence
                  </span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Logical equivalence guarantees that rewriting query topologies preserves identical mathematical result sets while granting freedom to commute, associate, and push filters below joins.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                  <span className="font-bold text-text block text-[11px]">
                    2. Predicate Pushdown Invariant
                  </span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Filtering at the physical scan layer eliminates 99% of tuples before they reach join operators, preserving memory bandwidth and preventing combinatorial tuple explosion.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                  <span className="font-bold text-text block text-[11px]">
                    3. Left-Deep Tree vs Bushy Trees
                  </span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    System R restricts the search space to left-deep join trees, bounding optimization complexity to O(3^N) while ensuring inner relations are indexed and intermediate materialization is minimized.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                  <span className="font-bold text-text block text-[11px]">
                    4. Interesting Orders &amp; Clustered Layout
                  </span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    A scan that produces tuples sorted on join keys eliminates downstream sort operations. Sort-Merge Join runs in pure streaming pipelined fashion with zero temporary files.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}


        {/* Tree Display (for BST_INSERTION_INORDER & AVL_TREE_ROTATIONS) */}
        {currentFrame.treeState && (
          <div className="space-y-4">
            {/* AVL Rotation Alert Banner */}
            {currentFrame.treeState.rotationBanner && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-mono shrink-0">
                    {currentFrame.treeState.rotationBanner.type} ROTATION
                  </span>
                  <span className="font-bold text-text">
                    {currentFrame.treeState.rotationBanner.title}
                  </span>
                </div>
                <span className="text-text-muted text-xs">
                  {currentFrame.treeState.rotationBanner.description}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold">
                {selectedAlgoId === 'AVL_TREE_ROTATIONS'
                  ? 'Self-Balancing AVL Tree Topology (Balance Factors & Heights)'
                  : selectedAlgoId === 'RED_BLACK_TREE'
                  ? 'Red-Black Tree Topology (Color Invariants & Black-Height)'
                  : 'Binary Search Tree Layout'}
              </span>
              <span className="font-mono">Total Nodes: {currentFrame.treeState.nodes.length}</span>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg
                viewBox="0 0 420 255"
                className="w-full max-w-[520px] h-60 bg-surface rounded-lg border border-border shadow-2xs"
              >
                {/* Tree Edges */}
                {currentFrame.treeState.nodes.map((node) => {
                  const leftChild = currentFrame.treeState!.nodes.find((n) => n.id === node.left);
                  const rightChild = currentFrame.treeState!.nodes.find((n) => n.id === node.right);

                  return (
                    <g key={`edges-${node.id}`}>
                      {leftChild && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={leftChild.x}
                          y2={leftChild.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )}
                      {rightChild && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={rightChild.x}
                          y2={rightChild.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Tree Nodes */}
                {currentFrame.treeState.nodes.map((node) => {
                  const isActive = currentFrame.treeState!.activeNodeId === node.id;
                  const isCompared = currentFrame.treeState!.comparedNodeId === node.id;
                  const isNew = node.isNew;
                  const isImbalanced = node.isImbalanced;
                  const isPivot = node.isPivot;
                  const isRecolorWarning = node.recolorWarning;

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (node.color === 'RED') {
                    fill = '#ef4444';
                    stroke = '#b91c1c';
                    textFill = '#ffffff';
                  } else if (node.color === 'BLACK') {
                    fill = '#1e293b';
                    stroke = '#0f172a';
                    textFill = '#ffffff';
                  } else if (isImbalanced) {
                    fill = '#fee2e2';
                    stroke = '#ef4444';
                    textFill = '#b91c1c';
                  } else if (isPivot) {
                    fill = '#ede9fe';
                    stroke = '#8b5cf6';
                    textFill = '#6d28d9';
                  } else if (isNew) {
                    fill = '#10b981';
                    stroke = '#059669';
                    textFill = '#ffffff';
                  } else if (isActive) {
                    fill = '#2563eb';
                    stroke = '#1d4ed8';
                    textFill = '#ffffff';
                  } else if (isCompared) {
                    fill = '#f59e0b';
                    stroke = '#d97706';
                    textFill = '#ffffff';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {/* Pulse ring for active nodes */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="22"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}

                      {/* Imbalance warning ring */}
                      {isImbalanced && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="24"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Consecutive RED violation warning ring */}
                      {isRecolorWarning && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                          className="animate-pulse"
                        />
                      )}

                      {/* Pivot highlight ring */}
                      {isPivot && !isImbalanced && !isRecolorWarning && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="23"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                          opacity="0.7"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                      />

                      {/* Node Value Text */}
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dy=".32em"
                        fill={textFill}
                        className="text-xs font-bold font-mono select-none"
                      >
                        {node.val}
                      </text>

                      {/* Balance Factor Pill Badge */}
                      {node.balanceFactor !== undefined && (
                        <g>
                          <rect
                            x={node.x - 18}
                            y={node.y - 30}
                            width="36"
                            height="13"
                            rx="3"
                            fill={
                              isImbalanced
                                ? '#ef4444'
                                : Math.abs(node.balanceFactor) > 0
                                ? '#d97706'
                                : '#10b981'
                            }
                          />
                          <text
                            x={node.x}
                            y={node.y - 20}
                            textAnchor="middle"
                            className="text-[9px] font-bold font-mono fill-white select-none"
                          >
                            BF:{node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                          </text>
                        </g>
                      )}

                      {/* Red-Black Tree Node Color & Black-Height Badge */}
                      {node.color !== undefined && (
                        <g>
                          <rect
                            x={node.x - 16}
                            y={node.y - 30}
                            width="32"
                            height="13"
                            rx="3"
                            fill={node.color === 'RED' ? '#b91c1c' : '#0f172a'}
                          />
                          <text
                            x={node.x}
                            y={node.y - 20}
                            textAnchor="middle"
                            className="text-[9px] font-bold font-mono fill-white select-none"
                          >
                            {node.color === 'RED' ? 'RED' : 'BLK'}
                          </text>
                        </g>
                      )}

                      {/* Node Height Indicator */}
                      {node.height !== undefined && (
                        <text
                          x={node.x + 18}
                          y={node.y + 13}
                          className="text-[9px] font-mono font-bold fill-slate-500 select-none"
                        >
                          h={node.height}
                        </text>
                      )}

                      {/* Black-Height Indicator */}
                      {node.blackHeight !== undefined && (
                        <text
                          x={node.x + 18}
                          y={node.y + 13}
                          className="text-[9px] font-mono font-bold fill-slate-500 select-none"
                        >
                          bh={node.blackHeight}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* In-Order Traversal Output Stream */}
            {currentFrame.treeState.traversalOrder && (
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {currentFrame.treeState.traversalLabel || 'In-Order Traversal Stream (Sorted)'}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                  {currentFrame.treeState.traversalOrder.length > 0 ? (
                    currentFrame.treeState.traversalOrder.map((val, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                      >
                        {val}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">No nodes emitted yet</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-Way B-Tree / 2-3-4 Tree Display */}
        {currentFrame.bTreeState && (
          <div className="space-y-4">
            {/* Split / Elevation Alert Banner */}
            {currentFrame.bTreeState.splitBanner && (
              <div
                className={`border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                        ? 'text-cyan-900 dark:text-cyan-300'
                        : 'text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {currentFrame.bTreeState.splitBanner.type === 'LEAF_SPLIT'
                      ? '⚡ Node Split'
                      : currentFrame.bTreeState.splitBanner.type === 'ROOT_SPLIT'
                      ? '🌲 Root Split (Tree Height +1)'
                      : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                      ? '➡️ Leaf Sibling Hop'
                      : currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                      ? '🎯 Range Scan Match'
                      : '⬆️ Median Elevation'}:
                  </span>
                  <span className="font-semibold text-text">
                    {currentFrame.bTreeState.splitBanner.title}
                  </span>
                </div>
                <span className="text-text-muted text-[11px]">
                  {currentFrame.bTreeState.splitBanner.description}
                </span>
              </div>
            )}

            {/* SVG Canvas for Multi-Way B-Tree & B+ Tree */}
            <div className="w-full flex justify-center bg-surface/50 border border-border rounded-xl p-3 overflow-x-auto">
              <svg
                viewBox="0 0 460 250"
                className="w-full max-w-2xl h-64 select-none font-sans"
              >
                {/* Connection lines from parents to children */}
                {currentFrame.bTreeState.nodes.map((node) => {
                  if (!node.children || node.children.length === 0) return null;
                  const nodeWidth = Math.max(60, node.keys.length * 36 + 16);
                  const nodeHeight = 32;

                  return (
                    <g key={`links-${node.id}`}>
                      {node.children.map((childId, childIdx) => {
                        const childNode = currentFrame.bTreeState!.nodes.find((n) => n.id === childId);
                        if (!childNode) return null;
                        const totalSlots = node.children!.length;
                        const startX = node.x - nodeWidth / 2 + (nodeWidth / (totalSlots + 1)) * (childIdx + 1);
                        const startY = node.y + nodeHeight / 2;
                        const endX = childNode.x;
                        const endY = childNode.y - nodeHeight / 2;

                        return (
                          <line
                            key={`link-${node.id}-${childId}`}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Leaf Horizontal Sibling Pointer Chains (for B+ Tree) */}
                {currentFrame.bTreeState.siblingLinks &&
                  currentFrame.bTreeState.siblingLinks.map((link, lIdx) => {
                    const fromNode = currentFrame.bTreeState!.nodes.find((n) => n.id === link.from);
                    const toNode = currentFrame.bTreeState!.nodes.find((n) => n.id === link.to);
                    if (!fromNode || !toNode) return null;
                    const fromWidth = Math.max(60, fromNode.keys.length * 36 + 16);
                    const toWidth = Math.max(60, toNode.keys.length * 36 + 16);
                    const startX = fromNode.x + fromWidth / 2;
                    const startY = fromNode.y;
                    const endX = toNode.x - toWidth / 2;
                    const endY = toNode.y;

                    return (
                      <g key={`sibling-${lIdx}`}>
                        <line
                          x1={startX + 3}
                          y1={startY}
                          x2={endX - 8}
                          y2={endY}
                          stroke={link.active ? '#06b6d4' : '#64748b'}
                          strokeWidth={link.active ? 3 : 1.5}
                          strokeDasharray={link.active ? '4 2' : '2 2'}
                        />
                        {/* Traversal Arrowhead */}
                        <polygon
                          points={`${endX - 3},${endY} ${endX - 9},${endY - 4} ${endX - 9},${endY + 4}`}
                          fill={link.active ? '#06b6d4' : '#64748b'}
                        />
                        {link.active && (
                          <text
                            x={(startX + endX) / 2}
                            y={startY - 9}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold fill-cyan-600 select-none"
                          >
                            SIBLING HOP
                          </text>
                        )}
                      </g>
                    );
                  })}

                {/* B-Tree / B+ Tree Segmented Nodes */}
                {currentFrame.bTreeState.nodes.map((node) => {
                  const isActive = currentFrame.bTreeState!.activeNodeId === node.id;
                  const isFull = node.isFull;
                  const isOverflow = node.isOverflow;
                  const isElevating = node.isElevating;
                  const nodeWidth = Math.max(60, node.keys.length * 36 + 16);
                  const nodeHeight = 32;

                  let borderColor = '#cbd5e1';
                  let bgColor = '#ffffff';

                  if (isOverflow) {
                    borderColor = '#ef4444';
                    bgColor = '#fef2f2';
                  } else if (isElevating) {
                    borderColor = '#8b5cf6';
                    bgColor = '#f5f3ff';
                  } else if (isActive) {
                    borderColor = '#3b82f6';
                    bgColor = '#eff6ff';
                  } else if (isFull) {
                    borderColor = '#f59e0b';
                    bgColor = '#fffbeb';
                  } else if (node.nodeType === 'ROUTER') {
                    borderColor = '#6366f1';
                    bgColor = '#f8fafc';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {/* Pulse ring for active or overflowing nodes */}
                      {isActive && (
                        <rect
                          x={node.x - nodeWidth / 2 - 4}
                          y={node.y - nodeHeight / 2 - 4}
                          width={nodeWidth + 8}
                          height={nodeHeight + 8}
                          rx="10"
                          fill="none"
                          stroke={isOverflow ? '#ef4444' : '#3b82f6'}
                          strokeWidth="2"
                          strokeDasharray={isOverflow ? '4 2' : undefined}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Box */}
                      <rect
                        x={node.x - nodeWidth / 2}
                        y={node.y - nodeHeight / 2}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="6"
                        fill={bgColor}
                        stroke={borderColor}
                        strokeWidth="2"
                      />

                      {/* Internal Key Slots */}
                      {node.keys.map((keyVal, keyIdx) => {
                        const slotWidth = 32;
                        const slotHeight = 24;
                        const slotX =
                          node.x - nodeWidth / 2 + 8 + keyIdx * 36;
                        const slotY = node.y - slotHeight / 2;

                        const isTarget = currentFrame.bTreeState!.targetKey === keyVal;
                        const isPromoted = currentFrame.bTreeState!.promotedKey === keyVal;
                        const isKeyHighlighted = node.highlightedKeys?.includes(keyVal);

                        let keyBg = '#f1f5f9';
                        let keyText = '#0f172a';
                        let keyBorder = '#e2e8f0';

                        if (isPromoted) {
                          keyBg = '#8b5cf6';
                          keyText = '#ffffff';
                          keyBorder = '#7c3aed';
                        } else if (isTarget) {
                          keyBg = '#10b981';
                          keyText = '#ffffff';
                          keyBorder = '#059669';
                        } else if (isKeyHighlighted) {
                          keyBg = '#f59e0b';
                          keyText = '#ffffff';
                          keyBorder = '#d97706';
                        }

                        return (
                          <g key={`key-${node.id}-${keyIdx}`}>
                            <rect
                              x={slotX}
                              y={slotY}
                              width={slotWidth}
                              height={slotHeight}
                              rx="4"
                              fill={keyBg}
                              stroke={keyBorder}
                              strokeWidth="1.5"
                            />
                            <text
                              x={slotX + slotWidth / 2}
                              y={slotY + slotHeight / 2}
                              textAnchor="middle"
                              dy=".32em"
                              fill={keyText}
                              className="text-xs font-bold font-mono select-none"
                            >
                              {keyVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Node Status Tag (Full / 2-node / 3-node / 4-node / Router / Leaf) */}
                      <g>
                        <text
                          x={node.x}
                          y={node.y + nodeHeight / 2 + 12}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-semibold fill-slate-500 select-none"
                        >
                          {node.nodeType === 'ROUTER'
                            ? 'ROUTER (INDEX)'
                            : node.nodeType === 'LEAF'
                            ? 'DATA LEAF PAGE'
                            : node.keys.length === 1
                            ? '2-node'
                            : node.keys.length === 2
                            ? '3-node'
                            : node.keys.length === 3
                            ? '4-node (FULL)'
                            : 'OVERFLOW'}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Range Query Buffer & Disk Page I/O HUD (for B+ Tree) */}
            {currentFrame.bTreeState.rangeQuery && (
              <div className="bg-surface border border-border rounded-lg p-3 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Query Filter:
                    </span>
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded text-xs">
                      SELECT records WHERE key &gt;= {currentFrame.bTreeState.rangeQuery.min} AND key &lt;= {currentFrame.bTreeState.rangeQuery.max}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-text-muted">Page I/Os:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {currentFrame.bTreeState.pageReads ?? 0} Disk Fetches
                    </span>
                    {currentFrame.bTreeState.rangeQuery.isTerminated && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ✓ Range Scan Halted
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Range Query Result Stream:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                    {currentFrame.bTreeState.rangeQuery.results.length > 0 ? (
                      currentFrame.bTreeState.rangeQuery.results.map((keyVal, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                        >
                          key: {keyVal}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted italic">Result buffer empty (locating start leaf...)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Invariant Properties Summary */}
            <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                <span className="uppercase tracking-wider">
                  {currentFrame.bTreeState.isBPlusTree
                    ? 'B+ Tree Indexing & External Memory Invariant Properties:'
                    : 'B-Tree / 2-3-4 Order M=4 Invariant Properties:'}
                </span>
                <span>
                  {currentFrame.bTreeState.isBPlusTree
                    ? 'O(log_B N + K/B) Range I/Os'
                    : 'Max Capacity: 3 Keys, 4 Children'}
                </span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                {currentFrame.bTreeState.isBPlusTree
                  ? 'All actual record keys reside strictly in leaf pages linked by horizontal sibling pointers. Internal index pages store only separator keys to guide point search down to the initial leaf. Once reached, sequential scans traverse sibling pointers directly with zero root re-traversals.'
                  : `Internal nodes with k keys have exactly k + 1 children. All leaf nodes reside at uniform tree height h=${currentFrame.bTreeState.treeHeight}. Overflow triggers preemptive median promotion, growing tree height from root down.`}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Bloom Filter Bit-Array Hashing Display */}
        {currentFrame.bloomFilterState && (
          <div className="space-y-4">
            {/* Top Status & Probabilistic HUD */}
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    currentFrame.bloomFilterState.operation === 'INSERT'
                      ? 'bg-primary-100 text-primary-900 border border-primary-300'
                      : currentFrame.bloomFilterState.operation === 'QUERY'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'bg-canvas text-text-muted border border-border'
                  }`}
                >
                  OP: {currentFrame.bloomFilterState.operation}
                </span>

                {currentFrame.bloomFilterState.targetKey && (
                  <span className="font-semibold text-text">
                    Target: <code className="bg-canvas px-1.5 py-0.5 rounded border border-border text-primary-700 font-mono">{currentFrame.bloomFilterState.targetKey}</code>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Saturation:</span>
                  <span className="font-mono font-bold text-text">
                    {currentFrame.bloomFilterState.filterMetrics.bitsSet} / {currentFrame.bloomFilterState.bitArraySize} ({currentFrame.bloomFilterState.filterMetrics.saturation}%)
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Theoretical FPR:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    p ≈ {currentFrame.bloomFilterState.filterMetrics.theoreticalFpr}%
                  </span>
                </div>
              </div>
            </div>

            {/* Query Result / False Positive Alert Banner */}
            {currentFrame.bloomFilterState.queryResult && (
              <div
                className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.bloomFilterState.queryResult.isFalsePositive
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : currentFrame.bloomFilterState.queryResult.isPositive
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.bloomFilterState.queryResult.isFalsePositive
                        ? 'text-amber-900 dark:text-amber-300'
                        : currentFrame.bloomFilterState.queryResult.isPositive
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-indigo-900 dark:text-indigo-300'
                    }`}
                  >
                    {currentFrame.bloomFilterState.queryResult.isFalsePositive
                      ? '⚠️ False Positive Detected'
                      : currentFrame.bloomFilterState.queryResult.isPositive
                      ? '✓ Probable Member Match'
                      : '🛡️ Definite Negative (Zero False Negatives!)'}:
                  </span>
                  <span className="text-text font-medium">
                    {currentFrame.bloomFilterState.queryResult.reason}
                  </span>
                </div>
              </div>
            )}

            {/* Bloom Filter Bit Array Grid */}
            <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                <span>Bit Array ($m = {currentFrame.bloomFilterState.bitArraySize}$ bits in RAM):</span>
                <span>Active Probes Highlighted</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-18 gap-1.5 pt-1">
                {currentFrame.bloomFilterState.bits.map((bitVal, bitIdx) => {
                  const isActive = currentFrame.bloomFilterState!.activeBits?.includes(bitIdx);
                  const isCollided = currentFrame.bloomFilterState!.collidedBits?.includes(bitIdx);

                  let cellBg = 'bg-surface border-border text-slate-400';
                  if (bitVal === 1) {
                    cellBg = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  }

                  return (
                    <div
                      key={bitIdx}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all duration-200 ${cellBg} ${
                        isActive
                          ? isCollided
                            ? 'ring-2 ring-purple-500 scale-105 shadow-xs'
                            : 'ring-2 ring-cyan-500 scale-105 shadow-xs'
                          : ''
                      }`}
                    >
                      <span className="text-[9px] font-mono text-text-muted select-none">
                        [{bitIdx}]
                      </span>
                      <span className="text-base font-mono font-extrabold select-none">
                        {bitVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Hash Function Pipelines */}
            {currentFrame.bloomFilterState.hashComputations &&
              currentFrame.bloomFilterState.hashComputations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentFrame.bloomFilterState.hashComputations.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-3 rounded-lg bg-surface border border-border space-y-1.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text font-mono text-[11px]">
                          {h.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            h.bitValue === 1
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          B[{h.bitIndex}] = {h.bitValue}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-text-muted truncate">
                        {h.formula}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* Registered Elements Registry & Math Invariants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Registered Keys in Filter ({currentFrame.bloomFilterState.insertedKeys.length}):
                </span>
                <div className="space-y-1 min-h-[40px]">
                  {currentFrame.bloomFilterState.insertedKeys.length > 0 ? (
                    currentFrame.bloomFilterState.insertedKeys.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between font-mono text-[11px] bg-canvas px-2 py-1 rounded border border-border"
                      >
                        <span className="font-semibold text-primary-700">{item.key}</span>
                        <span className="text-text-muted text-[10px]">
                          bits: [{item.indices.join(', ')}]
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">No keys inserted yet</span>
                  )}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                  <span className="uppercase tracking-wider">Bloom Filter Mathematical Invariants:</span>
                  <span>k = (m/n) · ln(2)</span>
                </div>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  False Negative Rate is strictly <strong className="text-emerald-600">0.00%</strong>. If any hash bit is 0, the key was never inserted. False positive probability follows <code className="text-primary-600 font-mono">p ≈ (1 - e^(-kn/m))^k</code>. 10 bits/key achieves &lt;1% FPR in LSM storage engines (Cassandra, RocksDB).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Trie & Radix Tree Visualizer Display */}
        {currentFrame.trieState && (
          <div className="space-y-4">
            {/* Top Status & Query HUD */}
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    currentFrame.trieState.operation === 'INSERT'
                      ? 'bg-primary-100 text-primary-900 border border-primary-300'
                      : currentFrame.trieState.operation === 'SEARCH'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : currentFrame.trieState.operation === 'AUTOCOMPLETE'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : currentFrame.trieState.operation === 'RADIX_COMPRESS'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-canvas text-text-muted border border-border'
                  }`}
                >
                  OP: {currentFrame.trieState.operation}
                </span>

                <span
                  className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${
                    currentFrame.trieState.isRadixMode
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-canvas text-text-muted border-border'
                  }`}
                >
                  {currentFrame.trieState.isRadixMode
                    ? '⚡ Compressed Radix Tree (Patricia)'
                    : '🌲 Standard Prefix Trie'}
                </span>

                {currentFrame.trieState.activeQuery && (
                  <span className="font-semibold text-text">
                    Query: <code className="bg-canvas px-1.5 py-0.5 rounded border border-border text-primary-700 font-mono">&quot;{currentFrame.trieState.activeQuery}&quot;</code>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Total Nodes:</span>
                  <span className="font-mono font-bold text-text">
                    {currentFrame.trieState.metrics.totalNodes}
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Words Stored:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {currentFrame.trieState.metrics.wordCount}
                  </span>
                </div>
                {currentFrame.trieState.metrics.compressionRatio && (
                  <>
                    <span className="text-border">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted">Memory Savings:</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                        {currentFrame.trieState.metrics.compressionRatio}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Socratic Banner Alert */}
            {currentFrame.trieState.banner && (
              <div
                className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.trieState.banner.type === 'SEARCH_HIT'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : currentFrame.trieState.banner.type === 'SEARCH_MISS'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : currentFrame.trieState.banner.type === 'PREFIX_MATCH'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.trieState.banner.type === 'SEARCH_HIT'
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : currentFrame.trieState.banner.type === 'SEARCH_MISS'
                        ? 'text-rose-900 dark:text-rose-300'
                        : currentFrame.trieState.banner.type === 'PREFIX_MATCH'
                        ? 'text-amber-900 dark:text-amber-300'
                        : 'text-purple-900 dark:text-purple-300'
                    }`}
                  >
                    {currentFrame.trieState.banner.title}:
                  </span>
                  <span className="text-text font-medium">
                    {currentFrame.trieState.banner.description}
                  </span>
                </div>
              </div>
            )}

            {/* Trie / Radix Tree SVG Canvas */}
            <div className="bg-surface/50 border border-border rounded-xl p-3 flex flex-col items-center justify-center overflow-x-auto">
              <svg
                width="100%"
                height="340"
                viewBox="0 0 720 420"
                className="max-w-[720px] select-none"
              >
                <defs>
                  <marker
                    id="arrowhead-trie"
                    markerWidth="7"
                    markerHeight="5"
                    refX="22"
                    refY="2.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 2.5, 0 5" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowhead-trie-active"
                    markerWidth="7"
                    markerHeight="5"
                    refX="22"
                    refY="2.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 2.5, 0 5" fill="#06b6d4" />
                  </marker>
                  <marker
                    id="arrowhead-trie-compressed"
                    markerWidth="7"
                    markerHeight="5"
                    refX="32"
                    refY="2.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 2.5, 0 5" fill="#a855f7" />
                  </marker>
                </defs>

                {/* Edges */}
                {currentFrame.trieState.edges.map((edge, idx) => {
                  const fromNode = currentFrame.trieState!.nodes.find((n) => n.id === edge.from);
                  const toNode = currentFrame.trieState!.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isActive = edge.isActive;
                  const isCompressed = edge.isCompressed;
                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;

                  return (
                    <g key={`edge-${idx}`}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isActive ? '#06b6d4' : isCompressed ? '#a855f7' : '#94a3b8'}
                        strokeWidth={isActive || isCompressed ? 2.5 : 1.75}
                        strokeDasharray={isCompressed ? '4 2' : undefined}
                        markerEnd={
                          isActive
                            ? 'url(#arrowhead-trie-active)'
                            : isCompressed
                            ? 'url(#arrowhead-trie-compressed)'
                            : 'url(#arrowhead-trie)'
                        }
                        className="transition-all duration-300"
                      />
                      {/* Edge Label Pill */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={isCompressed ? -16 : -8}
                          y={-8}
                          width={isCompressed ? 32 : 16}
                          height={16}
                          rx={4}
                          fill={isActive ? '#ecfeff' : isCompressed ? '#faf5ff' : '#f8fafc'}
                          stroke={isActive ? '#06b6d4' : isCompressed ? '#c084fc' : '#cbd5e1'}
                          strokeWidth={1}
                        />
                        <text
                          x={0}
                          y={3}
                          textAnchor="middle"
                          fontSize={isCompressed ? '10' : '9'}
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill={isActive ? '#0891b2' : isCompressed ? '#7e22ce' : '#475569'}
                        >
                          {edge.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Nodes */}
                {currentFrame.trieState.nodes.map((node) => {
                  const isRoot = node.id === 'root';
                  const isCompressed = node.isCompressed;
                  const isEnd = node.isEndOfWord;
                  const status = node.status || 'IDLE';

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (status === 'ACTIVE') {
                    fill = '#06b6d4';
                    stroke = '#0891b2';
                    textFill = '#ffffff';
                  } else if (status === 'MATCHED') {
                    fill = '#10b981';
                    stroke = '#059669';
                    textFill = '#ffffff';
                  } else if (status === 'MISMATCH') {
                    fill = '#f43f5e';
                    stroke = '#e11d48';
                    textFill = '#ffffff';
                  } else if (status === 'AUTOCOMPLETE_MATCH') {
                    fill = '#f59e0b';
                    stroke = '#d97706';
                    textFill = '#ffffff';
                  }

                  if (isCompressed && node.char.length > 2) {
                    return (
                      <g key={node.id} className="transition-all duration-300 cursor-default">
                        {isEnd && (
                          <rect
                            x={node.x - 38}
                            y={node.y - 18}
                            width={76}
                            height={36}
                            rx={10}
                            fill="none"
                            stroke="#059669"
                            strokeWidth={2}
                            strokeDasharray="3 2"
                          />
                        )}
                        <rect
                          x={node.x - 34}
                          y={node.y - 15}
                          width={68}
                          height={30}
                          rx={8}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={2}
                          className="shadow-xs"
                        />
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill={textFill}
                        >
                          {node.char}
                        </text>
                        {isEnd && (
                          <text
                            x={node.x + 30}
                            y={node.y - 12}
                            fontSize="10"
                            fill="#059669"
                            fontWeight="bold"
                          >
                            ★
                          </text>
                        )}
                      </g>
                    );
                  }

                  return (
                    <g key={node.id} className="transition-all duration-300 cursor-default">
                      {/* Double Concentric Ring for isEndOfWord (DFA Terminal State) */}
                      {isEnd && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={23}
                          fill="none"
                          stroke={status === 'MATCHED' || status === 'AUTOCOMPLETE_MATCH' ? stroke : '#10b981'}
                          strokeWidth={2}
                          strokeDasharray="4 2"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isRoot ? 17 : 18}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={2}
                        className="shadow-xs"
                      />
                      <text
                        x={node.x}
                        y={node.y + (isRoot ? 3 : 4)}
                        textAnchor="middle"
                        fontSize={isRoot ? '9' : '12'}
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={textFill}
                      >
                        {isRoot ? 'ROOT' : node.char}
                      </text>
                      {isEnd && (
                        <circle
                          cx={node.x + 13}
                          cy={node.y - 13}
                          r={4}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth={1}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Registered Elements & Autocomplete Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Registered Words Catalog */}
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Registered Dictionary Words ({currentFrame.trieState.registeredWords.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {currentFrame.trieState.registeredWords.length > 0 ? (
                    currentFrame.trieState.registeredWords.map((w, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-border text-primary-700 font-semibold"
                      >
                        ✓ {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">Empty Dictionary (Root Only)</span>
                  )}
                </div>
              </div>

              {/* Autocomplete Suggestions / Radix Invariants */}
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                {currentFrame.trieState.autocompleteSuggestions ? (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      <span className="uppercase tracking-wider">Autocomplete Results (Subtree DFS):</span>
                      <span>{currentFrame.trieState.autocompleteSuggestions.length} Matches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentFrame.trieState.autocompleteSuggestions.map((sug, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 px-2 py-0.5 rounded font-bold"
                        >
                          → {sug}
                        </span>
                      ))}
                    </div>
                  </>
                ) : currentFrame.trieState.isRadixMode ? (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 dark:text-purple-300">
                      <span className="uppercase tracking-wider">Radix Patricia Compression:</span>
                      <span>Space: O(N)</span>
                    </div>
                    <p className="text-text-muted text-[11px] leading-relaxed">
                      Single-child chains <code className="text-purple-600 font-mono">u→t→h</code> and <code className="text-purple-600 font-mono">o→r</code> compressed into composite edges <code className="font-mono font-bold">&quot;uth&quot;</code> and <code className="font-mono font-bold">&quot;or&quot;</code>. Slashes pointer allocations by 41.7% while preserving exact O(L) search guarantees.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                      <span className="uppercase tracking-wider">Trie Mathematical Invariants:</span>
                      <span>Time: O(L)</span>
                    </div>
                    <p className="text-text-muted text-[11px] leading-relaxed">
                      Search, insertion, and deletion time is strictly proportional to key length <strong className="text-primary-700">L</strong>, completely independent of dictionary size N. Terminal nodes act as DFA accepting states with zero hash collisions.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Inverted Index & Okapi BM25 Scoring Display */}
        {currentFrame.invertedIndexState && (
          <div className="space-y-4">
            {/* Top Status & Query HUD */}
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-primary-100 text-primary-900 border border-primary-300">
                  {currentFrame.invertedIndexState.queryType || 'INDEX_CORPUS'}
                </span>

                {currentFrame.invertedIndexState.activeQuery && (
                  <span className="font-semibold text-text">
                    Query: <code className="bg-canvas px-1.5 py-0.5 rounded border border-border text-primary-700 font-mono">&quot;{currentFrame.invertedIndexState.activeQuery}&quot;</code>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Corpus Docs (N):</span>
                  <span className="font-mono font-bold text-text">
                    {currentFrame.invertedIndexState.corpus.length}
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">avgdl:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {currentFrame.invertedIndexState.avgdl} words
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Parameters:</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                    k₁={currentFrame.invertedIndexState.k1}, b={currentFrame.invertedIndexState.b}
                  </span>
                </div>
              </div>
            </div>

            {/* Socratic Banner Alert */}
            {currentFrame.invertedIndexState.banner && (
              <div
                className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.invertedIndexState.banner.type === 'ANTI_STUFFING'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : currentFrame.invertedIndexState.banner.type === 'INTERSECTION_MATCH'
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.invertedIndexState.banner.type === 'ANTI_STUFFING'
                        ? 'text-purple-900 dark:text-purple-300'
                        : currentFrame.invertedIndexState.banner.type === 'INTERSECTION_MATCH'
                        ? 'text-indigo-900 dark:text-indigo-300'
                        : 'text-emerald-900 dark:text-emerald-300'
                    }`}
                  >
                    {currentFrame.invertedIndexState.banner.title}:
                  </span>
                  <span className="text-text font-medium">
                    {currentFrame.invertedIndexState.banner.description}
                  </span>
                </div>
              </div>
            )}

            {/* Corpus Document Cards Grid */}
            <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                <span>Ingested Document Collection ($N = {currentFrame.invertedIndexState.corpus.length}$):</span>
                <span>Document Length ($|D|$) &amp; Tokens</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {currentFrame.invertedIndexState.corpus.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-surface border border-border space-y-1.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text font-mono text-[11px] bg-canvas px-1.5 py-0.5 rounded border border-border">
                        {doc.id}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">
                        |D| = {doc.length} words
                      </span>
                    </div>
                    <span className="font-semibold text-text block text-[11px]">
                      {doc.title}
                    </span>
                    <p className="font-mono text-[10px] text-text-muted leading-relaxed bg-canvas p-1.5 rounded border border-border">
                      {doc.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inverted Index Posting Lists Visualizer */}
            {currentFrame.invertedIndexState.terms.length > 0 && (
              <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                  <span>Inverted Index Dictionary ($V = {currentFrame.invertedIndexState.terms.length}$ Vocabulary Terms):</span>
                  <span className="font-mono">Term → Posting List [docId, tf]</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                  {currentFrame.invertedIndexState.terms.map((t) => {
                    const isActive = t.isActive;
                    return (
                      <div
                        key={t.term}
                        className={`p-2.5 rounded-lg border text-xs transition-all ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-400 ring-1 ring-primary-400 shadow-xs'
                            : 'bg-surface border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-[11px] text-primary-700">
                            &quot;{t.term}&quot;
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            df={t.df} | IDF={t.idf.toFixed(3)}
                          </span>
                        </div>

                        {/* Postings Chain */}
                        <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                          {t.postings.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className={`px-1.5 py-0.5 rounded border font-semibold ${
                                isActive
                                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 border-primary-300'
                                  : 'bg-canvas text-text border-border'
                              }`}
                            >
                              {p.docId} <span className="text-text-muted text-[9px]">(tf={p.tf})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Two-Pointer Intersection Visualizer (if active) */}
            {currentFrame.invertedIndexState.twoPointerState && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
                  <span>Two-Pointer Leapfrog Posting Intersection:</span>
                  <span className="font-mono text-[11px]">Time Complexity: O(L₁ + L₂)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-canvas border border-border p-2.5 rounded-lg space-y-1">
                    <span className="font-bold text-text font-mono text-[11px]">
                      Pointer 1: &quot;{currentFrame.invertedIndexState.twoPointerState.term1}&quot;
                    </span>
                    <p className="text-[11px] text-text-muted font-mono">
                      Index [{currentFrame.invertedIndexState.twoPointerState.ptr1}] → Doc D1
                    </p>
                  </div>
                  <div className="bg-canvas border border-border p-2.5 rounded-lg space-y-1">
                    <span className="font-bold text-text font-mono text-[11px]">
                      Pointer 2: &quot;{currentFrame.invertedIndexState.twoPointerState.term2}&quot;
                    </span>
                    <p className="text-[11px] text-text-muted font-mono">
                      Index [{currentFrame.invertedIndexState.twoPointerState.ptr2}] → Doc D1
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-text-muted font-semibold">Matched Conjunctive Documents:</span>
                  {currentFrame.invertedIndexState.twoPointerState.matchedDocIds.map((docId) => (
                    <span
                      key={docId}
                      className="font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300"
                    >
                      ✓ {docId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BM25 Scoring Breakdown Table */}
            {currentFrame.invertedIndexState.rankedResults &&
              currentFrame.invertedIndexState.rankedResults.length > 0 && (
                <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text">
                      Okapi BM25 Relevance Score Breakdown &amp; Ranking
                    </span>
                    <span className="font-mono text-[11px] text-primary-700 font-bold">
                      BM25(D, Q) = ∑ IDF(qᵢ) · [f(qᵢ, D) · (k₁+1)] / [f(qᵢ, D) + k₁ · (1 - b + b · |D|/avgdl)]
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border text-text-muted font-mono text-[10px] uppercase">
                          <th className="py-2 px-3">Rank</th>
                          <th className="py-2 px-3">Doc ID</th>
                          <th className="py-2 px-3">Document Title</th>
                          <th className="py-2 px-3">Length (|D|)</th>
                          <th className="py-2 px-3">Matched Terms</th>
                          <th className="py-2 px-3 text-right">BM25 Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono text-[11px]">
                        {currentFrame.invertedIndexState.rankedResults.map((res) => (
                          <tr
                            key={res.docId}
                            className={`transition-colors ${
                              res.rank === 1
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-bold'
                                : 'hover:bg-canvas'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  res.rank === 1
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                                }`}
                              >
                                #{res.rank}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-primary-700">{res.docId}</td>
                            <td className="py-2.5 px-3 font-sans font-semibold text-text">{res.docTitle}</td>
                            <td className="py-2.5 px-3 text-text-muted">{res.docLength} words</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {res.matchedTerms.map((term) => (
                                  <span
                                    key={term}
                                    className="bg-canvas border border-border px-1.5 py-0.5 rounded text-[10px]"
                                  >
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-primary-700">
                              {res.totalScore.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Socratic Invariant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  1. Term Saturation (k₁)
                </span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Raw TF grows linearly, rewarding keyword stuffers. BM25 non-linear saturation bounds term contribution to <code className="text-primary-600 font-mono">k₁ + 1 = 2.2</code>.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  2. Length Normalization (b)
                </span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Parameter <code className="text-primary-600 font-mono">b = 0.75</code> penalizes wordy documents. Concise documents containing the target term achieve higher density scores.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  3. RSJ-Smoothed IDF
                </span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Rare words across the corpus carry high information entropy, receiving exponentially higher weights than frequent stopwords.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  4. Skip List Intersections
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Lucene posting lists contain skip pointers spaced at √L, turning linear scans into O(√L) fast logarithmic seeks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODULE: POSTING SKIP LISTS & ELIAS-FANO QUASI-SUCCINCT COMPRESSION */}
        {currentFrame.postingSkipState && (
          <div className="space-y-4">
            {/* Active Action Banner */}
            {currentFrame.postingSkipState.banner && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  currentFrame.postingSkipState.banner.type === 'MATCH'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : currentFrame.postingSkipState.banner.type === 'SKIP_JUMP'
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950'
                    : currentFrame.postingSkipState.banner.type === 'ELIAS_FANO_ENCODED'
                    ? 'bg-purple-50/70 border-purple-300 text-purple-950'
                    : 'bg-canvas border-border text-text'
                }`}
              >
                <div className="text-sm font-bold mt-0.5">
                  {currentFrame.postingSkipState.banner.title}
                </div>
                <div className="text-xs text-text-muted flex-1 leading-relaxed">
                  {currentFrame.postingSkipState.banner.description}
                </div>
              </div>
            )}

            {/* Visual Skip Blocks & Posting List A */}
            <div className="bg-canvas border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  Posting List A: N = 16 Documents (Interval k = 4 Blocks)
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Skip Complexity: O(L_B · √L_A)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentFrame.postingSkipState.skipBlocksA.map((block) => (
                  <div
                    key={block.blockIndex}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      block.isSkipped
                        ? 'bg-slate-100/70 border-slate-300 opacity-60'
                        : block.isInspected
                        ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                        : block.isActive
                        ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-text">Block {block.blockIndex}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                        skip → {block.skipDocId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap font-mono">
                      {block.docIds.map((docId) => {
                        const isMatch = currentFrame.postingSkipState?.matchedDocIds.includes(docId);
                        return (
                          <span
                            key={docId}
                            className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                              isMatch
                                ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                                : 'bg-canvas text-text border-border'
                            }`}
                          >
                            {docId}
                          </span>
                        );
                      })}
                    </div>

                    <div className="text-[10px] text-text-muted font-medium">
                      {block.isSkipped
                        ? '⚡ Bypassed in O(1)'
                        : block.isInspected
                        ? '✓ Target Found Inside'
                        : block.isActive
                        ? '→ Active Candidate Block'
                        : 'Pending Evaluation'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posting List B & Conjunctive Matches */}
            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  Query Conjunct Posting List B:
                </span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  {currentFrame.postingSkipState.postingListB.map((docId) => (
                    <span
                      key={docId}
                      className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold"
                    >
                      DocID {docId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Conjunctive Matches Emitted:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {currentFrame.postingSkipState.matchedDocIds.length === 0 ? (
                    <span className="text-text-muted text-[11px]">No matches yet</span>
                  ) : (
                    currentFrame.postingSkipState.matchedDocIds.map((docId) => (
                      <span
                        key={docId}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                      >
                        ✓ {docId}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Elias-Fano Compression Inspector (if active in frames 5-7) */}
            {currentFrame.postingSkipState.eliasFano && (
              <div className="bg-canvas border border-border rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                      Quasi-Succinct Storage Encoding
                    </span>
                    <h4 className="font-bold text-sm text-text mt-0.5">
                      Elias-Fano Bit Vector Representation (Peter Elias &amp; Robert Fano 1974)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-200">
                    {currentFrame.postingSkipState.eliasFano.compressionRatio}
                  </span>
                </div>

                {/* Elements Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-border text-text-muted text-[10px] uppercase">
                        <th className="py-2 px-3">Index</th>
                        <th className="py-2 px-3">DocID (x)</th>
                        <th className="py-2 px-3">High Quotient (x &gt;&gt; 3)</th>
                        <th className="py-2 px-3">Low Bits (x &amp; 7)</th>
                        <th className="py-2 px-3">3-Bit Binary Array</th>
                        <th className="py-2 px-3">Unary Gap Vector</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {currentFrame.postingSkipState.eliasFano.elements.map((el, idx) => (
                        <tr key={idx} className="hover:bg-surface transition-colors">
                          <td className="py-2 px-3 text-text-muted">[{idx}]</td>
                          <td className="py-2 px-3 font-bold text-primary-700">{el.docId}</td>
                          <td className="py-2 px-3 text-purple-800 font-bold">{el.highBits}</td>
                          <td className="py-2 px-3 text-indigo-700">{el.lowBits}</td>
                          <td className="py-2 px-3 text-text font-bold bg-indigo-50/40">{el.lowBitsBinary}</td>
                          <td className="py-2 px-3 text-emerald-700 font-bold bg-emerald-50/40">{el.unaryGap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Continuous Bit Vector Displays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text">Lower Bits Contiguous Array (18 bits):</span>
                      <span className="font-mono text-indigo-700">m × L = 6 × 3 = 18b</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs flex-wrap">
                      {currentFrame.postingSkipState.eliasFano.lowBitsArray.map((bits, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-1 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold"
                        >
                          {bits}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Direct indexing: read bits at [i × 3 .. i × 3 + 2] in O(1) time.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface border border-border space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text">High Bits Unary Vector (13 bits):</span>
                      <span className="font-mono text-emerald-700">m + max(h) = 13b</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 font-mono text-xs font-bold text-emerald-950 tracking-widest break-all">
                      {currentFrame.postingSkipState.eliasFano.highBitsVector}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      select₁(H, i) locates i-th set bit; count of preceding 0s yields high quotient in O(1) via CPU POPCNT.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Socratic Invariant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  1. Optimal Interval (k = √L)
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Spacing skip pointers at ⌊√L⌋ minimizes total comparisons: at most √L skip checks plus at most √L elements scanned inside the target block, yielding O(√L) time.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  2. Quasi-Succinct Storage
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Elias-Fano encodes m sorted integers in at most m × (2 + ⌈log₂(U/m)⌉) bits, within 2 bits per element of the Shannon information-theoretic lower bound.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  3. O(1) Random Access via select₁
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Unlike delta or variable-byte compression requiring full decompression from index 0, Elias-Fano enables direct O(1) random access using hardware POPCNT bit instructions.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  4. Search Engine Index Cores
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Information retrieval platforms leverage Elias-Fano and skip lists across posting lists, allowing billion-document full-text queries to resolve in sub-millisecond latencies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODULE: COLUMNAR STORAGE & VECTORIZED SIMD EXECUTION ENGINE */}
        {currentFrame.columnarState && (
          <div className="space-y-4">
            {/* SQL Query Specification Bar */}
            <div className="bg-canvas border border-border rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  Target OLAP Query Execution Plan
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border font-semibold text-text">
                    Layout: {currentFrame.columnarState.storageLayout === 'COLUMN_ORIENTED_DSM' ? 'Columnar DSM' : 'Row NSM'}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border font-semibold text-text">
                    Engine: {currentFrame.columnarState.executionEngine === 'VECTORIZED_SIMD' ? 'Vectorized SIMD' : 'Volcano (next())'}
                  </span>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-2.5 font-mono text-xs text-primary-900 font-semibold overflow-x-auto">
                {currentFrame.columnarState.querySql}
              </div>
            </div>

            {/* Active Action Banner */}
            {currentFrame.columnarState.banner && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  currentFrame.columnarState.banner.type === 'SUMMARY' || currentFrame.columnarState.banner.type === 'SIMD_SPEEDUP' || currentFrame.columnarState.banner.type === 'DSM_EFFICIENCY' || currentFrame.columnarState.banner.type === 'COMPRESSION_SAVINGS'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : currentFrame.columnarState.banner.type === 'NSM_WASTE' || currentFrame.columnarState.banner.type === 'VOLCANO_OVERHEAD'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-primary-50/70 border-primary-300 text-primary-950'
                }`}
              >
                <div className="text-sm font-bold mt-0.5">
                  {currentFrame.columnarState.banner.title}
                </div>
                <div className="text-xs text-text-muted flex-1 leading-relaxed">
                  {currentFrame.columnarState.banner.description}
                </div>
              </div>
            )}

            {/* Physical Memory Layout Visualization */}
            <div className="bg-canvas border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  Physical Storage Memory Layout: {currentFrame.columnarState.storageLayout === 'ROW_ORIENTED_NSM' ? 'N-ary Storage Model (NSM Slotted Pages)' : 'Decomposition Storage Model (DSM Column Vectors)'}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Bandwidth: {currentFrame.columnarState.metrics?.memoryBandwidthScanned}
                </span>
              </div>

              {currentFrame.columnarState.storageLayout === 'ROW_ORIENTED_NSM' ? (
                /* Row-Oriented NSM Slotted Pages Display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFrame.columnarState.rowPages.map((page) => (
                    <div key={page.pageId} className="bg-surface border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-border pb-1">
                        <span className="font-bold text-text font-mono">Slotted Page #{page.pageId} (4,096 Bytes)</span>
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          80% Unused Columns Loaded
                        </span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {page.slots.map((slot) => (
                          <div
                            key={slot.rowId}
                            className={`p-2 rounded border flex items-center justify-between ${
                              slot.isStatusMatch
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-500 opacity-70'
                            }`}
                          >
                            <span className="font-semibold">Row #{slot.rowId}:</span>
                            <span className="text-[11px] truncate">{slot.tupleBytes}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              slot.isStatusMatch ? 'bg-emerald-200 text-emerald-950' : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {slot.isStatusMatch ? 'MATCH' : 'SKIP'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Column-Oriented DSM Column Vectors Display */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {currentFrame.columnarState.columns.map((col) => (
                    <div
                      key={col.name}
                      className={`rounded-lg border p-2.5 space-y-2 ${
                        col.isFiltered
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                          : col.isProjected
                          ? 'bg-primary-50/80 border-primary-300'
                          : 'bg-surface border-border opacity-50'
                      }`}
                    >
                      <div className="border-b border-border pb-1 space-y-0.5">
                        <div className="text-xs font-bold text-text truncate font-mono">{col.name}</div>
                        <div className="flex items-center justify-between text-[10px] text-text-muted">
                          <span>{col.type}</span>
                          <span className="font-semibold text-primary-800">{col.memoryBytes} B</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono space-y-1 max-h-48 overflow-y-auto">
                        {col.values.slice(0, 8).map((val, vIdx) => {
                          const isMatch = col.isFiltered && val === 'PAID';
                          return (
                            <div
                              key={vIdx}
                              className={`px-1.5 py-0.5 rounded flex items-center justify-between truncate ${
                                isMatch
                                  ? 'bg-emerald-200/70 font-bold text-emerald-950'
                                  : 'bg-canvas text-text-muted'
                              }`}
                            >
                              <span className="text-[9px] text-text-muted">#{vIdx}</span>
                              <span className="truncate">{String(val)}</span>
                            </div>
                          );
                        })}
                        {col.values.length > 8 && (
                          <div className="text-center text-[9px] text-text-muted font-bold pt-1">
                            + {col.values.length - 8} more
                          </div>
                        )}
                      </div>

                      {col.compressionRatio && (
                        <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-center">
                          {col.compressionRatio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compression Inspectors (RLE & Dictionary) */}
            {currentFrame.columnarState.rleRuns && currentFrame.columnarState.dictionary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RLE Runs */}
                <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                      Run-Length Encoding (RLE): status Column
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                      9 Runs (43.8% Memory Reduction)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentFrame.columnarState.rleRuns.map((run, rIdx) => (
                      <span
                        key={rIdx}
                        className={`text-xs font-mono px-2 py-1 rounded border flex items-center gap-1 ${
                          run.value === 'PAID'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-surface border-border text-text-muted'
                        }`}
                      >
                        <span>{run.value}</span>
                        <span className="text-[10px] bg-white/80 px-1 rounded font-bold text-text">
                          ×{run.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dictionary Table */}
                <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                      Dictionary Encoding: customer_id Column
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                      2 Bits / Token (95.8% Savings)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentFrame.columnarState.dictionary.map((entry) => (
                      <div
                        key={entry.code}
                        className="text-xs font-mono px-2 py-1 rounded bg-surface border border-border flex items-center gap-1.5"
                      >
                        <span className="font-bold text-primary-700 bg-primary-50 px-1 rounded">
                          Token {entry.code}
                        </span>
                        <span className="text-text font-semibold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selection Vector Bitmask Visualizer */}
            <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                    SIMD Selection Vector Bitmask: _mm256_cmpeq_epi8(status, &apos;PAID&apos;)
                  </span>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    12 Active / 16 Total (75% Filter Selectivity)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-text-muted">
                  Branchless Hardware Evaluation
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5">
                {currentFrame.columnarState.selectionVector.map((bitItem) => {
                  const isActive = bitItem.bit === 1;
                  return (
                    <div
                      key={bitItem.index}
                      className={`rounded border p-2 text-center space-y-0.5 transition-all ${
                        isActive
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold scale-105 shadow-xs'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60'
                      }`}
                    >
                      <div className="text-[9px] text-text-muted font-mono">#{bitItem.index}</div>
                      <div className="text-sm font-mono font-black">{bitItem.bit}</div>
                      <div className="text-[9px] truncate font-sans font-medium">{bitItem.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantitative Performance Benchmark Table */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  Quantitative Execution Benchmark: Row NSM (Volcano) vs Columnar DSM (Vectorized SIMD)
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  9.2x Query Acceleration
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="py-1.5 pr-4 font-semibold">Architectural Metric</th>
                      <th className="py-1.5 px-4 font-semibold">Row-Oriented (NSM) + Volcano</th>
                      <th className="py-1.5 px-4 font-semibold">Columnar (DSM) + Vectorized SIMD</th>
                      <th className="py-1.5 pl-4 font-semibold text-right">Optimization Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Memory Scanned (Predicate)</td>
                      <td className="py-2 px-4 text-red-700">1,280 Bytes (80 B / row)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">16 Bytes (1 B / row)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">98.8% Bandwidth Saved</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Total Query Memory Loaded</td>
                      <td className="py-2 px-4 text-red-700">1,280 Bytes</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">112 Bytes (Projected Only)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">91.2% Bandwidth Saved</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Virtual Function Calls</td>
                      <td className="py-2 px-4 text-red-700">48 calls (3 per matching row)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">1 call (per 1024-elem batch)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">97.9% Calls Eliminated</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">L1 Cache Miss Count</td>
                      <td className="py-2 px-4 text-red-700">18 cache misses</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">2 cache misses</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">88.9% Cache Miss Drop</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Branch Predictor Thrashing</td>
                      <td className="py-2 px-4 text-red-700">High (Scalar IF-ELSE on status)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">Zero (Branchless SIMD Bitmask)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">100% Pipeline Stall Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 Socratic Invariant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  1. DSM &amp; Projection Pruning
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  OLTP demands single-tuple row writes (NSM); OLAP scans millions of rows projecting 2-3 columns. DSM column pruning prevents memory bus saturation by reading zero unreferenced attributes.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  2. Cache Line Density Wall
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  A 64-byte L1 CPU cache line holds 64 1-byte enum values or 16 4-byte integers in DSM. In NSM, 80% of the cache line is polluted with unneeded strings and IDs, triggering severe L1 thrashing.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  3. Direct SIMD on Encoded Data
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Dictionary and RLE compressions preserve value order and integer domains, enabling AVX2 vector registers to compare tokens directly without expanding strings back to user memory.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1 text-xs">
                <span className="font-bold text-text block text-[11px]">
                  4. Volcano vs Vectorized Batches
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Tuple-at-a-time next() virtual calls thrash instruction caches and branch predictors. Processing 1024-element primitive arrays in tight unrolled C loops achieves near-metal CPU instruction retirement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metric Key-Value Badges */}
        {currentFrame.metrics && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border">
            {Object.entries(currentFrame.metrics)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <div
                  key={k}
                  className="text-xs bg-surface border border-border px-3 py-1 rounded-md flex items-center gap-1.5"
                >
                  <span className="font-semibold text-text-muted">{k}:</span>
                  <span className="font-mono font-bold text-text">{v}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Socratic Step Explanation */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-mono">
              Step {currentFrameIndex + 1} of {frames.length}
            </span>
            <h4 className="text-sm font-bold text-text">
              {currentFrame.title}
            </h4>
          </div>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              currentFrame.status === 'SUCCESS' || currentFrame.status === 'COMPLETE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {currentFrame.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          {currentFrame.explanation}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            aria-label="Reset Stepper"
          >
            ↺ Reset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepBackward}
            disabled={currentFrameIndex === 0}
            aria-label="Previous Step"
          >
            ← Previous Step
          </Button>

          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepForward}
            disabled={currentFrameIndex === frames.length - 1}
            aria-label="Next Step"
          >
            Next Step →
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 2000 },
            { label: '1x', ms: 1200 },
            { label: '2x', ms: 600 },
          ].map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => setPlaybackSpeed(sp.ms)}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer border ${
                playbackSpeed === sp.ms
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-surface text-text-muted border-border hover:text-text'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
