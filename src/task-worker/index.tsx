import React from 'react';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import produce from 'immer';

import { PlannedTomato } from '../tomato-icons';
import { BLANK_TASK, Task, TaskFocusIndex } from '../data-model';

export type TaskWorkerControllerProps = {
  setTasks: (tasks: Task[]) => void;
  setTaskIndexToFocusNext: (taskIndexToFocusNext: TaskFocusIndex) => void;
  tasks: Task[];
  taskIndexToFocusNext: TaskFocusIndex;
}

export default function TaskWokerController({
  tasks,
  setTasks,
  taskIndexToFocusNext,
  setTaskIndexToFocusNext
}: TaskWorkerControllerProps) {
  return (
    <TaskWorkerView
      tasks={tasks}
      taskIndexToFocus={taskIndexToFocusNext}
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
          //console.log(`enter pressed, lastInsertedIndex: ${taskIndex+1}`);
          setTasks(
            produce(tasks, draft => {
              draft.splice(taskIndex + 1, 0, BLANK_TASK);
            })
          );
          setTaskIndexToFocusNext(taskIndex + 1);
          event.preventDefault();
        } else if (event.key === 'ArrowUp') {
          if (event.ctrlKey) {
            setTasks(
              produce(tasks, draft => {
                draft[taskIndex].numRemaining++;
              })
            )
          } else if (taskIndexToFocusNext !== null && taskIndexToFocusNext > 0) {
            setTaskIndexToFocusNext(taskIndexToFocusNext - 1);
          }
          event.preventDefault();
        } else if (event.key === 'ArrowDown') {
          if (event.ctrlKey) {
            if (tasks[taskIndex].numRemaining > 1) {
              setTasks(
                produce(tasks, draft => {
                  draft[taskIndex].numRemaining--;
                })
              )
            }
          } else if (tasks.length > 0 && taskIndexToFocusNext !== null && taskIndexToFocusNext < tasks.length - 1) {
            setTaskIndexToFocusNext(taskIndexToFocusNext + 1);
          }
          event.preventDefault();
        } else if (event.key === 'Delete' && event.ctrlKey) {
          if (tasks.length > 1) {
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
    />);
}

type TaskWorkerViewProps = {
  tasks: Task[];
  taskIndexToFocus: TaskFocusIndex;
  onChange: (event: any, taskIndex: number) => void;
  onKeyDown: (event: any, taskIndex: number) => void;
};

function TaskWorkerView({ tasks, taskIndexToFocus, onChange, onKeyDown }: TaskWorkerViewProps) {
  return (
    <>
      {tasks.map((task, taskIndex) => {
        return (
          <Box key={`task-${taskIndex}`}>
            <TextField id={`task-${taskIndex}`} value={task.objective} /*fullWidth={true}*/
              // https://stackoverflow.com/a/56066985/49678:
              inputRef={input => input && taskIndex === taskIndexToFocus && input.focus()}
              onChange={(e) => onChange(e, taskIndex)}
              onKeyDown={(e) => onKeyDown(e, taskIndex)} />
            {new Array(task.numRemaining)
              .fill(undefined)
              .map((e, plannedTomatoIndex) => {
                const key = `planned-tomato-${taskIndex}-${plannedTomatoIndex}`;
                return <PlannedTomato key={key} />;
              })
            }
          </Box>
        );
      })}
    </>
  );
}
