import React from 'react';
import TextField from '@material-ui/core/TextField';
//import Box from '@material-ui/core/Box';
import produce from 'immer';

import { PlannedTomato } from '../tomato-icons';
import { BLANK_TASK, Task, TaskFocusIndex } from '../data-model';
import { Button, IconButton, List, ListItem, ListItemIcon, Typography } from '@material-ui/core';
import { Container as DndContainer, Draggable, DropResult } from 'react-smooth-dnd';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

export type TaskPlannerState = 'planning' | 'working';

export type TaskPlannerControllerProps = {
  setTasks: (tasks: Task[]) => void;
  setTaskIndexToFocusNext: (taskIndexToFocusNext: TaskFocusIndex) => void;
  tasks: Task[];
  taskIndexToFocusNext: TaskFocusIndex;
  taskPlannerState: TaskPlannerState;
}

export default function TaskPlannerController({
  tasks,
  setTasks,
  taskIndexToFocusNext,
  setTaskIndexToFocusNext,
  taskPlannerState,
}: TaskPlannerControllerProps) {
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

  return (
    <TaskPlannerView
      tasks={tasks}
      taskIndexToFocus={taskIndexToFocusNext}
      taskPlannerState={taskPlannerState}
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
    />);
}

type TaskPlannerViewProps = {
  tasks: Task[];
  taskIndexToFocus: TaskFocusIndex;
  taskPlannerState: TaskPlannerState;
  onChange: (event: any, taskIndex: number) => void;
  onKeyDown: (event: any, taskIndex: number) => void;
  onFocus: (event: any, taskIndex: number) => void;
  onBlur: (event: any, taskIndex: number) => void;
  onDrop: (_: DropResult) => void;
  onAddTomatoClick: (taskIndex: number) => void;
  onRemoveTomatoClick: (taskIndex: number) => void;
};

function TaskPlannerView({
  tasks,
  taskIndexToFocus,
  taskPlannerState,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onDrop,
  onAddTomatoClick,
  onRemoveTomatoClick,
}: TaskPlannerViewProps) {
  return (
    <List>
      <DndContainer dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
        {tasks.map((task, taskIndex) => {
          const taskId = `task-${taskIndex}`;
          return (
            <Draggable key={taskId}>
              <ListItem>
                <ListItemIcon className="drag-handle">
                  <DragHandleIcon />
                </ListItemIcon>
                {taskPlannerState === 'planning' ? (
                  <>
                    <TextField
                      id={taskId}
                      value={task.objective}
                      // https://stackoverflow.com/a/56066985/49678:
                      inputRef={input => input && taskIndex === taskIndexToFocus && input.focus()}
                      onChange={(e) => onChange(e, taskIndex)}
                      onKeyDown={(e) => onKeyDown(e, taskIndex)}
                      onFocus={(e) => onFocus(e, taskIndex)}
                      onBlur={(e) => onBlur(e, taskIndex)}
                    />
                    &nbsp;<IconButton
                      color="default"
                      component="button"
                      size="small"
                      aria-label="increase planned tomatoes by one"
                      onClick={() => onAddTomatoClick(taskIndex)}>
                        <AddIcon />
                    </IconButton>
                    &nbsp;<IconButton
                      color="default"
                      component="button"
                      size="small"
                      disabled={task.numRemaining <= 1}
                      aria-label="decrease planned tomatoes by one"
                      onClick={() => onRemoveTomatoClick(taskIndex)}>
                        <RemoveIcon />
                    </IconButton>
                  </>
                ): /* taskPlannerState === 'working' at this point */ (
                  <Typography>
                    <span
                      tabIndex={0} // enables tab selection for non-input elements
                      onKeyDown={(e) => onKeyDown(e, taskIndex)}
                      onFocus={(e) => onFocus(e, taskIndex)}
                      onBlur={(e) => onBlur(e, taskIndex)}
                      ref={elem => elem && taskIndex === taskIndexToFocus && elem.focus()}
                    >
                      {task.objective}
                    </span>
                  </Typography>
                ) }
                {new Array(task.numRemaining)
                  .fill(undefined)
                  .map((e, plannedTomatoIndex) => {
                    const key = `planned-tomato-${taskIndex}-${plannedTomatoIndex}`;
                    return <PlannedTomato key={key} />;
                  })
                }
                {taskPlannerState === 'working' && taskIndex === taskIndexToFocus ? (
                  <>
                    &nbsp;<Button
                      variant="contained"
                      color="default"
                      component="button">{
                        task.taskNextStep === 'work' ? 'Start working' : 'Start resting'
                      }</Button>
                  </>
                ) : null}
              </ListItem>
            </Draggable>
          );
        })}
      </DndContainer>
    </List>
  );
}
