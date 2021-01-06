import React, { useState } from 'react';
//import logo from './logo.svg';
//import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import SettingsIcon from '@material-ui/icons/Settings';
import produce from 'immer';
import { Route, Switch, Link as RouteLink } from 'react-router-dom';
import TaskPlannerController from './task-planner';
import { BLANK_TASK, DEFAULT_REST_DURATION_MINS, DEFAULT_WORK_DURATION_MINS, TaskFocusIndex } from './data-model';
import { PropTypes, TextField } from '@material-ui/core';

function SettingsButton() {
  return (
    <Button variant="contained" color="default" startIcon={<SettingsIcon />} component={RouteLink} to={"/settings"}>
      Settings
    </Button>
  );
}

function PlanTasksButton({ color }: { color: PropTypes.Color; }) {
  return (
    <Button variant="contained" color={color} component={RouteLink} to={"/"}>
      Plan tasks
    </Button>
  );
}

function App() {
  // const [state, setState] = useState('planning' as State);
  const [tasks, setTasks] = useState([produce(BLANK_TASK, draft => draft)]);
  const [taskIndexToFocusNext, setTaskIndexToFocusNext] = useState<TaskFocusIndex>(0);
  const [tomatoWorkDurationMinutes, setTomatoWorkDurationMinutes] = useState(25);
  const [tomatoRestDurationMinutes, setTomatoRestDurationMinutes] = useState(5);

  const remainingWorkDurationTotalMinutes = tasks
    .map((task) => task.numRemaining)
    .reduce((acc, numRemaining) => acc + numRemaining) * (tomatoWorkDurationMinutes + tomatoRestDurationMinutes);
  const remainingWorkDurationHours = Math.floor(remainingWorkDurationTotalMinutes / 60);
  const remainingWorkDurationMins = remainingWorkDurationTotalMinutes - remainingWorkDurationHours * 60;
  const toGoString = computeToGoString(remainingWorkDurationHours, remainingWorkDurationMins);

  return (
    <CssBaseline>
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
            /><br />&nbsp;<br />
            <TextField
              variant="filled"
              type="number"
              value={tomatoRestDurationMinutes}
              onChange={(e) => setTomatoRestDurationMinutes(parseInt(e.target.value))}
              label="Rest duration, minutes"
            /><br />&nbsp;<br />
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
              <PlanTasksButton color="primary" />
          </Container>
        </Route>
        <Route path="/" exact={true}>
          <Container>
            <h1>Planning tasks ({toGoString})</h1>
            <TaskPlannerController
              tasks={tasks}
              setTasks={setTasks}
              taskIndexToFocusNext={taskIndexToFocusNext}
              setTaskIndexToFocusNext={setTaskIndexToFocusNext}
              taskPlannerState="planning"
              tomatoWorkDurationMinutes={tomatoWorkDurationMinutes}
              tomatoRestDurationMinutes={tomatoRestDurationMinutes}
            /><br />
            <SettingsButton />&nbsp;
              <Button variant="contained" color="primary" component={RouteLink} to={"/working"}>
                Work on tasks
              </Button>
          </Container>
        </Route>
        <Route path="/working">
          <Container>
            <h1>Working on tasks ({toGoString})</h1>
            <TaskPlannerController
              tasks={tasks}
              setTasks={setTasks}
              taskIndexToFocusNext={taskIndexToFocusNext}
              setTaskIndexToFocusNext={setTaskIndexToFocusNext}
              taskPlannerState="working"
              tomatoWorkDurationMinutes={tomatoWorkDurationMinutes}
              tomatoRestDurationMinutes={tomatoRestDurationMinutes}
            /><br />
            <SettingsButton />&nbsp;
            <PlanTasksButton color="default" />
          </Container>
        </Route>
      </Switch>
    </CssBaseline>
  );
}

function computeToGoString(remainingWorkDurationHours: number, remainingWorkDurationMins: number) {
  if (remainingWorkDurationHours === 0) {
    return `${remainingWorkDurationMins} minutes to go`;
  }
  // remainingWorkDurationHours > 0:
  if (remainingWorkDurationMins % 15 === 0) {
    // If minutes are at the quarter of the hour, just show the fractional hours for brevity:
    const fractionalHours = remainingWorkDurationHours + remainingWorkDurationMins / 60;
    const hoursOrHour = fractionalHours === 1 ? 'hour' : 'hours'
    return `${fractionalHours} ${hoursOrHour} to go`;
  }
  const hoursOrHour = remainingWorkDurationHours === 1 ? 'hour' : 'hours'
  // Note: minutes are never zero at this point to we will not say "0 minutes to go":
  return `${remainingWorkDurationHours} ${hoursOrHour} and ${remainingWorkDurationMins} minutes to go`;
}

export default App;
