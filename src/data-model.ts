export type Task = {
  objective: string;
  numDone: number;
  numRemaining: number;
  // Undefined means the task is not in progress.
  executionOrRestEndTime: number | undefined;
  // For in-progress tasks it indicates the step *after* the current in-progress activity is done.
  // For example, if executionOrRestEndTime !== undefined and this is equals to 'work' then it means
  // the task is in "resting" mode.
  taskNextStep: TaskNextStep;
};

export type TaskNextStep = 'work' | 'rest';

/**
 * Null means none of the tasks are focused
 */
export type TaskFocusIndex = number | null;

export const BLANK_TASK: Task = {
  objective: 'Test task',
  numDone: 1, // TODO: Set back to 0 after testing is done
  numRemaining: 1,
  executionOrRestEndTime: undefined,
  taskNextStep: 'work',
};

export type TaskPlannerState = 'planning' | 'working';

export const DEFAULT_WORK_DURATION_MINS: number = 15; // TODO: Set back to 25 after testing is done
export const DEFAULT_REST_DURATION_MINS: number = 5;
