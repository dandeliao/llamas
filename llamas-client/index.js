const server = 'http://localhost:3500';

const formSimulation = document.getElementById('formSimulation');
const worldCanvas = document.getElementById('world');

// draws on canvas
function draw (canvas) {
	
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(10, 10, 50, 50);

	ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
	ctx.fillRect(30, 30, 50, 50);
}


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
		.then(r => {

			console.log(r);

			draw(worldCanvas);

		})

	e.preventDefault();
});