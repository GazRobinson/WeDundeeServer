
module.exports.init = function () {
   
    bot.dialog('/wrapUp/goodbye', [
        function (session, args, next) {
            //facebook.com/wedundee  twitter.com/wedundee
            session.send("Ok, I guess that's all I have for you. Thanks for helping out and please follow We Dundee on Facebook and Twitter to find out about changes we make here.");
            global.HoldNext(session, {}, 12000);
        },
        function (session, args, next) {
            session.send("Oh wait! I'm meant to ask you what you thought of our service!");
            global.HoldNext(session, {}, 7000);
        },
        function (session, args, next) {
            prompts.beginConfirmDialog(session, {questionText: "Would you like to leave some feedback?"});
        },
        function (session, args, next) {
            if (args.response == 1) {
                //random question
                HoldDialog(session, '/wrapUp/feedbackYes');
            } else {
                HoldDialog(session, '//wrapUp/feedbackNo');
            }
        }
    ]).triggerAction({ matches: /^WRAPUP/ }); 

    bot.dialog('/wrapUp/feedbackYes', [
        function (session, args, next) {
            session.send("Great! Please be kind...");
            prompts.beginTextDialog(session);
        },
        function (session, args, next) {
            session.userData.completed = true;
            global.saveLog(session.message.address.user.id);
            SaveFeedback(session, args.text);
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
            session.send({
                type: 'close',
                text: "Bye bye!"
            });
            session.endDialog();
        }      
    ]);
}

const dbFeedbackPath = "server/saving-data/feedback";
global.SaveFeedback = function (session, feedback) {
    var fbRef = db.ref(dbFeedbackPath);

	fbRef.push({username:session.userData.name||"Anonymous", answer:feedback, checked: false});
}