'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';

export interface ArchitectureNode {
  id: string;
  type:
    | 'CLIENT'
    | 'API_GATEWAY'
    | 'LOAD_BALANCER'
    | 'APP_SERVICE'
    | 'CACHE'
    | 'MESSAGE_QUEUE'
    | 'DATABASE_PRIMARY'
    | 'READ_REPLICA'
    | 'OBJECT_STORAGE';
  label: string;
  category: 'EDGE' | 'COMPUTE' | 'CACHE' | 'PERSISTENCE' | 'MESSAGING';
  instances: number;
  slaMs?: number;
  x: number;
  y: number;
}

export interface ArchitectureLink {
  id: string;
  fromId: string;
  toId: string;
  type: 'SYNC_RPC' | 'ASYNC_EVENT' | 'REPLICATION' | 'CACHE_LOOKUP';
  label?: string;
}

export type ArchitectureTemplateKey = 'CACHE_ASIDE' | 'EVENT_DRIVEN' | 'RESILIENT_MULTI_AZ';

export interface ArchitectureWhiteboardProps {
  onExportToText?: (exportedMarkdown: string) => void;
  onClose?: () => void;
  initialTemplate?: ArchitectureTemplateKey;
  className?: string;
}

export const ARCHITECTURE_TEMPLATES: Record<
  ArchitectureTemplateKey,
  {
    name: string;
    description: string;
    nodes: ArchitectureNode[];
    links: ArchitectureLink[];
  }
