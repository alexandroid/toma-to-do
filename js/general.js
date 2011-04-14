jQuery(document).ready(function(){

   g_cookieName = "tasksAndPomodoros";
   g_isTimerOn = false;
   g_storageErrorHappened = false;
   g_timeoutId = null;

   $("button.work").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".task");
      thisTask.addClass("activetask").removeClass("task");
      thisTask.parent("article").find(".task").each( function(index) {
         if ($(this) != thisTask) {
            $(this).addClass("inactivetask").removeClass("task");
         }
      });
      
      g_taskTimeElement = thisTask.find(".timer").last();
      g_secondsLeft = 5;//25*60;
      g_isTimerOn = true;
      g_intervalId = setInterval("countDownWork()", 1000);
   });

   $("button.rest").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".donetask");
      thisTask.addClass("activetask").removeClass("donetask");
      
      g_taskTimeElement = thisTask.find(".timer").last();
      g_secondsLeft = 5;//25*60;
      g_isTimerOn = true;
      g_intervalId = setInterval("countDownRest()", 1000);
      
   });

   $("button.del").click(function(e){
      $(this).closest(".task").find("img").last().remove();
   });
   
   $("input").keyup(function(e){
      if(e.keyCode == 13){
         var thisTask = $(this).closest(".task");
         var newTask  = thisTask.clone( true, true );
         var newInput = newTask.find("input").attr("val", "");
         newTask.children("img").remove();
         var pom = makePom();
         pom.insertAfter(newInput);
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
   return $('<img class="pom" src="css/pom50rd.png" />');
}

function countDownWork() {
   if( --g_secondsLeft > 0 ) {
      var min = Math.floor( g_secondsLeft / 60 );
      var sec = g_secondsLeft % 60;
      var minStr = toTwoDigitString( min );
      var secStr = toTwoDigitString( sec );
      g_taskTimeElement.text( minStr + ':' + secStr );
   }
   else {
      g_taskTimeElement.text( '00:00' );
      clearInterval( g_intervalId );
      g_isTimerOn = false;
      var thisTask = g_taskTimeElement.closest(".activetask");
      thisTask.addClass("donetask").removeClass("activetask");
   }
}

function countDownRest() {
   if( --g_secondsLeft > 0 ) {
      var min = Math.floor( g_secondsLeft / 60 );
      var sec = g_secondsLeft % 60;
      var minStr = toTwoDigitString( min );
      var secStr = toTwoDigitString( sec );
      g_taskTimeElement.text( minStr + ':' + secStr );
   }
   else {
      g_taskTimeElement.text( '00:00' );
      clearInterval( g_intervalId );
      g_isTimerOn = false;
      var thisTask = g_taskTimeElement.closest(".activetask");
      thisTask.addClass("task").removeClass("activetask");
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
