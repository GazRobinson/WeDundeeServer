module.exports.init = function () {
    var helloArray = [
        "Hi",
        "Hi there",
        "Hello?",
        "Helloooooooo?",
        "HELLOOOOOOOOOOOOOOOOOOOO",
        "Anyone?",
        "Is this thing on...?",
        "If you're out there, say something!",
        "Type something to me",
        "Well, not something. Try 'Hello'!",
        "Okay. Well I, er... I've got places to be so...",
        "So I'm just going to head on out"

    ]
    
    bot.dialog('/intro/start',
        [
            function (session, args) {
                var greetingCount = 0
                if (args) {
                    greetingCount = args.greetingCount;
                }
                //SendMessage(session, helloArray[greetingCount]);
               // session.send(helloArray[greetingCount]);
                session.send("Hello there"); 
               /* setTimeout(function () {
                    if (greetingCount + 1 < helloArray.length) {
                        session.replaceDialog('/intro/start', { greetingCount: greetingCount + 1 }
                        )
                    }
                }
                , 6000);    */        
            }
        ]
    )
}