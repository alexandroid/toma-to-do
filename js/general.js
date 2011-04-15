jQuery(document).ready(function(){

   g_cookieName = "tasksAndPomodoros";
   g_isTimerOn = false;
   g_storageErrorHappened = false;
   g_timeoutId = null;

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
   
   $("input").keyup(function(e){
      if(e.keyCode == 13){
         var thisTask = $(this).closest(".task");
         var newTask  = thisTask.clone( true, true ); // with data and events, deep.
         var newInput = newTask.find("input").attr("val", "");
         newTask.children("img").remove();
         //var pom = makePom();
         //pom.insertAfter(newInput);
         newTask.insertAfter(thisTask);
         newInput.focus();
      }
      clearTimeout( g_timeoutId );
      g_timeoutId = setTimeout("saveTasksAndPomodoros()", 1000);
   });
});

function saveTasksAndPomodoros() {
   if(typeof(localStorage)=='undefined') { return; }
   
   var tasks = [];
   $(".task input").each( function(index) {
      tasks.push($(this).attr("value"));
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
   return $('<img class="pom pomdone" src="css/pom50rd.png" />');
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
   }
   else {
      g_taskTimeElement.text( secondsToTime( getNumberOfSecondsToWork() ) );
      clearInterval( g_intervalId );
      g_isTimerOn = false;
      var thisTask = g_taskTimeElement.closest(".restingtask");
      thisTask.addClass("task").removeClass("restingtask");
      makeDonePom().insertBefore(g_taskTimeElement.closest(".controls"));
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
