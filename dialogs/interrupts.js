
var greets = require('../intents/greetings.js');

const thanks = [
    "You're welcome!",
    "No problem!",
    "Any time.",
    "Just doing my job!",
    "You're too kind"
];
const profanityResponse = [
    "Well, that's rude.",
    "You kiss your mother with that mouth??",
    "Are you just trying to upset me?",
    "Hey, I'm not here to be abused.",
    "Is there any need for that sort of behaviour?",
    "Come on now. No need to be like that."
];
getRandomThanks = function () {    
    return thanks[Math.floor(Math.random() * thanks.length)];
}

module.exports = function () {

    bot.dialog('help', function (session) {
        session.send("I'm a simple echo bot.");
        session.endDialog();
    }).triggerAction({ matches: /^help/i });

    bot.dialog('/website', function (session, args) {
        session.send("WEBSITE: " + args.url);
        global.Wait(session, function () { session.endDialog(); });        
    });

    // ROOT
    bot.dialog('ROOT', function (session) {
        session.beginDialog('/');
    }).triggerAction({ matches: /^ROOT/ });

    //Gratitude
    bot.dialog('/gratitude', [
        function (session, args, next) {
            console.log("DOH DOH DOH DOH");
            session.send(["You're welcome!", "Don’t mention it - it’s my job to please you", "Don't mention it!", "You're welcome."]);
            global.HoldNext(session);
        },
        function (session, args, next) {
            session.endDialog();
        }

    ]
    ).triggerAction({
        matches: 'gratitude',
        onSelectAction: (session, args, next) => {
            session.beginDialog('/gratitude');
    } });

    //Greeting
    bot.dialog('/greeting', [function (session, args, next)
    {
        console.log(session.userData);
        if (!session.userData.name) {
            session.beginDialog('/', { greeting: true });
        } else {           
            if(session.conversationData.hello){
                session.send(greets.getGreetings());
            }
            session.endDialog();
            if (session.dialogStack().length == 0) {
                setTimeout(function() {
                    session.beginDialog("/");
                }, 5000);
            }
        }
    }
    ]
    ).triggerAction({
        matches: 'greeting' ,
        onSelectAction: (session, args, next) => {
        session.beginDialog('/greeting');
    } }
    );
    
    //AskName
    bot.dialog('/intent/askName', [
        function (session, args, next)
        {
            session.send("I am not allowed to give you that information. It's classified.");
            global.HoldNext(session);
        },
        function (session, args, next)
        {
            session.endDialog();
        }
        ]
        ).triggerAction({
            matches: 'intent.inquireAboutBot' ,
            onSelectAction: (session, args, next) => {
            session.beginDialog('/intent/askName');
        } }
    );

    //ShowMe
    bot.dialog('/showThought',
        [
            function (session, args) {

                global.address = session.message.address;

                console.log(args.intent);
                if (args.intent.entities != null) {
                    console.log(builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing'));
                    console.log(args.intent.entities[0].resolution);
                    if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "thought") {
                        console.log("farts");
                        session.beginDialog('/displayThought');
                    } else if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "picture") {
                        console.log("Getting picture");
                        session.beginDialog('/showPicture');
                    } else if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "music") {
                        console.log("Getting music");
                        session.beginDialog('/playMusic');
                    }
                }
            },
            function (session, args) {
                session.endDialog();
            }
        ]
    ).triggerAction({ matches: 'showMe',
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/showThought', args);
             } });

    bot.dialog('/stopMusic',
	[
		function (session, args) {
			var msg = new builder.Message().address(session.message.address);
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
    ).triggerAction({ matches: /^Stop Music/i,
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/stopMusic');
             } });

    bot.dialog('/blankResponse',
        function (session, args) {
            console.log("Blank Response: " + session.message.text);
            session.send({
                type: 'unlock',
                text: "unlock"
            });
            session.endDialogWithResult({confused:true});
        }
    );
    
    bot.dialog('/uploadTest',
        function (session, args, next) {
            console.log("Upload test");
            var d = new Date();
            session.userData.uploadID = session.userData.name + '_' + d.getTime();
            session.send({
                type: 'uploadPrompt',
                text: "Please select a file to upload or type 'cancel' if you've changed your mind."
            });
            session.replaceDialog("/doUploadStuff");
        }
        
    );

    global.SavePicInfo = function(session, picDescription ) {
        var postsRef = db.ref("server/saving-data/images");;
        postsRef.child(session.userData.uploadID).set({
            id: session.userData.uploadID, username: session.userData.name || "Anonymous", description: picDescription, checked: false, botImage: false,
        link: "http://storage.googleapis.com/wedundeebot.appspot.com/subfolder/images/" + id});
    }

bot.dialog('/pictest',
        function (session, args, next) {            
            session.replaceDialog("/uploadTest");
        }
        
).triggerAction({ matches: /^PICTEST/ });
    
    bot.dialog('/doUploadStuff',
    [
        function (session, args, next) {
            var msg = session.message;
            console.log(msg.text);

            var reg = session.message.text.match(new RegExp('cancel', 'i'));
            if (reg && reg.length > 0) {
                console.log("Cancelling");
                session.send({
                    type: 'pic/cancel',
                    text: "cancelling..."
                });
                session.endDialog();
            }
            if (msg.attachments && msg.attachments.length > 0) {

                console.log("cool");
                // Echo back attachment
                var attachment = msg.attachments[0];

                session.send("Thank you!");
                HoldNext(session);
            } else {
                // Echo back users text
              //  session.send("Please select a file to upload, or type 'cancel' if you've changed your mind.");
            }
        },
        function (session, args) {

            console.log("HERE NOW: " + session.message.text);
            var reg = session.message.text.match(new RegExp('cancel', 'i'));
            console.log(reg);
            if (reg && reg.length > 0) {
                console.log("Cancelling");
                session.send({
                    type: 'pic/cancel',
                    text: "cancelling..."
                });
                session.endDialog();
            } else {
                prompts.beginConfirmDialog(session, { questionText: "Would you like to add a description to your photo?", skip: false });
            }  
              
        }, 
        function (session, args, next) {        
            if (args.type && args.type == "confirm") {
                if (args.response == 1) {
                    session.beginDialog('/picture/addDescription');
                } else {
                    session.send("Ok, I guess the picture does all the talking.");
                    SavePicInfo(session, "");
                    HoldNext(session);
                }
            } else {
                SavePicInfo(session, args.text);
                session.endDialog();
            }  
        },
        function (session, args) {
            session.endDialog();
        }]
    );
    bot.dialog('/picture/addDescription',
    [
        function (session, args, next) {            
            session.send("Ok, try and keep it nice and short.");
            prompts.beginTextDialog(session);
        },
        function (session, args) {
            SavePicInfo(session, args.text);
            session.endDialog();
        }]
    );
    bot.dialog('/positiveRegexResponse',	
    function (session, args) {
        session.endDialogWithResult({ response: 1 , type: "confirm"});
    }
).triggerAction({ matches: global.prompts.positiveResponses,
    onSelectAction: (session, args, next) => {  
            console.log("REGEX POSITIVE");
            if (session.dialogStack().length > 0) {                        
                session.beginDialog('/positiveResponse');
            } else {                 
                session.beginDialog('/');
            }               
        }
    });
    bot.dialog('/positiveResponse',	
        function (session, args) {
            session.endDialogWithResult({ response: 1 , type: "confirm"});
		}
    ).triggerAction({ matches: 'positiveResponse',
        onSelectAction: (session, args, next) => {  
            console.log("EXTERNAL POSITIVE: " + args.intent.score );
            console.log(session.dialogStack());

            console.log(session.dialogStack().length);
            if (args.intent.score > 0.7) {
                    if (session.dialogStack().length > 0) {                        
                        session.beginDialog('/positiveResponse');
                    } else {                 
                        session.beginDialog('/');
                    } 
                } else {
                    if (session.dialogStack().length > 0) {                        
                        session.beginDialog('/blankResponse');
                       
                    } else {
                        session.beginDialog('/');
                    }    
                }   
            }
        });
    bot.dialog('/negativeRegexResponse',	
        function (session, args) {
            session.endDialogWithResult({ response: 0 , type: "confirm"});
		}
    ).triggerAction({ matches: global.prompts.positiveResponses,
        onSelectAction: (session, args, next) => {  
                console.log("REGEX NEGATIVE");
                if (session.dialogStack().length > 0) {                        
                    session.beginDialog('/negativeResponse');
                } else {                 
                    session.beginDialog('/');
                }     
            }
        });
    bot.dialog('/negativeResponse',	
        function (session, args) {
            session.endDialogWithResult({ response: 0 , type: "confirm"});
		}
    ).triggerAction({ matches: 'negativeResponse',
        onSelectAction: (session, args, next) => { 
            console.log("EXTERNAL NEGATIVE: " + args.intent.score ); 
            if (args.intent.score > 0.7) {
                    if (session.dialogStack().length > 0) {                        
                        session.beginDialog('/negativeResponse');
                    } else {                 
                        session.beginDialog('/');
                    } 
                } else {
                    if (session.dialogStack().length > 0) {                        
                        session.beginDialog('/blankResponse');
                    } else {                 
                        session.beginDialog('/');
                    }    
                } 
    } });
    
    bot.dialog('/interrupt',
	[
        function (session, args) {
            console.log(session.dialogStack());
            session.send("HEY! Don't interrupt me!");
            session.endDialogWithResult({ interrupt: true });
		}
    ]
    ).triggerAction({
        matches: /^INTERRUPT/,
        onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack 
        // (override the default behavior of replacing the stack)
            console.log(args);    
        session.beginDialog(args.action.split("*:")[1].split(')')[0], args);
    } }
    );

    bot.dialog('/thanks',
    [
        function (session, args) {
            session.send(getRandomThanks());
            HoldNext(session);
        }, 
        function (session, args) {
            session.endDialog();
        }
    ]
    ).triggerAction({ matches: 'gratitude',
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/thanks');
            }
        });    

    bot.dialog('/profanity',
    [
        function (session, args) {
            session.send(profanityResponse);
            HoldNext(session);
        }, 
        function (session, args) {
            session.endDialog();
        }
    ]
    ).triggerAction({ matches: 'profanity',
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/profanity');
            }
        });  
    
