/*-----------------------------------------------------------------------------
Basic pattern for exposing a custom prompt. The create() function should be
called once at startup and then beginDialog() can be called everytime you
wish to invoke the prompt.
-----------------------------------------------------------------------------*/

exports.init = function (bot) {
    // ROOT
    bot.dialog('textPrompt2', [
        function (session, args) {
            if (args.response) {
                session.send(args.question);
            } else {
                next(args);
            }    
    }, function (session, args) {
        session.beginDialog('/');
    },
    ]
        
    ).triggerAction({ matches: /^PIE/ });
}

////CUSTOM CONFIRM
var builder = require('botbuilder');
exports.beginConfirmDialog = function (session, options) {
    console.log('Do Confirm');
    session.beginDialog('/prompts/confirm', options || {});
}
unsureArray = [
    "Please answer yes or no! I'm still learning!",
    "Sorry, can you answer that one with some sort of yes or no?",
    "Just an 'Aye' or 'naw' please.",
    "Didn't catch that. Try a 'yes' or 'no' or something similar..."
]
resumeArray = [
    "Now then... Where was I?",
    "What was I saying?",
    "Back to my previous question",
    "Now as I was saying...",
    "I've lost my train of thought now! What was I saying?",
    "Hang on... What were we talking about?",
    "Now that we're done with that distraction..."
]
exports.createConfirmDialog = function (bot, recog) {
    var allowSkip = false;
    var unsureResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {        
            session.dialogData.qText = args.questionText;
            session.dialogData.prompt = args.prompt || args.questionText;
            if (args.repeat) {
                session.send(session.dialogData.prompt);                
            } else {
                session.send(session.dialogData.qText);
            }    

            unsureResponse = args.unsureResponse;
            session.dialogData.allowSkip = false;
            if (args) {
                if (args.skip) {
                    session.dialogData.allowSkip = args.skip;
                }    
            }    
        })
        .matches('positiveResponse', function (session, args) {
            session.endDialogWithResult({ response: 1 , type: "confirm"});
        })
        .matches('negativeResponse', function (session, args) {
            session.endDialogWithResult({ response: 0 , type: "confirm"});
        })
        .matches('intent.dontKnow', function (session, args) {
            if (session.dialogData.allowSkip) {
                session.endDialogWithResult({ response: 2 , type: "confirm"});
            } else {
                session.send(unsureResponse || unsureArray);
                timeDict[session.message.address.conversation.id] = setTimeout(function () { 
                session.replaceDialog('/prompts/confirm', {questionText:session.dialogData.qText, prompt:session.dialogData.prompt, repeat: true})
            }, 5000);
            }
        })
        .matches('gratitude', function (session, args) {
            session.send("Don't mention it!");
            timeDict[session.message.address.conversation.id] = setTimeout(function () { 
                session.replaceDialog('/prompts/confirm', {questionText:session.dialogData.qText, repeat: true})
            }, 3500);
        })
        .onDefault(function (session, args) {
            console.log(args);
            if (session.dialogData.allowSkip) {
                console.log("Allow skip");
                session.endDialogWithResult({ response: -1 });
            } else {
                session.send(unsureResponse || unsureArray);
                timeDict[session.message.address.conversation.id] = setTimeout(function () { 
                session.replaceDialog('/prompts/confirm', {questionText:session.dialogData.qText, prompt:session.dialogData.prompt, repeat: true})
            }, 5000);
            }    
        });
    bot.dialog('/prompts/confirm', prompt);
}

exports.beginSoftConfirmDialog = function (session, args) {
    session.beginDialog('/prompts/softConfirm', args);
}


    bot.dialog('/prompts/softConfirm',
        [
            function (session, args, next) {
                //Wait here
                session.dialogData.initialArgs = args || session.dialogData.initialArgs;
                global.WaitStop(session);
                if (session.dialogData.initialArgs.resumed) {
                    session.send(resumeArray);
                    global.Wait(session, function () { session.send(session.dialogData.initialArgs.questionText); }, 4000);
                } else if(session.dialogData.initialArgs.repeating){
                    session.send(unsureArray);
                    global.Wait(session, function () { session.send(session.dialogData.initialArgs.questionText); }, 4000);
                } else{
                    session.dialogData.initialArgs.repeating = true; //Repeat by default
                    session.send(session.dialogData.initialArgs.questionText);
                }
            },
            function (session, args, next) {
                global.WaitStop(session);
                if (args.type && args.type == "confirm") {
                    if (args.response == 1) {
                        session.endDialogWithResult({ response: 1 , type: "confirm"});
                    } else {
                        session.endDialogWithResult({ response: 0 , type: "confirm"});
                    }
                } else {
                    if (args && args.confused) {
                        session.dialogData.initialArgs.resumed = false;
                        session.dialogData.initialArgs.repeating = true;
                    } else {
                        session.dialogData.initialArgs.repeating = false;
                        session.dialogData.initialArgs.resumed = true;
                    }    
                    session.replaceDialog('/prompts/softConfirm', session.dialogData.initialArgs);
                }    
            },
            function (session, args, next) {
                session.endDialog();
            }
        ]
    );

