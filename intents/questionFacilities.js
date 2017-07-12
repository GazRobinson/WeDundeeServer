module.exports = function () {
    bot.dialog('/question.facility', function (session, args) {
        var location = builder.EntityRecognizer.findEntity(args.intent.entities, 'location');
        if (/dundee/i.test(location.entity)) {
            var place = builder.EntityRecognizer.findEntity(args.intent.entities, 'custom.places') || builder.EntityRecognizer.findEntity(args.intent.entities, 'Places.PlaceType');
            if (/gallery/i.test(place.entity)) {
            session.send("Dundee has two main galleries, one is contemporary and the other is more historic.");
            session.endDialog();
            } else if (/airport/i.test(place.entity)) {
            session.send("Yes, a small one, you can fly to it from Stanstead in London but Edinburgh airport is only an hour away.");
            session.endDialog();
            } else if (/museum/i.test(place.entity)) {
            session.send("The McManus Gallery is Dundee's Art gallery and museum, it has several galleries and a cafe.");
            session.endDialog();
            } else if (/DCA/i.test(place.entity)) {
                session.beginDialog('/question.facility.DCA');   
           // session.send("Dundee Contemporary Arts Gallery is in the west end of Dundee and has a a gallery, cinema, shop, cafe and print studio. Would you like to visit their website?");
            //session.endDialog();
            }
        } else {
            session.send("Do I look like Wikipedia?");
            session.endDialog();
        }    
    }).triggerAction({ matches: 'question.facility' });

    bot.dialog('/question.facility.DCA', [function (session, args) {        
            session.send("Dundee Contemporary Arts Gallery is in the west end of Dundee and has a a gallery, cinema, shop, cafe and print studio. Would you like to visit their website?");
			prompts.beginConfirmDialog(session, {skip:false});
    }, function (session, args) {
        if (args.response == 1) {
            session.beginDialog('/otherSite');
        } else {
            session.send("Ok then, maybe another time!");
            session.endDialog();
        } 
    }]).triggerAction({ matches: /^DCA/ });
}