> = {
  CACHE_ASIDE: {
    name: 'Read-Heavy Cache-Aside Cluster',
    description: 'High read throughput topology fronted by an API Gateway, stateless worker fleet, in-memory cache layer, and asynchronous read replicas.',
    nodes: [
      { id: 'client', type: 'CLIENT', label: 'Client Apps', category: 'EDGE', instances: 1, x: 50, y: 150 },
      { id: 'gateway', type: 'API_GATEWAY', label: 'API Gateway', category: 'EDGE', instances: 2, slaMs: 5, x: 200, y: 150 },
      { id: 'app', type: 'APP_SERVICE', label: 'Stateless App Fleet', category: 'COMPUTE', instances: 4, slaMs: 15, x: 380, y: 150 },
      { id: 'cache', type: 'CACHE', label: 'Redis Cache Tier', category: 'CACHE', instances: 3, slaMs: 2, x: 560, y: 70 },
      { id: 'db_primary', type: 'DATABASE_PRIMARY', label: 'Primary DB Leader', category: 'PERSISTENCE', instances: 1, slaMs: 25, x: 560, y: 230 },
      { id: 'db_replica', type: 'READ_REPLICA', label: 'Read Replicas (2x)', category: 'PERSISTENCE', instances: 2, slaMs: 12, x: 740, y: 230 },
    ],
    links: [
      { id: 'l1', fromId: 'client', toId: 'gateway', type: 'SYNC_RPC', label: 'HTTPS / REST' },
      { id: 'l2', fromId: 'gateway', toId: 'app', type: 'SYNC_RPC', label: 'gRPC Round-Robin' },
      { id: 'l3', fromId: 'app', toId: 'cache', type: 'CACHE_LOOKUP', label: 'Cache-Aside (<2ms)' },
      { id: 'l4', fromId: 'app', toId: 'db_primary', type: 'SYNC_RPC', label: 'Cache-Miss Read/Write' },
      { id: 'l5', fromId: 'db_primary', toId: 'db_replica', type: 'REPLICATION', label: 'Async WAL Stream' },
    ],
  },
  EVENT_DRIVEN: {
    name: 'Event-Driven Async Ingestion Pipeline',
    description: 'Decoupled asynchronous streaming architecture using a distributed message broker to buffer burst traffic before batch persistence.',
    nodes: [
      { id: 'client', type: 'CLIENT', label: 'Client Events', category: 'EDGE', instances: 1, x: 50, y: 150 },
      { id: 'gateway', type: 'API_GATEWAY', label: 'Edge Gateway', category: 'EDGE', instances: 2, slaMs: 5, x: 200, y: 150 },
      { id: 'ingest', type: 'APP_SERVICE', label: 'Ingest Worker', category: 'COMPUTE', instances: 3, slaMs: 8, x: 360, y: 150 },
      { id: 'queue', type: 'MESSAGE_QUEUE', label: 'Distributed Event Bus', category: 'MESSAGING', instances: 3, slaMs: 3, x: 520, y: 150 },
      { id: 'worker', type: 'APP_SERVICE', label: 'Stream Processor', category: 'COMPUTE', instances: 4, slaMs: 20, x: 680, y: 70 },
      { id: 'db_primary', type: 'DATABASE_PRIMARY', label: 'Analytical DB Store', category: 'PERSISTENCE', instances: 2, slaMs: 30, x: 680, y: 230 },
      { id: 'obj_store', type: 'OBJECT_STORAGE', label: 'Blob / Cold Storage', category: 'PERSISTENCE', instances: 1, slaMs: 50, x: 840, y: 150 },
    ],
    links: [
      { id: 'l1', fromId: 'client', toId: 'gateway', type: 'SYNC_RPC', label: 'HTTPS Ingest' },
      { id: 'l2', fromId: 'gateway', toId: 'ingest', type: 'SYNC_RPC', label: 'Fast Ack' },
      { id: 'l3', fromId: 'ingest', toId: 'queue', type: 'ASYNC_EVENT', label: 'Publish Event' },
      { id: 'l4', fromId: 'queue', toId: 'worker', type: 'ASYNC_EVENT', label: 'Consumer Quorum' },
      { id: 'l5', fromId: 'worker', toId: 'db_primary', type: 'SYNC_RPC', label: 'Batch Commit' },
      { id: 'l6', fromId: 'worker', toId: 'obj_store', type: 'SYNC_RPC', label: 'Raw Payload Archive' },
    ],
  },
  RESILIENT_MULTI_AZ: {
    name: 'Multi-AZ Resilient Enterprise Fabric',
    description: 'Production zero-single-point-of-failure topology featuring redundant gateways, L7 load balancers, multi-node caches, and cross-zone read replicas.',
    nodes: [
      { id: 'client', type: 'CLIENT', label: 'Edge Clients', category: 'EDGE', instances: 1, x: 40, y: 150 },
      { id: 'gateway_1', type: 'API_GATEWAY', label: 'AZ-1 Gateway', category: 'EDGE', instances: 2, slaMs: 5, x: 180, y: 80 },
      { id: 'gateway_2', type: 'API_GATEWAY', label: 'AZ-2 Gateway', category: 'EDGE', instances: 2, slaMs: 5, x: 180, y: 220 },
      { id: 'lb', type: 'LOAD_BALANCER', label: 'L7 Load Balancer', category: 'EDGE', instances: 2, slaMs: 3, x: 340, y: 150 },
      { id: 'app', type: 'APP_SERVICE', label: 'Multi-AZ Fleet', category: 'COMPUTE', instances: 6, slaMs: 12, x: 490, y: 150 },
      { id: 'cache', type: 'CACHE', label: 'Redis Quorum Cluster', category: 'CACHE', instances: 3, slaMs: 2, x: 650, y: 60 },
      { id: 'queue', type: 'MESSAGE_QUEUE', label: 'Async Event Broker', category: 'MESSAGING', instances: 2, slaMs: 4, x: 650, y: 150 },
      { id: 'db_primary', type: 'DATABASE_PRIMARY', label: 'Primary DB Leader', category: 'PERSISTENCE', instances: 1, slaMs: 20, x: 650, y: 240 },
      { id: 'db_replica', type: 'READ_REPLICA', label: 'Read Replicas (3x)', category: 'PERSISTENCE', instances: 3, slaMs: 10, x: 810, y: 240 },
    ],
    links: [
      { id: 'l1', fromId: 'client', toId: 'gateway_1', type: 'SYNC_RPC', label: 'DNS Weighted' },
      { id: 'l2', fromId: 'client', toId: 'gateway_2', type: 'SYNC_RPC', label: 'DNS Failover' },
      { id: 'l3', fromId: 'gateway_1', toId: 'lb', type: 'SYNC_RPC', label: 'Internal VPC' },
      { id: 'l4', fromId: 'gateway_2', toId: 'lb', type: 'SYNC_RPC', label: 'Internal VPC' },
      { id: 'l5', fromId: 'lb', toId: 'app', type: 'SYNC_RPC', label: 'Least-Conn Routing' },
      { id: 'l6', fromId: 'app', toId: 'cache', type: 'CACHE_LOOKUP', label: 'Cache-Aside' },
      { id: 'l7', fromId: 'app', toId: 'queue', type: 'ASYNC_EVENT', label: 'Async Write Buffer' },
      { id: 'l8', fromId: 'app', toId: 'db_primary', type: 'SYNC_RPC', label: 'ACID Transaction' },
      { id: 'l9', fromId: 'db_primary', toId: 'db_replica', type: 'REPLICATION', label: 'Synchronous Mirror' },
    ],
  },
};

