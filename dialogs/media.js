imageSearch = require('node-google-image-search');
const path = "http://storage.googleapis.com/wedundeebot.appspot.com/subfolder%2Fimages%2F"

var imgArray;
var imgRef;

getPic = function () {    
    var selectedItem = imgArray[Math.floor(Math.random() * imgArray.length)];
    return selectedItem;
}
sortArray = function (obj) {    
    var newArray = [];
    var obj_keys = Object.keys(obj);
    obj_keys.forEach(function (item) {
        if (obj[item].checked == true) {
            newArray.push(obj[item]);
        }
    });
    return newArray;
}
module.exports.init = function () {
    var imgRef = db.ref("server/saving-data/images");
    imgRef.once("value", function (snapshot) {
        if (snapshot.val() != null) {
            imgArray = sortArray(snapshot.val());
            if (imgArray.length < 1) {
                console.log("NAE IMAGES");
            }
        }    
    });
    
    bot.dialog('/showPicture', [function (session, args) {
        
        session.send("Hold on a second while I grab one for you...");
        var imgInfo = getPic();
        var descTxt = (imgInfo.description != null && imgInfo.description.length > 0) ? "It's '" + imgInfo.description + "'":"";
        var txt = (imgInfo.botImage == null || imgInfo.botImage == false) ? "Here's one taken by " + imgInfo.username + "! " + descTxt: "Here’s a picture I took!\n " + descTxt;
        setTimeout(function (session) {            
            var results = imageSearch(
                'Dundee',
                function (results) {
                    console.log("RES");
                    console.log(session);
                    var msg = new builder.Message().address(session.message.address);
                    msg.text(txt);
                    msg.textLocale('en-US');
                    msg.addAttachment({
                        contentType: "image/jpeg",
                        contentUrl: imgInfo.link,
                        name: "Law"
                    });
                    bot.send(msg);
                    session.beginDialog("/displayPicture");
                }, 0, 1
                );
        }, 5000, session);	                  
        },
        function (session, args) {
            setTimeout(function () {
                session.endDialog();
            }, 5000);
        }
    ]
    );  
     
    bot.dialog('/media/requestPicture', [
        function (session, args) {            
            var results = imageSearch(
                'Dundee',
                function (results) {
                    console.log(results);
                    var msg = new builder.Message().address(session.message.address);
                    msg.textLocale('en-US');
                    msg.addAttachment({
                        contentType: "image/jpeg",
                        contentUrl: getPic(),
                        name: "Law"
                    });
                    bot.send(msg);
                    session.beginDialog("/displayPicture");
                }, 0, 1
                );
        },
        function (session, args, next) {
                session.endDialog();
        }
    ]
    ); 
    bot.dialog('/media/emailPic', [
        function (session, args) {        
            session.send("Here's my email address, write it down and send my a picture sometime!");  
            session.endDialog();
        }
    ]
    ); 
    


    bot.dialog('/displayPicture', function (session, args, next) {        
            session.endDialog();
        }    
    ); 
}