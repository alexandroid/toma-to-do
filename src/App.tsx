import React, { useState } from 'react';
//import logo from './logo.svg';
//import './App.css';
//import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import SettingsIcon from '@material-ui/icons/Settings';
import produce from 'immer';
import { Route, Switch, Link as RouteLink } from 'react-router-dom';
import TaskPlannerController from './task-planner';
import { BLANK_TASK, DEFAULT_REST_DURATION_MINS, DEFAULT_WORK_DURATION_MINS } from './data-model';
import { TextField } from '@material-ui/core';

type State = 'planning' | 'working';

function App() {
  const [state, setState] = useState('planning' as State);
  const [tasks, setTasks] = useState([produce(BLANK_TASK, draft => draft)]);
  const [taskIndexToFocusNext, setTaskIndexToFocusNext] = useState(0);
  const [tomatoWorkDurationMinutes, setTomatoWorkDurationMinutes] = useState(25);
  const [tomatoRestDurationMinutes, setTomatoRestDurationMinutes] = useState(5);

  if (state === 'planning') {
    return (
      <Switch>
        <Route path="/settings" exact={true}>
          <Container>
            <h1>Settings</h1>
            <TextField
              variant="filled"
              type="number"
              value={tomatoWorkDurationMinutes}
              onChange={(e) => setTomatoWorkDurationMinutes(parseInt(e.target.value))}
              label="Work duration, minutes"
            /><br/>&nbsp;<br/>
            <TextField
              variant="filled"
              type="number"
              value={tomatoRestDurationMinutes}
              onChange={(e) => setTomatoRestDurationMinutes(parseInt(e.target.value))}
              label="Rest duration, minutes"
            /><br/>&nbsp;<br/>
            <Button
              variant="contained"
              color="secondary"
              disabled={tomatoWorkDurationMinutes === DEFAULT_WORK_DURATION_MINS && tomatoRestDurationMinutes === DEFAULT_REST_DURATION_MINS}
              onClick={() => {
                setTomatoWorkDurationMinutes(DEFAULT_WORK_DURATION_MINS);
                setTomatoRestDurationMinutes(DEFAULT_REST_DURATION_MINS);
              }}>
              Reset to 25/5
            </Button>&nbsp;
            <Button variant="contained" color="primary" component={RouteLink} to={"/"}>
              Plan tasks
            </Button>
          </Container>
        </Route>
        <Route path="/" exact={true}>
          <Container>
            <h1>Planning tasks</h1>
            <TaskPlannerController
              tasks={tasks}
              setTasks={setTasks}
              taskIndexToFocusNext={taskIndexToFocusNext}
              setTaskIndexToFocusNext={setTaskIndexToFocusNext}
            /><br/>
            <Button variant="contained" color="default" startIcon={<SettingsIcon />} component={RouteLink} to={"/settings"}>
              Settings
            </Button>&nbsp;
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
