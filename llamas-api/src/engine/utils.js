// ---
// auxiliary functions

const _ = require('lodash');

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

module.exports = {
	randomInteger,
	randomRealNumber,
	coinFlip,
	generateMatrix,
	toLinearArray,
	indexOfMax,
	warpPosition
}