
function AnswerQuestion(id, currentAnswers, newAnswers){
	var keyyyy = id+"/responses";
	var obb = {};
	var arr = newAnswers;
	if(currentAnswers != null){
	arr = currentAnswers.concat(newAnswers);
	}
	obb[keyyyy] = arr;
	qRef.update(obb
	);
}
var qRef;
var timeoutMessages = [
    "Please stand by...",
    "Please stand by...",
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
const dbBotPath = "server/bot-data/questions";
const dbUserPath = "server/saving-data/questions";
//global.qTime;
function LoadQLoop() {
    LoadAllHumanQs();
    global.qTime = setTimeout(function() {
        if (!global.questionsLoaded) {
            qRef.off();
            console.log("TRYING AGAIN");
            LoadQLoop();
    } 
    }, 60000);
}

module.exports.init = function () {
    qRef = db.ref(dbBotPath);
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
                    global.HoldNext(session);
                }    
            }, function (session, args, next) {
                if (session.userData.finishedQuestions) {
                        session.send("Wow! You got through all the questions I have!");
	                    session.userData.finishedQuestions = true;
                        setTimeout(function () { session.beginDialog('/questions/askASecret'); }, 4000);
                        return;
                }
                if (session.userData.questionCount < 3) {
                    session.send(["Next up...", "The next one is...", "All right, next question", "Time for another one", "What was next...? Oh yeah!",  "Oh this is a good one!", "This next question has some good responses", "This is a favourite of mine!"]);
                    global.HoldReplace(session, "/questions/intro", 5000);
                    //global.Wait(session, function () { session.replaceDialog("/questions/intro"); }, 4000);
                } else {
                    if (session.userData.usedQuestions.length < qArray.length) {
                        session.beginDialog("/questions/another");
                    } else {
                        session.send("Wow! You got through all the questions I have!");
	                    session.userData.finishedQuestions = true;
                        session.userData.questionCount = 5;
                        setTimeout(function () { session.beginDialog('/questions/askASecret'); }, 4000);
                    }    
                }    
            }, function (session, args, next) {
                session.endDialog();                    
            }
        ]
    ).triggerAction({ matches: /^qq/,
        onSelectAction: (session, args, next) => {    
            session.userData.finishedQuestions = false;
        session.beginDialog('/questions/intro');
            } });  
    
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
                    session.send("Wait! Sorry! I'm all out of questions apparently " + global.emoji.frown);
	                session.userData.finishedQuestions = true;
                    setTimeout(function () { session.beginDialog('/questions/askASecret'); }, 4000);
                }    
            }
        ]
    );

    bot.dialog('/questions/askASecret',
        [
            function (session, args, next) {
                session.beginDialog("/secret/root");
            },
            function (session, args, next) {
                if (session.conversationData.heardSecret && session.conversationData.heardSecret == true) {
                    next();
                } else {
                    session.beginDialog('/questions/hearSecret');
                }    
            },
            function (session, args, next) {
                session.beginDialog('/questions/askAQuestion');
            },
            function (session, args, next) {
                session.endDialog();
            }
        ]
    ).triggerAction({ matches: /^ASKSECRET/ });  


    bot.dialog('/questions/hearSecret',
        [
            function (session, args, next) {
                prompts.beginSoftConfirmDialog(session, {questionText:"Okay, I'm not supposed to say, but would you like to hear a secret someone else has told me?"})
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.send("Let me find a good one!");
                    global.HoldNext(session);
                } else {
                    session.send("Oh well!");
                    global.HoldEnd(session);
                }   
            },
            function (session, args, next) {
                session.beginDialog('/loadSecret');
            },
            function (session, args, next) {
                session.endDialog();
            }
        ]
    );

    bot.dialog('/negativeRoot2',
        [
            function (session, args, next) {
                session.conversationData.heardSecret = true;
                session.replaceDialog("/secret/negativeRoot")
            }
        ]
    );

    bot.dialog('/questions/askAQuestion',
        [
            function (session, args, next) {
                if (!session.userData.askedAQuestion) {
                    prompts.beginMultiDialog(session, {text: "Ok before we go, I promised you could leave a question for others to answer about Dundee. Would you like to do that?"});
                } else {
                    session.endDialog();
                }
            },
            function (session, args, next) {
                if (args.type && args.type == "confirm") {
                    if (args.response == 1) {
                        session.beginDialog('/askQuestion');
                    } else {
                        //TODO: Crashes here
                        HoldNext(session, { bad: true }, 3000);
                    }
                } else {
                    global.HoldDialog(session, '/quickAskQuestion', {text: args.text});
                }    
            },
            function (session, args, next) {
                global.HoldDialog(session, '/picture/intro', {text: args.text});
            },
            function (session, args, next) {
                session.endDialog();
            }
        ]
    ).triggerAction({ matches: /^ASSK/ });  

    bot.dialog('/questions/another',
        [
            function (session, args, next) {
                var msg = "";
                if (session.userData.questionCount == 3) {
                    msg = "I know I said only three questions, but how about another?";
                } else {
                    msg = "How about another one?";
                }
                prompts.beginSoftConfirmDialog(session, {questionText: msg});
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog("/questions/intro");
                } else {
                    session.beginDialog('/questions/askASecret');
                }
            }

        ]
    );
}
var qArray = [];


