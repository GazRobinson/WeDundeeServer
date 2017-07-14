const config = require('./config.js')
require('./connectorSetup.js')();
require('dotenv').config()
global.questionsLoaded = false;
global.prompts = require('./dialogs/prompts.js');
const defaultDialog = require('./dialogs/default.js')
var dialogs = {};
var greets = require('./intents/greetings.js');
dialogs.inactivity = require('./dialogs/inactivity.js');
dialogs.inactivity.init();
dialogs.fallback = require('./dialogs/fallback.js');
dialogs.fallback.init();
require('./dialogs/interrupts.js')();
dialogs.media = require('./dialogs/media.js');
dialogs.media.init();
dialogs.weather = require('./dialogs/weather.js');
dialogs.weather.init();
dialogs.beginning = require('./dialogs/beginning.js');
dialogs.beginning.init();
dialogs.wrapUp = require('./dialogs/wrapUp.js');
dialogs.wrapUp.init();
dialogs.intro = require('./dialogs/intro.js');
dialogs.intro.init();
dialogs.refusal = require('./dialogs/refusal.js');
dialogs.refusal.init();

require('./dialogs/intentManager.js')();
require('./intents/questionFacilities.js')();
var mysql = require('mysql');
var wordpress = require('wordpress');
var admin = require("firebase-admin");

var serviceAccount = require("./wedundeebot-firebase-adminsdk-ibkp7-c6ba8d1dd7.json");
var idleTimer;
const idleTime = 10000;
global.stopTimer = function () {
	clearTimeout(idleTimer);
}
global.startTimer = function () {
	clearTimeout(idleTimer);	
//	idleTimer = setTimeout(reactToIdle, idleTime);
}

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://wedundeebot.firebaseio.com"
});

// Get a database reference to our blog
global.SendMessage = function (session, message) {
	console.log("Send messsage: " + session.userData.name);
	
	session.conversationData.messageStack.push(message);
	session.send(message);
}
global.WaitForResponse = function (session, functionCall, t) {	
	session.dialogData.responded = false;
	setTimeout(function (responded)
	{
		if (!responded) {
			functionCall();
		}
	}, t, session.dialogData.responded);
}
module.exports.db = db = admin.database();
var ref = db.ref("server/saving-data/questions");

dialogs.questions = require('./dialogs/questions.js');
dialogs.questions.init();

function SaveQuestion(name, question) {
	var newPostRef = ref.push();
	newPostRef.set({
		from: name,
		question: question,
		answered: false,
		checked: false//,
		//answers: ["Answer A", "Anser B"]
	});
};

