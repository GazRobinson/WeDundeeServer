const 	config 			= require('./config.js')
require('./connectorSetup.js')();
require('dotenv').config()

global.prompts 			= require('./dialogs/prompts.js');
const 	defaultDialog 	= require('./dialogs/default.js')
var 	dialogs 		= {};
var 	greets 			= require('./intents/greetings.js');
dialogs.inactivity 		= require('./dialogs/inactivity.js');
dialogs.inactivity.init();
dialogs.fallback 		= require('./dialogs/fallback.js');
dialogs.fallback.init();
require('./dialogs/interrupts.js')();
dialogs.media 			= require('./dialogs/media.js');
dialogs.media.init();
require('./dialogs/weather.js')();
require('./dialogs/intentManager.js')();
require('./intents/questionFacilities.js')();
var 	mysql 			= require('mysql');
var 	wordpress 		= require('wordpress');
var 	admin 			= require("firebase-admin");

var serviceAccount 		= require("./wedundeebot-firebase-adminsdk-ibkp7-c6ba8d1dd7.json");
var 	idleTimer;
const 	idleTime 		= 10000;
global.stopTimer = function () {
	clearTimeout(idleTimer);
}
global.startTimer = function () {
	clearTimeout(idleTimer);
	idleTimer = setTimeout(reactToIdle, idleTime);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wedundeebot.firebaseio.com"
});



// Get a database reference to our blog
var db = admin.database();
var ref = db.ref("server/saving-data/questions");


var usersRef = ref;
var naaaame = "Cool guy";
/*
usersRef.child(userData.name).set({
  date_of_birth: "June 23, 1912",
  full_name: "Alan Turing"
});*/

function SaveQuestion(name, question){
	/*usersRef.child(name + Math.floor(Math.random() * 1000)).set({
	    from: name,
		question: question,
		answers: ["Answer A", "Anser B"]
	});*/
    var newPostRef = usersRef.push();
    newPostRef.set( {
        from: name,
        question: question,
        answered: false,
        checked: false//,
        //answers: ["Answer A", "Anser B"]
    });
};

function GetBackendQuestion(callback){
    ref.on("value", function(snapshot) {
		console.log(snapshot.val());
		ref.off("value");

	    var obj_keys = Object.keys(snapshot.val());
        var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
        var selectedquestion = snapshot.val()[ran_key];
        currentQuestionID = ran_key;
        currentQuestion = selectedquestion;
		console.log(selectedquestion);
        callback(currentQuestion);
        //AnswerQuestion(ran_key, selectedquestion.answers, ["New Answer A", "New Answer B"]);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      ref.off("value");
    });
    //ref.off("value", originalCallback);
};

function AnswerQuestion(id, currentAnswers, newAnswers){
	var keyyyy = id+"/answers";
	var obb = {};
	var arr = newAnswers;
	if(currentAnswers != null){
	arr = currentAnswers.concat(newAnswers);
	}
	obb[keyyyy] = arr;
	usersRef.update(obb
	);
	/*var newPostRef = usersRef.child(id).push();
	newPostRef.set( {
	        from: name,
	        question: question,
	        answered: false,
	        checked: false//,
	        //answers: ["Answer A", "Anser B"]
	    });*/
}

//WORDPRESS
var wpClient = wordpress.createClient({
    url: "http://www.devmode.wedundee.com",
    username: "Gaz",
    password: "Z8n-ScW-akq-Jww"
});

var intents = new builder.IntentDialog();
global.address;

//NLP
var model = 'https://eastus2.api.cognitive.microsoft.com/luis/v2.0/apps/8fce766d-71b2-4dc6-9266-65a27c778841?subscription-key=3e3add150f3a4f9c870d810b653bfd30&timezoneOffset=0&verbose=true&q='
var recognizer = new builder.LuisRecognizer(model);
bot.recognizer(recognizer);

