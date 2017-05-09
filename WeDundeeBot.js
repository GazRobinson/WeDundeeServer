const getGreetings = require('./intents/greetings.js')
const defaultDialog = require('./dialogs/default.js')
const config = require('./config.js')
const restify = require('restify')
const builder = require('botbuilder')
var prompts = require('./dialogs/prompts.js');
const recast = require('recastai')
const recastClient = new recast.request(config.recast, 'en')

var messageCount = 0;

var sessionData = {
	bacon : "This is a test"
}

// Connection to Microsoft Bot Framework
const connector = new builder.ChatConnector({
  appId: config.appId,
  appPassword: config.appPassword,
})

const bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

//NLP
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8fce766d-71b2-4dc6-9266-65a27c778841?subscription-key=d51418e801cc4453884758a0698e4a28&verbose=true&timezoneOffset=0&q='
var recognizer = new builder.LuisRecognizer(model);
bot.recognizer(recognizer);

const INTENTS = {
greetings: getGreetings

}

//PROMPT CONSTRUCTORS
// Create prompts
prompts.create(bot, recognizer);

/////////DIALOGS/////////
/////
//WEATHER
bot.dialog('weather',
	[
		function (session, args) {
			console.log(builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city'));
			if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city').entity != 'dundee') {
				session.send("Why do you want to know about that place! :'(");
				session.endDialog();
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
		const dialogs = [
			'/location',
			'/userWeather',
		]
		session.beginDialog(dialogs[Math.floor(Math.random() * dialogs.length)])
    }
]);

//UserWeather
bot.dialog('/userWeather', [
	function (session, args) {
		session.send('The weather is lovely in Dundee today!');
    }
]);

//Location
bot.dialog('/location',
	[
		function (session, args) {
			const str = ("So "+ session.userData.name + ", are you a native Dundonian?");
			builder.Prompts.confirm(session, str);
		},
		function (session, results) {
			session.userData.dundonian = results.response;
			builder.Prompts.confirm(session, 'And are you living in Dundee now?');
		},
		function (session, results) {
			session.userData.livingInDundee = results.response;

			if (session.userData.dundonian && session.userData.livingInDundee) {
				session.send("Can't bear to leave?");
				session.beginDialog('/answerQuestion');
			} else if(session.userData.dundonian && !session.userData.livingInDundee) {
				session.send("Couldn't stand it any longer?");
				session.beginDialog('/askMemory');
				session.beginDialog('/answerQuestion');
			} else if(!session.userData.dundonian && session.userData.livingInDundee) {
				session.send("Welcome to Dundee!");
			} else if(!session.userData.dundonian && !session.userData.livingInDundee) {
				session.send("Well what brings you here?");
				session.beginDialog('/askQuestion');
			}
			session.endDialog();
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

//////END INTERRUPTS/////////


intents.onDefault([
	function (session, args, next) {
		if (!session.userData.name) {
			session.beginDialog('/intro', 'Hi there!');
			
        } else {
			session.send(['NO RESPONSE']);
        }
    }
]);
intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile', "Oh, sorry!");
    },
    function (session, results) {
        session.send('Ok... %s it is! Sorry for the confusion.', session.userData.name);
    }
]);

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
		builder.Prompts.confirm(session, 'Do you have any fond memories of Dundee?');
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

// Server Init
const server = restify.createServer()
server.listen(3978)
server.post('/api/messages', connector.listen())

module.exports = sessionData

// Event when Message received
/*bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello again %s!', session.userData.name);
    }
]*/
	/*(session) => {
  recastClient.analyseText(session.message.text)
  .then(res => {const intent = res.intent()
  	if(intent){
  		session.userData.bacon = session.message.text
  		var returnString = INTENTS[intent.slug]("LOLL")
  		session.send(returnString)
  	}*/
	/*if(intent.slug == 'greetings'){
		session.send(getGreetings())
	} else{
		session.send("I don't understand yet")
	}*/
  /*})
  .catch(() => session.send('u wot m8?'))
})*/
//)	