This app combines a TODO list and a Pomodoro timer.

It was previously a jQuery app, its live working version is still up for now (uses local storage so it does not need a server):
   http://alexandroid.github.com/toma-to-do/

Design of the flow:
1. Create a list of tasks for the day to work on.
2. Start working on tasks, using pomodoro - choose a task, start the timer.
3. Rest periods must follow work periods.

The new version does not have the preview at this time. It is being re-written with React
and uses several ideas in its design which I wanted to test:
* UI is built around activities / user tasks and not resources
* Everything can be done using keyboard
* No reliance on icons or UI conventions
* Using some user-controlled storage like Google Docs for data storage

More about the Pomodoro technique:
   http://www.pomodorotechnique.com/
   http://en.wikipedia.org/wiki/Pomodoro_Technique

Resources used in the new version:
* Tomato icon by Saepul Nahwan from the Noun Project https://thenounproject.com/saepulnahwan23/collection/fruit-and-vegetable-solid/?i=2550102

Resources used in the old version:
* Pomodoro image based on: http://www.sxc.hu/photo/1292607
* Sound based on: http://www.freesound.org/samplesViewSingle.php?id=14263
* JQuery library: http://jquery.com/
* SoundManager2 library: http://www.schillmania.com/projects/soundmanager2/
