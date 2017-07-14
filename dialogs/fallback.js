
const dialogs = [
    '/fallback/picture',
    '/fallback/thought',
    '/fallback/music',
    '/fallback/questionFlow',
    '/fallback/questionFlow',
  //  '/fallback/answer',
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
            session.send("Would you like to see a picture of Dundee?");
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args) {
            console.log("We got here at least");
            if (args.response == 1) {
                session.beginDialog('/showPicture');
            } else if(args.response == 0 || args.response == 2){
                session.send("Ok then, maybe another time!");
                session.endDialog();
            }    
        },
        function (session, args) {
            console.log("GOT BACK HERE");
            session.endDialog();
                console.log(session.dialogStack());
        }
    ]);

    bot.dialog('/fallback/thought', [
        function (session, args) {
            session.send('Wanna hear a thought from the city?');
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/displayThought');
            } else if(args.response == 0 || args.response == 2) {
                session.send("Well, just ask if you change your mind!");
                session.endDialog();
                console.log(session.dialogStack());
            }    
        }
    ]);

    bot.dialog('/fallback/music', [
        function (session, args) {
            session.send('Maybe we could listen to some music?');
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/playMusic');
            } else if(args.response == 0 || args.response == 2) {
                session.send("Perhaps later!");
                session.endDialog();
                console.log(session.dialogStack());
            }    
        }
    ]);

    bot.dialog('/fallback/answer', [
        function (session, args) {
            session.send('Hey! Maybe you wanna answer a question about the city for me?');
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/answerQuestion');
            } else if(args.response == 0 || args.response == 2) {
                session.send("Never mind, maybe later!");
                session.endDialog();
                console.log(session.dialogStack());
            }    
        }
    ]);


    bot.dialog('/fallback/questionFlow', [
        function (session, args) {
            if (!session.userData.finishedQuestions) {
                session.beginDialog('/beginning/answerQuestionsAlt');
            } else {
                session.beginDialog('/fallback/answer');
            }
        },
        function (session, args) {
                session.endDialog();
        }
    ]);

    bot.dialog('/fallback/question', [
        function (session, args) {
            session.send('Do you have an obscure question for someone about the city?');
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args) {
            if (args.response == 1) {
                session.beginDialog('/askQuestion');
            } else if(args.response == 0 || args.response == 2 ) {
                session.send("Oh well.");
                session.endDialog();
                console.log(session.dialogStack());
            }    
        }
    ]);
}