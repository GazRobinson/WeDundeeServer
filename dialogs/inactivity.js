
const dialogs = [
    '/inactive/picture',
    '/inactive/thought',
    '/genericQuestion',
    '/inactive/music',
    '/inactive/answer',
    '/inactive/question'
];

module.exports.getRandom = function () {    
    return dialogs[Math.floor(Math.random() * dialogs.length)];
}

module.exports.init = function () {

    bot.dialog('/inactive/picture', [
        function (session, args) {
            session.send('Would you like to see a picture of Dundee?');
			prompts.beginConfirmDialog(session, {skip:false});
        },
        function (session, args) {
            console.log("We got here at least");
            if (args.response == 1) {
                session.beginDialog('/showPicture');
            } else {
                session.send("Ok then, maybe another time!");
                session.endDialog();
            }    
        },
        function (session, args) {
            console.log("GOT BACK HERE");
            session.endDialog();
        }
    ]).triggerAction({ matches: /^PIC/ });

    bot.dialog('/inactive/thought', [
        function (session, args) {
            session.send('Would you like to hear a thought from the city?');
			prompts.beginConfirmDialog(session, {skip:false});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/displayThought');
            } else {
                session.send("Well, just ask if you change your mind!");
                session.endDialog();
            }    
        }
    ]);

    bot.dialog('/inactive/music', [
        function (session, args) {
            session.send('Would you like to hear some music?');
			prompts.beginConfirmDialog(session, {skip:false});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/playMusic');
            } else {
                session.send("Perhaps later!");
                session.endDialog();
            }    
        }
    ]).triggerAction({ matches: /^MUSIC/ });

    bot.dialog('/inactive/answer', [
        function (session, args) {
            session.send('Can you answer a question about the city?');
			prompts.beginConfirmDialog(session, {skip:false});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/answerQuestion');
            } else {
                session.send("Never mind, maybe later!");
                session.endDialog();
            }    
        }
    ]).triggerAction({ matches: /^ANSWERQ/ });
}