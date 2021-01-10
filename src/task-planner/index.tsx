import React, { useRef } from 'react';
import produce from 'immer';

import { BLANK_TASK, Task, TaskFocusIndex, TaskPlannerState } from '../data-model';
import TaskPlannerView from './view';
import { WritableDraft } from 'immer/dist/types/types-external';

export type TaskPlannerControllerProps = {
  setTasks: React.Dispatch<React.SetStateAction<WritableDraft<Task>[]>>;
  setTaskIndexToFocusNext: (taskIndexToFocusNext: TaskFocusIndex) => void;
  tasks: Task[];
  taskIndexToFocusNext: TaskFocusIndex;
  taskPlannerState: TaskPlannerState;
  tomatoWorkDurationMinutes: number;
  tomatoRestDurationMinutes: number;
}

export default function TaskPlannerController({
  tasks,
  setTasks,
  taskIndexToFocusNext,
  setTaskIndexToFocusNext,
  taskPlannerState,
  tomatoWorkDurationMinutes,
  tomatoRestDurationMinutes,
}: TaskPlannerControllerProps) {
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

  function addNewTaskAfter(taskIndex: number) {
    if (taskPlannerState === 'planning') {
      setTasks(
        produce(tasks, draft => {
          draft.splice(taskIndex + 1, 0, BLANK_TASK);
        })
      );
    }
  }

  function incrementTaskRemainingTomatoes(taskIndex: number) {
    if (taskPlannerState === 'planning') {
      setTasks(
        produce(tasks, draft => {
          draft[taskIndex].numRemaining++;
        })
      )
    }
  }

  function decrementTaskRemainingTomatoes(taskIndex: number) {
    if (taskPlannerState === 'planning' && tasks[taskIndex].numRemaining > 1) {
      setTasks(
        produce(tasks, draft => {
          draft[taskIndex].numRemaining--;
        })
      )
    }
  }

  function updateNowAndCheckIfTaskIsDone() {
    const newNow = Date.now();
    forceUpdate();
    setTasks((oldTasks) =>
      produce(oldTasks, draft => {

        const taskIndexWhichEnded = draft.findIndex(task =>
          task.executionOrRestEndTime !== undefined && task.executionOrRestEndTime <= newNow);

        if(taskIndexWhichEnded < 0) {
          return;
        }

        const task = draft[taskIndexWhichEnded];

        task.executionOrRestEndTime = undefined;
        // console.info(`Setting task[${taskIndexWhichEnded}]executionOrRestEndTime = undefined`);
        if (timer.current !== undefined) { // should not happen, but just in case
          // console.info('Stopping the timer...');
          clearInterval(timer.current);
          timer.current = undefined;
        } else {
          console.error('Unexpected timer to be undefined here');
        }

        if (task.taskNextStep === 'rest') {
          // just finished working interval - update done/remaining tasks:
          task.numDone = task.numDone + 1;
          task.numRemaining = task.numRemaining > 0 ? task.numRemaining - 1 : 0;
        } else { // task.taskNextStep === 'work'
          // just finished resting interval - do nothing;
        }
      })
    );
  }

  return (
    <TaskPlannerView
      tasks={tasks}
      taskIndexToFocus={taskIndexToFocusNext}
      taskPlannerState={taskPlannerState}
      tomatoWorkDurationMinutes={tomatoWorkDurationMinutes}
      tomatoRestDurationMinutes={tomatoRestDurationMinutes}
      nowFn={Date.now}
      onChange={(event, taskIndex) => {
        setTasks(
          produce(tasks, draft => {
            draft[taskIndex].objective = event.target.value;
          })
        )
      }}
      onKeyDown={(event, taskIndex) => {
        // TODO: Hanlde 'Tab' focus change
        if (event.key === 'Enter') {
          addNewTaskAfter(taskIndex);
          setTaskIndexToFocusNext(taskIndex + 1);
          event.preventDefault();
        } else if (event.key === 'ArrowUp') {
          if (event.ctrlKey) {
            incrementTaskRemainingTomatoes(taskIndex);
          } else if (taskIndexToFocusNext !== null && taskIndexToFocusNext > 0) {
            setTaskIndexToFocusNext(taskIndexToFocusNext - 1);
          }
          event.preventDefault();
        } else if (event.key === 'ArrowDown') {
          if (event.ctrlKey) {
            decrementTaskRemainingTomatoes(taskIndex);
          } else if (tasks.length > 0 && taskIndexToFocusNext !== null && taskIndexToFocusNext < tasks.length - 1) {
            setTaskIndexToFocusNext(taskIndexToFocusNext + 1);
          }
          event.preventDefault();
        } else if (event.key === 'Delete' && event.ctrlKey) {
          if (tasks.length > 1 && taskPlannerState === 'planning') {
            setTasks(
              produce(tasks, draft => {
                draft.splice(taskIndex, 1)
              })
            );
            if (taskIndexToFocusNext === tasks.length - 1) {
              setTaskIndexToFocusNext(taskIndexToFocusNext - 1);
            }
          }
          event.preventDefault();
        }
      }}
      onFocus={(_, taskIndex) => setTaskIndexToFocusNext(taskIndex)}
      onBlur={(_, taskIndex) => {
        if (taskIndexToFocusNext === taskIndex) {
          //setTaskIndexToFocusNext(null);
        }
      }}
      onDrop={({ removedIndex, addedIndex }) => {
        if (removedIndex !== null && addedIndex !== null) {
          setTasks(
            produce(tasks, draft => {
              const task = tasks[removedIndex];
              draft.splice(removedIndex, 1);
              draft.splice(addedIndex, 0, task);
            })
          );
          setTaskIndexToFocusNext(addedIndex);
        }
      }}
      onAddTomatoClick={(taskIndex) => incrementTaskRemainingTomatoes(taskIndex)}
      onRemoveTomatoClick={(taskIndex) => decrementTaskRemainingTomatoes(taskIndex)}
      onStartWorkingRestingClick={(taskIndex) => {
        setTasks(
          produce(tasks, draft => {
            const task = draft[taskIndex];
            const nextStepDurationMins = task.taskNextStep === 'work' ? tomatoWorkDurationMinutes : tomatoRestDurationMinutes;
            task.executionOrRestEndTime = Date.now() + nextStepDurationMins /** * 60 */ * 1000;
            //                                       using seconds for testing ^^^^^^
            // console.info(`Setting end time: ${task.executionOrRestEndTime}`);
            task.taskNextStep = task.taskNextStep === 'work' ? 'rest' : 'work';
          })
        );
        timer.current = setInterval(updateNowAndCheckIfTaskIsDone, 1000);
      }}
    />);
}