//SQL
/*var con = mysql.createConnection({
  host: config.sqlHost,
  user: config.sqlUser,
  password: config.sqlPword
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});*/

//PROMPT CONSTRUCTORS
// Create prompts
prompts.createConfirmDialog(bot, recognizer);
prompts.createTextDialog(bot, recognizer);


var updateCount = 0;
/////////DIALOGS/////////
/////
bot.on('conversationUpdate', function (message) {
	clearTimeout(idleTimer);
	console.log(updateCount++);
	if (message.membersAdded[0].name == "WeDundee") {
		console.log("Set address");
		global.address = message.address;
		bot.loadSession(message.address, function (err, session) {
			if (err)
				console.log("ERR: " + err);	
			if (session.userData.name) {
				bot.send(new builder.Message()
					.address(address)
					.text("Hello " + session.userData.name + ", it's so nice to see your face again."));
			} else {
				session.send("Hello, welcome to We Dundee.");
			}
		});
	} else
	{
		console.log("Set REAL address");
		global.address = message.address;
		//idleTimer = setTimeout(reactToIdle, idleTime);
	}	
});


reactToIdle = function () {
	var randum = dialogs.inactivity.getRandom();
	console.log("IDLE: " + randum);
	bot.beginDialog(global.address, '/inactive', randum);
}

bot.dialog('/inactive', [
	function (session, args) {
		bot.beginDialog(global.address, args);		
	}, function (session, args) {
		global.startTimer();
	}
]);

bot.dialog('/', [function (session, args, next) {	
	console.log("This is the ROOT");
	global.address = session.message.address;
	global.stopTimer();
	if (!session.userData.name) {
		session.send("We don't even know each other yet!");
		setTimeout(function () { session.beginDialog('/intro'); }, 3000);
	} else {
		console.log("ROOT ");
		var randum = dialogs.fallback.getRandom();
		session.beginDialog( randum, dialogs.fallback.getConfusion());
		
	}
}, function (session, args, next) {

	console.log("timer");
	global.startTimer();
}]);

bot.dialog('/forceIdle', function (session, args) {
	//session.beginDialog('/inactive/picture');
	global.address = session.message.address;
	console.log("Force idle");
	session.endDialog();
	reactToIdle();
}).triggerAction({ matches: /^inactive/ });

var doneIntro = false;
//Greeting
bot.dialog('/greeting', [function (session, args, next) {
	global.address = session.message.address;
		if (!session.userData.name) {
			session.beginDialog('/intro');
			
		} else {
			if (!doneIntro) {
				session.beginDialog('/confirmIdentity');
				doneIntro = true;
			} else
			{
				session.send(greets.getGreetings());
				global.startTimer();
				session.endDialog();
			}	
        }
	}
	
]
).triggerAction({ matches: 'greeting' });

	bot.dialog('/confirmIdentity', [function (session, args) {
		session.send("Welcome back " + session.userData.name + " it's nice to see your face again! Are you still " + session.userData.name + "?");
		prompts.beginConfirmDialog(session, { skip: false, unsureResponse: "You don't know if you're you? Are you " + session.userData.name + "??" });
	},
	function (session, args, next) {
		if (args.response == 1) {
			session.send("Lovely. It's good to have you back!");
			global.startTimer();
			//setTimeout(function () { session.beginDialog('/smallTalk'); }, 4000);
			session.endDialog();
		} else {
			session.send("My mistake, you looked like somebody else. This is awkward...")

			setTimeout(next, 3000);
		}
	},
	function (session, args, next) {
		session.send("Let's start over!");
		setTimeout(function () { session.beginDialog('/intro'); }, 3000);
	}]
)

//INTRO
bot.dialog('/intro',
	[
		function (session, args) {
		session.beginDialog('/profile');
		},
		function (session, results) {
			session.send('Hello %s, nice to meet you!', session.userData.name);
			setTimeout(function () { session.beginDialog('/location'); }, 3000);
		}, function (session, args) {
			console.log("end intro");
			session.dialogStack();
			session.endDialog();
		}
		
]
).triggerAction({ matches: 'greeting' });