function GetBackendQuestion(callback) {
	ref.on("value", function (snapshot) {
		console.log(snapshot.val());
		ref.off("value");

		var obj_keys = Object.keys(snapshot.val());
		var ran_key = obj_keys[Math.floor(Math.random() * obj_keys.length)];
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

function AnswerQuestion(id, currentAnswers, newAnswers) {
	var keyyyy = id + "/answers";
	var obb = {};
	var arr = newAnswers;
	if (currentAnswers != null) {
		arr = currentAnswers.concat(newAnswers);
	}
	obb[keyyyy] = arr;
	ref.update(obb
	);
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
bot.set('persistConversationData', true);

//PROMPT CONSTRUCTORS
// Create prompts
prompts.createConfirmDialog(bot, recognizer);
prompts.createTextDialog(bot, recognizer);
prompts.createMultiDialog(bot, recognizer);


var updateCount = 0;
/////////DIALOGS/////////
/////
bot.on('conversationUpdate', function (message) {
	if (message.membersAdded[0].name == "WeDundee") {
		console.log("Set address");
	//
				console.log(message.address);
		bot.loadSession(message.address, function (err, session) {
			
			if (err)
				console.log("ERR: " + err);
			if (session.userData.name) {
				bot.send(new builder.Message()
					.address(address)
					.text("Hello " + session.userData.name + ", it's so nice to see your face again."));
			} else {
				var summary = dialogs.weather.GetCurrentWeather().summary.toLowerCase();
				session.beginDialog('/intro/start');
			}
		});
	} else {
		var add = message.address;
		add = {
			id: add.conversation.id + '|0000002',
			channelId: 'directline',
			user: { id: message.membersAdded[0].id },
			conversation: { id: add.conversation.id },
			bot: { id: 'WeDundee@81U4UWmTR8I', name: 'WeDundee' },
			serviceUrl: 'https://directline.botframework.com/'
		};
		bot.loadSession(add, function (err, session) {

			if (!session.conversationData.init) {
				console.log("Set REAL address");
				console.log(add);
				Init(session);

				console.log(session.userData);
				if (err)
					console.log("ERR: " + err);
				session.conversationData.address = add;
				/*setTimeout(function () {
					userTick(session);
				}, 5000);*/
			}
				console.log("msg sent");
				session.conversationData.lastMessageTime = Date.now();
		});
	}
});

function userTick(session) {
	if (Date.now() - session.conversationData.lastMessageTime > idleTime) {
		//IDLETRIGGER
	}
	setTimeout(function () {
		userTick(session);
	}, 5000)
}

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
var timeout;
//ROOT
bot.dialog('/', [	
	function (session, args, next) {	
		if (!session.userData.name) {
			if (!args || !args.greeting) {
				session.beginDialog("/root/introductions")
			} else {
				session.beginDialog('/intro');				
			}	
		} else {
			if (!session.conversationData.hello) {
				session.beginDialog('/confirmIdentity');
			} else {
				if (!session.userData.knowsAboutQuestions || !session.userData.knowsWhatsUp || session.userData.questionCount < 1) {
					session.beginDialog('/beginning/intro');
				} else {
					var randum = dialogs.fallback.getRandom();
					session.beginDialog(randum);
				}	
			}	
		}		
	}
]);

bot.dialog('/root/introductions', [	
	function (session, args, next) {	
		session.send("I feel like I hardly know you yet. Why don't we do some introductions?");

		prompts.beginConfirmDialog(session);		
	},
	function (session, args, next) {
		console.log(args);
		if (args.response == 1) {
			session.beginDialog('/intro');
		} else {
			session.beginDialog("/refusal/introduction");
		}
	}
]);

function check(val) {
	console.log(val);
}

var doneIntro = false;

global.timeDict = {};

global.WaitForInput = function(session, time, func) {
	timeDict[session.userData.name] = setTimeout(func, time);        
}

bot.dialog('/confirmIdentity', [
	function (session, args) {
		ResetForSession(session);
		console.log("Confirm");
		console.log(session.message.address);
		session.send("Welcome back " + session.userData.name + " it's nice to see your face again! Are you still " + session.userData.name + "?");
		prompts.beginConfirmDialog(session, {
			skip: false,
			questionText: "Welcome back " + session.userData.name + " it's nice to see your face again! Are you still " + session.userData.name + "?",
			unsureResponse: "You don't know if you're you? Are you " + session.userData.name + "??"
		});
	},
	function (session, args, next) {
		if (args.response == 1) {
			session.send("Lovely. It's good to have you back!");
			session.conversationData.hello = true;
			//global.startTimer();
			session.endDialog();
			setTimeout(function () { session.beginDialog('/beginning/intro'); }, 4000);
				
		} else {
			session.send("My mistake, you looked like somebody else. This is awkward...")

			setTimeout(next, 3000);
		}
	},
	function (session, args, next) {
		session.send("Let's start over!");
		setTimeout(function () { session.beginDialog('/intro'); }, 3000);
	}
]
);

 //INTRO
    bot.dialog('/intro',
        [
            function (session, args) {
                session.beginDialog('/profile');
            },
            function (session, results, next) {
                if (session.userData.name.includes(" ")) {
                    session.beginDialog("/intro/confirmName");
                } else {
                    next();
                }
            },
			function (session, results, next) {
				
			session.conversationData.hello = true;
                session.send('Hello %s, nice to meet you!', session.userData.name);
                //setTimeout(function () { session.beginDialog('/location'); }, 3000);
                setTimeout(function () { session.beginDialog('/beginning/intro'); }, 5000);
            }, function (session, args) {
                console.log("end intro");
                session.endDialog();
            }

        ]
    );

bot.dialog('/intro/confirmName',
	[
		//TODO: better handling
		function (session, args) {
			var split = session.userData.name.split(' ');
			session.send("Can I just call you " + split[0] + "?");
			prompts.beginConfirmDialog(session);
		},
		function (session, args, next) {
			if (args.response == 1) {
				session.userData.name = session.userData.name.split(' ')[0];
				session.endDialog();
			} else {
				session.send("Well how about " + session.userData.name.split(' ')[1] + "?");
				prompts.beginConfirmDialog(session);
			}
		},
		function (session, args, next) {
			if (args.response == 1) {
				session.userData.name = session.userData.name.split(' ')[1];
				session.endDialog();
			} else {
				session.send("Well what shall I call you?");
				prompts.beginTextDialog(session);
			}
		},
		function (session, args, next) {
			if (args.text) {
				session.userData.name = args.text;
			} 
			session.endDialog();
		}
	]
)
//PROFILE
bot.dialog('/profile', [
	function (session, args) {
		CW = dialogs.weather.GetCurrentWeather();
		builder.Prompts.text(session, 'Welcome to We Dundee, where it is currently '+ CW.temperature + ' degrees and ' + CW.summary.toLowerCase() + '. Can I ask your name please? :)');
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

bot.dialog('/displayThought',
	[
		function (session, args) {
			session.send("Here's something someone wanted to see in the city...");
			console.log("Getting thought");
			wpClient.getPosts({ post_type: 'thoughts', number: 1, offset: Math.floor(Math.random() * 1000) }, function (error, posts) {
				if (error) console.log(error);
				console.log("Found " + posts.length + " posts!");
				if (posts.length > 0) {
					console.log(posts[0]);
					if (posts[0].content.length > 200) {
						setTimeout(function () { session.send("Wow... It's a long one!") }, 4000);
						setTimeout(function () { session.send('"' + posts[0].content + '"') }, 9000);
						
					} else {
						setTimeout(function () { session.send('"' + posts[0].content + '"') }, 3000);
					}	
				}
				session.endDialog();
			});
		}
	]
);

bot.dialog('/playMusic',
	[
		function (session, args, next) {
			var msg = new builder.Message().address(session.message.address);
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

bot.dialog('/otherSite',
	[
		function (session, args, next) {
			var msg = new builder.Message().address(session.message.address);
			msg.text("Taking you to an external site");
			msg.textLocale('en-US');
			msg.addAttachment({
				contentType: "web/link",
				contentUrl: 'http://www.dca.org.uk',
				name: "DCA"
			});
			bot.send(msg);

			setTimeout(next, 5000);

		}, function (session, args, next) {
			session.send("See you soon!");
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


bot.dialog('/location.permission', [
	function (session, args) {
		session.send("Can I ask you some questions?");
		prompts.beginConfirmDialog(session, { allowSkip: true });
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



bot.dialog('/askQuestion', [
	function (session, args) {
		session.send("Ask away!");
		prompts.beginTextDialog(session);
	},
	function (session, args) {
		SaveQuestion(session.userData.name, args.text);
		session.send("I'll save that one for later. Once I have more information I'll get back to you!");
		session.endDialog();
	}
]);

bot.dialog('/answerQuestion', [
	function (session, args) {
		session.send(greets.getPositiveResponse() + "! Heads up! These are unmoderated right now so there might be a dev message!");
		setTimeout(function () {
			GetBackendQuestion(function (quest) { session.beginDialog('/answerQuestion.quest', { questionData: quest }); });

		}, 7000);
	}
]);
//TODO: Remove
const secretss = [
	"Rockstar North, makers of Grand Theft Auto, was founded in Dundee",
	"The inventor of adhesive postage stamps, James Chalmers, was born in Dundee",
	"The first radio broadcast was sent from Dundee",
	"The Law  hill is an extinct volcanic plug",
	"The Law has a disused rail tunnel running through it",
	"we have more sunshine hours than any other city in Scotland"
]
bot.dialog('/loadSecret', [
	function (session, args) {
		session.send(secretss[Math.floor(Math.random()*secretss.length)]);
		setTimeout(function () {
			session.endDialog();
		}, 3000);
	}
]);

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

function ResetForSession(session) {
	session.userData.questionCount = 0;
}
global.ResetData = function (session) {
	
	session.conversationData.hello = false;
	session.conversationData.messageStack = [];
	session.conversationData.test = "PFDSFDF";
	session.userData.questionCount = 0;
	session.userData.count = 0;
		session.userData.name = null;
		session.userData.dundonian = {};
		session.userData.livingInDundee = {};
		session.userData.usedQuestions = [];
		session.userData.knowsWhatsUp = false;
		session.userData.knowsAboutQuestions = false;
		session.userData.askedAQuestion = false;
        session.userData.questionCount = 0;
}
function Init(session) {
	console.log("init");
		console.log(session.message.address);
	session.conversationData.init = true;
	session.conversationData.hello = false;
	session.conversationData.messageStack = [];
	session.conversationData.test = "PFDSFDF";
	session.userData.questionCount = 0;
	session.userData.count = 0;
	session.userData.finishedQuestions = false;
	if (!session.userData.name) {
		global.ResetData();
	}
	session.save();
	console.log("end init");
}