/**
 * Memory Layout & Struct Padding Simulator
 * Mathematical alignment, padding hole calculation, cache line boundary detection,
 * and field re-ordering optimization for systems programming (C, C++, Rust, Go).
 *
 * Adheres strictly to docs/CONTENT_POLICY.md: 100% technical signal, zero vendor marketing.
 */

export type PrimitiveTypeKey =
  | 'bool'
  | 'i8'
  | 'u8'
  | 'i16'
  | 'u16'
  | 'i32'
  | 'u32'
  | 'f32'
  | 'i64'
  | 'u64'
  | 'f64'
  | 'pointer'
  | 'slice_rust'
  | 'slice_go';

export interface PrimitiveTypeInfo {
  name: string;
  size: number;
  alignment: number;
  description: string;
  colorClass: string;
}

export const PRIMITIVE_TYPES: Record<PrimitiveTypeKey, PrimitiveTypeInfo> = {
  bool: { name: 'bool', size: 1, alignment: 1, description: '1-byte boolean flag', colorClass: 'bg-emerald-600' },
  i8: { name: 'int8_t / i8', size: 1, alignment: 1, description: '8-bit signed integer', colorClass: 'bg-emerald-500' },
  u8: { name: 'uint8_t / u8 / byte', size: 1, alignment: 1, description: '8-bit unsigned integer', colorClass: 'bg-emerald-500' },
  i16: { name: 'int16_t / i16', size: 2, alignment: 2, description: '16-bit signed integer', colorClass: 'bg-teal-500' },
  u16: { name: 'uint16_t / u16', size: 2, alignment: 2, description: '16-bit unsigned integer', colorClass: 'bg-teal-500' },
  i32: { name: 'int32_t / i32', size: 4, alignment: 4, description: '32-bit signed integer', colorClass: 'bg-cyan-500' },
  u32: { name: 'uint32_t / u32', size: 4, alignment: 4, description: '32-bit unsigned integer', colorClass: 'bg-cyan-500' },
  f32: { name: 'float / f32', size: 4, alignment: 4, description: '32-bit IEEE-754 float', colorClass: 'bg-sky-500' },
  i64: { name: 'int64_t / i64', size: 8, alignment: 8, description: '64-bit signed integer', colorClass: 'bg-indigo-500' },
  u64: { name: 'uint64_t / u64', size: 8, alignment: 8, description: '64-bit unsigned integer', colorClass: 'bg-indigo-500' },
  f64: { name: 'double / f64', size: 8, alignment: 8, description: '64-bit IEEE-754 double', colorClass: 'bg-violet-500' },
  pointer: { name: 'void* / &T / uintptr', size: 8, alignment: 8, description: '64-bit raw pointer / reference', colorClass: 'bg-purple-500' },
  slice_rust: { name: '&[T] (Fat Pointer)', size: 16, alignment: 8, description: 'Pointer (8B) + Length (8B)', colorClass: 'bg-fuchsia-500' },
  slice_go: { name: '[]T (Slice Header)', size: 24, alignment: 8, description: 'Pointer (8B) + Len (8B) + Cap (8B)', colorClass: 'bg-pink-500' },
};

export interface StructFieldDefinition {
  id: string;
  name: string;
  type: PrimitiveTypeKey;
  isAtomicOrFrequentlyMutated?: boolean;
}

export interface ComputedFieldOffset {
  name: string;
  type: PrimitiveTypeKey;
  offset: number;
  size: number;
  alignment: number;
  paddingBefore: number;
  paddingAfter: number;
  isAtomicOrFrequentlyMutated?: boolean;
}

export interface ByteCell {
  byteIndex: number;
  fieldName: string | null;
  type: PrimitiveTypeKey | 'padding';
  isPadding: boolean;
  isCacheLineBoundary: boolean;
  cacheLineIndex: number;
  colorClass: string;
}

