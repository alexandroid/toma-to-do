jQuery(document).ready(function(){

   g_cookieName = "tasksAndPomodoros";
   g_isTimerOn = false;
   g_storageErrorHappened = false;
   g_saveTimeoutId = null;
   loadTasksAndPomodoros();

   $("button.work").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".task");
      thisTask.addClass("workingtask").removeClass("startabletask");
      thisTask.parent("article").find(".startabletask").each( function(index) {
         if ($(this) != thisTask) {
            $(this).addClass("inactivetask").removeClass("startabletask");
         }
      });
      
      g_taskTimeElement = thisTask.find(".timer").last();
      g_secondsLeft = getNumberOfSecondsToWork();
      g_isTimerOn = true;
      g_intervalId = setInterval("countDownWork()", 1000);
   });

   $("button.rest").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".resttask");
      thisTask.addClass("restingtask").removeClass("resttask");
      
      g_taskTimeElement = thisTask.find(".timer").last();
      g_secondsLeft = getNumberOfSecondsToRest();
      g_isTimerOn = true;
      g_intervalId = setInterval("countDownRest()", 1000);
   });

   // Not used yet.
   $("button.del").click(function(e){
      $(this).closest(".task").find("img").last().remove();
   });

   $("button.planadd").click(function(e){
      var thisControls = $(this).closest(".controls");
      var planPom = makePlanPom();
      planPom.insertBefore( thisControls );
      saveTasksAndPomodoros();
      updateTotalHoursPlanned();
   });

   $("button.planrem").click(function(e){
      $(this).closest(".task").children(".pomplan").last().remove();
      saveTasksAndPomodoros();
      updateTotalHoursPlanned();
   });
   
   $("#clearall").click(function(e){
      clearTasksAndPomodoros();
      saveTasksAndPomodoros();
      updateTotalHoursPlanned();
   });
   
   $("input").focusout(function(e){
      saveTasksAndPomodoros();
   });
   
   $("input").keyup(function(e){
      if(e.keyCode == 13){
         if( g_saveTimeoutId ) clearTimeout( g_saveTimeoutId );
         var thisInput = $(this);
         var thisTask = thisInput.closest(".task");
         var newTask  = thisTask.clone( true, true ); // with data and events, deep.
         var newInput = newTask.find("input").val("");
         newTask.children("img").remove();
         if(!newTask.hasClass("startabletask")) {
            // It means we are in active task mode, and new task should be forced to be inactive
            // regardless of whether we copied an inactive or 'active' task:
            newTask.removeClass("workingtask resttask restingtask").addClass("inactivetask");
         }
         newTask.insertAfter(thisTask);
         newInput.focus();
         saveTasksAndPomodoros();
      }
      else {
         if( g_saveTimeoutId ) clearTimeout( g_saveTimeoutId );
         g_saveTimeoutId = setTimeout("saveTasksAndPomodoros()", getSaveTimeoutTimeoutMs());
      }
      updateTaskWidths();
   });
});

function updateTotalHoursPlanned() {
   var pomsLeft = $("article").find(".pomplan").size();
   var pomsDone = $("article").find(".pomdone").size();
   var text = '';
   if( pomsLeft + pomsDone > 0 ) {
      text = ' (';
      if( pomsLeft > 0 ) {
         text += pomsToHours(pomsLeft) + ' to go';
      }
      if( pomsDone > 0 ) {
         if( pomsLeft > 0 ) text += ', ';
         text += pomsToHours(pomsDone) + ' done';
      }
      text += ')';
   }
   $("#planHoursSummary").text( text );
}

function pomsToHours( poms ) {
   var hours = poms / 2;
   if( poms > 2 ) return hours + ' hours';
   if( poms == 2 ) return 'one hour';
   if( poms == 1 ) return '30 min';
}

function updateTaskWidths() {
   var article = $("article");
   var maxWidthInLetters = 0;
   article.find("input").each( function(index) {
      var w = $(this).attr("value").length;
      if( w > maxWidthInLetters ) { maxWidthInLetters = w; }
   } );
   var resultWidth = Math.max( 25, maxWidthInLetters );
   article.find("input").css("width", resultWidth + "ex" );
}

function clearTasksAndPomodoros() {
   var article = $("article");
   article.find(".task").each( function(index) {
      if (index != 0) {
         $(this).children("img").remove();
         $(this).remove();
      } else { // index == 0;
         $(this).find("input").val("");
         $(this).children("img").remove();
         $(this).removeClass("workingtask resttask restingtask inactivetask").addClass("startabletask");
      }
   });
}

