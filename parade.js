"use strict";
function parseInput(input) {
    if (!input || input.trim() === '') {
        exitProcessWithError('Empty input');
    }
    input = input.split('\n');

    var firstInputRow = input.splice(0, 1)[0];
    var row = firstInputRow.trim().split(' ');
    if (row.length !== 3) {
        exitProcessWithError('Wrong input \"' + firstInputRow + '\".\nExpected \"N M K\" as integer in first line, for example 3 4 2.\nN is a knights count, M is a horses count, K is an expected knights with horses count.');
    }

    var knightsCount = parseInteger(row[0], "knights count", 250);
    var horsesCount = parseInteger(row[1], "horses count", 250);
    var parsedInput = {
        knightsWithHorsesCount: parseInteger(row[2], "knights with horses count", Math.min(knightsCount, horsesCount))
    };
    var coordinatesCount = knightsCount + horsesCount;
    if (coordinatesCount < input.lenght) {
        exitProcessWithError('Expected ' + coordinatesCount + ' coordinates but input has only ' + input.lenght + ' coordinates');
    }
    parsedInput.knightCoordinates = parseCoordinates(input.splice(0, knightsCount));
    parsedInput.horsesCoordinates = parseCoordinates(input.splice(0, horsesCount));
    return parsedInput;
}

function parseInteger(value, name, max) {
    var parsedValue = Number.parseInt(value)
    if (parsedValue === Number.NaN) {
        exitProcessWithError('Wrong ' + name + ' \"' + parsedValue + '\" - integer expected');
    }
    if (parsedValue < 0) {
        exitProcessWithError('Wrong ' + name + ' \"' + parsedValue + '\" - it must be equal or greater than 0');
    }
    if (parsedValue > max) {
        exitProcessWithError('Wrong ' + name + ' \"' + parsedValue + '\" - it can not be greater than ' + max);
    }
    return parsedValue;
}

function parseCoordinates(input) {
    var coordinates = [];
    for (var i = 0; i < input.length; i++) {
        coordinates.push(parseCoordinate(input[i]));
    }
    return coordinates;
}

function parseCoordinate(input) {
    var row = input.trim().split(' ');
    if (row.length !== 2) {
        exitProcessWithError('Wrong coordinate \"' + input + '\" - expected \"X Y\" as integer, for example 1 5');
    }
    return {
        x: parseInteger(row[0], 'X coordinate', 10000000),
        y: parseInteger(row[1], 'Y coordinate', 10000000)
    };
}

function exitProcessWithError(error) {
    process.stdout.write(error);
    process.exit(1);
}

function calculateDistances(knightCoordinates, horsesCoordinates) {
    var distances = [];
    for (var i = 0; i < knightCoordinates.length; i++) {
        distances.push([]);
        var knightCoordinate = knightCoordinates[i];
        for (var j = 0; j < horsesCoordinates.length; j++) {
            var horseCoordinate = horsesCoordinates[j];
            var distance = Math.pow(knightCoordinate.x - horseCoordinate.x, 2) + Math.pow(knightCoordinate.y - horseCoordinate.y, 2);
            distances[i].push(distance);
        }
    }
    return distances;
}

function copyDistancesWithoutUsedKnightAndHorse(distances, usedKnightIndex, usedHorseIndex) {
    var distancesWithoutUsedKnightsAndHorses = distances.slice(0);
    distancesWithoutUsedKnightsAndHorses.splice(0, usedKnightIndex + 1);
    for (var k = 0; k < distancesWithoutUsedKnightsAndHorses.length; k++) {
        distancesWithoutUsedKnightsAndHorses[k] = distancesWithoutUsedKnightsAndHorses[k].slice(0);
        distancesWithoutUsedKnightsAndHorses[k].splice(usedHorseIndex, 1);
    }
    return distancesWithoutUsedKnightsAndHorses;
}

function findMinimumDistanceForOneKnightAndOneHorse(distances) {
    var min = null;
    var minDistanceToHorse;
    for (var i = 0; i < distances.length; i++) {
        minDistanceToHorse = Math.min.apply(this, distances[i]);
        if (min == null || minDistanceToHorse < min) {
            min = minDistanceToHorse;
        }
    }
    return min;
}

function findMinimumDistanceForManyKnightsAndHorses(distances, requiredKnightsWithHorsesCount) {
    var min = null;
    var minDistanceToHorse;
    requiredKnightsWithHorsesCount = requiredKnightsWithHorsesCount - 1;
    for (var i = 0; i < (distances.length - requiredKnightsWithHorsesCount); i++) {
        var length = distances[i].length;
        for (var j = 0; j < length; j++) {
            var distance = distances[i][j];
            var distancesWithoutUsedKnightsAndHorses = copyDistancesWithoutUsedKnightAndHorse(distances, i, j);
            minDistanceToHorse = findMinimumDistance(distancesWithoutUsedKnightsAndHorses, requiredKnightsWithHorsesCount);
            minDistanceToHorse = Math.max(distance, minDistanceToHorse);
            if (min == null || minDistanceToHorse < min) {
                min = minDistanceToHorse;
            }
        }
    }
    return min;
}

function findMinimumDistance(distances, requiredKnightsWithHorsesCount) {
    if (requiredKnightsWithHorsesCount === 1) {
        return findMinimumDistanceForOneKnightAndOneHorse(distances);
    } else {
        return findMinimumDistanceForManyKnightsAndHorses(distances, requiredKnightsWithHorsesCount);
    }
}

function processData(input) {
    input = parseInput(input);
    var distances = calculateDistances(input.knightCoordinates, input.horsesCoordinates);
    var min = findMinimumDistance(distances, input.knightsWithHorsesCount);
    process.stdout.write(String(min));
}

process.stdin.resume();
process.stdin.setEncoding("ascii");
var _input = "";

process.stdin.on("data", function (input) {
    _input += input;
});

process.stdin.on("end", function () {
    processData(_input);
});