const config = require('./config.js')
module.exports = function () {
    
    var restify = require('restify');
    global.builder = require('botbuilder');

    // Get secrets from server environment
    var botConnectorOptions = {
        appId: config.appId,
        appPassword: config.appPassword
    };

    // Create bot
    var connector = new builder.ChatConnector(botConnectorOptions);
    global.bot = new builder.UniversalBot(connector);


    // Setup Restify Server
    var server = restify.createServer();

    // Handle Bot Framework messages
    server.post('/api/messages', connector.listen());

    server.listen(process.env.port || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });

    var admin = require("firebase-admin");
    var serviceAccount = require("./wedundeebot-firebase-adminsdk-ibkp7-c6ba8d1dd7.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://wedundeebot.firebaseio.com"
    });
    module.exports.db = db = admin.database();
}