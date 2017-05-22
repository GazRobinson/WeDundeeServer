var restify = require('restify');
var builder = require('botbuilder');
const config = require('./config.js')
var greets = require('./intents/greetings.js');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: config.appId, 
    appPassword: config.appPassword
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    
    //respond with user's message
    session.send(greets.getGreetings() + " You said " + session.message.text);
});

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});