global.SaveResponse = function (session, questionID, response) {
    console.log("Saving to: " + questionID);
    responseRef = db.ref(dbUserPath);
	var postsRef = responseRef.child(questionID + "/answers");

	var newPostRef = postsRef.push({username:session.userData.name||"Anonymous", answer:response, checked: false});
}
global.SaveResponseLocal = function (session, questionID, response) {
    console.log("Saving to local: " + questionID);
    responseRef = db.ref(dbUserPath);
	var postsRef = responseRef.child(questionID + "/answers");

	var newPostRef = postsRef.push({username:session.userData.name||"Anonymous", answer:response, checked: false});
}
var responses;

function LoadAllResponses() {

    var responseRef = db.ref("server/saving-data/responses");
    console.log("LOADING RESPONSES");
    responseRef.on("value", function (snapshot) {
        clearTimeout(global.qTime);
        console.log("RESPONSES LOADED");
        global.responsesLoaded = true;
		responseRef.off("value");
        responses = snapshot.val();
        //console.log(responses);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      responseRef.off("value");
        });
    global.responseTime = setTimeout(function() {
        LoadAllResponses();
    }, 300000);
}

function LoadAllQs() {
    console.log("LOADING QUESTIONS");
    qRef.on("value", function (snapshot) {
        clearTimeout(global.qTime);
        console.log("QUESTIONS LOADED");
        global.questionsLoaded = true;
		qRef.off("value");

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
            if (ret != "/secret/root") {
                qArray.push(ret);
            }    
        }
        LoadAllResponses();
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      qRef.off("value");
    });
}
function LoadAllHumanQs() {
    console.log("LOADING HUMAN QUESTIONS");
    var humanQRef = db.ref(dbUserPath);
    humanQRef.on("value", function (snapshot) {
        clearTimeout(global.qTime);
        console.log("HUMAN QUESTIONS LOADED");
        global.questionsLoaded = true;
		humanQRef.off("value");

        var obj_keys = Object.keys(snapshot.val());
        var q_arr = snapshot.val();
        console.log(obj_keys.length);
        for (k = 0; k < obj_keys.length; k++) {
            if (q_arr[obj_keys[k]].checked == null || q_arr[obj_keys[k]].checked == false) {
                console.log("Del");
                console.log(q_arr[obj_keys[k]].question);
                
                delete q_arr[obj_keys[k]];
            }
        }
        obj_keys = Object.keys(q_arr);
        console.log(obj_keys.length);
        for (k = 0; k < obj_keys.length; k++) {
            var ran_key = obj_keys[k];
            var selectedquestion = snapshot.val()[ran_key];
            currentQuestionID = ran_key;
            currentQuestion = selectedquestion;
           // console.log(selectedquestion.question);
            var qKeys = Object.keys(selectedquestion.question);
        
            for (i = 0; i < qKeys.length; i++) {
                //console.log("Creating: " + "/" + ran_key + "/" + qKeys[i]);
                var nme = CreateDialog(ran_key, qKeys[i], selectedquestion.question[qKeys[i]]);
            }
            var ret = "/" + ran_key + "/root";
            if (ret != "/secret/root") {
                qArray.push(ret);
            }    
        }
        LoadAllResponses();
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      humanQRef.off("value");
    });
}

function ShowHumanResponse(rootName) {
    console.log("RNAME: " + rootName);
    var answers = responses[rootName].answers;
  
    var obj_keys = Object.keys(answers);
    var ran_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
    var selectedquestion = answers[ran_key];
    return selectedquestion;
}