export interface StructLayoutResult {
  totalSize: number;
  dataBytes: number;
  paddingBytes: number;
  paddingPercentage: number;
  maxAlignment: number;
  cacheLinesSpanned: number;
  hasFalseSharingRisk: boolean;
  falseSharingDetails?: string;
  fields: ComputedFieldOffset[];
  byteGrid: ByteCell[];
}

export function computeStructLayout(fields: StructFieldDefinition[]): StructLayoutResult {
  if (fields.length === 0) {
    return {
      totalSize: 0,
      dataBytes: 0,
      paddingBytes: 0,
      paddingPercentage: 0,
      maxAlignment: 1,
      cacheLinesSpanned: 0,
      hasFalseSharingRisk: false,
      fields: [],
      byteGrid: [],
    };
  }

  let currentOffset = 0;
  let maxAlignment = 1;
  let totalDataBytes = 0;
  const computedFields: ComputedFieldOffset[] = [];
  const byteGrid: ByteCell[] = [];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const typeInfo = PRIMITIVE_TYPES[f.type] || PRIMITIVE_TYPES.i32;
    const align = typeInfo.alignment;
    const size = typeInfo.size;

    maxAlignment = Math.max(maxAlignment, align);
    totalDataBytes += size;

    // Calculate padding before this field to satisfy natural alignment
    const misalignment = currentOffset % align;
    const paddingBefore = misalignment === 0 ? 0 : align - misalignment;

    // Push padding bytes into byteGrid
    for (let p = 0; p < paddingBefore; p++) {
      const byteIdx = currentOffset + p;
      byteGrid.push({
        byteIndex: byteIdx,
        fieldName: null,
        type: 'padding',
        isPadding: true,
        isCacheLineBoundary: (byteIdx + 1) % 64 === 0,
        cacheLineIndex: Math.floor(byteIdx / 64),
        colorClass: 'bg-rose-950/60 border border-rose-800/80 text-rose-300',
      });
    }

    currentOffset += paddingBefore;
    const fieldStartOffset = currentOffset;

    // Push field data bytes into byteGrid
    for (let b = 0; b < size; b++) {
      const byteIdx = fieldStartOffset + b;
      byteGrid.push({
        byteIndex: byteIdx,
        fieldName: f.name,
        type: f.type,
        isPadding: false,
        isCacheLineBoundary: (byteIdx + 1) % 64 === 0,
        cacheLineIndex: Math.floor(byteIdx / 64),
        colorClass: typeInfo.colorClass,
      });
    }

    currentOffset += size;

    computedFields.push({
      name: f.name,
      type: f.type,
      offset: fieldStartOffset,
      size,
      alignment: align,
      paddingBefore,
      paddingAfter: 0,
      isAtomicOrFrequentlyMutated: f.isAtomicOrFrequentlyMutated,
    });
  }

  // Calculate trailing padding to align entire struct to maxAlignment
  const tailMisalignment = currentOffset % maxAlignment;
  const tailPadding = tailMisalignment === 0 ? 0 : maxAlignment - tailMisalignment;

  for (let p = 0; p < tailPadding; p++) {
    const byteIdx = currentOffset + p;
    byteGrid.push({
      byteIndex: byteIdx,
      fieldName: null,
      type: 'padding',
      isPadding: true,
      isCacheLineBoundary: (byteIdx + 1) % 64 === 0,
      cacheLineIndex: Math.floor(byteIdx / 64),
      colorClass: 'bg-rose-950/60 border border-rose-800/80 text-rose-300',
    });
  }

  const totalSize = currentOffset + tailPadding;
  const totalPaddingBytes = totalSize - totalDataBytes;
  const paddingPercentage = totalSize > 0 ? Math.round((totalPaddingBytes / totalSize) * 100) : 0;
  const cacheLinesSpanned = Math.ceil(totalSize / 64);

  // Mark paddingAfter on the last field if tailPadding > 0
  if (computedFields.length > 0 && tailPadding > 0) {
    computedFields[computedFields.length - 1].paddingAfter = tailPadding;
  }

  // False sharing detection: If multiple fields marked as frequently mutated or atomic share the same 64B cache line
  const cacheLineFieldMap: Record<number, string[]> = {};
  for (const cf of computedFields) {
    if (cf.isAtomicOrFrequentlyMutated) {
      const startLine = Math.floor(cf.offset / 64);
      const endLine = Math.floor((cf.offset + cf.size - 1) / 64);
      for (let cl = startLine; cl <= endLine; cl++) {
        if (!cacheLineFieldMap[cl]) cacheLineFieldMap[cl] = [];
        cacheLineFieldMap[cl].push(cf.name);
      }
    }
  }

  let hasFalseSharingRisk = false;
  let falseSharingDetails: string | undefined;

  for (const [lineIdx, fNames] of Object.entries(cacheLineFieldMap)) {
    if (fNames.length > 1) {
      hasFalseSharingRisk = true;
      falseSharingDetails = `Cache Line #${lineIdx} contains multiple concurrently mutated fields (${fNames.join(
        ', '
      )}), triggering hardware L1/L2 cache invalidation traffic (false sharing).`;
      break;
    }
  }

  return {
    totalSize,
    dataBytes: totalDataBytes,
    paddingBytes: totalPaddingBytes,
    paddingPercentage,
    maxAlignment,
    cacheLinesSpanned,
    hasFalseSharingRisk,
    falseSharingDetails,
    fields: computedFields,
    byteGrid,
  };
}

