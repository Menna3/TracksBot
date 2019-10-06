var numberOfQuestions = 6;    
var currentQuestion = 0;
var allTruckQuestions = 0;
var currentTruckQuestion = 0;
var sizeOfTruckQuesitons = 0;
var groupsNumber = 0;
var truckReplies = [];


$( document ).ready(function() { 

  setTimeout(function(){
    $.get("/start", function(data){
        postReply("bot", data);
        $('#textInput').prop("disabled", true);
        $('#buttonInput').prop("disabled", true);

        //ask questions
        setTimeout(function(){
            if (currentQuestion == 0) {
                getBotQuestion(currentQuestion);
            }                  
        }, 13); //1300
      });
  }, 6); //600

});

function getBotQuestion(questionNumber){
  $('#textInput').prop("disabled", true);
  $('#buttonInput').prop("disabled", true);

  var url = "/ask/" + questionNumber;
  $.get(url, function(data){
    if (questionNumber == "5"){
        textList = data.replace('[', '').replace(']', '').split(',');
        timeDelayList = [1, 3, 3, 1, 5]; //adjust it better than that to be more natural

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

function getBotTruckQuestion(truckQuestion){
  $('#textInput').prop("disabled", true);
  $('#buttonInput').prop("disabled", true);


  postReply("bot", truckQuestion);

    $('#textInput').prop("disabled", false);
    $('#buttonInput').prop("disabled", false);
    var input = document.getElementById('textInput');
    setInputPos(input, input.value.length);

}

function ownerAnswer(questionNumber, fleetId){
    if(currentQuestion == 5){
        groupsNumber = $("#textInput").val();
        postReply("owner", groupsNumber);

        url="truck/questions/" + groupsNumber;
        $.get(url).done(function(data){
            allTruckQuestions = data.replace('[', '').replace(']', '').split(',');
            sizeOfTruckQuesitons = allTruckQuestions.length;

            //ask questions
            setTimeout(function(){
                if (currentTruckQuestion < sizeOfTruckQuesitons) {
                    var question = allTruckQuestions[currentTruckQuestion];
//                            question = question.toString().replace("'","").repalce("'", "");
                    getBotTruckQuestion(question);
                    currentTruckQuestion++;
                }                  
            }, 10); //1000
           document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
        });
    }
    if(currentQuestion > 5){
        var answer = $("#textInput").val();
        postReply("owner", answer);

        truckReplies.push(answer);

        //ask questions
        setTimeout(function(){
            if (currentTruckQuestion < sizeOfTruckQuesitons) {
                var question = allTruckQuestions[currentTruckQuestion];
                question = (question.toString().replace("'","")).replace("'","");
                getBotTruckQuestion(question);
                currentTruckQuestion++;
            }else{
//                        console.log("finished "); //send the ajax with all the responses
                url = "/answer/trucks/" + $('#fleetId').val() + "/" + groupsNumber;
                $.ajax({
                    url: url,
                    type: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        replies = data.replace('[', '').replace(']', '').split(',');
                        
                        var i = 0;
                        function myLoop(replies){

                            setTimeout(function () {
                                postReply("bot", (replies[i].replace("'", "").replace("'", "")));
                                i++;
                                if (i < replies.length) {
                                   myLoop(replies);
                                   $('#textInput').prop("disabled", true);
                                   $('#buttonInput').prop("disabled", true);
                                }
                             }, 1000, replies)
                        }

                        myLoop(replies);
                                
                    },
                    data: JSON.stringify(truckReplies)
                });
            }

        }, 10); //1000
           document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});

    }else if (currentQuestion < 6){
          var rawText = $("#textInput").val();
           postReply("owner", rawText);


           url = "/answer/" + questionNumber + "/" + $('#fleetId').val();
           $.get(url, {msg: rawText}).done(function(data) {
               $('#fleetId').attr('value', data);

               currentQuestion += 1
               //ask questions
                setTimeout(function(){
                    if (currentQuestion < 6) {
                        getBotQuestion(currentQuestion)
                    }                  
                }, 10); //1000
               document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
          });
      }

}

$("#textInput").keypress(function(e) {
  if(e.which == 13){
     ownerAnswer(currentQuestion, $('#fleetId').val());
}});

$("#buttonInput").click(function(){
    ownerAnswer(currentQuestion, $('#fleetId').val());
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
  }

   document.getElementById('textInput').scrollIntoView({block: 'start', behavior: 'smooth'});
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