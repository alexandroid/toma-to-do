import React from 'react';
import { Task, TaskFocusIndex, TaskPlannerState } from '../data-model';
import { Button, IconButton, List, ListItem, ListItemIcon, Typography } from '@material-ui/core';
import { Container as DndContainer, Draggable, DropResult } from 'react-smooth-dnd';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import TextField from '@material-ui/core/TextField';

import { DoneTomato, InProgressTomato, PlannedTomato } from '../tomato-icons';


export type TaskPlannerViewProps = {
  tasks: Task[];
  taskIndexToFocus: TaskFocusIndex;
  taskPlannerState: TaskPlannerState;
  tomatoWorkDurationMinutes: number;
  tomatoRestDurationMinutes: number;
  nowFn: () => number;
  onChange: (event: any, taskIndex: number) => void;
  onKeyDown: (event: any, taskIndex: number) => void;
  onFocus: (event: any, taskIndex: number) => void;
  onBlur: (event: any, taskIndex: number) => void;
  onDrop: (_: DropResult) => void;
  onAddTomatoClick: (taskIndex: number) => void;
  onRemoveTomatoClick: (taskIndex: number) => void;
  onStartWorkingRestingClick: (taskIndex: number) => void;
};

export default function TaskPlannerView({
  tasks,
  taskIndexToFocus,
  taskPlannerState,
  tomatoWorkDurationMinutes,
  tomatoRestDurationMinutes,
  nowFn,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onDrop,
  onAddTomatoClick,
  onRemoveTomatoClick,
  onStartWorkingRestingClick,
}: TaskPlannerViewProps) {
  const taskInProgressIndex = tasks.findIndex(task => task.executionOrRestEndTime !== undefined);
  const isTaskInProgress = taskInProgressIndex >= 0;

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
                <TaskTomatoes task={task} taskIndex={taskIndex} />
                {taskPlannerState === 'working' ? (
                  <>{formatRemainingTime(tasks[taskIndex], nowFn(), tomatoWorkDurationMinutes, tomatoRestDurationMinutes)}</>
                ) : null}
                {taskPlannerState === 'working' && !isTaskInProgress && taskIndex === taskIndexToFocus ? (
                  <>
                    &nbsp;<Button
                      variant="contained"
                      color="default"
                      component="button"
                      onClick={() => onStartWorkingRestingClick(taskIndex)}
                      >{
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

function TaskTomatoes({ task, taskIndex }: { task: Task, taskIndex: number }) {
  // If the task is in "working" mode, we want to display the first remaining tomato
  // as the "in progress one". Moreover, if there are no "remaining" tomatoes planned,
  // we still want to show an in-progress one. We don't want to force-add a new "remaining"
  // tomato upon a new working segment, since it could have been an accidental click
  // and we don't want to have a new planned tomato after the user cancels it.
  const isWorkingInProgress = task.executionOrRestEndTime !== undefined && task.taskNextStep === 'rest';
  const numInProgress = isWorkingInProgress ? 1 : 0;
  const numRemaining = isWorkingInProgress ? Math.max(0, task.numRemaining - 1) : task.numRemaining;

  return (
    <>
      {new Array(task.numDone).fill(undefined)
        .map((_, doneTomatoIndex) => {
          const key = `done-tomato-${taskIndex}-${doneTomatoIndex}`;
          return <DoneTomato key={key} />;
        })
      }
      {new Array(numInProgress)
        .fill(undefined)
        .map((_, plannedTomatoIndex) => {
          const key = `in-progress-tomato-${taskIndex}-${plannedTomatoIndex}`;
          return <InProgressTomato key={key} />;
        })
      }
      {new Array(numRemaining)
        .fill(undefined)
        .map((_, plannedTomatoIndex) => {
          const key = `planned-tomato-${taskIndex}-${plannedTomatoIndex}`;
          return <PlannedTomato key={key} />;
        })
      }
    </>
  );
}

function formatRemainingTime(
  task: Task,
  currentTimeMs: number | undefined,
  tomatoWorkDurationMinutes: number,
  tomatoRestDurationMinutes: number
) {
  if (task.executionOrRestEndTime !== undefined && currentTimeMs !== undefined) {
    // console.info(`End time is ${task.executionOrRestEndTime}, diff: ${task.executionOrRestEndTime - currentTimeMs}, currentTimeMs: ${currentTimeMs}, now: ${Date.now()}`);
    return formatTimeDifference(task.executionOrRestEndTime - currentTimeMs);
  }
  const durationToDisplayMins = task.taskNextStep === 'work'
    ? tomatoWorkDurationMinutes
    : tomatoRestDurationMinutes;
  return formatTimeDifference(durationToDisplayMins * 60 * 1000);
}

function formatTimeDifference(diffMs: number) {
  // Ceiling rounding is used for seconds only to avoid waiting up to a second
  // with 00:00 shown in the UI:
  const diffSeconds = Math.ceil(diffMs / 1000);
  if (diffSeconds > 0) {
    const s = diffSeconds % 60;
    const diffMinutes = Math.trunc(diffSeconds / 60);
    const m = diffMinutes % 60;
    const h = Math.trunc(diffMinutes / 60);
    if (h > 0) {
      return `${padZeroes(h)}:${padZeroes(m)}:${padZeroes(s)}`;
    } else { // always print sero minutes
      return `${padZeroes(m)}:${padZeroes(s)}`;
    }
  }
  return '00:00';
}

function padZeroes(n: number) {
  return n.toString().padStart(2, '0');
}
