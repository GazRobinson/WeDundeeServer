require('dotenv').config()
const defaultDialog = require('./dialogs/default.js')
var restify = require('restify');
var builder = require('botbuilder');
const config = require('./config.js')
var greets = require('./intents/greetings.js');
var prompts = require('./dialogs/prompts.js');
var mysql = require('mysql');
var imageSearch = require('node-google-image-search');

console.log(process.env.CSE_ID);
// Get secrets from server environment
var botConnectorOptions = { 
    appId: config.appId, 
    appPassword: config.appPassword
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();
var address;

//NLP
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8fce766d-71b2-4dc6-9266-65a27c778841?subscription-key=d51418e801cc4453884758a0698e4a28&verbose=true&timezoneOffset=0&q='
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

/////////DIALOGS/////////
/////
//WEATHER
bot.dialog('weather',
	[
		function (session, args) {
			console.log(args.entities);
			if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city') != null) {
				if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city').entity != 'dundee') {
					session.send("Why do you want to know about that place! :'(");
					session.endDialog();
				} else {
					session.send("What a nice day it is again, isn't it?");
					prompts.beginConfirmDialog(session);
				}
			} else
			{
				session.send("What a nice day it is again, isn't it?");
					prompts.beginConfirmDialog(session);
			}	
		},
		function (session, args) {
			if (args.response == true) {
				session.send("I knew it!");
				
			} else if (args.response == false) 			{
				session.send("Doh!");
			} else {
				session.send(prompts.getApology());
			}
		},		
	]
);

bot.dialog('/', intents);

//Greeting
bot.dialog('/greeting', function (session, args, next) {
		if (!session.userData.name) {
			session.beginDialog('/intro', 'Hi there!');
			
        } else {
			
			session.sendTyping();
			setTimeout(function () { session.beginDialog('/smallTalk', ("Hi again " + session.userData.name)); }, 3000);
        }
    }
).triggerAction({ matches: 'greeting' });


//INTRO
bot.dialog('/intro',
	[
		function (session, args) {
		session.beginDialog('/profile', "Hi there!");
		},
		function (session, results) {
			session.send('Hello %s, nice to meet you!', session.userData.name);
		session.beginDialog('/smallTalk');
    }
]
).triggerAction({ matches: 'greeting' });

//PROFILE
bot.dialog('/profile', [
    function (session, args) {
		builder.Prompts.text(session, (args ? (args +" ") : ("") )+ 'What is your name?');
    },
    function (session, results) {
		session.userData.name = results.response;
        session.endDialog();
    }
]);

//SMALLTALK
bot.dialog('/smallTalk', [
	function (session, args) {
		session.send(args);
		const dialogs = [
		//	'/location',
			'/userWeather',
			'/askUserAQuestion',
			'/genericQuestion'
		]
		session.beginDialog(dialogs[Math.floor(Math.random() * dialogs.length)])
    }
]);

//IMG RESULTS
function callback(results) {
	console.log(results);
	var msg = new builder.Message().address(address);
    msg.text('Hello, this is a notification');
	msg.textLocale('en-US');
	msg.addAttachment({
		contentType: "image/jpeg",
		contentUrl: results[0].link,
		name: "Law"
	});
	bot.send(msg);
	 

}

//ShowMe
bot.dialog('/show',
	[
		function (session, args) {
			session.send("Hold on a second while I grab one for you...");
    	address = session.message.address;
//setTimeout(function () { session.beginDialog('/smallTalk', ("Hi again " + session.userData.name)); }, 3000);
			setTimeout(function () { var results = imageSearch('Dundee', callback, 0, 1); }, 2000);


		}
]
).triggerAction({ matches: 'showMe' });

/*bot.dialog('/doShow',
	[
		function (session, args) {
 
	console.log("Do Show");
		session.send({
            text: "Here!",
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: args,
                    name: "Law"
                }
            ]
        });

		}
]
).triggerAction({ matches: 'showMe' });*/

//BUSINESS
bot.dialog('/business', [
	function (session, args) {
		const dialogs = [
			'/askUserAQuestion'
		]
		session.beginDialog(dialogs[Math.floor(Math.random() * dialogs.length)])
    }
]).triggerAction({ matches: /^BUSINESS/i });

//UserWeather
bot.dialog('/userWeather', [
	function (session, args) {
		session.send('The weather is lovely in Dundee today!');
    }
]);

//GenericQuestion
bot.dialog('/genericQuestion', [
	function (session, args) {
		session.send(greets.getGenericQuestion());
		prompts.beginTextDialog(session);
			
	},
	function (session, args) {
		console.log(args.text);
		if (args.text) {
			session.send(greets.getQuestionResponse);
		} else {
			session.send(greets.getUnsureResponse());
		}	
	}
]);

//askUserAQuestion
bot.dialog('/askUserAQuestion', [
	function (session, args) {
		session.send("Can I ask you a question?");
		prompts.beginConfirmDialog(session);
			
	},
	function (session, args) {
		if (args.response) {
			session.send(greets.getPositiveResponse() + "! Okay, let's see here...");
			session.send(greets.getBackendQuestion());
			prompts.beginTextDialog(session);
		} else {
			session.send(greets.getUnsureResponse());
		}	
	},
	function (session, args) {
		console.log(args.text);
		if (args.response) {
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
			session.send("So... Are you a native Dundonian?");
			prompts.beginConfirmDialog(session);
		},
		function (session, results) {
			session.userData.dundonian = results.response;
			session.send("And are you living in Dundee now?");
			prompts.beginConfirmDialog(session);
		},
		function (session, results) {
			session.userData.livingInDundee = results.response;

			if (session.userData.dundonian && session.userData.livingInDundee) {
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
			}
		}
		
]
);

//TEST
bot.dialog('fart', function (session, args) {
    session.send("FART");
});

////////END DIALOGS///////



////////INTERRUPTS//////////
// Add help dialog
bot.dialog('help', function (session) {
	session.send("I'm a simple echo bot.");
	session.endDialog();
}).triggerAction({ matches: /^help/i });

// WeatherTest
bot.dialog('weatherTest', function (session, args) {
	var intent = args.intent;
	session.send("YESSSSSSSS");
		session.beginDialog('weather', intent);
}).triggerAction({ matches: 'checkWeather' });

// RESET
bot.dialog('RESET', function (session) {
		session.userData = null;
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
		builder.Prompts.confirm(session, 'Do you have a question about Dundee?');
    },
	function (session, results) {
		if (results.response) {
			builder.Prompts.text(session, 'Ask away!');
		}
		else {
			session.endDialog();
		}	
    }
]);

bot.dialog('/answerQuestion', [
    function (session, args) {
		builder.Prompts.confirm(session, 'Can you answer a question about Dundee for me?');
    },
	function (session, results) {
		if (results.response) {
			session.send("Okay! Let's see... The question is:");
			builder.Prompts.text(session, 'Who loves orange soda?');
		}
		else {
			session.endDialog();
		}	
    }
]);

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
// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});