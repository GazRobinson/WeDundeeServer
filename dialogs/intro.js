module.exports.init = function () {
    var helloArray = [
        { message: "Hello", time: 10000 },
        { message: "Hello...?", time: 10000 },
        { message: "If you're out there, say something!", time: 12000 },
        { message: "Type something to me", time: 14000 },
        { message: "Well, not something. Try 'Hello'!", time: 15000 },
        { message: "Okay. Well I, er... I've got places to be so...", time: 10000 },
        { message: "So... I'm just going to head on out", time: 10000 },
        { message: "Just say hello if you need me!", time: 10000 }
    ]
    
    bot.dialog('/intro/start',
        [
            function (session, args) {
                if (!args || !args.count) {
                    count = 0;
                }
                session.send(helloArray[count].message);
                var time = helloArray[count].time;  
                count++;
                if (count < helloArray.length) {
                    timeDict[session.message.user.id] = setTimeout(function () {
                        session.replaceDialog('/intro/start', { waiting: true, count: count });
                    }, 6000);
                } else {
                    count = 0;
                    timeDict[session.message.user.id] = setTimeout(function () {
                        session.replaceDialog('/intro/start', { waiting: true, count: count });
                    }, time);
                }  
            }
        ]
    )
}