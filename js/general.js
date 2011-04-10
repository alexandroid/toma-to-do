 jQuery(document).ready(function(){
   //var cookieName = 'classesList';
   //$("#verbose").val("");
   //var listHash = readMyListHash(cookieName);
   //updateMyListCounter( listHash );

   //localStorage["testKey"] = "testValue";

   $("button.add").click(function(e){
      var pom = makePom();
      pom.insertBefore($(this));
   });

   $("button.del").click(function(e){
      $(this).parent("task").children("img").last().remove();
   });
   
   $("input").keyup(function(e){
      if(e.keyCode == 13){
         var thisTask = $(this).parent("task");
         var newTask  = thisTask.clone( true, true );
         var newInput = newTask.children("input").attr("val", "");
         newTask.children("img").remove();
         var pom = makePom();
         pom.insertAfter(newInput);
         newTask.insertAfter(thisTask);
         newInput.focus();
      }
   });

   //$(".addToMyList input").click(function(e){
      //$(this).closest("li").addClass("selected");

      //var thisClassID = $(this).closest(".item").attr("id");

      //var listHash = readMyListHash(cookieName);
      //listHash[ thisClassID ] = 1;
      //saveMyListHash( listHash, cookieName );
      //updateMyListCounter( listHash );

      //e.preventDefault();
   //});

   //$(".removeFromMyList input").click(function(e){
      //$(this).closest("li").removeClass("selected");

      //var thisClassID = $(this).closest(".item").attr("id");

      //var listHash = readMyListHash(cookieName);
      //delete listHash[ thisClassID ];
      //saveMyListHash( listHash, cookieName );
      //updateMyListCounter( listHash );

      //e.preventDefault();
   //});
});

function makePom() {
   return $('<img src="css/pom.jpg" />');
}
