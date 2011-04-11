jQuery(document).ready(function(){

   g_isTimerOn = false;

   $("button.add").click(function(e){
      if( g_isTimerOn ) return;
      
      var thisTask = $(this).closest(".task");
      //grayOutAllTasksButThis( thisTask ); // should also disable the button.
      
      g_taskTimeElement = thisTask.find(".timer").last();
      g_secondsLeft = 5;//25*60;
      g_isTimerOn = true;
      g_intervalId = setInterval("countDown()", 1000);
      
      //var pom = makePom();
      //pom.insertBefore($(this));
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
   });
});

function makePom() {
   return $('<img src="css/pom.jpg" />');
}

function grayOutAllTasksButThis( task ) {
   //var article = task.parent("article");
   //article.children(".task").addClass("gray");
   //task.removeClass("gray");
}

function countDown() {
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
   }
}

function toTwoDigitString( v ) {
   var vStr = v.toString();
   if( vStr.length < 2 ) return '0' + vStr;
   return vStr;
}
