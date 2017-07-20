
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
var timeoutMessages = [
    "Please stand by...",
    "Please stand by...",
    "This is probably Google's fault.",
    "Let me find a joke.",
    "Okay Here it is.",
    "Why did the chicken cross the road?",
    "...",
    "I'll give you a second",
    "...",
    "ERROR: ANSWER NOT LOADED. PLEASE STAND BY",
    "That was the joke",
    "Sorry",
    "...",
    "Wow, still here?",
    "Is the internet on?",
    "Did you check, or are you just saying it is?",
    "Look, we're going to be here a while.",
    "I'd get another joke but my connection to the mainframe is down",
    "Let's play Rock, Paper, Scissors",
    "Go on the next message",
    "ROCK",
    "...",
    "I can't see. Did I win?",
    "Are you lying?",
    "...",
    "I'm thinking of a number between 0 and 65535",
    "Take a guess, if you're right, I'll give you a prize",
    "Just say it out loud... now",
    "...",
    "Okay that was a practice run...",
    "Wow. Google's still down, huh?",
    "Keep typing stuff, maybe you'll crash the server"

]
//global.qTime;
function LoadQLoop() {
    LoadAllQs();
    global.qTime = setTimeout(function() {
        if (!global.questionsLoaded) {
            ref.off();
            console.log("TRYING AGAIN");
            LoadQLoop();
    } 
    }, 60000);
}

module.exports.init = function () {
    ref = db.ref("server/bot-data/questions");
    LoadQLoop();
    bot.dialog('/questions/intro',
        [
            function (session, args, next) {
                if (qArray.length < 1) {
                    if (args && args.waiting) {   
                        count = args.count;
                        if (count < timeoutMessages.length) {
                            session.send(timeoutMessages[count]);
                        } else {
                            session.send(timeoutMessages[0]);                            
                        }
                    } else {
                        session.send("I'm just hooking into the mainframe to bring you fresh questions. Please stand by...");
                        count = 1;
                    }
                    timeDict[session.userData.name] = setTimeout(function () {
                        session.replaceDialog('/questions/intro', {waiting:true, count:++count});
                    }, 5500, session);
                    return;
                } else {      
                    if (args && args.waiting) {
                        session.send("Okay! We're back on track!");  
                        clearTimeout(timeDict[session.userData.name]);
                        setTimeout(function () {
                            session.replaceDialog('/questions/intro');
                        }, 4000, session);
                        return;
                    }                        
                }
                console.log("starting question: " + session.userData.questionCount);
                console.log(session.userData.usedQuestions);
                var tempQArray = JSON.parse(JSON.stringify(qArray));
                var possible = [];
                for (i = 0; i < qArray.length; i++){
                    var good = true;
                    for (j = 0; j < session.userData.usedQuestions.length; j++){
                        if (session.userData.usedQuestions[j] == qArray[i]) {
                            good = false;
                        }
                    }
                    if (good) {
                        possible.push(qArray[i]);
                    }    
                }
                console.log("Possible");
                console.log(possible);
                if (possible.length > 0) {
                    var nextQ = possible[Math.floor(Math.random() * possible.length)];
                    session.userData.usedQuestions.push(nextQ);
                    session.userData.questionCount++;
                    session.beginDialog(nextQ);
                } else {
	                session.userData.finishedQuestions = true;
                    next();
                }    
            }, function (session, args, next) {
                if (session.userData.finishedQuestions) {
                        session.send("Wow! You got through all the questions I have!");
	                    session.userData.finishedQuestions = true;
                        setTimeout(function () { session.beginDialog('/questions/askAQuestion'); }, 4000);
                        return;
                }
                if (session.userData.questionCount < 3) {
                    session.replaceDialog("/questions/intro");
                } else {
                    if (session.userData.usedQuestions.length < qArray.length) {
                        session.beginDialog("/questions/another");
                    } else {
                        session.send("Wow! You got through all the questions I have!");
	                    session.userData.finishedQuestions = true;
                        session.userData.questionCount = 5;
                        setTimeout(function () { session.beginDialog('/questions/askAQuestion'); }, 4000);
                    }    
                }    
            }, function (session, args, next) {
                session.endDialog();                    
            }
        ]
    ).triggerAction({ matches: /^qq/ });  
    
    bot.dialog('/questions/single',
        [
            function (session, args, next) {
                var tempQArray = JSON.parse(JSON.stringify(qArray));
                var possible = [];
                for (i = 0; i < qArray.length; i++){
                    var good = true;
                    for (j = 0; j < session.userData.usedQuestions.length; j++){
                        if (session.userData.usedQuestions[j] == qArray[i]) {
                            good = false;
                        }
                    }
                    if (good) {
                        possible.push(qArray[i]);
                    }    
                }
                console.log("Possible count: " + possible.length);
                if (possible.length > 0) {
                    var nextQ = possible[Math.floor(Math.random() * possible.length)];
                    session.userData.usedQuestions.push(nextQ);
                    session.userData.questionCount++;
                    session.beginDialog(nextQ);
                } else {
                    session.send("Wait! Sorry! I'm all out of questions apparently :(");
	                session.userData.finishedQuestions = true;
                    setTimeout(function () { session.beginDialog('/questions/askAQuestion'); }, 4000);
                }    
            }
        ]
    );

    bot.dialog('/questions/askAQuestion',
        [
            function (session, args, next) {
                if (!session.userData.askedAQuestion) {
                    prompts.beginConfirmDialog(session, {questionText: "Do you have a question about the city you've always wanted to ask?"});
                } else {
                    session.endDialog();
                }
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/askQuestion');
                } else {
                    session.send("You must know a lot about Dundee!");
                    session.endDialog();
                }
            }
        ]
    );

    bot.dialog('/questions/another',
        [
            function (session, args, next) {
                var msg = "";
                if (session.userData.questionCount == 3) {
                    msg = "I know I said only three questions, but how about another?";
                } else {
                    msg = "How about another one?";
                }
                prompts.beginConfirmDialog(session, {questionText: msg});
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog("/questions/intro");
                } else {
                    session.beginDialog('/questions/askAQuestion');
                }
            }

        ]
    );
}
var qArray = [];

