import React, { useState } from 'react';
//import logo from './logo.svg';
//import './App.css';
//import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import produce from 'immer';
import { Route, Switch, Link as RouteLink } from 'react-router-dom';
import TaskPlannerController from './task-planner';
import { BLANK_TASK } from './data-model';

type State = 'planning' | 'working';

function App() {
  const [state, setState] = useState('planning' as State);
  const [tasks, setTasks] = useState([produce(BLANK_TASK, draft => draft)]);
  const [taskIndexToFocusNext, setTaskIndexToFocusNext] = useState(0);

  if (state === 'planning') {
    return (
      <Switch>
        <Route path="/" exact={true}>
          <Container>
            <h1>Effort plan</h1>
            <TaskPlannerController
              tasks={tasks}
              setTasks={setTasks}
              taskIndexToFocusNext={taskIndexToFocusNext}
              setTaskIndexToFocusNext={setTaskIndexToFocusNext}
            />
            <Button variant="contained" color="primary" component={RouteLink} to={"/working"}>
              Start working
            </Button>
          </Container>
        </Route>
        <Route path="/working">
          <Container>
            <h1>Working on tasks</h1>

          </Container>
        </Route>
      </Switch>
    );
  }

  // state === 'working' at this point
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
