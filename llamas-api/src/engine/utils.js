const _ = require('lodash');
const fs = require('fs');

// random integer generator
function randomInteger (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function coinFlip () {
	heads = randomInteger(0, 1);
	if (heads === 0) {
		return false;
	} else {
		return true;
	}
}

// random real number generator
function randomRealNumber (min, max) {
	return Math.random() * (max - min) + min;
}

// random unique color
function randomUniqueColor (colorsInUse) {
	
	let r = randomInteger(0, 256);
	let g = randomInteger(0, 256);
	let b = randomInteger(0, 256);

	let i = 0;
	while(i < colorsInUse.length) {
		if ((Math.abs(r - colorsInUse[i][0]) > 10)
			|| (Math.abs(g - colorsInUse[i][1]) > 10)
	 		|| (Math.abs(b - colorsInUse[i][2]) > 10)
			) {
			i++;
		} else {
			//console.log('color is already in use, starting over');
			r = randomInteger(0, 256);
			g = randomInteger(0, 256);
			b = randomInteger(0, 256);
			i = 0;
		}
	}

	color = [r, g, b];
	//console.log('new chosen color:', color);
	return color;
}

// 2D matrix generator
function generateMatrix(lines, columns) {
	let matrix = new Array (lines);

	for (let i = 0; i < matrix.length; i++) {
		let line = new Array (columns);
		for (let j = 0; j < line.length; j++) {
			line[j] = null;
		}
		matrix[i] = line;
	}

	return matrix;

}

// converts 2D matrix to 1D array
function toLinearArray (biArray) {
	let uniArray = new Array();
	for (let i = 0; i < biArray.length; i++) {
		for (let j = 0; j < biArray[0].length; j++) {
			uniArray[j + biArray.length * i] = _.clone(biArray[i][j]);
		}
	}
	return uniArray;
}

// returns array containing just the solicited property
function mapProperty (property, array) {
	let mapped = array.map(a => {
		if (a[property]) {
			return a[property];
		} else {
			return;
		}
	});
	//console.log(mapped.filter(Array));
	return mapped.filter(n => {
		return (n != undefined) && (n != null);
	});
}

// returns index of the greatest value in an array 
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

// returns position if boundaries where to warp around themselves (e.g. going all the way down makes you come out of the top)
function warpPosition(line, column, numberOfLines, numberOfColumns) {

	let l = _.clone(line);
	let c = _.clone(column);

	if (line >= numberOfLines) {
		l = line - numberOfLines;
	} else if (line < 0) {
		l = numberOfLines + line;
	}

	if (column >= numberOfColumns) {
		c = column - numberOfColumns;
	} else if (column < 0) {
		c = numberOfColumns + column;
	}

	return {'line': l, 'column': c}
}

function saveInfo(path, info) {
	try {
		fs.writeFileSync(path, JSON.stringify(info) + '\r\n', { flag: 'a' });
	} catch (err) {
		console.log('error when saving data:', err);
	}
}

module.exports = {
	randomInteger,
	randomRealNumber,
	randomUniqueColor,
	coinFlip,
	generateMatrix,
	toLinearArray,
	mapProperty,
	indexOfMax,
	warpPosition,
	saveInfo
}