// This function is not designed to support "any time load" i.e. when there are other
// tasks present than the initial empty single one defined in HTML.
// But it could be improved if we ever need it (although, probably "clearall" + load should do the job too).
function loadTasksAndPomodoros() {
   
   var tasksArray = loadTasksAndPomodorosArrayFromLocalStorage();
   if( tasksArray != null ) {
      var article = $("article");
      var firstTask = article.find(".task").first();
      
      for( i=0; i<tasksArray.length; ++i ) {
         var taskData = tasksArray[i];
         
         var taskName = taskData[0];
         var numberOfDonePomodoros = taskData[1];
         var numberOfLeftPomodoros = taskData[2];
         
         if( i == 0 ) {
            setTaskNameAndPoms( firstTask, taskName, numberOfDonePomodoros, numberOfLeftPomodoros );
         }
         else {
            var lastTask = article.find(".task").last();
            var newTask  = lastTask.clone( true, true ); // with data and events, deep.
            newTask.children("img").remove();
            setTaskNameAndPoms( newTask, taskName, numberOfDonePomodoros, numberOfLeftPomodoros );
            newTask.insertAfter(lastTask);
         }
      }
   } // if( tasksArray != null )
   updateTaskWidths();
   updateTotalHoursPlanned();
}

function loadTasksAndPomodorosArrayFromLocalStorage() {
   if(typeof(localStorage)=='undefined') { return; }
   
   var tasksArray = null;

   try {
      var dataJSON = localStorage.getItem("tasks");

      if( dataJSON != null && typeof( dataJSON ) != 'undefined' && dataJSON != "" ) {
         
         tasksArray = $.secureEvalJSON( dataJSON );
      }      
   } catch(e) {
      // Do nothing if failed to read or convert from JSON - let the result be null.
   }
   
   return tasksArray;
}

function setTaskNameAndPoms(taskElement, taskName, numberOfDonePomodoros, numberOfLeftPomodoros) {
   taskElement.find("input").val(taskName);
   taskElement.find(".pomdone").remove();
   var taskControls = taskElement.find(".controls");
   for( p=0; p < numberOfDonePomodoros; ++p ) {
      makeDonePom().insertBefore( taskControls );
   }
   for( p=0; p < numberOfLeftPomodoros; ++p ) {
      makePlanPom().insertBefore( taskControls );
   }
}

function saveTasksAndPomodoros() {
   if(typeof(localStorage)=='undefined') { return; }
   
   var tasks = [];
   $(".task input").each(
      function(index) {
         var taskName = $(this).attr("value");
         var thisTask = $(this).closest(".task");
         var numberOfDonePomodoros = thisTask.children(".pomdone").size();
         var numberOfLeftPomodoros = thisTask.children(".pomplan").size();
         tasks.push([taskName, numberOfDonePomodoros, numberOfLeftPomodoros]);
      });
   
   var dataJSON = $.toJSON( tasks );
   
   try {
      localStorage.setItem("tasks", dataJSON);
      g_storageErrorHappened = false;
   } catch(e) {
      if (e==QUOTA_EXCEEDED_ERR && !g_storageErrorHappened ) {
         alert('Cannot save tasks, browser says the local storage space quota is exceeded. Did you create too many tasks?');
         g_storageErrorHappened = true;
      }
   }
}

function makeDonePom() {
   return $('<img class="pom pomdone" src="img/pom50rd.png" />');
}

function makePlanPom() {
   return $('<img class="pom pomplan" src="img/pom50pl.png" />');
}


function secondsToTime(seconds) {
   var min = Math.floor( seconds / 60 );
   var sec = seconds % 60;
   var minStr = toTwoDigitString( min );
   var secStr = toTwoDigitString( sec );
   return minStr + ':' + secStr;
}

function countDownWork() {
   if( --g_secondsLeft > 0 ) {
      g_taskTimeElement.text( secondsToTime( g_secondsLeft ) );
      if( g_secondsLeft == 1 ) {
         g_ringSound.play();
      }
   }
   else {
      g_taskTimeElement.text( secondsToTime( getNumberOfSecondsToRest() ) );
      clearInterval( g_intervalId );
      g_isTimerOn = false;
      var thisTask = g_taskTimeElement.closest(".workingtask");
      thisTask.addClass("resttask").removeClass("workingtask");
   }
}

function countDownRest() {
   if( --g_secondsLeft > 0 ) {
      g_taskTimeElement.text( secondsToTime( g_secondsLeft ) );
      if( g_secondsLeft == 1 ) {
         g_ringSound.play();
      }
   }
   else {
      g_taskTimeElement.text( secondsToTime( getNumberOfSecondsToWork() ) );
      clearInterval( g_intervalId );
      g_isTimerOn = false;
      var thisTask = g_taskTimeElement.closest(".restingtask");
      thisTask.addClass("startabletask").removeClass("restingtask");
      makeDonePom().insertAfter(thisTask.children("input"));
      thisTask.children(".pomplan").last().remove();
      thisTask.parent("article").find(".inactivetask").each( function(index) {
         if ($(this) != thisTask) {
            $(this).addClass("startabletask").removeClass("inactivetask");
         }
      });
      saveTasksAndPomodoros();
   }
}

function toTwoDigitString( v ) {
   var vStr = v.toString();
   if( vStr.length < 2 ) return '0' + vStr;
   return vStr;
}

function getNumberOfSecondsToWork() {
   return 25*60;
}

function getNumberOfSecondsToRest() {
   return 5*60;
}

function getSaveTimeoutTimeoutMs() {
   return 1000;
};
