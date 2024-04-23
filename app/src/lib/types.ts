import { z } from 'zod';

export const CREATE_CHALLENGE = z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.string(),
    points: z.number(),
    staticFlag: z.string(),
    fileUrl: z.string(),
    containerPath: z.string(),
    assignTo: z.string().uuid(),
    dependsOn: z.string(),
    isWithFile: z.boolean(),
    isFlagPool: z.boolean(),
    isStaticFlag: z.boolean(),
    isContainer: z.boolean(),
    isDependant: z.boolean()
})
export type ChallengeCreate = z.infer<typeof CREATE_CHALLENGE>;

export const CREATE_EVENT = z.object({
    name: z.string(),
    description: z.string(),
    start: z.number(),
    end: z.number()
})
export type EventCreate = z.infer<typeof CREATE_EVENT>;

export const CREATE_TEAM_EVENT = z.object({
    eventId: z.string().uuid(),
    teamIdList: z.array(z.string().uuid())
})
export type TeamEventCreate = z.infer<typeof CREATE_TEAM_EVENT>;

export const UPDATE_CHALLENGE = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.string(),
    points: z.number(),
    assignTo: z.string().uuid(),
    dependsOn: z.string()
})
export type ChallengeUpdate = z.infer<typeof UPDATE_CHALLENGE>;

export const UPDATE_EVENT = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    start: z.number(),
    end: z.number()
})
export type EventUpdate = z.infer<typeof UPDATE_EVENT>;

export const UPDATE_SUBMISSION = z.object({
    challengeId: z.string().uuid(),
    teamId: z.string().uuid(),
    eventId: z.string().uuid(),
    containerId: z.string().uuid(),
    containerHost: z.string(),
    containerFlag: z.string()
})
export type SubmissionUpdate = z.infer<typeof UPDATE_SUBMISSION>;

export const UPDATE_USER = z.object({
    id: z.string().uuid(),
    email: z.string(),
    role: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    affiliation: z.string(),
    teamId: z.string(),
    isVerified: z.boolean()
})
export type UserUpdate = z.infer<typeof UPDATE_USER>;

export const UPDATE_TEAM = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string()
})
export type TeamUpdate = z.infer<typeof UPDATE_TEAM>;

export const DELETE_TEAM_EVENT = z.object({
    teamId: z.string().uuid(),
    eventId: z.string().uuid()
})
export type TeamEventDelete = z.infer<typeof DELETE_TEAM_EVENT>;

export const DELETE_SUBMISSION = z.object({
    challengeId: z.string().uuid(),
    teamId: z.string().uuid(),
    eventId: z.string().uuid()
})
export type SubmissionDelete = z.infer<typeof DELETE_SUBMISSION>;
