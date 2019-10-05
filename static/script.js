var numberOfQuestions = 8;    
var currentQuestion = 0;

$( document ).ready(function() {          
  setTimeout(function(){
    $.get("/start", function(data){
        postReply("bot", data);
        $('#textInput').prop("disabled", true);
        $('#buttonInput').prop("disabled", true);

        //ask questions
        setTimeout(function(){
            if (currentQuestion <= numberOfQuestions) {
                getBotQuestion(currentQuestion);
            }                  
        }, 1300);
      });
  }, 600);


});

function getBotQuestion(questionNumber){
  $('#textInput').prop("disabled", true);
  $('#buttonInput').prop("disabled", true);

  var url = "/ask/" + questionNumber;
  $.get(url, function(data){
    if (questionNumber == "5"){
        textList = data.replace('[', '').replace(']', '').split(',');
        timeDelayList = [1000, 3000, 3000, 1000, 5000]; //adjust it better than that to be more natural

        var i = 0;
        function myLoop(textList){

            setTimeout(function () {
                data = textList[i].replace('*', ',').replace("'", "").replace("'", "").replace('*', ',');
                postReply("bot", data);
                i++;
                if (i < textList.length) {
                   myLoop(textList);
                   $('#textInput').prop("disabled", true);
                   $('#buttonInput').prop("disabled", true);
                }
             }, timeDelayList[i], textList)
        }

        myLoop(textList);

    }else{
        postReply("bot", data);
    } 



    $('#textInput').prop("disabled", false);
    $('#buttonInput').prop("disabled", false);
    var input = document.getElementById('textInput');
    setInputPos(input, input.value.length);

      });
}

function getBotTruckQuestion(questionNumber){
  $('#textInput').prop("disabled", true);
  $('#buttonInput').prop("disabled", true);

  var url = "/ask/trucks/" + questionNumber;
  $.get(url, function(data){
    postReply("bot", data);

    $('#textInput').prop("disabled", false);
    $('#buttonInput').prop("disabled", false);
    var input = document.getElementById('textInput');
    setInputPos(input, input.value.length);

  });
}

function ownerAnswer(questionNumber, ownerId){
   var rawText = $("#textInput").val();
   postReply("owner", rawText);

   url = "/answer/" + questionNumber + "/" + $('#ownerId').val();;
   $.get(url, {msg: rawText}).done(function(data) {
       $('#ownerId').attr('value', data);

       //ask questions
        setTimeout(function(){
            if (currentQuestion <= numberOfQuestions) {
                getBotQuestion(currentQuestion)
            }                  
        }, 1000);
       document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
  });

}

function setInputSelection(input, startPos, endPos) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(startPos, endPos);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', endPos);
        range.moveStart('character', startPos);
        range.select();
    }
}

function setInputPos(input, pos) {
    setInputSelection(input, pos, pos);
}

$("#textInput").keypress(function(e) {
  if(e.which == 13){
      if(currentQuestion == "5"){
          var trucksObj = {};
          var truckReplies = {};
          var numberOfTruckQuestions = 3;

          var groupsNumber = $("#textInput").val();
          postReply("owner", groupsNumber);
          groupsNumber = parseInt(groupsNumber, 10);

          var i = 0;
        function loopOverGroups(groupsNumber){
            var truckQuestion = 0;
            postReply("bot", "What is the number of trucks in group number " + (i+1).toString());
            var numberOfTrucksInGroup = $("#textInput").val();

            $("#textInput").on('keypress', function(event) {
                if (event.which == 13) {
                    console.log(i);
                    postReply("owner", numberOfTrucksInGroup);
//                            loopOverTruckQuestion(truckQuestion);

//                            trucksObj[numberOfTrucksInGroup] = truckReplies;
                    i++;

                    if(i < groupsNumber){
                    loopOverGroups(groupsNumber);
                }
                }


            });


        }
        var j = 0;
        function loopOverTruckQuestion(truckQuestion){
            getBotTruckQuestion(truckQuestion);
            var truckReply = $("#textInput").val();
            $("#textInput").on('keypress', function(event) {
                if (event.which == 13) {
                    postReply("owner", truckReply);
                    truckReplies[(truckQuestion+1).toString()] = truckReply;
                    truckQuestion +=1;
                    j++;

                    if(j < numberOfTruckQuestions){
                    loopOverTruckQuestion(truckQuestion)
                }
                 }


            });


        }

        loopOverGroups(groupsNumber);

//                  $.ajax({
//                    url: '/answer/trucks',
//                    type: 'post',
//                    dataType: 'json',
//                    contentType: 'application/json',
//                    success: function (data) {
//        //                $('#target').html(data.msg);
//                    },
//                    data: JSON.stringify(trucksObj)
//                });

      }else{
        ownerAnswer(currentQuestion, $('#ownerId').val());
        currentQuestion += 1;
      }

}});

$("#buttonInput").click(function(){
    ownerAnswer(currentQuestion, $('#ownerId').val());
    currentQuestion += 1;
});

function postReply(replyer, data){
  if(replyer == "bot"){
        botHtml = '<li><div class="row comments mb-2">'+
                '<div class="col-md-2 col-sm-2 col-2 text-center user-img">'+
                    '<img id="profile-photo" src="http://nicesnippets.com/demo/man01.png" class="rounded-circle"/>'+
                '</div>'+
                '<div class="col-md-8 offset-1 col-sm-8 offset-1 col-8 offset-1 comment rounded mb-2">'+
                    '<h4 class="m-0">Tracks</h4>'+
                    '<time class="text-white ml-3">1 month ago</time>'+
                    '<like></like>'+
                    '<p class="mb-0 text-white">'+data+'</p>'+
                '</div>'+
            '</div></li>';
        $("#chatBox").append(botHtml);    

      $('#textInput').prop("disabled", false);
      $('#buttonInput').prop("disabled", false);
      var input = document.getElementById('textInput')
      setInputPos(input, input.value.length);
      document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
  }else{
      var ownerHtml ='<li><div class="row comments mb-2">	'+							
                '<div class="col-md-8 offset-1 col-sm-8 offset-1 col-8 offset-1 comment rounded mb-2">'+
                    '<h4 class="m-0">You</h4>'+
                    '<time class="text-white ml-3">1 min ago</time>'+
                    '<like></like>'+
                    '<p class="mb-0 text-white">'+ data +'</p>'+
                '</div>'+
                '<div class="col-md-2 col-sm-2 col-2 text-center user-img">'+
                    '<img id="profile-photo" src="http://nicesnippets.com/demo/man04.png" class="rounded-circle"/>'+
                '</div>'+
            '</div></li>';
       $("#textInput").val("");
       $("#chatBox").append(ownerHtml);

      $('#textInput').prop("disabled", true);
      $('#buttonInput').prop("disabled", true);
      document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
  }

//           document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
}
