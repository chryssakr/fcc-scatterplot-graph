const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

var width = 800;
var height = 600;

var tooltip = d3
  .select("#root")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

var svg = d3
  .select("#root")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json(url).then((data) => {
  svg
    .append("text")
    .attr("x", 235)
    .attr("y", 50)
    .attr("font-size", 20)
    .attr("id", "title")
    .style("fill", "#23575c")
    .text("Doping in Professional Bicycle Racing");
  svg
    .append("text")
    .attr("x", 290)
    .attr("y", 75)
    .attr("font-size", 15)
    .attr("id", "subtitle")
    .style("fill", "#23575c")
    .text("35 Fastest times up Alpe d'Huez");

  // data is an array with objects
  // I need time for y axis, year for x axis and then everything for the overlay

  // setting xScale & xAxis
  var yearsArr = data.map((d, i) => {
    return new Date(data[i]["Year"], 0, 1);
  });

  var xScale = d3
    .scaleTime()
    .domain([d3.min(yearsArr), d3.max(yearsArr)])
    .range([60, width - 100]);
  var xAxis = d3.axisBottom().scale(xScale);
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, 550)");

  // setting yScale & yAxis
  var timesArr = data.map((d, i) => {
    var [minutes, seconds] = data[i]["Time"].split(":");
    return new Date(0, 0, 1, 0, Number(minutes), Number(seconds));
  });
  var yScale = d3
    .scaleTime()
    .domain([d3.max(timesArr), d3.min(timesArr)])
    .range([height - 100, 50]);
  var format = d3.timeFormat("%M:%S");
  var yAxis = d3.axisLeft().scale(yScale).tickFormat(format);
  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 50)");
  var yearsTimesArr = data.map((d, i) => {
    var [minutes, seconds] = data[i]["Time"].split(":");
    var date = new Date(0, 0, 1, 0, Number(minutes), Number(seconds));
    return [data[i]["Year"], date];
  });

  // creating the scatter plot
  d3.select("svg")
    .selectAll("circle")
    .data(yearsTimesArr)
    .enter()
    .append("circle")
    .attr("data-xvalue", (d) => new Date(d[0], 0, 1))
    .attr("data-yvalue", (d) => d[1])
    .attr("cx", (d) => xScale(new Date(d[0], 0, 1)))
    .attr("cy", (d) => yScale(d[1]) + 50)
    .attr("r", 5)
    .attr("index", (d, i) => i)
    .attr("fill", function (d, i) {
      return data[i]["Doping"] === "" ? "#c2edce" : "#388087";
    })
    .attr("class", "dot");

  // legend
  var legendItems = ["No doping allegations", "Riders with doping allegations"];
  var colorScale = d3
    .scaleOrdinal()
    .domain(legendItems)
    .range(["#c2edce", "#388087"]);

  var legend = svg
    .append("g")
    .attr("id", "legend")
    .style("font-size", "14px")
    .attr("transform", "translate(" + (width - 250) + ", 300)")
    .style("fill", "#23575c"); //"#6fb3b8"
  var legendItems = legend
    .selectAll(".legend-item")
    .data(legendItems)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legendItems
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function (d) {
      return colorScale(d);
    });

  legendItems
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(function (d) {
      return d;
    });

  // tooltip
  d3.selectAll("circle")
    .on("mouseover", function (event, d) {
      var i = this.getAttribute("index");

      tooltip.transition().duration(200).style("opacity", 0.7);
      tooltip
        .html(
          data[i]["Name"] +
            ": " +
            data[i]["Nationality"] +
            "<br>Year: " +
            data[i]["Year"] +
            ", Time: " +
            format(timesArr[i]) +
            "<br>" +
            data[i]["Doping"]
        )
        .attr("data-year", yearsArr[i])
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });
});
