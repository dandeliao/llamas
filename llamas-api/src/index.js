const express = require('express');
const cors = require('cors');
const { oneRound, getWorldData, stopSimulation } = require('./engine/simulateWorld');
const { randomGround, randomLlamas } = require("./engine/createWorld");
const _ = require('lodash');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// ---
// simulation

function unbrainLlamas(llamas) {
	
	let zombieLlamas = [];

	for(let i = 0; i < llamas.length; i++) {
		let llama = _.cloneDeep(llamas[i]);
		delete llama.brain;
		zombieLlamas.push(llama);
	}

	return zombieLlamas;

}

function runSimulation(initialGround, initialLlamas, rounds) {
	
	console.log('Simulation has started.');

	let ground = _.cloneDeep(initialGround);
	let llamas = _.cloneDeep(initialLlamas);
	
	let newWorld;
	let timeline = [{'ground': ground, 'llamas': llamas}];
	
	for (let r = 0; r < rounds; r++) {
		console.log('--- round', r);
		newWorld = oneRound(ground, llamas);
		ground = _.cloneDeep(newWorld.ground);
		llamas = _.cloneDeep(newWorld.llamas);

		newWorld.llamas = unbrainLlamas(newWorld.llamas);
		//timeline.push(_.cloneDeep(newWorld));
		timeline.push(newWorld);

	}
	
	console.log('Simulation has finished.');
	console.log('a survivor:', llamas[llamas.length - 1]);
	console.log('other survivor:', llamas[0]);

	return timeline;
}

// ---
// routes

app.get('/', (req, res) => {
	res.send('Welcome to llamas!');
});

app.post('/run', (req, res) => {

	const oldWorld = {'ground': randomGround(20, 30), 'llamas': randomLlamas(20, 30)};
	const timeline = runSimulation(oldWorld.ground, oldWorld.llamas, req.body.steps);
	res.json(timeline);
});


// ---
// runs server

app.listen(3500, () => {
	console.log('server running at 3500...');
});