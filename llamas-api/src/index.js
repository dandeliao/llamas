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

function runSimulation(initialGround, initialLlamas, rounds) {
	
	console.log('Simulation has started.');

	let ground = _.cloneDeep(initialGround);
	let llamas = _.cloneDeep(initialLlamas);
	
	let newWorld;
	let timeline = [{'ground': ground, 'llamas': llamas}];
	
	for (let r = 0; r < rounds; r++) {
		console.log('--- round', r);
		newWorld = oneRound(ground, llamas);
		timeline.push(_.cloneDeep(newWorld));
		ground = _.cloneDeep(newWorld.ground);
		llamas = _.cloneDeep(newWorld.llamas);
	}
	
	console.log('Simulation has finished.');
	return timeline;
}

// ---
// routes

app.get('/', (req, res) => {
	res.send('Welcome to llamas!');
});

app.post('/run', (req, res) => {

	const oldWorld = {'ground': randomGround(40, 40), 'llamas': randomLlamas(40, 40)};
	const timeline = runSimulation(oldWorld.ground, oldWorld.llamas, req.body.steps);
	res.json(timeline);
});


// ---
// runs server

app.listen(3500, () => {
	console.log('server running at 3500...');
});