//TODO: fix at vælge en undergruppe efter du har valgt et interval

// undergruppe: vis egen selection (hardcoded), Select en anden
// Select gruppe med: passiv guld i 0-5 minut som er over x - få denne data fra mosaic plot
let dataPromise2 = d3.json("../formattedDamageWinrateScatterStats.json", function (data) {
  //console.log(data);
});
let dataset2 = [];
dataPromise2.then(function (d) {
  for (let i = 0; i < d.length; i++) {
    dataset2.push(d[i]);
  }
  drawScatter2(dataset2);
});

function drawScatter2(dataset) {
  window.mirrorSelectEffect = mirrorSelectEffect
  window.mirrorResetSelectionEffects = mirrorResetSelectionEffects
  window.mirrorDrawEffects = mirrorDrawEffects
  //Accessors
  const opacity = "0.15";
  const xAccessor = (d) => d.Winrate;
  const yAccessor = (d) => d.Damage;


  const nameAccessor = (d) => d.Name;
  const tierAccessor = (d) => d.Tier;
  const divisionAccessor = (d) => d.Division;
  const colorAccessor = (d) => d.Tier;


  // STATE 0 = FADED, 1 Active, 2 currently selected
  playerDataMap = new Map();

  let circleR = 7;


  const colorRanks = new Set();
  let colorRanksSorted = [];
  let namesToDeleteSet = new Set();

  // function fillDataMap() {
  //   for (let i = 0; i < dataset.length; i++) {
  //     tempObject = { Tier: "null", State: 0 };
  //     tempObject.Tier = dataset[i].Tier;
  //     playerDataMap.set(dataset[i].Name, tempObject);
  //   }
  // }
  // fillDataMap();
  fillColorUniqueSet();
  colorRanksSorted = sortColorRankAscending();

  function fillColorUniqueSet() {
    for (let i = 0; i < dataset.length; i++) {
      colorRanks.add(dataset[i].Tier);
    }
  }
  function sortColorRankAscending() {
    tempArray = [];

    if (colorRanks.has("I")) {
      tempArray.splice(0, 0, "I");
    }
    if (colorRanks.has("B")) {
      tempArray.splice(tempArray.length, 0, "B");
    }
    if (colorRanks.has("S")) {
      tempArray.splice(tempArray.length, 0, "S");
    }
    if (colorRanks.has("G")) {
      tempArray.splice(tempArray.length, 0, "G");
    }
    if (colorRanks.has("P")) {
      tempArray.splice(tempArray.length, 0, "P");
    }
    if (colorRanks.has("D")) {
      tempArray.splice(tempArray.length, 0, "D");
    }
    if (colorRanks.has("M")) {
      tempArray.splice(tempArray.length, 0, "M");
    }
    if (colorRanks.has("GM")) {
      tempArray.splice(tempArray.length, 0, "GM");
    }
    if (colorRanks.has("C")) {
      tempArray.splice(tempArray.length, 0, "C");
    }

    return tempArray;
  }

  // SIZE OF SVG
  const width = d3.min([window.innerWidth * 0.45, window.innerHeight * 0.45]);

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 20,
      right: 20,
      bottom: 50,
      left: 50,
    },
  };
  // Adding boundaries chart to axes
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // Create SVG and attach to html div
  const wrapper = d3
    .select("#wrapper2")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // bounds for our inner chart = where data points are placed
  // draw our SVG canvas
  const bounds2 = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // adding x&y scales with bounding ranges relative to the dataset
  const xScale2 = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale2 = d3
    .scaleLinear()

    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  // Add color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(colorRanksSorted)
    .range(d3.schemeSet1);

  // Drawing the dataset with dots for each x&y value
  const dots = bounds2
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      let str = d.Name.replace(/\s+/g, "");
      return "P-" + str;
    })
    .attr("cx", (d) => xScale2(xAccessor(d)))
    .attr("cy", (d) => yScale2(yAccessor(d)))
    .attr("r", circleR)
    .attr("fill", (d) => colorScale(colorAccessor(d)));

  // Draw axes
  const xAxisGenerator = d3.axisBottom().scale(xScale2);
  const xAxis = bounds2
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .html("Winrate %");

  const yAxisGenerator = d3.axisLeft().scale(yScale2).ticks(5);

  const yAxis = bounds2.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .text("Damage")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");

  // bounds
  //   .selectAll("circle")
  //   .on("mouseenter", onMouseEnter)
  //   .on("mouseleave", onMouseLeave)
  //   //.on("click", onClickChart);

  const tooltip = d3.select("#tooltip2");

  function stripString(nameStr, typeOfElementStr) {
    strippedName = nameStr.replace(/\s+/g, "");
    finalString = String(typeOfElementStr + "." + "P-" + strippedName);
    return finalString;
  }
  // function onMouseEnter(datum) {
  //   const dayDot = bounds
  //     .append("circle")
  //     .attr("class", "tooltip-dot")
  //     .attr("cx", xScale(xAccessor(datum)))
  //     .attr("cy", yScale(yAccessor(datum)))
  //     .attr("r", function (d) {
  //       str = stripString(datum.Name, "circle");

  //       return (r = d3.select(str).attr("r"));
  //     })
  //     .style("pointer-events", "none");

  //   const formatWinrate = d3.format(".2f");
  //   tooltip.select("#Winrate").text(formatWinrate(xAccessor(datum)));

  //   const formatDamage = d3.format(".2f");
  //   tooltip.select("#Damage").text(formatDamage(yAccessor(datum)));
  //   tooltip.select("#Name").text(nameAccessor(datum));
  //   tooltip.select("#Rank").text(tierAccessor(datum));

  //   const x = xScale(xAccessor(datum)) + dimensions.margin.left;
  //   const y = yScale(yAccessor(datum)) + dimensions.margin.top;

  //   tooltip.style(
  //     "transform",
  //     `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
  //   );
  //   tooltip.style("opacity", 1);
  // }

  // TODO: TEMPORARY IMPLEMENTATION mangler remove
  // TODO: mangler at sætte teksten ordentligt + ring om hver selection
  // function onClickChart(datum) {
  //   if (selectedObject == null) {
  //     selectedObject = datum;
  //     drawSelectEffect(datum);
  //     //console.log("Selectedobject var null")
  //     return;
  //   }

  //   if (datum == prevSelectedObject && prevSelectedObject != null) {
  //     //console.log("Du må ikke trykke på det samme")
  //     return;
  //   }

  //   if (
  //     selectedObject != null &&
  //     prevSelectedObject == null &&
  //     selectedObject != datum
  //   ) {
  //     prevSelectedObject = selectedObject;
  //     selectedObject = datum;
  //     drawSelectEffect(selectedObject);
  //     //console.log("selected var ikke 0 og prev var 0")
  //     return;
  //   }
  //   if (selectedObject != null && prevSelectedObject != null) {
  //     resetSelectionEffects(selectedObject, prevSelectedObject);
  //     drawSelectEffect(datum);
  //     selectedObject = datum;
  //     prevSelectedObject = null;
  //     //console.log("selected var ikke null og prev var ikke null")
  //     return;
  //   }
  // }





  function mirrorSelectEffect(datum) {

    //console.log(datum)
    // Kald Laursen.draw
    clickedObject = stripString(datum.Name, "circle");
    bounds2
      .append("circle")
      .attr("class", "select-effect")
      .attr("cx", (d) => xScale2(xAccessor(datum)))
      .attr("cy", (d) => yScale2(yAccessor(datum)))
      .attr("r", circleR)
      .style("z-index", "5");

    bounds2
      .append("text")
      .attr("id", "selectText")
      .attr("class", function () {
        str = datum.Name.replace(/\s+/g, "");
        return "P-" + str;
      })
      .attr("x", xScale2(xAccessor(datum)) - 20)
      .attr("y", function (d) {
        y = yScale2(yAccessor(datum));
        radi = d3.select(clickedObject).attr("r");
        y = y - radi * 1.5;
        return y;
      })
      .style("z-index", "5")
      .style("font-size", "10px")
      .style("text-align", "left")
      .attr("pointer-events", "none")
      .text(datum.Name);

  }

  function mirrorResetSelectionEffects(prevObject, selectObject) {



    // Select first object and remove circle
    prevObjectSelector = stripString(prevObject.Name, "circle")
    bounds2.select(prevObjectSelector)
      .style("z-index", "0");

    selectObjectSelector = stripString(selectObject.Name, "circle")
    bounds2.select(selectObjectSelector)
      .style("z-index", "0");

    // Remove all marking effects
    bounds2.selectAll("circle.select-effect").remove()
    bounds2.selectAll("text#selectText").remove();

    // Set z index to 0
    bounds2
      .select(selectObjectSelector)
      .style("z-index", "0")

    bounds2
      .select(prevObjectSelector)
      .style("z-index", "0")



    prevPlayerObject = playerDataMap.get(prevObject.Name)
    selectPlayerObject = playerDataMap.get(selectObject.Name)



  }
  function checkLegendActive() {
    state = false;
    for (let [key, value] of clickedMap) {
      if (clickedMap.get(key) == true) {

        state = true
        break;

      }

    }
    return state;
  }
  function onMouseLeave() {
    d3.selectAll(".tooltip-dot").remove();
    tooltip.style("opacity", 0);
  }
  let savedDataFromPreviousCall = []
  function selectSpecificPlayers(data) {
    // TODO: Hvilket data format fås spillere i?
    namesToDeleteArr = [];
    for (let i = 0; i < data.length; i++) {
      namesToDeleteArr.push(data[i]);
      tmpSelector = stripString(data[i], "circle");
      bounds2
        .select(tmpSelector)
        .attr("opacity", "1")
        .attr("pointer-events", "auto");
    }
    namesToDeleteSet = new Set(namesToDeleteArr);
    tmpArray = [];
    tmpArray2 = []
    for (let i = 0; i < dataset.length; i++) {
      tmpArray.push(dataset[i].Name);
      tmpArray2.push(dataset[i].Name)
    }

    const fadeArray = tmpArray.filter((name) => {
      return !namesToDeleteSet.has(name);
    });


    //console.log(clickedMap)
    console.log(checkLegendActive())
    if (checkLegendActive() === true) {
      // FADE ALL PLAYERS THAT DOES NOT MATCH THE TIER
      //TODO: BUG DO NOT SELECT ALL CIRCLES
      filtered = filterToTier(data)
      playersToDeleteSet = new Set(filtered)
      const fadeArray2 = tmpArray2.filter((name) => {
        return !playersToDeleteSet.has(name)
      });

      for (let i = 0; i < fadeArray2.length; i++) {
        selector = stripString(fadeArray2[i], "circle")
        bounds2
          .select(selector)
          .attr("opacity", opacity)
          .attr("pointer-events", "none")
      }



    }
    if (checkLegendActive() === false) {

      for (let i = 0; i < fadeArray.length; i++) {
        selector = stripString(fadeArray[i], "circle");

        bounds2
          .select(selector)
          .attr("opacity", opacity)
          .attr("pointer-events", "none");

      }
      savedDataFromPreviousCall = namesToDeleteSet
      console.log(savedDataFromPreviousCall)
    }


  }
  function filterToTier(filterArray) {
    resultFilteredArray = []
    for (let i = 0; i < filterArray.length; i++) {
      if (playerDataMap.has(filterArray[i])) {
        tmpValue = playerDataMap.get(filterArray[i])
        tmpTier = tmpValue.Tier
        if (checkTierActive(tmpTier) === true) {
          resultFilteredArray.push(filterArray[i])


        }
      }
    }

    return resultFilteredArray
  }
  //Initialize legend

  // var legendItemSize = 12;
  // var legendSpacing = 20;
  // legendFontSize = "12px";
  // var scale = 1.5;
  // var offsetX = 10;
  // var offsetY = 6;
  // let clickedMap = new Map();
  // fillClickedMap();

  // function fillClickedMap() {
  //   for (i = 0; i < colorRanksSorted.length; i++) {
  //     clickedMap.set(colorRanksSorted[i], false);
  //   }
  // }

  // let legendDimensions = {
  //   width: 0,
  //   height: 0,
  //   margin: 10,
  // };
  // legendDimensions.width =
  //   colorRanksSorted.length * (legendItemSize + legendSpacing);
  // numericFontSize = parseInt(legendFontSize.replace(/\D/g, ""));
  // legendDimensions.height =
  //   numericFontSize + legendItemSize + legendDimensions.margin;

  // const legendWrapper = d3
  //   .select("#legend")
  //   .append("svg")
  //   .attr("width", legendDimensions.width)
  //   .attr("height", legendDimensions.height);

  // const legend = legendWrapper
  //   .selectAll("g")

  //   .data(colorRanksSorted)
  //   .enter()
  //   .append("g");

  // legend
  //   .append("rect")
  //   .attr("id", "rects")
  //   .attr("width", legendItemSize)
  //   .attr("height", legendItemSize)
  //   .attr("x", function (d, i) {
  //     return (x = (legendItemSize + legendSpacing) * i + offsetX);
  //   })
  //   .attr("y", function (d) {
  //     return legendItemSize / 2;
  //   })
  //   .style("fill", colorScale);

  // // ADD TEXT
  // legend
  //   .append("text")
  //   .attr("id", "text")
  //   .attr(
  //     "x",
  //     (d, i) => (x = (legendItemSize + legendSpacing) * i + legendItemSize)
  //   )
  //   .attr(
  //     "y",
  //     (d, i) => (y = offsetY + legendDimensions.margin + legendItemSize)
  //   )
  //   .style("font-size", legendFontSize)
  //   .style("z-index", "5")
  //   .style("text-align", "center")
  //   .text(function (d) {
  //     return d;
  //   })
  //   .attr("pointer-events", "none");

  // legend.on("click", clickLegend);

  // function clickLegend(datum) {
  //   // Click legend and increase size + alter growth position
  //   if (clickedMap.get(datum) == false) {
  //     var counter = colorRanksSorted.indexOf(datum);
  //     d3.select(this)
  //       .select("#rects")
  //       .transition()
  //       .duration(250)
  //       .attr("width", legendItemSize * scale)
  //       .attr("height", legendItemSize * scale)
  //       .attr("x", calculatePlacementX(this))
  //       .attr("y", calculatePlacementY(this));

  //     d3.select(this)
  //       .select("#text")
  //       .transition()
  //       .duration(250)
  //       .attr("x", function (d) {
  //         return (x = (legendItemSize + legendSpacing) * counter + offsetX);
  //       })
  //       .attr(
  //         "y",
  //         (d, i) =>
  //           (y = offsetY + legendDimensions.margin + legendItemSize * scale)
  //       );
  //     // Update internal state of clickedgroups
  //     updatePlayerDataWithClickedGroup(datum, 1);
  //   }
  //   // unclick legend removing effect and decreasing size + reposition
  //   if (clickedMap.get(datum) == true) {
  //     var counter = colorRanksSorted.indexOf(datum);
  //     d3.select(this)
  //       .select("#rects")
  //       .transition()
  //       .duration(250)
  //       .attr("width", legendItemSize)
  //       .attr("height", legendItemSize)
  //       .attr("x", function (d) {
  //         return (x = (legendItemSize + legendSpacing) * counter + offsetX);
  //       })
  //       .attr("y", function (d) {
  //         return (y = legendItemSize / 2);
  //       });

  //     d3.select(this)
  //       .select("#text")
  //       .transition()
  //       .duration(250)
  //       .attr("x", function (d) {
  //         return (x = (legendItemSize + legendSpacing) * counter + offsetX + 2);
  //       })
  //       .attr("y", function (d) {
  //         return (y = offsetY + legendDimensions.margin + legendItemSize);
  //       });
  //     updatePlayerDataWithClickedGroup(datum, 0);
  //   }
  //   alternating = clickedMap.get(datum);
  //   alternating = alternating ? false : true;
  //   clickedMap.set(datum, alternating);
  //   drawEffects();



  // }
  // function calculatePlacementX(object) {
  //   x1 = d3.select(object).node().getBBox().x;
  //   x2 = d3.select(object).node().getBBox().x + legendItemSize;
  //   x = (x2 + x1) / 2 - offsetX;
  //   return x;
  // }
  // function calculatePlacementY(object) {
  //   y1 = d3.select(object).node().getBBox().y;
  //   y2 = d3.select(object).node().getBBox().y + legendItemSize;
  //   y = (y2 + y1) / 2 - offsetY;
  //   return y;
  // }

  // function updatePlayerDataWithClickedGroup(groupType, state) {
  //   for (let [key, value] of playerDataMap) {
  //     tmpObject = { Tier: "null", State: 0 };
  //     // Check if state == 2 do not overwrite selection
  //     if (groupType === value.Tier && value.State != 2) {
  //       tmpObject.Tier = value.Tier;
  //       tmpObject.State = state;
  //       playerDataMap.set(key, tmpObject);
  //     }
  //   }
  // }
  // function checkTierActive(groupType) {
  //   for (let [key, value] of clickedMap) {
  //     if (key === groupType && value === true) {
  //       //console.log("key: " + key + " & value: " + value)      
  //       return true


  //     }
  //   }


  //   return false
  // }
  // function updatePlayerDataWithSpecificPlayer(player, state) {
  //   tmpObject = {
  //     Tier: "null",
  //     State: 0
  //   }
  //   playerObject = playerDataMap.get(player)
  //   tmpObject.Tier = playerObject.Tier
  //   tmpObject.State = state
  //   playerDataMap.set(player, tmpObject)


  // }

  // Function should fade all groups but the ones with state 1 or 2. State 1 active state 2 selected
  function mirrorDrawEffects(dataNotToFade, dataFade, type) {
    
    
    
    if (type === 1){
      console.log("1")
      for (let i=0; i<dataFade.length; i++){
        selectorThisFade= stripString(dataFade[i], "circle")
        bounds2.select(selectorThisFade)
        .transition()
        .duration(250)
        .attr("opacity", opacity)
          .attr("pointer-events", "none");
      }
      for (let i=0; i<dataNotToFade.length; i++){
        selectorThisNotFade = stripString(dataNotToFade[i], "circle")
        bounds2.select(selectorThisNotFade)
        .transition()
        .duration(250)
        .attr("opacity", "1")
          .attr("pointer-events", "auto");
      }
      
    }

    if (type ===2){
      console.log("2")
      tmpFade = Array.from(dataFade)
      tmpNotFade = Array.from(dataNotToFade)
      for (let i=0; i<tmpFade.length; i++){
        selectorThisFade2= stripString(tmpFade[i], "circle")
        bounds2.select(selectorThisFade2)
        .transition()
        .duration(250)
        .attr("opacity", opacity)
          .attr("pointer-events", "none");
      }

      for (let i=0; i<tmpNotFade.length; i++){
        selectorThisNotFade2 = stripString(tmpNotFade[i], "circle")
        bounds2.select(selectorThisNotFade2)
        .transition()
        .duration(250)
        .attr("opacity", "1")
          .attr("pointer-events", "auto");
      }
     
    
    console.log("hej")
    if (type === 1) {
      console.log("not to fade:")
      console.log(dataNotToFade)
      console.log("To fade:")
      console.log(dataFade)
    }
    if (type ===3){
      console.log("3")
      console.log(dataset2.length)
      for (let i=0; i<dataset2.length; i++){
        selectorThis = stripString(dataset[i].Name, "circle")
        bounds2.select(selectorThis)
        .attr("opacity", "1")
        .attr("pointer-events", "auto")

      }
      

     
    }
  }



  // function reset() {
  //   console.log("reset");
  //   bounds
  //     .selectAll("circle")
  //     .transition()
  //     .duration(350)
  //     .attr("opacity", 1)
  //     .attr("pointer-events", "auto");

  //   // remove select effect

  //   prevSelectedObject = null;
  //   selectedObject = null;
  //   bounds.selectAll("text#selectText").remove();
  //   bounds.selectAll("circle.select-effect").remove();
  //   for (let [key, value] of playerDataMap) {
  //     temp = playerDataMap.get(key)
  //     temp.State = 0;
  //     playerDataMap.set(key, temp)
  //   }
  //   //console.log(playerDataMap)
  //   for (let [key, value] of clickedMap) {
  //     clickedMap.set(key, false);
  //   }

  //   legendStatus = false;
  //   legend.selectAll("rect").remove();
  //   legend.selectAll("text").remove();

  //   legend
  //     .append("rect")

  //     .attr("id", "rects")
  //     .attr("width", legendItemSize)
  //     .attr("height", legendItemSize)
  //     .attr("x", function (d, i) {
  //       return (x = (legendItemSize + legendSpacing) * i + offsetX);
  //     })
  //     .attr("y", function (d) {
  //       return legendItemSize / 2;
  //     })
  //     .style("fill", colorScale);

  //   legend
  //     .append("text")

  //     .attr("id", "text")
  //     .attr(
  //       "x",
  //       (d, i) => (x = (legendItemSize + legendSpacing) * i + legendItemSize)
  //     )
  //     .attr(
  //       "y",
  //       (d, i) => (y = offsetY + legendDimensions.margin + legendItemSize)
  //     )
  //     .style("font-size", legendFontSize)
  //     .style("z-index", "5")
  //     .style("text-align", "center")
  //     .text(function (d) {
  //       return d;
  //     })
  //     .attr("pointer-events", "none");

  //   // Remove mosaic plot
  //   mosiac1 = document.getElementById("player1");
  //   mosiac2 = document.getElementById("player2");
  //   mosiac1.innerHTML = "";
  //   mosiac2.innerHTML = "";
  //   selectedPlayerNames = [];
  // }
}
