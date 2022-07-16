const express = require('express');
const cors = require('cors');
const { oneRound, getWorldData, stopSimulation } = require('./engine/simulateWorld');
const { randomGround, randomLlamas } = require("./engine/createWorld");
const _ = require('lodash');
const { randomInteger, coinFlip } = require('./engine/utils');

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
		// random burst or drop of energy
		let lottery = randomInteger(0, 50);
		if ((lottery === 0)||(lottery === 1)) {
		for (let i = 0; i < ground.length; i++) {
			for (let j = 0; j < ground[0].length; j++) {
				if (((ground[i][j] > 0) && (ground[i][j] < 3))) {
					console.log('pumping up energy...')
					ground[i][j]++;
				}
			}
		}
		} else if ((lottery === 2)) {
			for (let i = 0; i < ground.length; i++) {
				for (let j = 0; j < ground[0].length; j++) {
					if ((ground[i][j] === 4 || (ground[i][j] === 3))) {
						if (coinFlip()) {
							console.log('droping down energy...')
							ground[i][j]--;
						}
					}
				}
			}
		} else if ((lottery === 3)||(lottery === 4)) {
			for (let i = 0; i < ground.length; i++) {
				for (let j = 0; j < ground[0].length; j++) {
					if (ground[i][j] === 0) {
						//if (coinFlip()) {
							//if (coinFlip()){
								console.log('regrowing voids...')
								ground[i][j] = 1;
							//}
						//}
					}
				}
			}
		} else if (lottery === 5) {
			for (let i = 0; i < ground.length; i++) {
				for (let j = 0; j < ground[0].length; j++) {
					if (ground[i][j] >= 3) {
						if (coinFlip()) {
							if (coinFlip()) {
								console.log('bad weather...')
								ground[i][j] = ground[i][j] - 3;
							}
						}
					}
				}
			}
		}
		

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