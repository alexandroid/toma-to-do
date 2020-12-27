import React, { useState } from 'react';
import logo from './logo.svg';
//import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { PlannedTomato } from './tomato-icons';
import produce from 'immer';

type Task = {
  objective: string;
  numDone: number;
  inProgressUntilTime: number | undefined; // undefined means the task is not in progress
  numRemaining: number;
};

type State = 'planning' | 'executing';

const BLANK_TASK: Task = {
  objective: 'Test task',
  numDone: 0,
  inProgressUntilTime: undefined,
  numRemaining: 0,
};

function App() {
  const [state, setState] = useState('planning' as State);
  const [tasks, setTasks] = useState([produce(BLANK_TASK, draft => draft)]);
  const [taskIndexToFocusNext, setTaskIndexToFocusNext] = useState(0);

  if (state === 'planning') {
    return (
      <>
        <Container>
          <h1>Effort plan</h1>
          {tasks.map((task, taskIndex) => {
            return (<Box key={`task-${taskIndex}`}>
              <TextField id={`task-${taskIndex}`} value={task.objective} /*fullWidth={true}*/
              // https://stackoverflow.com/a/56066985/49678:
              inputRef={input => input && taskIndex === taskIndexToFocusNext && input.focus()}
              onChange={(e) => setTasks(produce(tasks, draft => {
                draft[taskIndex].objective = e.target.value;
              }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log(`enter pressed, lastInsertedIndex: ${taskIndex+1}`);
                  setTasks(produce(tasks, draft => {
                    draft.splice(taskIndex+1, 0, BLANK_TASK);
                  }));
                  setTaskIndexToFocusNext(taskIndex+1);
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  if(taskIndexToFocusNext > 0) {
                    setTaskIndexToFocusNext(taskIndexToFocusNext - 1);
                  }
                  e.preventDefault();
                } else if (e.key === 'ArrowDown') {
                  if(tasks.length > 0 && taskIndexToFocusNext < tasks.length - 1) {
                    setTaskIndexToFocusNext(taskIndexToFocusNext + 1);
                  }
                  e.preventDefault();
                }
              }}/>
              <PlannedTomato/>
            </Box>);
          })}
          {/* <Button variant="contained" color="primary">
            Hello World
          </Button> */}
        </Container>
      </>
    );
  }

  // state === 'executing' at this point
  return (
    <>
      <h1>Today's goals</h1>
      <ul>
        {tasks.map(task => (
          <li>{task.objective}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
