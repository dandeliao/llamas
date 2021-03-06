const server = 'http://localhost:3500';

const formSimulation = document.getElementById('formSimulation');
const worldCanvas = document.getElementById('world');

// ---
// functions for drawing on canvas

const scale = 33;

// returns a color palette of n colors from colorLow to colorHigh
function colorPalette (colorLow, colorHigh, n) {
	let palette = [];
	for (let i = 0; i < n; i++) {
		let color = [];
		for (let j = 0; j < 3; j++) {
			// j represents r, g or b (red, green or blue)
			color[j] = colorLow[j] + (i * Math.floor((colorHigh[j] - colorLow[j]) / n));
		}
		palette.push(color);
	}
	return palette;
}

// draw world map on canvas
function drawMap (canvas, ground) {
	
	let colorLow = [152, 147, 133]; // rgb
	let colorHigh = [92, 45, 30]; // rgb
	let palette = colorPalette(colorLow, colorHigh, 5);

	// these are NOT the same as css width and height!
	canvas.width = ground[0].length * scale;
	canvas.height = ground.length * scale;

	const ctx = canvas.getContext('2d');

	for (let i = 0; i < ground.length; i++) {
		for (let j = 0; j < ground[0].length; j++) {
			let value = ground[i][j];

			let color = palette[value];
			ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			ctx.fillRect(j * scale, i * scale, scale, scale);
		}
	}
}

// draw llamas over the map
function drawLlamas (canvas, llamas) {

	const ctx = canvas.getContext('2d');
	ctx.lineWidth = 3;

	/* let x = llamas[0].line * scale;
	let y = llamas[0].column * scale;
	ctx.strokeStyle = `rgb(${llamas[0].color[0]}, ${llamas[0].color[1]}, ${llamas[0].color[2]})`;
	ctx.strokeRect(y, x, scale, scale); */

	for (let l = 0; l < llamas.length; l++) {
		let x = llamas[l].line * scale;
		let y = llamas[l].column * scale;
		ctx.strokeStyle = `rgb(${llamas[l].color[0]}, ${llamas[l].color[1]}, ${llamas[l].color[2]})`;
		ctx.strokeRect(y, x, scale, scale);
	}
}

// "animation" (playback)
stepSize = 240; // miliseconds
function delay () {
	return new Promise(r => setTimeout(r, stepSize));
}
async function runStep (canvas, world) {
	console.log('---')
	console.log(world);
	drawMap(canvas, world.ground);
	drawLlamas(canvas, world.llamas);
	await delay();
}
async function play (canvas, timeline) {
	for (let i = 0; i < timeline.length; i++) {
		await runStep(canvas, timeline[i]);
	}
}

// ---
// event listeners

formSimulation.addEventListener('submit', e => {

	const steps = {
		'steps': formSimulation.elements['steps'].value
	}

	fetch(`${server}/run`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(steps)
	})
		.then(res => res.json())
		.then(timeline => {

			console.log(timeline);

			play(worldCanvas, timeline);

		})

	e.preventDefault();
});