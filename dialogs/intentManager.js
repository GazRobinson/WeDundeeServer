module.exports = function () {

    bot.dialog('/question.location', [function (session, args) {
        var place = builder.EntityRecognizer.findEntity(args.intent.entities, 'location') || builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.geography.country');

        if (/dundee/i.test(place.entity)) {
            console.log("YES MATE");
            session.beginDialog('/question.location.dundee');
            
        } else if (/scotland/i.test(place.entity)) {
            session.send("Oh, ok. Geography not your strong point? It's a country in the UK north of, and bordering, England.");
            session.endDialog
        } else if (/england/i.test(place.entity)) {
            session.beginDialog('/question.location.england');
        }else {
            session.send("I have no idea! Have you tried checking a map?");
            session.endDialog();
        }    
    }
    ]).triggerAction({ matches: 'question.location' });

bot.dialog('/question.location.dundee', [function (session, args) {
    session.send('Dundee is on the east coast of Scotland, it sits facing south on the bank of the River Tay or the silvery Tay as people like to call it. Would you like to see a picture?');
    prompts.beginConfirmDialog(session);
 },
    function (session, args) {
        if (args.response == 1) {
                session.beginDialog('/showPicture');            
        } else {
            session.send("Okay then!");
            session.endDialog();
        }
    }]
);    
bot.dialog('/question.location.england', [function (session, args) {
    session.send("Do you want me to show you a map?");
    prompts.beginConfirmDialog(session);
 },
    function (session, args) {
        if (args.response == 1) {
            session.send("I'd show you a map here, but I'm still learning!");
            session.endDialog();
        } else {
            session.send("Why don't you try asking something else then?");
            session.endDialog();
        }
    }]
);  
}