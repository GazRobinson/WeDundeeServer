/*
bot.dialog('dialog/name',
    [
        function (session, args) {
        }
    ]
)
*/
module.exports.init = function () {
    
    bot.dialog('/beginning/intro',
        [
            function (session, args) {
                if (!session.userData.knowsWhatsUp) {
                    session.send("So " + session.userData.name + ", would you like to know what I'm up to?");
                    prompts.beginConfirmDialog(session);
                } else {
                    session.replaceDialog('/beginning/answerQuestionsAlt');
                }    
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.send("We Dundee is taking names and information about Dundee so we can let the world find out what we do here.");
                    session.userData.knowsWhatsUp = true;
                    setTimeout(function () { session.beginDialog('/beginning/answerQuestions'); }, 5000);
                } else {
                    session.beginDialog("/beginning/firstRefusal")
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    ).triggerAction({ matches: /^INT/ }); 

    bot.dialog('/beginning/rejoin',
        [
            function (session, args) {
                session.send("So do you want to answer some questions?")
                prompts.beginConfirmDialog(session);
            }, 
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/beginning/doQuestions');
                } else {
                    session.send("This is getting awkward...");
                    setTimeout(function () { session.beginDialog('/beginning/secondRefusal'); }, 3000);
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )
    
    bot.dialog('/beginning/answerQuestions',
        [
            function (session, args) {
                session.send("So do you want to answer some questions now?")
                prompts.beginConfirmDialog(session);
            }, 
            function (session, args, next) {
                if (args.response == 1) {
                    if (!session.userData.knowsAboutQuestions) {
                        session.beginDialog('/beginning/doQuestions');
                    } else {
                        session.beginDialog("/questions/intro");
                    }    
                } else {
                    session.send("Awkward...");
                    setTimeout(function () { session.beginDialog('/beginning/secondRefusal') }, 3000);
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )
    bot.dialog('/beginning/answerQuestionsAlt',
        [
            function (session, args) {
                session.send("Do you want to answer some questions?")
                prompts.beginConfirmDialog(session);
            }, 
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog("/questions/intro");
                } else {
                    session.beginDialog('/beginning/secondRefusal');
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )
    bot.dialog('/beginning/doQuestions',
        [
            function (session, args, next) {
                session.send("I'm going to ask you three random questions and if you answer them you can leave a question to ask others.")
			    setTimeout(next, 6000);
            }, 
            function (session, args, next) {
                session.send("But I reserve the right to not use them, or to reword them slightly...")
			    setTimeout(next, 5000);
            },
            function (session, args, next) {
                session.send("Okay! Let's start!")
                session.userData.knowsAboutQuestions = true;
                setTimeout(function () { session.beginDialog("/questions/intro"); }, 4000);
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )
    bot.dialog('/beginning/firstRefusal',
        [
            function (session, args) {
                session.send("Okay... Shall I just get to the bit where I ask you questions?")
                prompts.beginConfirmDialog(session);
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.send("Good. Let's get started.");
                    setTimeout(function () { session.beginDialog("/beginning/doQuestions"); }, 4000);
                } else {
                    session.beginDialog("/beginning/secondRefusal")
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )
    bot.dialog('/beginning/secondRefusal',
        [
            function (session, args) {
                session.send("Okay... Well would you like to know something that someone said once about the city?")
                prompts.beginConfirmDialog(session);
            },
            function (session, args, next) {
                if (args.response == 1) {
                    //TODO: Grab a thought
                    session.beginDialog('/displayThought');
                } else {
                    session.beginDialog("/beginning/thirdRefusal")
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    )

    bot.dialog('/beginning/thirdRefusal',
        [
            function (session, args) {
                console.log(session.dialogStack());
                session.send("Ok. I feel like we got off on the wrong footing, shall we start over?")
                prompts.beginConfirmDialog(session);
            },
            function (session, args, next) {
                console.log("thied 2");
                if (args.response == 1) {
                    next();
                } else {
                    session.beginDialog("/beginning/breakTime")
                }
            },
            function (session, args, next) {
                console.log("thied 2");
                session.endDialog();
                session.beginDialog("/beginning/intro")
            }
        ]
    ).triggerAction({ matches: /^BREAK/ }); 
    function Wait(sesh, nxt) {
        sesh.userData.waiting = true;
        var cont = false;
    }

    function breaktime(session, count) {
        if (session.userData.waiting == true && count < 6) {
            switch (count) {
                case 0:
                    session.send("Bye.");
                    break;
                case 1:
                    session.send("Still there?");
                    break;
                case 2:
                    session.send("That was a hint to leave...");
                    break;
                case 3:
                    session.send("go");
                    break;
                case 4:
                    session.send("Go!");
                    break;
                case 5:
                    session.send("But come back if you want to talk.");
                    break;                    
            }
            timeDict[session.userData.name] = setTimeout(breaktime, 7000, session, count + 1);
        }
    }

    

    bot.dialog('/beginning/breakTime',
        [
            function (session, args, next) {
                session.userData.waiting = true;                
                session.send("Okay... Well I have to take my designated break now, so I'm just going to leave you here...");
               // WaitForInput(session, 10000, function(){session.endDialogWithResult({ response: 1 }); });
                prompts.beginTextDialog(session);
                timeDict[session.userData.name] = setTimeout(breaktime, 8000, session, 0);
            },
            function (session, args, next) {
                clearTimeout(timeDict[session.userData.name]);
                session.endDialog();
            }
        ]
    )
}