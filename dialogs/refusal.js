module.exports.init = function () {
    
    bot.dialog('/refusal/introduction',
        [
            function (session, args, next) {
                SendMessage(session, "Wow, okay. I mean, that's a little rude.");
                //WaitForResponse(session, next, 4000)
            },function (session, args, next) {
                SendMessage(session, "Is this how you normally treat people?");
               // WaitForResponse(session, next, 4000)
            },function (session, args) {
                SendMessage(session, "Some people...");
                //WaitForResponse(session, session.endDialog, 4000)
            }
        ]
    )
}