jQuery(document).ready(function(){

   g_cookieName = "tasksAndPomodoros";
   g_isTimerOn = false;
   g_storageErrorHappened = false;
   loadTasksAndPomodoros();
   g_saveIntervalId = setInterval("saveTasksAndPomodoros()", 3000);

   $("button.work").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".task");
      thisTask.addClass("workingtask").removeClass("task");
      thisTask.parent("article").find(".task").each( function(index) {
         if ($(this) != thisTask) {
            $(this).addClass("inactivetask").removeClass("task");
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

   $("button.del").click(function(e){
      $(this).closest(".task").find("img").last().remove();
   });

   $("button.planadd").click(function(e){
      var thisControls = $(this).closest(".controls");
      var planPom = makePlanPom();
      planPom.insertBefore( thisControls );
   });

   $("button.planrem").click(function(e){
      $(this).closest(".task").children("img").last().remove();
   });
   
   $("input").keyup(function(e){
      if(e.keyCode == 13){
         var thisInput = $(this);
         var thisTask = thisInput.closest(".task");
         var newTask  = thisTask.clone( true, true ); // with data and events, deep.
         var newInput = newTask.find("input").val("");
         newTask.children("img").remove();
         //var pom = makePom();
         //pom.insertAfter(newInput);
         newTask.insertAfter(thisTask);
         newInput.focus();
      }
      clearInterval( g_saveIntervalId );
      g_saveIntervalId = setInterval("saveTasksAndPomodoros()", 3000);
      updateTaskWidths();
   });
});

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
   var firstTask = article.find(".task, .inactivetask, .workingtask, .resttask, .restingtask").first();
   article.find(".task, .inactivetask, .workingtask, .resttask, .restingtask").each( function(index) {
      if (index != 0) {
         $(this).children("img").remove();
         $(this).remove();
      } else { // index == 0;
         $(this).find("input").val("");
         $(this).children("img").remove();
      }
   });
}

function loadTasksAndPomodoros() {
   
   var tasksArray = loadTasksAndPomodorosArrayFromLocalStorage();
   if( tasksArray != null ) {
      var article = $("article");
      var firstTask = article.find(".task, .inactivetask, .workingtask, .resttask, .restingtask").first();
      
      for( i=0; i<tasksArray.length; ++i ) {
         var taskData = tasksArray[i];
         
         var taskName = taskData[0];
         var numberOfDonePomodoros = taskData[1];
         var numberOfLeftPomodoros = taskData[2];
         
         if( i == 0 ) {
            setTaskNameAndPoms( firstTask, taskName, numberOfDonePomodoros, numberOfLeftPomodoros );
         }
         else {
            var lastTask = article.find(".task, .inactivetask, .workingtask, .resttask, .restingtask").last();               
            var newTask  = lastTask.clone( true, true ); // with data and events, deep.
            newTask.children("img").remove();
            setTaskNameAndPoms( newTask, taskName, numberOfDonePomodoros, numberOfLeftPomodoros );
            newTask.insertAfter(lastTask);
         }
      }
   } // if( tasksArray != null ) {
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
   $(".task input, .inactivetask input, .workingtask input, .resttask input, .restingtask input").each(
      function(index) {
         var taskName = $(this).attr("value");
         var thisTask = $(this).closest(".task, .inactivetask, .workingtask, .resttask, .restingtask");
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

function getNumberOfSecondsToWork() {
   return 25*60;
}

function getNumberOfSecondsToRest() {
   return 5*60;
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
      thisTask.addClass("task").removeClass("restingtask");
      makeDonePom().insertAfter(thisTask.children("input"));
      thisTask.children(".pomplan").last().remove();
      thisTask.parent("article").find(".inactivetask").each( function(index) {
         if ($(this) != thisTask) {
            $(this).addClass("task").removeClass("inactivetask");
         }
      });
   }
}

function toTwoDigitString( v ) {
   var vStr = v.toString();
   if( vStr.length < 2 ) return '0' + vStr;
   return vStr;
}
