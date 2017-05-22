//const rxjs = require('rxjs') //required by directLine.js
const directLine = require('botframework-directlinejs')
const ConnectionStatus = require('botframework-directlinejs')

var dLine = new directLine.DirectLine({
    secret: '81U4UWmTR8I.cwA.NfI.AmDtRGKElWU9OINAYy_OIfb3U6Dd2GRWb7VNPiEYHzk'
});
dLine.connectionStatus$
.subscribe(connectionStatus => {
    switch(connectionStatus) {
        case ConnectionStatus.Uninitialized:    // the status when the DirectLine object is first created/constructed
            console.log("START")
            break;
        case ConnectionStatus.Connecting:       // currently trying to connect to the conversation
         console.log("connecting")
            break;    
        case ConnectionStatus.Online:           // successfully connected to the converstaion. Connection is healthy so far as we know.
         console.log("online")
            break;
        case ConnectionStatus.ExpiredToken:     // last operation errored out with an expired token. Your app should supply a new one.
        console.log("expired")
            break;
        case ConnectionStatus.FailedToConnect:  // the initial attempt to connect to the conversation failed. No recovery possible.
        console.log("failed")
            break;
        case ConnectionStatus.Ended:            // the bot ended the conversation
        console.log("ended")
            break;    
    }
    });

dLine.postActivity({
    from: { id: 'myUserId', name: 'myUserName' }, // required (from.name is optional)
    type: 'message',
    text: 'a message for you, Rudy'
}).subscribe(
    id => console.log("Posted activity, assigned ID ", id),
    error => console.log("Error posting activity", error)
);



console.log(dLine.secret);