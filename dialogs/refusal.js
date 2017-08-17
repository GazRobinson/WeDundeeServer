module.exports.init = function () {
    
    bot.dialog('/refusal/introduction',
        [
            function (session, args, next) {
                session.send("Wow, okay. I mean, that's a little rude.");
                //WaitForResponse(session, next, 4000)
            },function (session, args, next) {
                session.send("Is this how you normally treat people?");
               // WaitForResponse(session, next, 4000)
            },function (session, args) {
                session.send("Some people...");
                //WaitForResponse(session, session.endDialog, 4000)
            }
        ]
    )
}