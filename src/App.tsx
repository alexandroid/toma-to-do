import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

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
        <h1>Effort plan</h1>
        <ul>
          {tasks.map(task => (
            <li>{task.objective}</li>
          ))}
        </ul>
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
