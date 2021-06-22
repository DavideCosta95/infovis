const svgWidth = 1500;
const svgHeight = 800;
const submarine_height = 30;
const transitionDuration = 1000;

const svg = d3.select("body").append("svg").attr('width', svgWidth).attr('height', svgHeight);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#44A7C4");

let dataset;
let colorIndex = 0;
let positionIndex = 0;
const positionStep = 130;
let usedColors = [];

d3.json('/dataset').then(function (data) {
    dataset = data;
    loadDataset();
});

function loadDataset() {
    svg.selectAll("g").data(dataset).join(
        /***
         * ENTER
         */
        function (enter) {
            const g = enter.append("g");

            positionIndex = 0;

            // helix
            g.append("polyline")
                .attr("points", getHelixPosition())
                .attr("class", "helix")
                .attr("fill", function () {
                    let color;
                    do {
                        color = randomColor();
                    } while (usedColors.includes(color, 0));
                    usedColors.push(color);
                    dataset[colorIndex].color = color;
                    colorIndex++;
                    return color;
                })
                .attr("stroke-width", 2)
                .attr("stroke", "black");

            colorIndex = 0;
            positionIndex = 0;

            // body
            g.append("ellipse")
                .attr('cx', function () {
                    return dataset[positionIndex++].x;
                })
                .attr('cy', function (datapoint) {
                    return datapoint.depth
                })
                .attr('rx', function (datapoint) {
                    return datapoint.width
                })
                .attr('ry', submarine_height)
                .attr("stroke-width", 2)
                .attr("stroke", "black")
                .attr("class", "body")
                .attr('fill', getColor());

            positionIndex = 0;

            // first porthole
            g.append("circle")
                .attr('cx', getSecondPortholePosition())
                .attr("cy", function (datapoint) {
                    return datapoint.depth
                })
                .attr("r", function (datapoint) {
                    return datapoint.porthole
                })
                .attr("class", "first-porthole")
                .attr("fill", "black");

            positionIndex = 0;

            // second porthole
            g.append("circle")
                .attr('cx', getCenterPosition())
                .attr("cy", function (datapoint) {
                    return datapoint.depth
                })
                .attr("r", function (datapoint) {
                    return datapoint.porthole
                })
                .attr("class", "second-porthole")
                .attr("fill", "black");

            // turret
            g.append("polyline")
                .attr("points", turretPosition())
                .attr("class", "turret")
                .attr("fill", "None")
                .attr("stroke-width", 3)
                .attr("stroke", "black");
        },

        /***
         * UPDATE
         */
        function (update) {
            const tx = d3.transition().duration(transitionDuration);

            colorIndex = 0;
            positionIndex = 0;

            // helix
            update.select(".helix")
                .transition(tx)
                .attr("points", getHelixPosition())
                .attr("class", "helix")
                .attr("fill", getColor())
                .attr("stroke-width", 2)
                .attr("stroke", "black");

            colorIndex = 0;
            positionIndex = 0;

            // body
            update.select(".body")
                .transition(tx)
                .attr('cx', function () {
                    return dataset[positionIndex++].x;
                })
                .attr('cy', function (datapoint) {
                    return datapoint.depth
                })
                .attr('rx', function (datapoint) {
                    return datapoint.width
                })
                .attr('ry', submarine_height)
                .attr("stroke-width", 2)
                .attr("stroke", "black")
                .attr("class", "body")
                .attr('fill', getColor());

            positionIndex = 0;

            // first porthole
            update.select(".first-porthole")
                .transition(tx)
                .attr('cx', getSecondPortholePosition())
                .attr("cy", function (datapoint) {
                    return datapoint.depth
                })
                .attr("r", function (datapoint) {
                    return datapoint.porthole
                })
                .attr("class", "first-porthole")
                .attr("fill", "black");

            positionIndex = 0;

            // second porthole
            update.select(".second-porthole")
                .transition(tx)
                .attr('cx', getCenterPosition())
                .attr("cy", function (datapoint) {
                    return datapoint.depth
                })
                .attr("r", function (datapoint) {
                    return datapoint.porthole
                })
                .attr("class", "second-porthole")
                .attr("fill", "black");

            // used only 2 portholes to make the submarines look cuter and more fish-like

            // turret
            update.select(".turret")
                .transition(tx)
                .attr("points", turretPosition())
                .attr("class", "turret")
                .attr("fill", "None")
                .attr("stroke-width", 3)
                .attr("stroke", "black");
        }
    );

    svg.selectAll("g").on('mousedown', function (datapoint) {
        const thisDatapointIndex = dataset.indexOf(datapoint);
        let otherDatapointIndex = randomIntegerIn(0, dataset.length - 1);

        while (thisDatapointIndex === otherDatapointIndex) {
            otherDatapointIndex = randomIntegerIn(0, dataset.length - 1);
        }

        swapDatapoints(thisDatapointIndex, otherDatapointIndex);
        loadDataset();
    });

    function randomIntegerIn(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomColor() {
        return "#"
            + "" + randomIntegerIn(0, 9)
            + "" + randomIntegerIn(0, 9)
            + "" + randomIntegerIn(0, 9)
            + "" + randomIntegerIn(0, 9)
            + "" + randomIntegerIn(0, 9)
            + "" + randomIntegerIn(0, 9);
    }

    function swapDatapoints(firstDatapoint, secondDatapoint) {
        const firstPorthole = dataset[firstDatapoint].porthole;
        const firstWidth = dataset[firstDatapoint].width;
        const firstTurret = dataset[firstDatapoint].turret;
        const firstColor = dataset[firstDatapoint].color;

        dataset[firstDatapoint].porthole = dataset[secondDatapoint].porthole;
        dataset[firstDatapoint].width = dataset[secondDatapoint].width;
        dataset[firstDatapoint].turret = dataset[secondDatapoint].turret;
        dataset[firstDatapoint].color = dataset[secondDatapoint].color;

        dataset[secondDatapoint].porthole = firstPorthole;
        dataset[secondDatapoint].width = firstWidth;
        dataset[secondDatapoint].turret = firstTurret;
        dataset[secondDatapoint].color = firstColor;
    }

    function getHelixPosition() {
        return function (datapoint) {
            dataset[positionIndex].x = (positionIndex + 1) * positionStep;
            const x = dataset[positionIndex].x;
            positionIndex++;

            const angle = 1 / 8;

            const y = datapoint.depth;

            const startX = x + datapoint.width * Math.cos(Math.PI * (angle));
            const startY = y + submarine_height * Math.sin(Math.PI * angle);
            const endX = x + datapoint.width * Math.cos(Math.PI * -angle);
            const endY = y + submarine_height * Math.sin(Math.PI * -angle);

            return [
                startX, startY,
                startX + datapoint.width / 4, startY + submarine_height / 2,
                startX + datapoint.width / 2, startY + submarine_height / 2,
                startX + datapoint.width / 2, endY - submarine_height / 2,
                startX + datapoint.width / 4, endY - submarine_height / 2,
                endX, endY
            ]
        };
    }

    function turretPosition() {
        return function (datapoint) {
            const x = datapoint.x;
            const y = datapoint.depth - submarine_height;

            return [
                x, y,
                x, y - datapoint.turret,
                x - datapoint.turret / 3, y - datapoint.turret
            ];
        };
    }

    function getColor() {
        return function () {
            const color = dataset[colorIndex].color;
            colorIndex++;
            return color;
        };
    }

    function getCenterPosition() {
        return function () {
            const position = dataset[positionIndex].x;
            positionIndex++;
            return position;
        };
    }

    function getSecondPortholePosition() {
        return function (datapoint) {
            const position = dataset[positionIndex].x - datapoint.width / 2;
            positionIndex++;
            return position;
        };
    }
}
