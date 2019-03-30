const robots={
	inputt: require('./robot/input'),
	text: require('./robot/text.js'),
	state: require('./robot/state')
}

async function start(){

	robots.inputt();
	await robots.text();//inicializanddo o robo de texto

	const content = robots.state.load();
	console.dir(content, { deph: null });
}

start();