//ambiguous
exports.beginMultiDialog = function (session, options) {
    console.log(options);
    session.beginDialog('/prompts/multi', options || {});
}

const scoreThreshold = 0.6;
exports.createMultiDialog = function (bot, recog) {
    var unsureResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
            console.log("HERERERERE: " + args.repeat);
            session.dialogData.scoreThreshold = args.threshold || scoreThreshold;
            if (args.text) {
            console.log("pie ");
                args.questionText = args.text;
                args.repeat = true;
            }
            if (args.questionText) {
            console.log("fudge ");
                session.dialogData.qText = args.questionText;
            }
            if (args.repeat) {
            console.log("oljdhbsgd ");
                session.send(session.dialogData.qText);
            }
            unsureResponse = args.unsureResponse;
            allowSkip = false;
            if (args) {
                if (args.skip) {
                    allowSkip = args.skip;
                }
            }
        })
        .matches('positiveResponse', function (session, args) {
            console.log(args);
            if (args.score > session.dialogData.scoreThreshold){
                session.endDialogWithResult({ response: 1, type: "confirm", text: session.message.text });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }
        })
        .matches('negativeResponse', function (session, args) {
            if (args.score > session.dialogData.scoreThreshold) {
                session.endDialogWithResult({ response: 0, type: "confirm", text: session.message.text });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }
        })
        .matches('intent.changeName', function (session, args) {
            if (args.score > session.dialogData.scoreThreshold) {
                session.endDialogWithResult({ response: 0, type: "confirm", text: session.message.text });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }
        })
        .matches('intent.dontKnow', function (session, args) {
            if (args.score > session.dialogData.scoreThreshold) {
                session.endDialogWithResult({ response: 2, type: "confirm", text: session.message.text });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }    
        })
        .onDefault(function (session, args) {
            //I've got a response that I need.
            if (/\S/.test(session.message.text)){
                session.endDialogWithResult({ response: -1, text: session.message.text });
            } else {
                //Whitespace only
                session.send("Lost for words? Don't be shy!");
                timeDict[session.message.address.conversation.id] = setTimeout(function () { 
                    console.log("coo");
                session.replaceDialog('/prompts/multi', {questionText:session.dialogData.qText, prompt:session.dialogData.prompt, repeat: true})
            }, 5000);
            }
        });
    bot.dialog('/prompts/multi', prompt);
}
//CUSTOM TEXT
exports.beginTextDialog = function (session, options) {
    console.log('Do Text');
    session.beginDialog('/prompts/text', options || {});
}

exports.createTextDialog = function (bot, recog) {
    var botResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
            if (args.text) {
                session.send(args.text);
            }    
            botResponse = args;
        })
        .matches('intent.dontKnow', function (session) {
            // Return 'false' to indicate they gave up
            console.log('DONT KNOW');
            session.endDialogWithResult({ text: "",
            response: false});
        })
        .onDefault(function (session, args) {
            // Validate users reply.
            console.log('THIS IS THE DEFAULT');
            session.endDialogWithResult({ text: session.message.text,
            response: 1, botResponse: botResponse});
        });
    bot.dialog('/prompts/text', prompt);
}

const getNonUnderstand = () => {
	const answers = [
	"Please use some sort of 'yes' or 'no' for this one. I'm still getting used to everything.",]
	return answers[Math.floor(Math.random() * answers.length)]
}
exports.getApology = () => {
	const answers = [
	'APOLOGY',]
	return answers[Math.floor(Math.random() * answers.length)]
}