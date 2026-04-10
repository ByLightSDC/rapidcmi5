/**
 * This file determines the contract between rapid cmi5 and any backend that wishes to interact with it
 * for scenario and CMI5 AU mapping operations.
 */

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const ScenarioApiSchema = z.object({
  uuid: z.string().optional(),
  dateCreated: z.string().optional(),
  dateEdited: z.string().optional(),
  description: z.string().optional(),
  name: z.string().optional(),
  author: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  metadata_tags: z.array(z.string()).optional(),
});

export type ScenarioApi = z.infer<typeof ScenarioApiSchema>;

const PaginatedScenariosResponseSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
  totalCount: z.number().optional(),
  totalPages: z.number().optional(),
  data: z.array(ScenarioApiSchema).optional(),
});

export const ScenarioQuerySchema = z.object({
  uuid: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  tag: z.string().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['dateCreated', 'dateEdited']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export const Cmi5AuMappingApiSchema = z.object({
  auId: z.string(),
  author: z.string().optional(),
  dateCreated: z.string().optional(),
  dateEdited: z.string().optional(),
  name: z.string().optional(),
  durationHours: z.number().optional(),
  scenarios: z.array(z.string()),
});

export type Cmi5AuMappingApi = z.infer<typeof Cmi5AuMappingApiSchema>;

export const Cmi5AuMappingCreateSchema = z.object({
  auId: z.string(),
  name: z.string(),
  durationHours: z.number().optional(),
  scenarios: z.array(z.string()),
});

export type Cmi5AuMappingCreate = z.infer<typeof Cmi5AuMappingCreateSchema>;

export const Cmi5AuMappingUpdateSchema = z.object({
  name: z.string().optional(),
  durationHours: z.number().optional(),
  scenarios: z.array(z.string()),
});

export type Cmi5AuMappingUpdate = z.infer<typeof Cmi5AuMappingUpdateSchema>;

export const scenarioContract = c.router({
  getScenario: {
    method: 'GET',
    path: '/v1/content/range/scenarios/:uuid',
    pathParams: z.object({ uuid: z.string() }),
    responses: {
      200: ScenarioApiSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Retrieve a scenario by UUID.',
  },
  listScenarios: {
    method: 'GET',
    path: '/v1/content/range/scenarios',
    query: ScenarioQuerySchema,
    responses: {
      200: PaginatedScenariosResponseSchema,
    },
    summary: 'List scenarios with optional filtering.',
  },
  getAuMapping: {
    method: 'GET',
    path: '/v1/cmi5/auMapping/:auId',
    pathParams: z.object({ auId: z.string() }),
    responses: {
      200: Cmi5AuMappingApiSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Retrieve a CMI5 AU mapping by AU ID.',
  },
  createAuMapping: {
    method: 'POST',
    path: '/v1/cmi5/auMapping',
    body: Cmi5AuMappingCreateSchema,
    responses: {
      201: Cmi5AuMappingApiSchema,
    },
    summary: 'Create a new CMI5 AU mapping.',
  },
  updateAuMapping: {
    method: 'PUT',
    path: '/v1/cmi5/auMapping/:auId',
    pathParams: z.object({ auId: z.string() }),
    body: Cmi5AuMappingUpdateSchema,
    responses: {
      200: Cmi5AuMappingApiSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Update an existing CMI5 AU mapping.',
  },
});
