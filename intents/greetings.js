const random = array => {return array[Mathf.floor(Math.random() * array.length)]}


const getGreetings = (pie) => {
	const answers = [
	'Hello',
	'Bonjour',
	'Hi',]
	return answers[Math.floor(Math.random() * answers.length)]
}

module.exports = getGreetings