export function ArchitectureWhiteboard({
  onExportToText,
  onClose,
  initialTemplate = 'CACHE_ASIDE',
  className = '',
}: ArchitectureWhiteboardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ArchitectureTemplateKey>(initialTemplate);
  const [nodes, setNodes] = useState<ArchitectureNode[]>(ARCHITECTURE_TEMPLATES[initialTemplate].nodes);
  const [links, setLinks] = useState<ArchitectureLink[]>(ARCHITECTURE_TEMPLATES[initialTemplate].links);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Switch Template Handler
  const handleSelectTemplate = (key: ArchitectureTemplateKey) => {
    setSelectedTemplate(key);
    setNodes(ARCHITECTURE_TEMPLATES[key].nodes);
    setLinks(ARCHITECTURE_TEMPLATES[key].links);
    setSelectedNodeId(null);
  };

  // Node Map for fast coordinate lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, ArchitectureNode>();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  // Real-Time Architecture Linter & Resilience Evaluation
  const linter = useMemo(() => {
    const findings: Array<{ type: 'VULNERABILITY' | 'WARNING' | 'STRENGTH'; message: string }> = [];
    let score = 50;

    const hasComputeFleet = nodes.some((n) => n.type === 'APP_SERVICE' && n.instances >= 2);
    const hasComputeSingle = nodes.some((n) => n.type === 'APP_SERVICE' && n.instances === 1);
    const hasDbPrimary = nodes.some((n) => n.type === 'DATABASE_PRIMARY');
    const hasReadReplicas = nodes.some((n) => n.type === 'READ_REPLICA' && n.instances >= 1);
    const hasCache = nodes.some((n) => n.type === 'CACHE');
    const hasQueue = nodes.some((n) => n.type === 'MESSAGE_QUEUE');
    const hasLoadBalancer = nodes.some((n) => n.type === 'LOAD_BALANCER' || n.type === 'API_GATEWAY');

    // Ingress tier check
    if (hasLoadBalancer) {
      score += 10;
      findings.push({
        type: 'STRENGTH',
        message: 'Ingress traffic fronted by dedicated Gateway / Load Balancer tier.',
      });
    }

    // 1. Compute Redundancy
    if (hasComputeFleet) {
      score += 15;
      findings.push({
        type: 'STRENGTH',
        message: 'Stateless compute tier has horizontal redundancy (>=2 instances).',
      });
    } else if (hasComputeSingle) {
      findings.push({
        type: 'VULNERABILITY',
        message: 'Single Point of Failure: Stateless service has only 1 instance. Service crash triggers total outage.',
      });
    }

    // 2. Database & Persistence Redundancy
    if (hasDbPrimary && hasReadReplicas) {
      score += 15;
      findings.push({
        type: 'STRENGTH',
        message: 'Database persistence tier is decoupled with read replicas, eliminating read-write contention.',
      });
    } else if (hasDbPrimary && !hasReadReplicas) {
      findings.push({
        type: 'VULNERABILITY',
        message: 'SPOF Alert: Primary database has zero read replicas. Unplanned failover requires manual intervention.',
      });
    }

    // 3. In-Memory Cache Buffer
    if (hasCache) {
      score += 10;
      findings.push({
        type: 'STRENGTH',
        message: 'In-memory cache layer absorbs high-frequency reads (<2ms SLA), protecting persistent storage.',
      });
    } else {
      findings.push({
        type: 'WARNING',
        message: 'No cache layer detected. High QPS read bursts will directly hit database disk I/O.',
      });
    }

    // 4. Asynchronous Messaging Buffer
    if (hasQueue) {
      score += 10;
      findings.push({
        type: 'STRENGTH',
        message: 'Asynchronous event queue buffers burst traffic and prevents cascading RPC timeouts.',
      });
    }

    // Status Tier
    let tier: 'PRODUCTION_READY' | 'MODERATE_RESILIENCE' | 'SPOF_VULNERABLE' = 'MODERATE_RESILIENCE';
    if (score >= 85) {
      tier = 'PRODUCTION_READY';
    } else if (score < 65) {
      tier = 'SPOF_VULNERABLE';
    }

    return {
      score: Math.min(100, score),
      tier,
      findings,
    };
  }, [nodes]);

  // Add / Remove Component Helper
  const handleAddNode = (type: ArchitectureNode['type']) => {
    const id = `custom_${type.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const label = type.replace(/_/g, ' ');
    const newNode: ArchitectureNode = {
      id,
      type,
      label,
      category:
        type === 'CACHE'
          ? 'CACHE'
          : type === 'DATABASE_PRIMARY' || type === 'READ_REPLICA' || type === 'OBJECT_STORAGE'
          ? 'PERSISTENCE'
          : type === 'MESSAGE_QUEUE'
          ? 'MESSAGING'
          : type === 'APP_SERVICE'
          ? 'COMPUTE'
          : 'EDGE',
      instances: 2,
      slaMs: 10,
      x: 400 + Math.round(Math.random() * 80),
      y: 100 + Math.round(Math.random() * 100),
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleRemoveNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setLinks((prev) => prev.filter((l) => l.fromId !== id && l.toId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Generate Structured Engineering Rationale Markdown
  const generateExportMarkdown = (): string => {
    const templateName = ARCHITECTURE_TEMPLATES[selectedTemplate].name;
    const computeNodes = nodes.filter((n) => n.category === 'COMPUTE');
    const edgeNodes = nodes.filter((n) => n.category === 'EDGE');
    const cacheNodes = nodes.filter((n) => n.category === 'CACHE');
    const persistNodes = nodes.filter((n) => n.category === 'PERSISTENCE');
    const queueNodes = nodes.filter((n) => n.category === 'MESSAGING');

    return `### Proposed Architecture Topology (${templateName}):
- **Edge & Routing**: ${edgeNodes.map((n) => `${n.label} (${n.instances}x instances)`).join(', ') || 'Direct routing'}.
- **Compute Tier**: ${computeNodes.map((n) => `${n.label} (${n.instances}x instances, ~${n.slaMs || 15}ms SLA)`).join(', ')}.
- **Caching Strategy**: ${
      cacheNodes.length > 0
        ? cacheNodes.map((n) => `${n.label} (<2ms latency buffer)`).join(', ')
        : 'Direct database access without caching tier'
    }.
- **Persistence & Storage**: ${persistNodes.map((n) => `${n.label} (${n.instances}x)`).join(', ')}.
- **Decoupling & Event Bus**: ${
      queueNodes.length > 0
        ? queueNodes.map((n) => `${n.label} for async write buffering`).join(', ')
        : 'Synchronous end-to-end request-response'
    }.
- **Architectural Resilience**: Evaluated at ${linter.score}% (${linter.tier.replace(/_/g, ' ')}) with ${
      linter.findings.filter((f) => f.type === 'STRENGTH').length
    } confirmed structural safeguards.`;
  };

  const handleExport = () => {
    const text = generateExportMarkdown();
    onExportToText?.(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      data-testid="architecture-whiteboard-studio"
      className={`bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header Bar */}
      <div className="bg-canvas border-b border-border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Socratic Systems Design Studio
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                linter.tier === 'PRODUCTION_READY'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : linter.tier === 'MODERATE_RESILIENCE'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              Resilience: {linter.score}% ({linter.tier.replace(/_/g, ' ')})
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text">
            Architecture Whiteboard & Topology Canvas
          </h3>
          <p className="text-xs text-text-muted">
            Compose distributed systems topologies, validate single-points-of-failure (SPOF), and export structured rationales.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            className="text-xs font-semibold"
          >
            {isCopied ? '✓ Injected into Answer!' : '📥 Export Topology to Response'}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close Whiteboard">
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Template Selector & Palette Ribbon */}
      <div className="bg-surface border-b border-border p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-text-muted">Architecture Archetypes:</span>
          {(Object.keys(ARCHITECTURE_TEMPLATES) as ArchitectureTemplateKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectTemplate(key)}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                selectedTemplate === key
                  ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                  : 'bg-canvas text-text-muted border-border hover:text-text hover:border-border-hover'
              }`}
            >
              {ARCHITECTURE_TEMPLATES[key].name.split(' ')[0]} {ARCHITECTURE_TEMPLATES[key].name.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Add Component Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-text-muted shrink-0">+ Add Node:</span>
          <button
            type="button"
            onClick={() => handleAddNode('CACHE')}
            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-mono text-[10px]"
          >
            + Cache
          </button>
          <button
            type="button"
            onClick={() => handleAddNode('MESSAGE_QUEUE')}
            className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-mono text-[10px]"
          >
            + Queue
          </button>
          <button
            type="button"
            onClick={() => handleAddNode('READ_REPLICA')}
            className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-mono text-[10px]"
          >
            + Replica
          </button>
          <button
            type="button"
            onClick={() => handleAddNode('APP_SERVICE')}
            className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 font-mono text-[10px]"
          >
            + Service
          </button>
        </div>
      </div>

      {/* Main Studio Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[420px]">
        {/* SVG Interactive Canvas Column */}
        <div className="lg:col-span-8 p-4 bg-canvas/60 relative overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
          <svg
            viewBox="0 0 920 320"
            className="w-full h-full max-h-[380px] select-none"
            role="img"
            aria-label="Interactive Architecture Topology Canvas"
          >
            <defs>
              {/* Arrowhead Markers */}
              <marker
                id="arrow-sync"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
              </marker>
              <marker
                id="arrow-async"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
              </marker>
              <marker
                id="arrow-cache"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
              </marker>
              <marker
                id="arrow-repl"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
              </marker>
            </defs>

            {/* Subtle Grid Background */}
            <pattern id="canvas-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#canvas-grid)" />

            {/* Render Directional Links */}
            {links.map((link) => {
              const from = nodeMap.get(link.fromId);
              const to = nodeMap.get(link.toId);
              if (!from || !to) return null;

              const strokeColor =
                link.type === 'SYNC_RPC'
                  ? '#0284c7'
                  : link.type === 'ASYNC_EVENT'
                  ? '#d97706'
                  : link.type === 'CACHE_LOOKUP'
                  ? '#059669'
                  : '#7c3aed';

              const markerId =
                link.type === 'SYNC_RPC'
                  ? 'arrow-sync'
                  : link.type === 'ASYNC_EVENT'
                  ? 'arrow-async'
                  : link.type === 'CACHE_LOOKUP'
                  ? 'arrow-cache'
                  : 'arrow-repl';

              const isDashed = link.type === 'ASYNC_EVENT' || link.type === 'REPLICATION';
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2 - 8;

              return (
                <g key={link.id} className="transition-all">
                  <line
                    x1={from.x + 55}
                    y1={from.y + 25}
                    x2={to.x}
                    y2={to.y + 25}
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray={isDashed ? '4 3' : undefined}
                    markerEnd={`url(#${markerId})`}
                  />
                  {link.label && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#64748b"
                      fontFamily="monospace"
                      className="select-none bg-canvas"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Architecture Component Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              let badgeColor = '#0284c7'; // blue
              const bgFill = '#ffffff';

              if (node.category === 'CACHE') {
                badgeColor = '#059669'; // emerald
              } else if (node.category === 'PERSISTENCE') {
                badgeColor = '#7c3aed'; // purple
              } else if (node.category === 'MESSAGING') {
                badgeColor = '#d97706'; // amber
              } else if (node.category === 'COMPUTE') {
                badgeColor = '#0284c7'; // sky
              } else if (node.category === 'EDGE') {
                badgeColor = '#475569'; // slate
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform hover:scale-105"
                  tabIndex={0}
                  role="button"
                  aria-label={`Node ${node.label}, Category: ${node.category}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedNodeId(node.id);
                  }}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <rect
                      x="-4"
                      y="-4"
                      width="134"
                      height="58"
                      rx="10"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Component Container Box */}
                  <rect
                    width="126"
                    height="50"
                    rx="8"
                    fill={bgFill}
                    stroke={isSelected ? '#1e3a8a' : '#cbd5e1'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                    className="shadow-xs filter drop-shadow-xs"
                  />

                  {/* Category Accent Stripe */}
                  <path
                    d="M 0 8 Q 0 0 8 0 L 118 0 Q 126 0 126 8 L 126 12 L 0 12 Z"
                    fill={badgeColor}
                  />

                  {/* Category Tag text */}
                  <text
                    x="8"
                    y="9"
                    fontSize="7"
                    fontWeight="bold"
                    fill="#ffffff"
                    fontFamily="monospace"
                  >
                    {node.category}
                  </text>

                  {/* Node Label */}
                  <text
                    x="10"
                    y="27"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#1e293b"
                    className="select-none"
                  >
                    {node.label.length > 24 ? `${node.label.slice(0, 22)}..` : node.label}
                  </text>

                  {/* Node Instance Count & SLA */}
                  <text
                    x="10"
                    y="42"
                    fontSize="8"
                    fill="#64748b"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {node.instances}x {node.instances > 1 ? 'nodes' : 'node'}
                    {node.slaMs ? ` · ~${node.slaMs}ms` : ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Canvas Legend */}
          <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-muted bg-surface/90 px-3 py-1.5 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-sky-600 inline-block" /> Sync RPC
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-amber-600 inline-block" /> Async Event
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" /> Cache Lookup
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-purple-600 inline-block" /> Replication
              </span>
            </div>
            <span>Click any node to inspect parameters</span>
          </div>
        </div>

        {/* Right Sidebar: Linter & Node Inspector */}
        <div className="lg:col-span-4 p-4 space-y-4 bg-surface flex flex-col justify-between overflow-y-auto">
          {/* Selected Node Details */}
          {selectedNode ? (
            <div className="p-3.5 bg-canvas rounded-xl border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text">{selectedNode.label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border">
                  {selectedNode.category}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-text-muted block">Instances:</span>
                  <span className="font-mono font-bold text-text">{selectedNode.instances}x</span>
                </div>
                <div>
                  <span className="text-text-muted block">Estimated SLA:</span>
                  <span className="font-mono font-bold text-text">
                    {selectedNode.slaMs ? `${selectedNode.slaMs}ms` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id ? { ...n, instances: n.instances + 1 } : n
                      )
                    )
                  }
                  className="px-2 py-1 rounded bg-surface border border-border text-[10px] font-semibold hover:text-text"
                >
                  + Add Instance
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveNode(selectedNode.id)}
                  className="text-[10px] text-rose-600 hover:underline font-semibold"
                >
                  Remove Node
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-canvas/50 rounded-xl border border-border text-center text-xs text-text-muted">
              Select any node on the whiteboard canvas to inspect instance count, SLAs, and routing.
            </div>
          )}

          {/* Architectural Linter Findings */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-text">
              <span className="uppercase tracking-wider text-[11px]">Resilience Linter</span>
              <span
                className={`font-mono font-extrabold ${
                  linter.score >= 85 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {linter.score}/100
              </span>
            </div>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {linter.findings.map((f, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border text-[11px] leading-relaxed ${
                    f.type === 'STRENGTH'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                      : f.type === 'VULNERABILITY'
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900 dark:text-rose-300'
                      : 'bg-amber-50/50 border-amber-200 text-amber-900 dark:text-amber-300'
                  }`}
                >
                  <span className="font-bold mr-1">
                    {f.type === 'STRENGTH' ? '✓' : f.type === 'VULNERABILITY' ? '⚠️ SPOF:' : '⚡'}
                  </span>
                  {f.message}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Export CTA */}
          <div className="pt-2 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              className="w-full text-xs font-semibold"
            >
              {isCopied ? '✓ Injected into Answer!' : '📥 Export Architecture to Answer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