function LoadAllQs() {
    console.log("LOADING QUESTIONS");
    ref.on("value", function (snapshot) {
        clearTimeout(global.qTime);
        console.log("QUESTIONS LOADED");
        global.questionsLoaded = true;
		ref.off("value");

	    var obj_keys = Object.keys(snapshot.val());
        for (k = 0; k < obj_keys.length; k++) {
            var ran_key = obj_keys[k];
            var selectedquestion = snapshot.val()[ran_key];
            currentQuestionID = ran_key;
            currentQuestion = selectedquestion;
        
            var qKeys = Object.keys(selectedquestion);
        
            for (i = 0; i < qKeys.length; i++) {
             //   console.log(selectedquestion[qKeys[i]]);
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
                    if (args && args.clarified) {
                        session.send(args.text);                        
                    } else {
                        session.send(qData.text);
                    }    
                    prompts.beginMultiDialog(session);
                }, 
                function (session, args) {
                    if (args.type && args.type == "confirm") {
                        console.log("conf type: " + args.response);
                        if (args.response == 1) {
                            console.log("pos");
                            if (qData.positiveMsg) {
                                session.replaceDialog("/" + rootKeyName + "/" + thisKeyName, { clarified: true, text: qData.positiveMsg });
                                return;
                            }    
                        } else if (args.response == 0 || args.response == 2) {
                            console.log("neg");
                            session.send(qData.negativeMsg||"That's okay! We'll move on for now!");
                            session.endDialog();
                            return;
                        } 
                    }
                    console.log("else");
                    var expected;
                    if (qData.expectedResponse) {
                        expected = qData.expectedResponse;
                        if (args.response) {
                            session.dialogData.solved = false;
                            for (i = 0; i < expected.length; i++) {
                                for (j = 0; j < expected[i].answer.length; j++) {
                                    var reg = args.text.match(expected[i].answer[j]);
                                    console.log(reg);
                                    if (reg && reg.length > 0) {
                                        if (!expected[i].responseDialog) {

                                            session.dialogData.solved = true;
                                            session.send(expected[i].response);
                                            setTimeout(function () { session.endDialog(); }, 6000);
                                            return;
                                        } else {
                                            session.beginDialog("/" + rootKeyName + "/" + expected[i].responseDialog);
                                        }    
                                    }
                                }
                            }                            
                        }
                    } 
                    if (qData.response != null) {
                        session.send(qData.response);
                    } else {
                        session.send("Thanks");
                    }
                    setTimeout(function () { session.endDialog(); }, 5000);
                    return;
                       
                }, function (session, args, next) {
                    session.endDialog();                    
                }
            ]
        )
    } else if (qData.type == "confirm") {
        bot.dialog("/" + rootKeyName + "/" + thisKeyName,
            [
                function (session, args) {
                    prompts.beginConfirmDialog(session, {questionText: qData.text});
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
                    if (!qData.next) {
                        setTimeout(function () { session.endDialog(); }, 4000);
                    } else {
                        setTimeout(function () { session.beginDialog(qData.next); }, 5000);                        
                    }    
                }
            ]                    
        ) 
    }   else if (qData.type == "link") {
        bot.dialog("/" + rootKeyName + "/" + thisKeyName,
            [
                function (session, args) {
                    session.beginDialog(qData.dialog, qData.args);  
                }
            ]                    
        ) 
    }  
}