/*     bot.dialog('/botInquire',
    [
        function (session, args) {
            session.send("I am not allowed to answer questions about myself, it’s company policy.");
            timeDict[session.message.address.conversation.id] = setTimeout(function () { 
                session.endDialog();
            }, global.defaultTime);
        }
    ]
    ).triggerAction({ matches: 'intent.inquireAboutBot',
        onSelectAction: (session, args, next) => {    
        session.beginDialog('/botInquire');
             }
         }); */ 
    bot.dialog('/population',
        [
            function (session, args, next) {
                session.send('There are 148,270 people in Dundee city currently, I have only met a few of of them - but there is plenty time.');
                setTimeout(next, 10000);
            }, 
            function (session, args, next) {            
                prompts.beginSoftConfirmDialog(session, {questionText: 'Would you like to know the population density?', skip:true});
            },
            function (session, args, next) {
                if (args.response == 1) {
                    session.send('2,478/km2 or as I prefer 6,420/mi2, this might not be much if you compare it to Tokyo but it’s the second highest in Scotland.');
                } else if(args.response == 0 || args.response == 2){
                    session.send("Ok then, I thought it was interesting!");                
                }  
                session.endDialog();
            }
    ]
     ).triggerAction({
        matches: 'question.population' ,
        onSelectAction: (session, args, next) => {
        session.beginDialog('/population');
    } }
    );  

    bot.dialog('/interrupt/changeName',
        [
            function (session, args, next) {
                prompts.beginConfirmDialog(session, {questionText: "Oh! You're not " + session.userData.name + "? Would you like to change your name?", skip:false});
            }, 
            function (session, args, next) {            
                if (args.response == 1) {                    
                    session.send("Sorry for the confusion! I thought you looked like " + session.userData.name + ". Let's start over!");
                    global.ResetData(session);
                    HoldDialog(session, '/intro');
                } else if (args.response == 0 || args.response == 2) {
                    session.send("Well now you're just TRYING to confuse me...");
                    HoldNext(session);
                } 
            },
            function (session, args, next) {                 
                session.endDialog();
            }
    ]
    ).triggerAction({
        matches: 'intent.changeName' ,
        onSelectAction: (session, args, next) => {
        session.beginDialog('/interrupt/changeName');
    } }
    );
     

    bot.dialog('/log', function (session) {
        //session.beginDialog('/log');
    }).triggerAction({
        matches: /^LOG/,
        onSelectAction: (session, args, next) => {
            console.log(chatlogs[session.message.address.user.id].name);

            console.log("-------------");
            console.log(chatlogs[session.message.address.user.id].log);
            saveLog(session.message.address.user.id, session.userData);
        }});  

    bot.dialog('sec', function (session) {
        session.beginDialog('/website', {url:"www.dca.org.uk"});
    }).triggerAction({ matches: /^FAME/ });  

    // RESET
    bot.dialog('RESET', function (session) {
        
        global.ResetData(session);
        session.send("RESETTING.");
        session.clearDialogStack();
        session.replaceDialog('/');
    }).triggerAction({ matches: /^RESET/ });  
}