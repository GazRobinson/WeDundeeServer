
const dialogs = [
    '/fallback/picture',
    '/fallback/thought',
    '/fallback/music',
    '/fallback/answer',
    '/fallback/question'
];

const confusion = [
    'Sorry?',
    "I didn't get that.",
    "Sorry, I'm new here.",
    "I'm still learning.",
    "Huh? This is all new to me."
];

module.exports.getConfusion = function () {    
    return confusion[Math.floor(Math.random() * confusion.length)];
}

module.exports.getRandom = function () {    
    return dialogs[Math.floor(Math.random() * dialogs.length)];
}

module.exports.init = function () {

    bot.dialog('/fallback/picture', [
        function (session, args) {
            session.send(args + " Maybe you'd like to see a picture of Dundee instead?");
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
    ]);

    bot.dialog('/fallback/thought', [
        function (session, args) {
            session.send(args + ' Perhaps you could hear a thought from the city?');
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

    bot.dialog('/fallback/music', [
        function (session, args) {
            session.send(args + ' How about we listen to some music in the mean time?');
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
    ]);

    bot.dialog('/fallback/answer', [
        function (session, args) {
            session.send(args + ' What if you answer a question about the city for me?');
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
    ]);

    bot.dialog('/fallback/question', [
        function (session, args) {
            session.send(args + ' Maybe you have an obscure question for someone about the city?');
			prompts.beginConfirmDialog(session, {skip:false});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/askQuestion');
            } else {
                session.send("Oh well.");
                session.endDialog();
            }    
        }
    ]);
}