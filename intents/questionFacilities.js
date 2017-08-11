module.exports = function () {
    bot.dialog('/question.facility', function (session, args) {
        console.log(args.intent.entities);
        var location = builder.EntityRecognizer.findEntity(args.intent.entities, 'location');
        if (location && /dundee/i.test(location.entity)) {
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
            var place = builder.EntityRecognizer.findEntity(args.intent.entities, 'custom.places') || builder.EntityRecognizer.findEntity(args.intent.entities, 'Places.PlaceType');
            if (place) {
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
                }else {
                    session.send("Do I look like Wikipedia?");
                    session.endDialog();
                }  
            } else {
                session.send("Do I look like Wikipedia?");
                session.endDialog();
            }    
        }    
    }).triggerAction({
        matches: 'question.facility' ,
        onSelectAction: (session, args, next) => {
        session.beginDialog('/question.facility', args);
    } }
    );

    bot.dialog('/question.facility.DCA', [function (session, args) {        
			prompts.beginConfirmDialog(session, {questionText: "Dundee Contemporary Arts Gallery is in the west end of Dundee and has a a gallery, cinema, shop, cafe and print studio. Would you like to visit their website?", skip:false});
    }, function (session, args) {
        if (args.response == 1) {
            session.beginDialog('/otherSite', {URL: "http://www.dca.org.uk"});
        } else {
            session.send("Ok then, maybe another time!");
            session.endDialog();
        } 
    }]).triggerAction({ matches: /HYPERLINKTEST/ });
}