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
                session.send("So " + session.userData.name + ", would you like to know what I'm up to?");
                prompts.beginConfirmDialog(session);
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.send("We Dundee is taking names and information about Dundee so we can let the world find out what we do here.");
                    setTimeout(function () { session.beginDialog('/beginning/answerQuestions'); }, 5000);
                } else {
                    session.beginDialog("/beginning/firstRefusal")
                }
            }
        ]
    )

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
            },
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
                    session.beginDialog('/beginning/doQuestions');
                } else {
                    session.send("This is getting awkward...");
                    setTimeout(function () { session.beginDialog('/beginning/secondRefusal') }, 3000);
                }
            },
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
			    setTimeout(next, 4000);
            },
            function (session, args, next) {
                session.send("Okay! Let's start!")
                setTimeout(function () { session.beginDialog("/questions/intro"); }, 4000);
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
                } else {
                    session.beginDialog("/beginning/secondRefusal")
                }
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
                    session.send("TODO<second refusal>");
                } else {
                    session.beginDialog("/beginning/thirdRefusal")
                }
            }
        ]
    )

    bot.dialog('/beginning/thirdRefusal',
        [
            function (session, args) {
                session.send("Ok. I feel like we got off on the wrong footing, shall we start over?")
                prompts.beginConfirmDialog(session);
            },
            function (session, args, next) {
                if (args.response == 1) {
                    //TODO: Check flow of dialogs
                    session.beginDialog("/beginning/intro")
                } else {
                    session.beginDialog("/beginning/breakTime")
                }
            }
        ]
    )
    bot.dialog('/beginning/breakTime',
        [
            function (session, args, next) {
                //TODO: Break time                    
                session.send("Okay... Well I have to take my designated break now, so I'm just going to leave you here...");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("Bye.");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("Still there?");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("That was a hint to leave...");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("go");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("Go!");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("But come back if you want to talk.");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                //TODO: Photo
                session.send("Here's a photo of a pot hole.");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send(":(");
			    setTimeout(next, 3000);
            },
            function (session, args, next) {
                session.send("Does it make you angry?");
			    setTimeout(next, 3000);
            }
        ]
    )    
}