//PROFILE
bot.dialog('/profile', [
    function (session, args) {
		builder.Prompts.text(session, 'Welcome to We Dundee, can I ask your name please? :)');
    },
    function (session, results) {
		session.userData.name = results.response;
        session.endDialog();
    }
]);

//SMALLTALK
bot.dialog('/smallTalk', [
	function (session, args) {
		//console.log(session.message.address);
		
		const dialogs = [
		//	'/userWeather',
			'/genericQuestion'
		]
		session.beginDialog(dialogs[Math.floor(Math.random() * dialogs.length)])
    }
]);

//IMG RESULTS
function callback(results) {
	console.log(results);
	var msg = new builder.Message().address(address);
    msg.text('Here you go!');
	msg.textLocale('en-US');
	msg.addAttachment({
		contentType: "image/jpeg",
		contentUrl: results[0].link,
		name: "Law"
	});
	bot.send(msg);

}
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
				session.beginDialog('/displayThought');
			} else if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "picture") {
				console.log("Getting picture");	
                session.beginDialog('/showPicture');
			} else if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "music") {
				console.log("Getting music");	
                session.beginDialog('/playMusic');
			}
		}
	}
]
).triggerAction({ matches: 'showMe' });

bot.dialog('/displayThought',
	[
		function (session, args) {
				session.send("Here's something someone wanted to see in the city...");
				console.log("Getting thought");
				wpClient.getPosts({post_type: 'thoughts', number:1, offset:Math.floor(Math.random() * 1000)},function (error, posts) {
				if (error) console.log(error);
				console.log("Found " + posts.length + " posts!");
				if (posts.length > 0) {
					console.log(posts[0]);
					setTimeout(function () { session.send( '"' + posts[0].content + '"') }, 3000);
				}
			});
	}
]
);

bot.dialog('/playMusic',
	[
		function (session, args, next) {
			var msg = new builder.Message().address(global.address);
			msg.text("Here's some music from Dundee. (You might need to click or tap the screen!)");
			msg.textLocale('en-US');
			msg.addAttachment({
				contentType: "audio/mpeg3",
				contentUrl: 'http://wedundeesite.azurewebsites.net/audio/laeto_01_dead_planets.mp3',
				name: "Laeto"
			});
			bot.send(msg);
			
			setTimeout(next, 5000);

		}, function (session, args, next) {
			session.send("Just type 'Stop music' if you've had enough!");
			session.endDialog();
		}
]
);


//GenericQuestion
bot.dialog('/genericQuestion', [
	function (session, args) {
		session.send(greets.getGenericQuestion());
		prompts.beginTextDialog(session);
			
	},
	function (session, args) {
		console.log("Response: " + args.text);
		if (args.text) {
			session.send(greets.getQuestionResponse());
		} else {
			session.send(greets.getUnsureResponse());
		}	
	}
]);


//Location
bot.dialog('/location',
	[
		function (session, args) {
			if (session.userData.dundonian) {
				console.log("Skipping location");
				session.endDialog();
				session.beginDialog('/genericQuestion');
			} else {
				//session.send("So... Are you a native Dundonian?");
				//prompts.beginConfirmDialog(session);
				session.send("So " + session.userData.name + ", are you living in Dundee now?");
				prompts.beginConfirmDialog(session);
			}	
		},
	/*	function (session, results) {
			session.userData.dundonian = results.response;
			session.send("And are you living in Dundee now?");
			prompts.beginConfirmDialog(session);
		},*/
		function (session, results) {
			session.userData.livingInDundee = results.response;
			if (session.userData.livingInDundee) {
				session.beginDialog('/location.permission');
			} else {
				session.send("Well then, feel free to ask me questions about the city and I'll try to answer them.");
				session.endDialog();
			}				
		/*	if (session.userData.dundonian && session.userData.livingInDundee) {
				session.send("Can't bear to leave?");
				session.beginDialog('/answerQuestion');
			} else if(session.userData.dundonian && !session.userData.livingInDundee) {
				session.send("Couldn't stand it any longer?");
				session.beginDialog('/askMemory');
			} else if(!session.userData.dundonian && session.userData.livingInDundee) {
				session.send("Welcome to Dundee!");
			} else if(!session.userData.dundonian && !session.userData.livingInDundee) {
				session.send("Well what brings you here?");
				session.beginDialog('/askQuestion');
			}*/
		}		
]
);


