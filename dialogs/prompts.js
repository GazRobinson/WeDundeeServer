/*-----------------------------------------------------------------------------
Basic pattern for exposing a custom prompt. The create() function should be
called once at startup and then beginDialog() can be called everytime you
wish to invoke the prompt.
-----------------------------------------------------------------------------*/

var builder = require('botbuilder');
exports.beginConfirmDialog = function (session, options) {
    console.log('Do Confirm');
    session.beginDialog('confirm', options || {});
}

exports.create = function (bot, recog) {
    console.log('TOAST\n')
    console.log(recog);
    var prompt = new builder.IntentDialog({ recognizers: [recog] })
        .onBegin(function (session, args) {
            
        })
        .matches('positiveResponse', function (session) {
            // Return 'false' to indicate they gave up
            console.log('AYE');
            session.endDialogWithResult({ response: true });
        })
        .matches('negativeResponse', function (session) {
            // Return 'false' to indicate they gave up
            console.log('noperino');
            session.endDialogWithResult({ response: false });
        })
        .onDefault(function (session, args) {
            console.log(args);
            // Validate users reply.
            session.send(getNonUnderstand());
        });
    bot.dialog('confirm', prompt);
}

const getNonUnderstand = () => {
	const answers = [
	'Sorry?',
	"I didn't get that",
	'What was that?',]
	return answers[Math.floor(Math.random() * answers.length)]
}
exports.getApology = () => {
	const answers = [
	'APOLOGY',]
	return answers[Math.floor(Math.random() * answers.length)]
}