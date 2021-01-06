export type Task = {
  objective: string;
  numDone: number;
  numRemaining: number;
  executionOrRestEndTime: number | undefined; // undefined means the task is not in progress
  taskNextStep: TaskNextStep;
};

export type TaskNextStep = 'work' | 'rest';

/**
 * Null means none of the tasks are focused
 */
export type TaskFocusIndex = number | null;

export const BLANK_TASK: Task = {
  objective: 'Test task',
  numDone: 0,
  numRemaining: 1,
  executionOrRestEndTime: undefined,
  taskNextStep: 'work',
};

export const DEFAULT_WORK_DURATION_MINS: number = 25;
export const DEFAULT_REST_DURATION_MINS: number = 5;