bot.dialog('/location.permission',[		
		function (session, args) {
				session.send("Can I ask you some questions?");
				prompts.beginConfirmDialog(session, {allowSkip: true});					
		}, 
		function (session, args) {
			if (args.response == 1) {
				session.beginDialog('/answerQuestion');
			} else {
				session.send("That’s ok, what would you like to ask me instead?");
				session.endDialog();
			}	
		},
		function (session, results) {
			console.log("end location/permission")
			session.endDialog();
		}
]
);


////////END DIALOGS///////



////////INTERRUPTS//////////
// Add help dialog
bot.dialog('help', function (session) {
	session.send("I'm a simple echo bot.");
	session.endDialog();
}).triggerAction({ matches: /^help/i });


// RESET
bot.dialog('RESET', function (session) {
		session.userData.name = null;
		session.userData.dundonian = null;
		session.userData.livingInDundee = null;
	session.send("RESETTING.");
		session.beginDialog('/');
}).triggerAction({ matches: /^RESET/ });

// ROOT
bot.dialog('ROOT', function (session) {
		session.beginDialog('/');
}).triggerAction({ matches: /^ROOT/ });

// PICTURE
bot.dialog('PICTURE', function (session) {
	session.send("Trying to send a picture...");
		session.send({
            text: "Here!",
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: "http://www.dundeepartnership.co.uk/sites/default/files/The%20Law_small%20%28crop%29.jpg",
                    name: "Law"
                }
            ]
        });
}).triggerAction({ matches: /^PICTURE/ });

//////END INTERRUPTS/////////


bot.dialog('/askQuestion', [
    function (session, args) {
		session.send("Ask away!");
		prompts.beginTextDialog(session);
    },
	function (session, args) {
		SaveQuestion(session.userData.name, args.text);
		session.send("I'll save that for later, once I have more information.");
		session.endDialog();
    }
]);

bot.dialog('/answerQuestion', [
	function (session, args) {
			session.send(greets.getPositiveResponse() + "! Okay, let's see here...");
			setTimeout(function () {
				GetBackendQuestion(function (quest) { session.beginDialog('/answerQuestion.quest', {questionData: quest}); });
				
			}, 3000); 
	}
]).triggerAction({ matches: /^ANSWER/ });

bot.dialog('/answerQuestion.quest', [
	function (session, args) {
		session.send(args.questionData.question);
		prompts.beginTextDialog(session, args.questionData.botResponse);
	},
	function (session, args) {
		console.log(args.text);
		if (args.response) {
			AnswerQuestion(currentQuestionID, currentQuestion.currentAnswers, [args.text]);
			if (Math.random > 1.4) {
				session.send(greets.getQuestionResponse());
			} else {
				session.send(args.botResponse);
			}	
		} else {
			session.send(greets.getUnsureResponse());
		}
		session.endDialog(); 
	}
]);
var currentQuestionID;
var currentQuestion;
bot.dialog('/askMemory', [
    function (session, args) {
		session.send("Do you have any fond memories of Dundee?");
		prompts.beginConfirmDialog(session);		
    },
	function (session, results) {
		if (results.response) {
			builder.Prompts.text(session, 'Why not share one?');
		}
		else {
			session.endDialog();
		}	
    }
]);