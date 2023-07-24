import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const fetchData = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
  const data = await response.json();

  return data;
};

fetchData().then((dataset) => {
  const svgWidth = 1500;
  const svgHeight = 800;
  const padding = 70;

  const tooltip = d3
    .select("#svg-container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const svg = d3
    .select("#svg-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const baseTemp = dataset.baseTemperature;

  const parseYear = d3.timeParse("%Y");
  const parseMonth = d3.timeParse("%m");

  const formatDate = d3.timeFormat("%Y");
  const formatMonth = d3.timeFormat("%B");

  const yScaling = d3
    .scaleTime()
    .domain([
      d3.max(dataset.monthlyVariance, (d) => parseMonth(d.month)),
      d3.min(dataset.monthlyVariance, (d) => parseMonth(d.month)),
    ])
    .range([svgHeight - padding, padding]);

  const xScaling = d3
    .scaleTime()
    .domain([
      d3.min(dataset.monthlyVariance, (d) => parseYear(d.year)),
      d3.max(dataset.monthlyVariance, (d) => parseYear(d.year)),
    ])
    .range([padding, svgWidth - padding]);

  const yAxis = d3.axisLeft(yScaling).tickFormat(formatMonth).ticks(12);
  const xAxis = d3.axisBottom(xScaling).tickFormat(formatDate).ticks(20);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${svgHeight - padding})`)
    .call(xAxis);

  svg
    .selectAll("rect")
    .data(dataset.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScaling(parseYear(d.year)))
    .attr("y", (d) => yScaling(parseMonth(d.month - 1)))
    .attr("width", 5)
    .attr("height", (d) => 60)
    .attr("fill", (d) =>
      d.variance <= -1
        ? "SteelBlue"
        : d.variance <= 0
        ? "LightSteelBlue"
        : d.variance <= 1
        ? "Orange"
        : "Crimson"
    )
    .on("mouseover", function (e, d) {
      d3.select(this).attr("class", "cell highlighted");
      const year = d.year;
      const month = formatMonth(parseMonth(d.month));
      const variance = d.variance;
      tooltip
        .style("opacity", 0.75)
        .html(
          `${year} - ${month}<br><br>${(baseTemp + d.variance).toFixed(3)} °C`
        )
        .style("left", e.pageX + 15 + "px")
        .style("top", e.pageY - 100 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("class", "cell");
      tooltip.style("opacity", 0);
    });
});
