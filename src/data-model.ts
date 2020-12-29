export type Task = {
  objective: string;
  numDone: number;
  inProgressUntilTime: number | undefined; // undefined means the task is not in progress
  numRemaining: number;
};

export const BLANK_TASK: Task = {
  objective: 'Test task',
  numDone: 0,
  inProgressUntilTime: undefined,
  numRemaining: 1,
};
