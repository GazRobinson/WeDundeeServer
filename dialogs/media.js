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

module.exports.init = function () {

    bot.dialog('/showPicture', [function (session, args) {
        
    		global.address = session.message.address;
            session.send("Hold on a second while I grab one for you...");
            global.currentSession = session;
            console.log(session.dialogStack());
        
            setTimeout(function () { var results = imageSearch('Dundee', args ? args.callback : defaultImageCallback, 0, 1);}, 3000);	                  
        },
        function (session, args) {
            session.endDialog();
        }
    ]
    );    

    bot.dialog('/displayPicture', function (session, args, next) {        
            session.endDialog();
        }    
    ); 
}