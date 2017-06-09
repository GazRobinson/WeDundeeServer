module.exports = function () {
    bot.dialog('/stopMusic',
	[
		function (session, args) {
			var msg = new builder.Message().address(global.address);
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
).triggerAction({ matches: /^Stop Music/i });
}