/**
 * Optimizes struct layout by reordering fields in descending order of natural alignment and size.
 * In C/C++, Rust (repr(C)), and Go, descending alignment packing guarantees zero internal padding holes.
 */
export function optimizeStructLayout(fields: StructFieldDefinition[]): StructFieldDefinition[] {
  return [...fields].sort((a, b) => {
    const alignA = (PRIMITIVE_TYPES[a.type] || PRIMITIVE_TYPES.i32).alignment;
    const alignB = (PRIMITIVE_TYPES[b.type] || PRIMITIVE_TYPES.i32).alignment;
    if (alignB !== alignA) {
      return alignB - alignA; // Largest alignment first
    }
    const sizeA = (PRIMITIVE_TYPES[a.type] || PRIMITIVE_TYPES.i32).size;
    const sizeB = (PRIMITIVE_TYPES[b.type] || PRIMITIVE_TYPES.i32).size;
    return sizeB - sizeA;
  });
}

/**
 * Generates idiomatic struct definition code in C, Rust, Go, or C++ with offset annotations.
 */
export function generateCodeDefinition(
  fields: StructFieldDefinition[],
  lang: 'c' | 'rust' | 'go' | 'cpp'
): string {
  const layout = computeStructLayout(fields);

  if (lang === 'c' || lang === 'cpp') {
    const structName = 'PacketHeader';
    const lines = [
      `// Total Size: ${layout.totalSize} bytes | Padding: ${layout.paddingBytes} bytes (${layout.paddingPercentage}%)`,
      `// Max Alignment: ${layout.maxAlignment} bytes | Spans ${layout.cacheLinesSpanned} L1 cache line(s)`,
      `struct ${structName} {`,
    ];

    for (const f of layout.fields) {
      const typeMap: Record<string, string> = {
        bool: 'bool',
        i8: 'int8_t',
        u8: 'uint8_t',
        i16: 'int16_t',
        u16: 'uint16_t',
        i32: 'int32_t',
        u32: 'uint32_t',
        f32: 'float',
        i64: 'int64_t',
        u64: 'uint64_t',
        f64: 'double',
        pointer: 'void*',
        slice_rust: 'struct { void* ptr; size_t len; }',
        slice_go: 'struct { void* ptr; size_t len; size_t cap; }',
      };
      const cType = typeMap[f.type] || 'int32_t';
      lines.push(`    ${cType} ${f.name}; // offset: ${f.offset}, size: ${f.size}B`);
    }
    lines.push('};');
    return lines.join('\n');
  }

  if (lang === 'rust') {
    const lines = [
      `// Total Size: ${layout.totalSize} bytes | Padding: ${layout.paddingBytes} bytes (${layout.paddingPercentage}%)`,
      `#[repr(C)]`,
      `pub struct PacketHeader {`,
    ];
    for (const f of layout.fields) {
      const typeMap: Record<string, string> = {
        bool: 'bool',
        i8: 'i8',
        u8: 'u8',
        i16: 'i16',
        u16: 'u16',
        i32: 'i32',
        u32: 'u32',
        f32: 'f32',
        i64: 'i64',
        u64: 'u64',
        f64: 'f64',
        pointer: '*const u8',
        slice_rust: '&[u8]',
        slice_go: 'GoSlice',
      };
      const rustType = typeMap[f.type] || 'i32';
      lines.push(`    pub ${f.name}: ${rustType}, // offset: ${f.offset}, size: ${f.size}B`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  // Go
  const lines = [
    `// Total Size: ${layout.totalSize} bytes | Padding: ${layout.paddingBytes} bytes (${layout.paddingPercentage}%)`,
    `type PacketHeader struct {`,
  ];
  for (const f of layout.fields) {
    const typeMap: Record<string, string> = {
      bool: 'bool',
      i8: 'int8',
      u8: 'byte',
      i16: 'int16',
      u16: 'uint16',
      i32: 'int32',
      u32: 'uint32',
      f32: 'float32',
      i64: 'int64',
      u64: 'uint64',
      f64: 'float64',
      pointer: 'uintptr',
      slice_rust: '[]byte',
      slice_go: '[]byte',
    };
    const goType = typeMap[f.type] || 'int32';
    const capitalized = f.name.charAt(0).toUpperCase() + f.name.slice(1);
    lines.push(`\t${capitalized} ${goType} // offset: ${f.offset}, size: ${f.size}B`);
  }
  lines.push('}');
  return lines.join('\n');
}

export interface PresetStruct {
  id: string;
  name: string;
  description: string;
  fields: StructFieldDefinition[];
}

export const PRESET_STRUCTS: PresetStruct[] = [
  {
    id: 'unoptimized-packet',
    name: 'Unoptimized Network Header (High Waste)',
    description: 'Alternating byte and 64-bit integer fields creating 11 bytes of compiler padding holes (37.5% memory waste).',
    fields: [
      { id: 'f1', name: 'version', type: 'u8' },
      { id: 'f2', name: 'sequence_number', type: 'u64' },
      { id: 'f3', name: 'flags', type: 'u8' },
      { id: 'f4', name: 'checksum', type: 'u32' },
      { id: 'f5', name: 'is_encrypted', type: 'bool' },
      { id: 'f6', name: 'payload_ptr', type: 'pointer' },
    ],
  },
  {
    id: 'concurrent-ring-buffer',
    name: 'Concurrent Ring Buffer Node (False Sharing)',
    description: 'Head and Tail pointers packed on the same 64-byte cache line, causing cross-core cache invalidation bounce.',
    fields: [
      { id: 'f1', name: 'read_index', type: 'u64', isAtomicOrFrequentlyMutated: true },
      { id: 'f2', name: 'write_index', type: 'u64', isAtomicOrFrequentlyMutated: true },
      { id: 'f3', name: 'buffer_capacity', type: 'u32' },
      { id: 'f4', name: 'is_closed', type: 'bool' },
      { id: 'f5', name: 'ring_data_ptr', type: 'pointer' },
    ],
  },
  {
    id: 'hft-order-entry',
    name: 'High-Frequency Order Book Entry',
    description: 'Sorted by descending alignment to achieve 0 internal padding bytes and minimal 24-byte footprint.',
    fields: [
      { id: 'f1', name: 'order_id', type: 'u64' },
      { id: 'f2', name: 'timestamp_ns', type: 'u64' },
      { id: 'f3', name: 'price_ticks', type: 'u32' },
      { id: 'f4', name: 'quantity', type: 'u32' },
    ],
  },
];
