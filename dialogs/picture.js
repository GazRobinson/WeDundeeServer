
module.exports.init = function () {
    
    bot.dialog('/picture/root',
        [
            function (session, args) {
                session.beginDialog("/media/requestPicture");
            },
            function (session, args) {        
    		global.address = session.message.address;
            prompts.beginConfirmDialog(session, {questionText: "I am thinking of showing people images of the city like this. Would you have on I could use?"});                
                global.currentSession = session;                  
        },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/uploadPicture');
                } else {
                    session.send("Maybe another time then!");
                    global.Wait(session, function () { console.log("END");session.endDialog(); }, 4000); 
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    );  

    bot.dialog('/picture/picture',
        [
            function (session, args) {

			console.log(session.dialogStack());
                prompts.beginConfirmDialog(session, {questionText: "Oh, are you here to upload a picture?"});                
            },
            function (session, args, next) {
                console.log(session.dialogStack());
                if (args.response == 1) {
                    session.beginDialog('/picture/uploadPicture');
                } else {
                    session.send("Maybe another time then!");
                    global.Wait(session, function () { console.log("END");session.endDialog(); }, 4000); 
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    ); 

    bot.dialog('/picture/uploadPicture',
        [
            function (session, args) {
                prompts.beginConfirmDialog(session, {questionText: "Cool! We don't actually have a way for you to give me a picture just yet, but I can give you an email address to send them to, if you want?"});  
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/emailPicture');
                } else {
                    session.send("Maybe another time then!");
                    global.Wait(session, function () { session.endDialog(); }, 4000);                    
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    ); 
     bot.dialog('/picture/emailPicture',
        [
            function (session, args) {
                session.send("The address is... Well, I don't actually have this either. Give me a few days!");
                global.Wait(session, function () { session.endDialog(); }, 3000);
            }
        ]
    ); 
}