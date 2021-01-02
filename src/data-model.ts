export type Task = {
  objective: string;
  numDone: number;
  inProgressUntilTime: number | undefined; // undefined means the task is not in progress
  numRemaining: number;
};

/**
 * Null means none of the tasks are focused
 */
export type TaskFocusIndex = number | null;

export const BLANK_TASK: Task = {
  objective: 'Test task',
  numDone: 0,
  inProgressUntilTime: undefined,
  numRemaining: 1,
};

export const DEFAULT_WORK_DURATION_MINS: number = 25;
export const DEFAULT_REST_DURATION_MINS: number = 5;
