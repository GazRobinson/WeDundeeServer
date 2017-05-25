require('dotenv').config()
const defaultDialog = require('./dialogs/default.js')
var restify = require('restify');
var builder = require('botbuilder');
const config = require('./config.js')
var greets = require('./intents/greetings.js');
var prompts = require('./dialogs/prompts.js');
var mysql = require('mysql');
var imageSearch = require('node-google-image-search');
var wordpress = require('wordpress');

console.log(process.env.CSE_ID);
// Get secrets from server environment
var botConnectorOptions = { 
    appId: config.appId, 
    appPassword: config.appPassword
};

//WORDPRESS
var wpClient = wordpress.createClient({
    url: "http://www.devmode.wedundee.com",
    username: "Gaz",
    password: "Z8n-ScW-akq-Jww"
});

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
bot.on('conversationUpdate', function (message) {
	console.log(message.address);
	if (message.membersAdded[0].name=="WeDundee") {
		address = message.address;
		bot.loadSession(message.address, function (err, session) {
			if (err)
				console.log("ERR: " + err);	
			if (session.userData.name) {
				bot.send(new builder.Message()
					.address(address)
					.text("Hello " + session.userData.name + ", it's so nice to see your face again."));
			} else {
				session.send("Hello there, it's so nice to see your face");
			}
		});
	}
});


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

bot.dialog('/', function (session, args, next) {
	console.log("This is the ROOT");
	if (!session.userData.name) {
		session.send("We don't even know each other yet!");
		setTimeout(function () { session.beginDialog('/intro'); }, 3000);
	} else {
		session.beginDialog("/smallTalk");
	}
});

//Greeting
bot.dialog('/greeting', function (session, args, next) {
		if (!session.userData.name) {
			session.beginDialog('/intro', 'Hi there!');
			
        } else {
			session.send("Hi again " + session.userData.name);
			//session.sendTyping();
			
			setTimeout(function () { session.beginDialog('/smallTalk'); }, 3000);
			session.endDialog();
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
			setTimeout(function () { session.beginDialog('/smallTalk'); }, 3000);
    }
]
).triggerAction({ matches: 'greeting' });

//PROFILE
bot.dialog('/profile', [
    function (session, args) {
		builder.Prompts.text(session, 'What is your name?');
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
			'/location',
		//	'/userWeather',
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
bot.dialog('/show',
	[
		function (session, args) {

    		address = session.message.address;

				console.log(args.intent);
				if (args.intent.entities != null) {
					console.log(builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing'));
				console.log(args.intent.entities[0].resolution);
				if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "thought") {
				
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
				} else if (builder.EntityRecognizer.findEntity(args.intent.entities, 'botThing').resolution.values[0] == "picture") {
				console.log("Getting picture");	
			session.send("Hold on a second while I grab one for you...");
					setTimeout(function () { var results = imageSearch('Dundee', callback, 0, 1); }, 3000);	
				}
			}
		}
]
).triggerAction({ matches: 'showMe' });

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
		console.log("Response: " + args.text);
		if (args.text) {
			session.send(greets.getQuestionResponse());
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
			setTimeout(function () {
				session.send(greets.getBackendQuestion());
				prompts.beginTextDialog(session);
			}, 3000);
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
			if (session.userData.dundonian) {
				console.log("Skipping location");
				session.endDialog();
				session.beginDialog('/genericQuestion');
			} else {
				session.send("So... Are you a native Dundonian?");
				prompts.beginConfirmDialog(session);
			}	
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
	function (session, args) {
		if (args.response) {
			session.send(greets.getPositiveResponse() + "! Okay, let's see here...");
			setTimeout(function () {
				session.send(greets.getBackendQuestion());
				prompts.beginTextDialog(session);
			}, 3000);
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