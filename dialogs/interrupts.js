const thanks = [
    "You're welcome!",
    "No problem!",
    "Any time.",
    "Just doing my job!",
    "You're too kind"
];

getRandomThanks = function () {    
    return thanks[Math.floor(Math.random() * thanks.length)];
}

module.exports = function () {
    bot.dialog('/stopMusic',
	[
		function (session, args) {
			var msg = new builder.Message().address(global.address);
			msg.text('Back to silence then...');
			msg.textLocale('en-US');
			msg.addAttachment({
				contentType: "audio/stop",
				contentUrl: 'http://wedundeesite.azurewebsites.net/audio/laeto_01_dead_planets.mp3',
				name: "Laeto"
			});
			bot.send(msg);
			session.endDialog();
			//audio/mpeg3
		}
]
    ).triggerAction({ matches: /^Stop Music/i });

bot.dialog('/thanks',
	[
		function (session, args) {
            session.send(getRandomThanks());
		}
]
    ).triggerAction({ matches: 'gratitude' });    

bot.dialog('/population',
	[
		function (session, args, next) {
            session.send('There are 148,270 people in Dundee city currently, I have only met a few of of them - but there is plenty time.');
            setTimeout(next, 10000);
        }, 
        function (session, args, next) {            
            session.send('Would you like to know the population density?');
			prompts.beginConfirmDialog(session, {skip:true});
        },
        function (session, args, next) {
            if (args.response == 1) {
                session.send('2,478/km2 or as I prefer 6,420/mi2, this might not be much if you compare it to x but it’s the second highest in Scotland.');
            } else if(args.response == 0 || args.response == 2){
                session.send("Ok then, I thought it was interesting!");                
            }  
            session.endDialog();
		}
]
).triggerAction({ matches: 'question.population' });      
}