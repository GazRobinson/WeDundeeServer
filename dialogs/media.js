imageSearch = require('node-google-image-search');

const pics = [
    'http://www.dundeepartnership.co.uk/sites/default/files/The%20Law_small%20%28crop%29.jpg',
    'http://wedundeesite.azurewebsites.net/images/29141947776_ffed4483cc_k.jpg',
    'http://wedundeesite.azurewebsites.net/images/29626893214_d842957ef7_k.jpg',
    'http://wedundeesite.azurewebsites.net/images/31424155534_990c73f698_k.jpg',
    'http://wedundeesite.azurewebsites.net/images/6275619791_4da79d3895_b.jpg',
    'http://wedundeesite.azurewebsites.net/images/dundee_bridge.jpg',
    'http://wedundeesite.azurewebsites.net/images/6276140800_b5ac9e3e89_b.jpg'
];
getPic = function () {    
    return pics[Math.floor(Math.random() * pics.length)];
}
defaultImageCallback = function (results) {
    console.log(results);
	var msg = new builder.Message().address(global.address);
    msg.text('Here you go!');
    msg.textLocale('en-US');
	msg.addAttachment({
		contentType: "image/jpeg",
		contentUrl: getPic(),
		name: "Law"
	});
	bot.send(msg);
    setTimeout(function () {
        currentSession.beginDialog("/displayPicture");
        //bot.beginDialog(global.address, "*:/displayPicture");
    }, 2500);
    
}

nonDefaultImageCallback = function (results) {
    console.log(results);
	var msg = new builder.Message().address(global.address);
    msg.text('Here you go!');
    msg.textLocale('en-US');
	msg.addAttachment({
		contentType: "image/jpeg",
		contentUrl: getPic(),
		name: "Law"
	});
	bot.send(msg);    
}

module.exports.init = function () {

    bot.dialog('/showPicture', [function (session, args) {
        
            session.send("Hold on a second while I grab one for you...");
            console.log(session.dialogStack());
        
            setTimeout(function (session) {            
            var results = imageSearch(
                'Dundee',
                function (results) {
                    console.log("RES");
                    console.log(session);
                    var msg = new builder.Message().address(session.message.address);
                    msg.text('Here you go!');
                    msg.textLocale('en-US');
                    msg.addAttachment({
                        contentType: "image/jpeg",
                        contentUrl: getPic(),
                        name: "Law"
                    });
                    bot.send(msg);
                    session.beginDialog("/displayPicture");
                }, 0, 1
                );
        }, 5000, session);	                  
        },
        function (session, args) {
            setTimeout(function () {
                session.endDialog();
            }, 5000);
        }
    ]
    );  
    bot.dialog('/media/requestPicture', [
        function (session, args) {            
            var results = imageSearch(
                'Dundee',
                function (results) {
                    console.log(results);
                    var msg = new builder.Message().address(session.message.address);
                    msg.textLocale('en-US');
                    msg.addAttachment({
                        contentType: "image/jpeg",
                        contentUrl: getPic(),
                        name: "Law"
                    });
                    bot.send(msg);
                    session.beginDialog("/displayPicture");
                }, 0, 1
                );
        },
        function (session, args, next) {
                session.endDialog();
        }
    ]
    ); 
    bot.dialog('/media/emailPic', [
        function (session, args) {        
            session.send("Here's my email address, write it down and send my a picture sometime!");  
            session.endDialog();
        }
    ]
    ); 
    


    bot.dialog('/displayPicture', function (session, args, next) {        
            session.endDialog();
        }    
    ); 
}