
module.exports.init = function () {
    
    bot.dialog('/picture/intro',
        [
            function (session, args) {
                if (args && args.bad) {                    
                    prompts.beginConfirmDialog(session, {questionText: "Ok, I am also collecting photos of nice details found in Dundee, would you like to know more?"});   
                } else {
                    prompts.beginConfirmDialog(session, {questionText: "Finally, I am also collecting photos of nice details found in Dundee, would you like to know more?"});   
                }
            },            
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/root');
                } else {
                    next();
                }
            },function (session, args, next) {
                session.beginDialog('/wrapUp/goodbye');
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    ).triggerAction({ matches: /^pictureloop/,
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/picture/intro');
             } });

    bot.dialog('/picture/root',
        [
            function (session, args) {
                session.send("Photos like this")
                session.beginDialog("/media/requestPicture");
            },
            function (session, args, next) {
                global.Wait(session, next, 6000); 
            },
            function (session, args) {        
                global.address = session.message.address;
                prompts.beginConfirmDialog(session, {questionText: "Would you like to upload one?"});                
                    global.currentSession = session;                  
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/uploadPicture');
                } else {
                    session.send("Thats fine, you can come back and add it later when you do.");
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
                prompts.beginSoftConfirmDialog(session, {questionText: "Are you here to upload a picture?"});                
            },
            function (session, args, next) {
                console.log(session.dialogStack());
                if (args.response == 1) {
                    session.beginDialog('/picture/onComputer');
                } else {
                    session.send("Ok then!");
                    global.Wait(session, function () { session.beginDialog('/beginning/rejoin'); }, 4000); 
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    ); 

    bot.dialog('/picture/onComputer',
        [
            function (session, args) {        
                prompts.beginConfirmDialog(session, {questionText: "Ok, do you have it on your computer now?"});                      
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/uploadPicture');
                } else {
                    session.beginDialog('/picture/orEmail');
                }
            },function (session, args, next) {
                session.endDialog();
            }
        ]
    );
    bot.dialog('/picture/orEmail',
        [
            function (session, args) {        
                prompts.beginConfirmDialog(session, {questionText: "Thats fine, you can come back and add it later when you do or I can give you an email address to send it to?"});                      
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.beginDialog('/picture/emailPicture');
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
                session.send("Ok send it to photos@wedundee.com");
                global.Wait(session, function () { session.endDialog(); }, 10000);
            }
        ]
    ); 
}