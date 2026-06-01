/*
 * This file determines the contract between rapid cmi5 and any backend that wishes to interact with it
 * A backend can be generated that conforms to this url contract by using
 *  https://ts-rest.com/server/express is an example with express
 */

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const ExecuteCodeBodySchema = z.object({
  submissionContent: z.string(),
  language: z.string(),
  languageVersion: z.string(),
});

export const ExecuteCodeResponseSchema = z.object({
  success: z.boolean(),
  stdout: z.string(),
  stderr: z.string(),
  cmpinfo: z.string(),
  outcome: z.number(),
});

export type ExecuteCodeBodyApi = z.infer<typeof ExecuteCodeBodySchema>;
export type ExecuteCodeResponseApi = z.infer<typeof ExecuteCodeResponseSchema>;

const LanguagesResponseSchema = z.record(z.string(), z.array(z.string()));
export type LanguagesResponseApi = z.infer<typeof LanguagesResponseSchema>;

export const codeRunnerContract = c.router({
  listLanguages: {
    method: 'GET',
    path: '/v1/cmi5/code-runner/languages',
    responses: {
      200: LanguagesResponseSchema,
    },
    summary: 'List available code execution runtimes.',
  },
  execute: {
    method: 'POST',
    path: '/v1/cmi5/code-runner/execute',
    body: ExecuteCodeBodySchema,
    responses: {
      200: ExecuteCodeResponseSchema,
    },
    summary: 'Execute code against an evaluator.',
  },
});
