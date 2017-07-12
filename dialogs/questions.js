/*
bot.dialog('/questions/coffeeRoot', [
        function (session, args) {
            session.send("Do you like coffee?");
            prompts.beginConfirmDialog(session);
        },
        function (session, args, next) {
            if (args.response == 1) {
            } else {
            }
        }
    ]);
*/


function AnswerQuestion(id, currentAnswers, newAnswers){
	var keyyyy = id+"/responses";
	var obb = {};
	var arr = newAnswers;
	if(currentAnswers != null){
	arr = currentAnswers.concat(newAnswers);
	}
	obb[keyyyy] = arr;
	ref.update(obb
	);
}
var ref;
module.exports.init = function () {
    ref = db.ref("server/bot-data/questions");
    LoadAllQs();

    bot.dialog('/questions/intro',
        [
            function (session, args, next) {
                console.log("starting question: " + session.userData.questionCount);
                console.log("user length: " + session.userData.usedQuestions.length);
                var tempQArray = JSON.parse(JSON.stringify(qArray));
                var possible = [];
                for (i = 0; i < qArray.length; i++){
                    var good = true;
                    for (j = 0; j < session.userData.usedQuestions.length; j++){
                        if (session.userData.usedQuestions[j] == i) {
                            good = false;
                        }
                    }
                    if (good) {
                        possible.push(i);
                    }    
                }
                console.log("Possible count: " + possible.length);
                if (possible.length > 0) {
                    var nextQ = Math.floor(Math.random() * possible.length);
                    session.userData.usedQuestions.push(nextQ);
                    session.userData.questionCount++;
                    console.log("Doing question");
                    session.beginDialog(qArray[nextQ]);
                } else {
                    session.send("Sorry! That's all the questions I have for now :(");
                }    
            }, function (session, args, next) {

                if (session.userData.questionCount < 3) {
                    session.beginDialog("/questions/intro");
                } else {
                    if (session.userData.usedQuestions.length < qArray.length) {
                        session.beginDialog("/questions/another");
                    } else {
                        session.send("Wow! You got through all the questions I have!");
                        session.endDialog();
                    }    
                }    
            }
        ]
    ).triggerAction({ matches: /^qq/ });  
    
    bot.dialog('/questions/another',
        [
            function (session, args, next) {
                session.send("I know I said only three questions, but how about another?");
                    prompts.beginConfirmDialog(session);
                },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog("/questions/intro");
                } else {
                    session.send("Nevermind then!");
                    session.endDialog();
                }
            }

        ]
    );
}
var qArray = [];

function LoadAllQs() {
    ref.on("value", function(snapshot) {
		//console.log(snapshot.val());
		ref.off("value");

	    var obj_keys = Object.keys(snapshot.val());
        for (k = 0; k < obj_keys.length; k++) {
            var ran_key = obj_keys[k];
            var selectedquestion = snapshot.val()[ran_key];
            currentQuestionID = ran_key;
            currentQuestion = selectedquestion;
        
            var qKeys = Object.keys(selectedquestion);
        
            for (i = 0; i < qKeys.length; i++) {
                console.log(selectedquestion[qKeys[i]]);
                CreateDialog(ran_key, qKeys[i], selectedquestion[qKeys[i]]);
            }
            var ret = "/" + ran_key + "/root";
            qArray.push(ret);
        }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      ref.off("value");
    });
}

function CreateDialog(rootKeyName, thisKeyName, qData) {
    if (qData.type == "textPrompt") {
        bot.dialog("/" + rootKeyName + "/" + thisKeyName,
            [
                function (session, args) {
                    session.send(qData.text);
                    prompts.beginTextDialog(session);
                }, 
                function (session, args) {
                    if (qData.response != null) {
                        session.send(qData.response);
                        setTimeout(function () { session.endDialog(); }, 4000);
                    } else {
                        session.endDialog();
                    }
                }
            ]
        )
    } else if (qData.type == "confirm") {
        bot.dialog("/" + rootKeyName + "/" + thisKeyName,
            [
                function (session, args) {
                    session.send(qData.text);
                    prompts.beginConfirmDialog(session);
                },
                function (session, args, next) {
                    if (args.response == 1) {
                        session.beginDialog("/" + rootKeyName + "/" + qData.positive);
                    } else {
                        session.beginDialog("/" + rootKeyName + "/" + qData.negative);
                    }
                }
            ]                    
        ) 
    } else if (qData.type == "statement") {
        bot.dialog("/" + rootKeyName + "/" + thisKeyName,
            [
                function (session, args) {
                    session.send(qData.text);
                    setTimeout(session.endDialog, 4000);
                }
            ]                    
        ) 
    }     
}