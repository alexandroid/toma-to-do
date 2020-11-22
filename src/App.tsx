import React, { useState } from 'react';
import logo from './logo.svg';
//import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';

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
  const [tasks, setTasks] = useState([BLANK_TASK]);

  if (state === 'planning') {
    return (
      <>
        <Container>
          <h1>Effort plan</h1>
          <Box>
            <TextField id="one" value={tasks[0].objective} fullWidth={true} onChange={(e) => setTasks([{...tasks[0], objective: e.target.value}])}/>
          </Box>
          <TextField id="two" value={tasks[0].objective} />
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
