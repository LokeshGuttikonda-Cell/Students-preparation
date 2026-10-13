import { describe, it, expect } from 'vitest';
import { getCurriculumUrlForTopic, TOPIC_TO_CURRICULUM_ARTICLE_SLUG } from '../topic-curriculum-map';
import { DEFAULT_ROLES_CATALOG } from '../catalog-data';
import { CURRICULUM_SUMMARIES } from '../curriculum-summaries';

describe('Topic Curriculum Map & Module Theory Redirection Tests', () => {
  it('maps AI Coding Agents & Autonomous Loops directly to the AI coding agent article', () => {
    const url = getCurriculumUrlForTopic('ai-coding-agents-loops', 'AI Coding Agents & Autonomous Loops', 'Module 1');
    expect(url).toBe('/curriculum/claude-code-and-ai-coding-agents');
  });

  it('maps RAG Architectures & Vector Search directly to the production RAG article', () => {
    const url = getCurriculumUrlForTopic('rag-architectures-vector-search', 'RAG Architectures & Vector Search', 'Module 2');
    expect(url).toBe('/curriculum/retrieval-augmented-generation-and-vector-search');
  });

  it('maps AWS Cloud Architecture directly to Cloud VPC curriculum', () => {
    const url = getCurriculumUrlForTopic('aws-cloud-architecture', 'Cloud Architecture & Infrastructure Services', 'Module 1');
    expect(url).toBe('/curriculum/cloud-vpc-networking-and-iam-security');
  });

  it('maps Linux Shell Scripting directly to Linux Process Lifecycle curriculum', () => {
    const url = getCurriculumUrlForTopic('linux-shell-scripting', 'Linux System Administration & Shell', 'Module 2');
    expect(url).toBe('/curriculum/linux-kernel-cgroups-container-primitives');
  });

  it('maps DevOps Docker CI/CD directly to Docker Layer Caching curriculum', () => {
    const url = getCurriculumUrlForTopic('devops-docker-cicd', 'DevOps, Docker & CI/CD Pipelines', 'Module 3');
    expect(url).toBe('/curriculum/docker-multi-stage-builds-and-kubernetes-scheduling');
  });

  it('maps Core Java Multithreading directly to JVM Memory Model curriculum', () => {
    const url = getCurriculumUrlForTopic('core-java-multithreading', 'Core Java & Multithreading', 'Module 1');
    expect(url).toBe('/curriculum/java-virtual-threads-and-concurrency-models');
  });

  it('maps Advanced SQL Optimization directly to ACID Properties curriculum', () => {
    const url = getCurriculumUrlForTopic('advanced-sql-optimization', 'Advanced SQL & Query Optimization', 'Module 3');
    expect(url).toBe('/curriculum/acid-transactions-mvcc-and-isolation-anomalies');
  });

  it('guarantees that EVERY competency topic across ALL defined roles redirects to a specific article', () => {
    for (const role of DEFAULT_ROLES_CATALOG) {
      for (const comp of role.competencies) {
        const url = getCurriculumUrlForTopic(comp.topicSlug, comp.topicName, comp.topicName);
        expect(url.startsWith('/curriculum/')).toBe(true);
        expect(url).not.toBe('/curriculum');
        // Must contain a specific slug
        const targetSlug = url.replace('/curriculum/', '');
        expect(targetSlug.length).toBeGreaterThan(3);
      }
    }
  });

  it('guarantees that all mapped article slugs exist in CURRICULUM_SUMMARIES', () => {
    const knownSlugs = new Set(CURRICULUM_SUMMARIES.map((s) => s.slug));
    for (const [, articleSlug] of Object.entries(TOPIC_TO_CURRICULUM_ARTICLE_SLUG)) {
      expect(knownSlugs.has(articleSlug)).toBe(true);
    }
  });
});