function ShowHumanResponseDB(session, rootName) {
    var p = dbUserPath + "/" + rootName + "/answers";
    console.log(p);
    var responseRef = db.ref(p);
    console.log("LOADING RESPONSES");
    responseRef.once("value", function (snapshot) {
        var answers = snapshot.val();
        if (answers != null) {
            var obj_keys = Object.keys(answers);
            console.log(answers);
            for (k = 0; k < obj_keys.length; k++) {
                if (answers[obj_keys[k]].checked == null || answers[obj_keys[k]].checked == false) {
                    console.log("Del");
                    console.log(answers[obj_keys[k]].answer);
                    delete answers[obj_keys[k]];
                }
            }
            console.log(answers);
            obj_keys = Object.keys(answers);
            if (obj_keys.length > 0) {
                var ran_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
                var resp = answers[ran_key];
                console.log("Answer: " + resp.answer);
                session.send(["Interesting! " + resp.username + " said '" + resp.answer + "'",
                "Thanks! " + resp.username + " said '" + resp.answer + "'",
                "Good to know! " + resp.username + " said '" + resp.answer + "'",
                "Thanks for the answer! " + resp.username + " said '" + resp.answer + "'",
                "Thank you! " + resp.username + " said '" + resp.answer + "'"
                ]);
            } else {  
                console.log("NAE VALID ANSWERS.");
                session.send(["Interesting answer.", "Thanks!", "I'll remember this for the future!", "Good answer.", "Thank you!"]);
                
            }    

        } else {            
            console.log("NAE ANSWQERs: ");
            session.send(["Interesting answer.", "Thanks!", "I'll remember this for the future!", "Good answer.", "Thank you!"]);
        }   
                
        session.sendTyping();
        setTimeout(function () { session.endDialog(); }, 5000);
    }
    );    
}    
function ShowHumanResponseDB(session, rootName, logLocation) {
    var p = dbUserPath + "/" + logLocation + "/answers";
    console.log(p);
    var responseRef = db.ref(p);
    console.log("LOADING RESPONSES");
    responseRef.once("value", function (snapshot) {
        var answers = snapshot.val();
        if (answers != null) {
            var obj_keys = Object.keys(answers);
            console.log(answers);
            for (k = 0; k < obj_keys.length; k++) {
                if (answers[obj_keys[k]].checked == null || answers[obj_keys[k]].checked == false) {
                    console.log("Del");
                    console.log(answers[obj_keys[k]].answer);
                    delete answers[obj_keys[k]];
                }
            }
            console.log(answers);
            obj_keys = Object.keys(answers);
            if (obj_keys.length > 0) {
                var ran_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
                var resp = answers[ran_key];
                console.log("Answer: " + resp.answer);
                session.send(["Interesting! " + resp.username + " said '" + resp.answer + "'",
                "Thanks! " + resp.username + " said '" + resp.answer + "'",
                "Good to know! " + resp.username + " said '" + resp.answer + "'",
                "Thanks for the answer! " + resp.username + " said '" + resp.answer + "'",
                "Thank you! " + resp.username + " said '" + resp.answer + "'"
                ]);
            } else {  
                console.log("NAE VALID ANSWERS.");
                session.send(["Interesting answer.", "Thanks!", "I'll remember this for the future!", "Good answer.", "Thank you!"]);
                
            }    

        } else {            
            console.log("NAE ANSWQERs: ");
            session.send(["Interesting answer.", "Thanks!", "I'll remember this for the future!", "Good answer.", "Thank you!"]);
        }   
                
        session.sendTyping();
        setTimeout(function () { session.endDialog(); }, 5000);
    }
    );    
}   
function CreateDialog(rootKeyName, thisKeyName, qData) {
    var dialogName = "/" + rootKeyName + "/" + thisKeyName;
  //  console.log("Dialog name: " + dialogName);  
  //  console.log(qData);
    if (qData.type == "textPrompt") {
        bot.dialog(dialogName,
            [
                function (session, args) {
                    var sendText = qData.text
                    if (args && args.clarified) {
                        sendText = args.text;                        
                    }    
                    if (qData.from != null) {
                        sendText = qData.from + " asks '" + sendText + "'";
                    }
                    prompts.beginMultiDialog(session, {text:sendText});
                }, 
                function (session, args) {
                    //IF the user responded with a 'YES' or "NO", handle it
                    if (args.type && args.type == "confirm") {
                        console.log("conf type: " + args.response);
                        if (args.response == 1) {
                            console.log("pos");
                            if (qData.positiveMsg) {
                                session.replaceDialog(dialogName, { clarified: true, text: qData.positiveMsg });
                                return dialogName;
                            }    
                        } else if (args.response == 0 || args.response == 2) {
                            console.log("neg");
                            if (qData.negative) {
                                session.beginDialog("/" + rootKeyName + "/" + qData.negative);
                                
                            } else {
                                session.send(emojiCheck(qData.negativeMsg) || "That's okay! We'll move on for now!");
                                global.Wait(session, function () { 
                                    session.endDialog();                                    
                                }, 6000);
                            }    
                            return dialogName;
                        } 
                    }
                    //IF we got a proper response:
                    //Log the response
                    //Invalid
                    var temp = args.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
                    var expected;
                    if (qData.invalidResponse) {
                        expected = qData.invalidResponse;
                        if (args.response) {
                            session.dialogData.solved = false;
                            for (i = 0; i < expected.length; i++) {
                                for (j = 0; j < expected[i].answer.length; j++) {
                                    var reg = temp.match(new RegExp('\\b' + expected[i].answer[j] + '\\b', 'i'));
                                    if (reg && reg.length > 0) {
                                            session.dialogData.solved = true;
                                            session.send(emojiCheck(expected[i].response));
	                                        session.sendTyping();
                                            global.Wait(session, function () { 
                                                session.endDialog();
                                                
                                               // session.replaceDialog(dialogName, { text: qData.text });
                                            }, 6000);
                                            return dialogName;
                                    }
                                }
                            }                            
                        }
                    } 

                    if (qData.logLocation && args.text) {
                        console.log("Logging to logLocation: " + args.text + " to " + qData.logLocation);
                        global.SaveResponse(session, qData.logLocation, args.text);
                    } else {
                        console.log("Logging: " + args.text + " to " + qData.logLocation);
                        global.SaveResponseLocal(session, rootKeyName, args.text);
                    }
                    //Expected
                    if (qData.expectedResponse) {
                        expected = qData.expectedResponse;
                        if (args.response) {
                            session.dialogData.solved = false;
                            for (i = 0; i < expected.length; i++) {
                                for (j = 0; j < expected[i].answer.length; j++) {
                                    var exp = '\\b' + expected[i].answer[j] + '\\b';
                                    console.log("REGEX: " + exp);

                                    console.log("txt: " + args.text);
                                    var reg = args.text.match(new RegExp(exp, 'i'));
                                    
                                    console.log(reg);
                                    if (reg && reg.length > 0) {
                                        if (expected[i].responseDialog) {
                                            global.WaitStop(session);
                                            session.beginDialog("/" + rootKeyName + "/" + expected[i].responseDialog);
                                            return dialogName;                                            
                                        } else {
                                            session.dialogData.solved = true;
                                            session.send( emojiCheck(expected[i].response));
	                                        session.sendTyping();
                                            setTimeout(function () { session.endDialog(); }, 6000);
                                            return dialogName;                                            
                                        }    
                                    }
                                }
                            }                            
                        }
                    }   
                    if (rootKeyName != "secret") {
                        if (qData.logLocation && args.text) {
                            ShowHumanResponseDB(session, rootKeyName, qData.logLocation);
                        } else {
                            ShowHumanResponseDB(session, rootKeyName);
                        }
                    } else {
                        console.log("Skipping for secret");
                        session.sendTyping();
                        setTimeout(function () { session.endDialog(); }, 5000);
                    }    
                    
                    return dialogName;
                       
                }, function (session, args, next) {
                    session.endDialog();                    
                }
            ]
        )
    } else if (qData.type == "confirm") {
        bot.dialog(dialogName,
            [
                function (session, args) {
                    prompts.beginSoftConfirmDialog(session, {questionText: qData.text});
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
        bot.dialog(dialogName,
            [
                function (session, args) {
                    session.send(emojiCheck(qData.text));
                    if (!qData.next) {
                        HoldNext(session);
                    } else {
                        HoldDialog(session, qData.next);
                     //   setTimeout(function () { session.beginDialog(qData.next); }, 7000);                        
                    }    
                }, function (session, args, next) {
                    session.endDialog();                    
                }

            ]                    
        ) 
    }   else if (qData.type == "link") {
        bot.dialog(dialogName,
            [
                function (session, args) {
                    console.log()
                    session.sendTyping();
                    global.Wait(session, function () { session.beginDialog(qData.dialogLocation, qData.args); }, 5000);                      
                }, function (session, args, next) {
                    session.endDialog();                    
                }
            ]                    
        ) 
    }  
    return dialogName;
}

function emojiCheck(str) {
    str = str.replace(':)', emoji.smile);
    str = str.replace(';)', emoji.wink);
    str = str.replace(':(', emoji.frown);
    str = str.replace(':D', emoji.laugh);
    return str;
}