
module.exports.init = function () {
    bot.dialog('/wrapUp/oneMore', [
        function (session, args) {
            session.send("Oh well. Can I ask you one last question?");
            prompts.beginConfirmDialog(session);
        },
        function (session, args, next) {
            if (args.response == 1) {
                //random question
            } else {
                session.beginDialog("/wrapUp/goodbye");
            }
        }
    ]);

    bot.dialog('/wrapUp/goodbye', [
        function (session, args, next) {
            session.send("Well I think that's everything! Good bye and thanks for your time!");
            setTimeout(next, 5000);
        },
        function (session, args, next) {
            session.send("Oh wait! I'm meant to ask you what you thought of our service!");
            setTimeout(next, 5000);
        },
        function (session, args, next) {
            session.send("Would you like to leave some feedback?");
            prompts.beginConfirmDialog(session);
        },
        function (session, args, next) {
            if (args.response == 1) {
                //random question
                session.beginDialog("/wrapUp/feedbackYes");
            } else {
                session.beginDialog("/wrapUp/feedbackNo");
            }
        }
    ]);

    bot.dialog('/wrapUp/feedbackYes', [
        function (session, args, next) {
            session.send("Great! Please be kind...");
            prompts.beginTextDialog(session);
        },
        function (session, args, next) {
            session.endDialog();
        }
    ]);
    bot.dialog('/wrapUp/feedbackNo', [
        function (session, args, next) {
            session.send("I'm going to take that as a positive thing!");
            setTimeout(next, 4000);
        },
        function (session, args, next) {
            session.send("Bye bye!");
            session.endDialog();
        }      
    ]);
}