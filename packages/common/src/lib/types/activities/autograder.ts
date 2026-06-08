import z from 'zod/v4';

export const AutoGraderEventResultSchema = z.object({
  answers: z.object({
    performance: z.number(),
  }),
  success: z.boolean(),
});

export type AutoGraderEventResult = z.infer<typeof AutoGraderEventResultSchema>;

export const AutoGraderEventDataSchema = z.object({
  name: z.string(),
  telemetryAgent: z.string(),
  uuid: z.string(),
  metadata: z.object({
    rangeOsUI: z.object({
      quizQuestion: z.object({
        question: z.string(),
        activityId: z.string(),
        questionId: z.string(),
        questionType: z.string(),
      }),
    }),
  }),
});

export type AutoGraderEventData = z.infer<typeof AutoGraderEventDataSchema>;

export const AutoGraderEventSchema = z.object({
  result: AutoGraderEventResultSchema,
  autoGrader: AutoGraderEventDataSchema,
});

export type AutoGraderEvent = z.infer<typeof AutoGraderEventSchema>;

export const AuAutoGraderSchema = z.object({
  name: z.string(),
  activityId: z.string(),
  questionId: z.string(),
  uuid: z.string(),
  question: z.string(),
  questionType: z.string(),
});

export type AuAutoGrader = z.infer<typeof AuAutoGraderSchema>;
