/*-----------------------------------------------------------------------------
Basic pattern for exposing a custom prompt. The create() function should be
called once at startup and then beginDialog() can be called everytime you
wish to invoke the prompt.
-----------------------------------------------------------------------------*/

////CUSTOM CONFIRM
var builder = require('botbuilder');
exports.beginConfirmDialog = function (session, options) {
    console.log('Do Confirm');
    global.stopTimer();
    session.beginDialog('/prompts/confirm', options || {});
}

exports.createConfirmDialog = function (bot, recog) {
    var allowSkip = false;
    var unsureResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
            
            if (args.questionText) {
                session.dialogData.qText = args.questionText;
            }
            if (args.repeat) {
                session.send(session.dialogData.qText);
            }
            unsureResponse = args.unsureResponse || getNonUnderstand();
            allowSkip = false;
            if (args) {
                if (args.skip) {
                    allowSkip = args.skip;
                }    
            }    
        })
        .matches('positiveResponse', function (session, args) {
            session.endDialogWithResult({ response: 1 });
        })
        .matches('negativeResponse', function (session, args) {
            session.endDialogWithResult({ response: 0 });
        })
        .matches('intent.dontKnow', function (session, args) {
            session.endDialogWithResult({ response: 2 });
        })
        .onDefault(function (session, args) {
            console.log(args);
            if (allowSkip) {
                console.log("Allow skip");
                session.endDialogWithResult({ response: -1 });
            } else {
                session.send(unsureResponse);
            }    
        });
    bot.dialog('/prompts/confirm', prompt);
}
//ambiguous
exports.beginMultiDialog = function (session, options) {
    console.log('Do Confirm');
    global.stopTimer();
    session.beginDialog('/prompts/multi', options || {});
}

exports.createMultiDialog = function (bot, recog) {
    var unsureResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
            
            if (args.questionText) {
                session.dialogData.qText = args.questionText;
            }
            if (args.repeat) {
                session.send(session.dialogData.qText);
            }
            unsureResponse = args.unsureResponse || getNonUnderstand();
            allowSkip = false;
            if (args) {
                if (args.skip) {
                    allowSkip = args.skip;
                }
            }
        })
        .matches('positiveResponse', function (session, args) {
            if (args.score > scoreThreshold){
                session.endDialogWithResult({ response: 1, type: "confirm" });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }
        })
        .matches('negativeResponse', function (session, args) {
            if (args.score > scoreThreshold) {
                session.endDialogWithResult({ response: 0, type: "confirm" });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }
        })
        .matches('intent.dontKnow', function (session, args) {
            if (args.score > scoreThreshold) {
                session.endDialogWithResult({ response: 2, type: "confirm" });
            } else{
                session.endDialogWithResult({ response: -1, text: session.message.text });
            }    
        })
        .onDefault(function (session, args) {
            session.endDialogWithResult({ response: -1, text: session.message.text });
        });
    bot.dialog('/prompts/multi', prompt);
}
const scoreThreshold = 0.4;
//CUSTOM TEXT
exports.beginTextDialog = function (session, options) {
    console.log('Do Text');
    session.beginDialog('/prompts/text', options || {});
}

exports.createTextDialog = function (bot, recog) {
    var botResponse;
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
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