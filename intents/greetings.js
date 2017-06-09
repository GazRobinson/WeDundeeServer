const random = array => {return array[Mathf.floor(Math.random() * array.length)]}


exports.getGreetings = () => {
	const answers = [
	'Hello',
	'Bonjour',
		'Hey',
		'Hiya :)',
		'Yo',
		'Hello',
	'Hello!']
	return answers[Math.floor(Math.random() * answers.length)]
}

exports.getPositiveResponse = function (session, options) {
    var answers = [
		'Awesome',
		'Radical',
		'Cool',
		'Great',
		'Wicked',
		'Sweet',
	]
	return answers[Math.floor(Math.random() * answers.length)]
}


/*const getNegativeResponse = () => {
	const answers = [
		'Aww',
		'Okay...',
		'Sure',
	]
	return answers[Math.floor(Math.random() * answers.length)]
}*/

exports.getGenericQuestion = () => {
	const questions = [
		'How are you today?',
		'How has your week been?',
		"What's your favourite flavour of Ice Cream?",
		"What's your favourite film?",
		"What sort of music do you like?",
		"If you had one wish, what would it be?"
	]
	return questions[Math.floor(Math.random() * questions.length)]
}

exports.getBackendQuestion = () => {
	const questions = [
		"Where's a good coffee shop in Dundee?",
		"What's the best restaurant in the city?",
		"Do you know any good secrets about the city?",
		"What sight does someone new to the city HAVE to see?",
		"Do you know anything unusual about Dundee?",
		"Heard any good rumours about the city?",
		"Do you know anyone famous from Dundee?"
	]
	return questions[Math.floor(Math.random() * questions.length)]
}

exports.getQuestionResponse = () => {
	const answers = [
		"I'll be sure to let the world know",
		"Thanks :)  I'll remember this for the future!"
	]
	return answers[Math.floor(Math.random() * answers.length)]
}
exports.getUnsureResponse = () => {
	const answers = [
		"Nevermind!",
		"Don't know? Okay, just thought I'd ask!",
		"Don't worry about it! :)",
		"Thanks anyway! :)"
	]
	return answers[Math.floor(Math.random() * answers.length)]
}