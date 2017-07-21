
module.exports.init = function () {
    bot.dialog('/wrapUp/oneMore', [
        function (session, args) {
            prompts.beginConfirmDialog(session, {questionText: "Oh well. Can I ask you one last question?"});
        },
        function (session, args, next) {
            if (args.response == 1) {
                session.beginDialog("/questions/single");
            } else {
                session.beginDialog("/wrapUp/goodbye");
            }
        }
    ]).triggerAction({ matches: /^WRAPUP/ }); 

    bot.dialog('/wrapUp/goodbye', [
        function (session, args, next) {
            session.send("Ok, I guess that all I have for you. Thanks for helping out and please follow We Dundee on Facebook to find out about changes we make here.");
            global.Wait(session, next, 12000);
        },
        function (session, args, next) {
            session.send("Oh wait! I'm meant to ask you what you thought of our service!");
            global.Wait(session, next, 7000);
        },
        function (session, args, next) {
            prompts.beginConfirmDialog(session, {questionText: "Would you like to leave some feedback?"});
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
            session.userData.completed = true;
            session.send("Thank you and goodbye!");
            session.endDialog();
        }
    ]);
    bot.dialog('/wrapUp/feedbackNo', [
        function (session, args, next) {
            session.send("I'm going to take that as a positive thing!");
            setTimeout(next, 4000);
        },
        function (session, args, next) {
            session.userData.completed = true;
            session.send("Bye bye!");
            session.endDialog();
        }      
    ]);
}