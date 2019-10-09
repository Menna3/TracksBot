var numberOfQuestions = 5;
var numberOfTruckQuestions = 4;
var currentQuestion = 0;
var allTruckQuestions = 0;
var currentTruckQuestion = 0;
var sizeOfTruckQuesitons = 0;
var groupsNumber = 0;
var truckReplies = [];
var allConversation = [];
var botReplies = [];


$(document).ready(function() {

    setTimeout(function() {
        $.get("/start", function(data) {
            postReply("bot", data);
            $('#textInput').prop("disabled", true);
            $('#buttonInput').prop("disabled", true);
            //ask questions
            setTimeout(function() {
                if (currentQuestion == 0) {
                    getBotQuestion(currentQuestion);
                }
            }, 1500);
        });
    }, 600);
    
    $.get("/bot/replies", function(data) {
        botReplies = data
    });

});

function getBotQuestion(questionNumber) {
    $('#textInput').prop("disabled", true);
    $('#buttonInput').prop("disabled", true);

    var url = "/ask/" + questionNumber;
    $.get(url, function(data) {
        if (questionNumber == numberOfQuestions-1) {
            textList = data.replace('[', '').replace(']', '').split(',');
            timeDelayList = [3500, 3300, 1500, 5000, 2500]; //adjust it better than that to be more natural

            var i = 0;

            function myLoop(textList) {

                setTimeout(function() {
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

        } else {
            postReply("bot", data);
        }



        $('#textInput').prop("disabled", false);
        $('#buttonInput').prop("disabled", false);
        var input = document.getElementById('textInput');
        setInputPos(input, input.value.length);

    });
}

function getBotTruckQuestion(currentTruckQuestion) {
    $('#textInput').prop("disabled", true);
    $('#buttonInput').prop("disabled", true);
    
    var url = "/ask/truck/" + currentTruckQuestion + "/" + $('#fleetId').val();
    $.get(url, function(data) {
        if (data.includes("How many trucks in group number")){
            newTruckId = (parseInt($('#truckId'))+1).toString()
            $('#truckId').attr('value', newTruckId);
        }
        repeatQuestion(data)
        
    });

}

function repeatQuestion(data){
    postReply("bot", data);
    $('#textInput').prop("disabled", false);
    $('#buttonInput').prop("disabled", false);
    var input = document.getElementById('textInput');
    setInputPos(input, input.value.length);
}


function ownerAnswer(questionNumber, fleetId) {
    if (currentQuestion == numberOfQuestions-1) {
        groupsNumber = $("#textInput").val();
        postReply("owner", groupsNumber);
        sizeOfTruckQuesitons = parseInt(groupsNumber) * numberOfTruckQuestions;
        url = "truck/questions/" + groupsNumber + "/" + $('#fleetId').val();
        $.get(url).done(function(data) {
            
            if(botReplies.includes(data)){
                setTimeout(function() {
                    repeatQuestion(data);
                }, 1500);
            }else{ //get first truck question
                        //ask questions
                setTimeout(function() {
                    getBotTruckQuestion(currentTruckQuestion);
                    currentTruckQuestion++;
                    currentQuestion++;

                }, 1500);
                document.getElementById('textInput').scrollIntoView({
                    block: 'start',
                    behavior: 'smooth'
                });
                
            }
            
        });
    }else if (currentQuestion > numberOfQuestions-1) {
        var answer = $("#textInput").val();
        postReply("owner", answer);
        
        if(currentTruckQuestion < sizeOfTruckQuesitons){
            url = "/answer/trucks/" + $('#fleetId').val() + "/" + $('#truckId').val() + "/" + (parseInt(currentTruckQuestion)-1).toString();
            $.get(url, {
                msg: answer
            }).done(function(data) {
                if(botReplies.includes(data)){
                    setTimeout(function() {
                        repeatQuestion(data);
                    }, 1300);
                }else{
                    
                    $('#truckId').attr('value', data);
                    //ask questions
                    setTimeout(function() {
                        getBotTruckQuestion(currentTruckQuestion);
                        currentTruckQuestion++;
                        currentQuestion++;

                    }, 1300);
                    document.getElementById('textInput').scrollIntoView({
                        block: 'start',
                        behavior: 'smooth'
                    });
                }

            });
        }else{
            
            url = "/answer/trucks/" + $('#fleetId').val() + "/" + $('#truckId').val() + "/" + (parseInt(currentTruckQuestion)-1).toString();
            $.get(url, {
                msg: answer
            }).done(function(data) {
                if(botReplies.includes(data)){
                    setTimeout(function() {
                        repeatQuestion(data);
                    }, 1500);
                }else{
                    $.ajax({
                        url: "/conversation/" + $('#fleetId').val(),
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(data) {
                            replies = data.replace('[', '').replace(']', '').split(',');
                            var i = 0;
                            function myLoop(replies) {

                                setTimeout(function() {
                                    postReply("bot", (replies[i].replace("'", "").replace("'", "")));
                                    i++;
                                    if (i < replies.length) {
                                        myLoop(replies);
                                        $('#textInput').prop("disabled", true);
                                        $('#buttonInput').prop("disabled", true);
                                    } else { //end of conversation
                                        postReply("bot", "Do you want to register another fleet?")
                                        $('#textInput').prop("disabled", true);
                                        $('#buttonInput').prop("disabled", true);
                                        postYesOrNo();
                                    }
                                }, 1500, replies)
                            }

                            myLoop(replies);
                        },
                        data: JSON.stringify(allConversation)
                    });    
                }
            });      
        }
        

    } else{
        var rawText = $("#textInput").val();
        postReply("owner", rawText);

        url = "/answer/" + questionNumber + "/" + $('#fleetId').val();
        $.get(url, {
            msg: rawText
        }).done(function(data) {
            $('#fleetId').attr('value', data);
            if(botReplies.includes(data)){
                setTimeout(function() {
                    repeatQuestion(data);
                }, 1500);
            }else{
                currentQuestion += 1;
                //ask questions
                setTimeout(function() {
                    getBotQuestion(currentQuestion);
                    
                }, 1300);
                document.getElementById('textInput').scrollIntoView({
                    block: 'start',
                    behavior: 'smooth'
                });
            }
        
        });
    }

}

$("#textInput").keypress(function(e) {
    if (e.which == 13) {
        ownerAnswer(currentQuestion, $('#fleetId').val());
    }
});

$("#buttonInput").click(function() {
    ownerAnswer(currentQuestion, $('#fleetId').val());
});

function postReply(replyer, data) {
    if (replyer == "bot") {
        botHtml = '<li><div class="row comments mb-2">' +
            '<div class="col-md-2 col-sm-2 col-2 text-center user-img">' +
            '<img id="profile-photo" src="http://nicesnippets.com/demo/man01.png" class="rounded-circle"/>' +
            '</div>' +
            '<div class="col-md-8 offset-1 col-sm-8 offset-1 col-8 offset-1 comment rounded mb-2">' +
            '<h4 class="m-0">Tracks</h4>' +
            '<like></like>' +
            '<p class="mb-0 text-white">' + data + '</p>' +
            '</div>' +
            '</div></li>';
        $("#chatBox").append(botHtml);

        $('#textInput').prop("disabled", false);
        $('#buttonInput').prop("disabled", false);
        var input = document.getElementById('textInput')
        setInputPos(input, input.value.length);
        allConversation.push("bot");
        allConversation.push(data);

    } else {
        var ownerHtml = '<li><div class="row comments mb-2">	' +
            '<div class="col-md-8 offset-1 col-sm-8 offset-1 col-8 offset-1 comment rounded mb-2">' +
            '<h4 class="m-0">You</h4>' +
            '<like></like>' +
            '<p class="mb-0 text-white">' + data + '</p>' +
            '</div>' +
            '<div class="col-md-2 col-sm-2 col-2 text-center user-img">' +
            '<img id="profile-photo" src="http://nicesnippets.com/demo/man04.png" class="rounded-circle"/>' +
            '</div>' +
            '</div></li>';
        $("#textInput").val("");
        $("#chatBox").append(ownerHtml);

        $('#textInput').prop("disabled", true);
        $('#buttonInput').prop("disabled", true);
        allConversation.push("owner");
        allConversation.push(data);
    }

    document.getElementById('textInput').scrollIntoView({
        block: 'start',
        behavior: 'smooth'
    });
}

function hideChatBox() {
    document.getElementById("chatDiv").style.display = "none";
    $("#seeYouSoon").css("display", "block");
}

function postYesOrNo() {
    botHtml = '<li><div class="row comments mb-2">' +
        '<button type="button" onClick="window.location.reload();" class="col-4 offset-1 btn comment mb-0 text-white">Yes</button>' +
        '<button type="button" onClick="hideChatBox()" class="col-4 offset-1 btn comment mb-0 text-white">No</button>' +
        '</div></li>';

    $("#chatBox").append(botHtml);

    $('#textInput').prop("disabled", true);
    $('#buttonInput').prop("disabled", true);
    var input = document.getElementById('textInput')
    setInputPos(input, input.value.length);
    document.getElementById('textInput').scrollIntoView({
        block: 'start',
        behavior: 'smooth'
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