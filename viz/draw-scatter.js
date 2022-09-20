//TODO: fix at vælge en undergruppe efter du har valgt et interval

// undergruppe: vis egen selection (hardcoded), Select en anden
// Select gruppe med: passiv guld i 0-5 minut som er over x - få denne data fra mosaic plot
let dataPromise = d3.json("../formattedScatterStats.json", function (data) {
  //console.log(data);
});
var dataset = [];
dataPromise.then(function (d) {
  for (let i = 0; i < d.length; i++) {
    dataset.push(d[i]);
  }
  drawScatter(dataset);
});

function drawScatter(dataset) {
  window.selectSpecificPlayers = selectSpecificPlayers;
  //Accessors
  const opacity = "0.15";
  const xAccessor = (d) => d.Winrate;
  const yAccessor = (d) => d.Gold;
  const nameAccessor = (d) => d.Name;
  const tierAccessor = (d) => d.Tier;
  const divisionAccessor = (d) => d.Division;
  const colorAccessor = (d) => d.Tier;
  let savedDataFromPreviousCall = []
  var legendStatus = false;
  // STATE 0 = FADED, 1 Active, 2 currently selected
  var playerDataMap = new Map();
  function fillDataMap() {
    for (let i = 0; i < dataset.length; i++) {
      tempObject = { Tier: "null", State: 0 };
      tempObject.Tier = dataset[i].Tier;
      playerDataMap.set(dataset[i].Name, tempObject);
    }
  }
  fillDataMap();

  var circleR = 7;

  document.getElementById("resetButton").addEventListener("click", function () {
    reset();
  });
  const colorRanks = new Set();
  let colorRanksSorted = [];
  var namesToDeleteSet = new Set();


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
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // bounds for our inner chart = where data points are placed
  // draw our SVG canvas
  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // adding x&y scales with bounding ranges relative to the dataset
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
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
  const dots = bounds
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      str = d.Name.replace(/\s+/g, "");
      return "P-" + str;
    })
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", circleR)
    .attr("fill", (d) => colorScale(colorAccessor(d)));

  // Draw axes
  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = bounds
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

  const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(4);

  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .text("Gold")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");

  bounds
    .selectAll("circle")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)
    .on("click", onClickChart);

  const tooltip = d3.select("#tooltip");

  function stripString(nameStr, typeOfElementStr) {
    strippedName = nameStr.replace(/\s+/g, "");
    finalString = String(typeOfElementStr + "." + "P-" + strippedName);
    return finalString;
  }
  function onMouseEnter(datum) {
    const dayDot = bounds
      .append("circle")
      .attr("class", "tooltip-dot")
      .attr("cx", xScale(xAccessor(datum)))
      .attr("cy", yScale(yAccessor(datum)))
      .attr("r", function (d) {
        str = stripString(datum.Name, "circle");

        return (r = d3.select(str).attr("r"));
      })
      .style("pointer-events", "none");

    const formatWinrate = d3.format(".2f");
    tooltip.select("#Winrate").text(formatWinrate(xAccessor(datum)));

    const formatGold = d3.format(".2f");
    tooltip.select("#Gold").text(formatGold(yAccessor(datum)));
    tooltip.select("#Name").text(nameAccessor(datum));
    tooltip.select("#Rank").text(tierAccessor(datum));

    const x = xScale(xAccessor(datum)) + dimensions.margin.left;
    const y = yScale(yAccessor(datum)) + dimensions.margin.top;

    tooltip.style(
      "transform",
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );
    tooltip.style("opacity", 1);
  }
  prevSelectedObject = null;
  selectedObject = null;
  // TODO: TEMPORARY IMPLEMENTATION mangler remove
  // TODO: mangler at sætte teksten ordentligt + ring om hver selection
  function onClickChart(datum) {
    if (selectedObject == null) {
      selectedObject = datum;
      drawSelectEffect(datum);
      //console.log("Selectedobject var null")
      return;
    }

    if (datum == prevSelectedObject && prevSelectedObject != null) {
      //console.log("Du må ikke trykke på det samme")
      return;
    }

    if (
      selectedObject != null &&
      prevSelectedObject == null &&
      selectedObject != datum
    ) {
      prevSelectedObject = selectedObject;
      selectedObject = datum;
      drawSelectEffect(selectedObject);
      //console.log("selected var ikke 0 og prev var 0")
      return;
    }
    if (selectedObject != null && prevSelectedObject != null) {
      resetSelectionEffects(selectedObject, prevSelectedObject);
      drawSelectEffect(datum);
      selectedObject = datum;
      prevSelectedObject = null;
      //console.log("selected var ikke null og prev var ikke null")
      return;
    }
  }



  let selectedPlayerNames = [];

  function drawSelectEffect(datum) {
    tmpObject = datum


    mirrorSelectEffect(tmpObject)


    selectedPlayerNames.push(datum.Name);




    clickedObject = stripString(datum.Name, "circle");
    obj1 = bounds
      .select(clickedObject)
      .attr("r", circleR)
      .transition()
      .duration(250)
      .style("z-index", "5");

    if (selectedPlayerNames.length === 2) {
      doActualDraw(selectedPlayerNames[0], selectedPlayerNames[1]);
    }
    // Kald Laursen.draw

    bounds
      .append("circle")
      .attr("class", "select-effect")
      .attr("cx", (d) => xScale(xAccessor(datum)))
      .attr("cy", (d) => yScale(yAccessor(datum)))
      .attr("r", circleR)
      .style("z-index", "5");

    bounds
      .append("text")
      .attr("id", "selectText")
      .attr("class", function () {
        str = datum.Name.replace(/\s+/g, "");
        return "P-" + str;
      })
      .attr("x", xScale(xAccessor(datum)) - 20)
      .attr("y", function (d) {
        y = yScale(yAccessor(datum));
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

  function resetSelectionEffects(prevObject, selectObject) {
    tmpPrevObject = prevObject;
    tmpSelectObject = selectObject
    mirrorResetSelectionEffects(tmpPrevObject, tmpSelectObject)
    selectedPlayerNames = [];
    $("#player1").empty();
    $("#player2").empty();

    // Select first object and remove circle
    prevObjectSelector = stripString(prevObject.Name, "circle")
    bounds.select(prevObjectSelector)
      .style("z-index", "0");

    selectObjectSelector = stripString(selectObject.Name, "circle")
    bounds.select(selectObjectSelector)
      .style("z-index", "0");

    // Remove all marking effects
    bounds.selectAll("circle.select-effect").remove()
    bounds.selectAll("text#selectText").remove();

    // Set z index to 0
    bounds
      .select(selectObjectSelector)
      .style("z-index", "0")

    bounds
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

  function selectSpecificPlayers(data) {
    // TODO: Hvilket data format fås spillere i?
    namesToDeleteArr = [];
    for (let i = 0; i < data.length; i++) {
      namesToDeleteArr.push(data[i]);
      tmpSelector = stripString(data[i], "circle");
      bounds
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
      //TODO: BUG DO NOT SELECT ALL CIRCLES<
      filtered = filterToTier(data)
      playersToDeleteSet = new Set(filtered)
      const fadeArray2 = tmpArray2.filter((name) => {
        return !playersToDeleteSet.has(name)
      });

      for (let i = 0; i < fadeArray2.length; i++) {
        selector = stripString(fadeArray2[i], "circle")
        bounds
          .select(selector)
          .attr("opacity", opacity)
          .attr("pointer-events", "none")
      }



    }
    if (checkLegendActive() === false) {

      for (let i = 0; i < fadeArray.length; i++) {
        selector = stripString(fadeArray[i], "circle");

        bounds
          .select(selector)
          .attr("opacity", opacity)
          .attr("pointer-events", "none");

      }
      savedDataFromPreviousCall = namesToDeleteSet

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

  var legendItemSize = 12;
  var legendSpacing = 20;
  legendFontSize = "12px";
  var scale = 1.5;
  var offsetX = 10;
  var offsetY = 6;
  let clickedMap = new Map();
  fillClickedMap();

  function fillClickedMap() {
    for (i = 0; i < colorRanksSorted.length; i++) {
      clickedMap.set(colorRanksSorted[i], false);
    }
  }

  let legendDimensions = {
    width: 0,
    height: 0,
    margin: 10,
  };
  legendDimensions.width =
    colorRanksSorted.length * (legendItemSize + legendSpacing);
  numericFontSize = parseInt(legendFontSize.replace(/\D/g, ""));
  legendDimensions.height =
    numericFontSize + legendItemSize + legendDimensions.margin;

  const legendWrapper = d3
    .select("#legend")
    .append("svg")
    .attr("width", legendDimensions.width)
    .attr("height", legendDimensions.height);

  const legend = legendWrapper
    .selectAll("g")

    .data(colorRanksSorted)
    .enter()
    .append("g");

  legend
    .append("rect")
    .attr("id", "rects")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .attr("x", function (d, i) {
      return (x = (legendItemSize + legendSpacing) * i + offsetX);
    })
    .attr("y", function (d) {
      return legendItemSize / 2;
    })
    .style("fill", colorScale);

  // ADD TEXT
  legend
    .append("text")
    .attr("id", "text")
    .attr(
      "x",
      (d, i) => (x = (legendItemSize + legendSpacing) * i + legendItemSize)
    )
    .attr(
      "y",
      (d, i) => (y = offsetY + legendDimensions.margin + legendItemSize)
    )
    .style("font-size", legendFontSize)
    .style("z-index", "5")
    .style("text-align", "center")
    .text(function (d) {
      return d;
    })
    .attr("pointer-events", "none");

  legend.on("click", clickLegend);

  function clickLegend(datum) {
    // Click legend and increase size + alter growth position
    if (clickedMap.get(datum) == false) {
      var counter = colorRanksSorted.indexOf(datum);
      d3.select(this)
        .select("#rects")
        .transition()
        .duration(250)
        .attr("width", legendItemSize * scale)
        .attr("height", legendItemSize * scale)
        .attr("x", calculatePlacementX(this))
        .attr("y", calculatePlacementY(this));

      d3.select(this)
        .select("#text")
        .transition()
        .duration(250)
        .attr("x", function (d) {
          return (x = (legendItemSize + legendSpacing) * counter + offsetX);
        })
        .attr(
          "y",
          (d, i) =>
            (y = offsetY + legendDimensions.margin + legendItemSize * scale)
        );
      // Update internal state of clickedgroups
      updatePlayerDataWithClickedGroup(datum, 1);
    }
    // unclick legend removing effect and decreasing size + reposition
    if (clickedMap.get(datum) == true) {
      var counter = colorRanksSorted.indexOf(datum);
      d3.select(this)
        .select("#rects")
        .transition()
        .duration(250)
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("x", function (d) {
          return (x = (legendItemSize + legendSpacing) * counter + offsetX);
        })
        .attr("y", function (d) {
          return (y = legendItemSize / 2);
        });

      d3.select(this)
        .select("#text")
        .transition()
        .duration(250)
        .attr("x", function (d) {
          return (x = (legendItemSize + legendSpacing) * counter + offsetX + 2);
        })
        .attr("y", function (d) {
          return (y = offsetY + legendDimensions.margin + legendItemSize);
        });
      updatePlayerDataWithClickedGroup(datum, 0);
    }
    alternating = clickedMap.get(datum);
    alternating = alternating ? false : true;
    clickedMap.set(datum, alternating);
    drawEffects();


    //enlargeClickedGroup();
  }
  function calculatePlacementX(object) {
    x1 = d3.select(object).node().getBBox().x;
    x2 = d3.select(object).node().getBBox().x + legendItemSize;
    x = (x2 + x1) / 2 - offsetX;
    return x;
  }
  function calculatePlacementY(object) {
    y1 = d3.select(object).node().getBBox().y;
    y2 = d3.select(object).node().getBBox().y + legendItemSize;
    y = (y2 + y1) / 2 - offsetY;
    return y;
  }

  function updatePlayerDataWithClickedGroup(groupType, state) {
    for (let [key, value] of playerDataMap) {
      tmpObject = { Tier: "null", State: 0 };
      // Check if state == 2 do not overwrite selection
      if (groupType === value.Tier && value.State != 2) {
        tmpObject.Tier = value.Tier;
        tmpObject.State = state;
        playerDataMap.set(key, tmpObject);
      }
    }
  }
  function checkTierActive(groupType) {
    for (let [key, value] of clickedMap) {
      if (key === groupType && value === true) {
        //console.log("key: " + key + " & value: " + value)      
        return true


      }
    }


    return false
  }
  function updatePlayerDataWithSpecificPlayer(player, state) {
    tmpObject = {
      Tier: "null",
      State: 0
    }
    playerObject = playerDataMap.get(player)
    tmpObject.Tier = playerObject.Tier
    tmpObject.State = state
    playerDataMap.set(player, tmpObject)


  }

  // Function should fade all groups but the ones with state 1 or 2. State 1 active state 2 selected
  function drawEffects() {
      let exportResetOrFade = false
      clickedFalseCounter =0
      selectionsCounter =0
      //TODO : missing able to check for more ranks, only checking for one
      // && savedDataFromPreviousCall.size != savedDataFromPreviousCall.size

      if (checkLegendActive()=== true && savedDataFromPreviousCall.size !== undefined  ){
        console.log(playerDataMap)
        console.log(savedDataFromPreviousCall.size)
        let saved = Array.from(savedDataFromPreviousCall)
         filteredPlayers = filterToTier(saved)
        filteredPlayersSet = new Set(filteredPlayers)
        
        tempDataset =[]
        for (let i=0; i<dataset.length; i++){
            tempDataset.push(dataset[i].Name)
            
        }

    clickedFalseCounter = 0
    selectionsCounter = 0
    //TODO : missing able to check for more ranks, only checking for one
    // && savedDataFromPreviousCall.size != savedDataFromPreviousCall.size

    if (checkLegendActive() === true && savedDataFromPreviousCall.size !== undefined) {
      console.log(playerDataMap)
      console.log(savedDataFromPreviousCall.size)
      let saved = Array.from(savedDataFromPreviousCall)
      filteredPlayers = filterToTier(saved)
      filteredPlayersSet = new Set(filteredPlayers)

      tempDataset = []
      for (let i = 0; i < dataset.length; i++) {
        tempDataset.push(dataset[i].Name)

      }

      const fadeArray3 = tempDataset.filter((name) => {
        return !filteredPlayersSet.has(name)
      })
      console.log(fadeArray3.length)
      for (let i = 0; i < fadeArray3.length; i++) {
        selectorThis = stripString(fadeArray3[i], "circle")
        bounds
          .select(selectorThis)
          .transition()
          .duration(250)
          .attr("opacity", opacity)
          .attr("pointer-events", "none");

<<<<<<< HEAD
        }
        mirrorDrawEffects(filteredPlayers, fadeArray3, 1)
        return
    
    }
    let tmpArrayToFade = new Set()
    let tmpArrayNotToFade = new Set()
    for (let [key, value] of playerDataMap) {
        selector = stripString(key, "circle")
        
       
        
      if (value.State === 0) {
        tmpArrayToFade.add(key)
        clickedFalseCounter +=1
=======
      }
      //mirrorDrawEffects(filteredPlayers, fadeArray3, 1)
      return

    }

    for (let [key, value] of playerDataMap) {
      selector = stripString(key, "circle")


      // IF INACTIVE
      if (value.State === 0) {

        clickedFalseCounter += 1
>>>>>>> 274b484503297c4f4d913fe2f1221b69f3f934c8
        bounds
          .select(selector)
          .transition()
          .duration(250)
          .attr("opacity", opacity)
          .attr("pointer-events", "none");
      }
      // Aktiver igen
<<<<<<< HEAD
      if (value.State === 1){
        tmpArrayNotToFade.add(key)
=======
      if (value.State === 1) {
>>>>>>> 274b484503297c4f4d913fe2f1221b69f3f934c8
        bounds
          .select(selector)
          .transition()
          .duration(250)
          .attr("opacity", "1")
          .attr("pointer-events", "auto")
      }
      
      // Hvis alle states er inaktive så vises alle datapunkter
<<<<<<< HEAD
      if (clickedFalseCounter === playerDataMap.size -2 || clickedFalseCounter === playerDataMap.size ){
        exportResetOrFade = true  
        bounds.selectAll('circle')
          .transition()
        .duration(250)
        .attr("opacity", "1")
        .attr("pointer-events", "auto")
        //mirrorDrawEffects(null, null ,3)
=======
      if (clickedFalseCounter === playerDataMap.size - 2 || clickedFalseCounter === playerDataMap.size) {
        bounds.selectAll('circle')
          .transition()
          .duration(250)
          .attr("opacity", "1")
          .attr("pointer-events", "auto")
>>>>>>> 274b484503297c4f4d913fe2f1221b69f3f934c8
      }
    }
    if (exportResetOrFade == false){
      mirrorDrawEffects(tmpArrayNotToFade, tmpArrayToFade, 2)
    }
    if (exportResetOrFade == true){
      mirrorDrawEffects(null, null, 3)
    }


  }



  function reset() {
    console.log("reset");
    bounds
      .selectAll("circle")
      .transition()
      .duration(350)
      .attr("opacity", 1)
      .attr("pointer-events", "auto");

    // remove select effect

    prevSelectedObject = null;
    selectedObject = null;
    bounds.selectAll("text#selectText").remove();
    bounds.selectAll("circle.select-effect").remove();
    for (let [key, value] of playerDataMap) {
      temp = playerDataMap.get(key)
      temp.State = 0;
      playerDataMap.set(key, temp)
    }
    //console.log(playerDataMap)
    for (let [key, value] of clickedMap) {
      clickedMap.set(key, false);
    }

    // TODO: BAD WAY TO DO THIS!
    legendStatus = false;
    legend.selectAll("rect").remove();
    legend.selectAll("text").remove();

    legend
      .append("rect")

      .attr("id", "rects")
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .attr("x", function (d, i) {
        return (x = (legendItemSize + legendSpacing) * i + offsetX);
      })
      .attr("y", function (d) {
        return legendItemSize / 2;
      })
      .style("fill", colorScale);

    legend
      .append("text")

      .attr("id", "text")
      .attr(
        "x",
        (d, i) => (x = (legendItemSize + legendSpacing) * i + legendItemSize)
      )
      .attr(
        "y",
        (d, i) => (y = offsetY + legendDimensions.margin + legendItemSize)
      )
      .style("font-size", legendFontSize)
      .style("z-index", "5")
      .style("text-align", "center")
      .text(function (d) {
        return d;
      })
      .attr("pointer-events", "none");

    // Remove mosaic plot
    mosiac1 = document.getElementById("player1");
    mosiac2 = document.getElementById("player2");
    mosiac1.innerHTML = "";
    mosiac2.innerHTML = "";
    selectedPlayerNames = [];
  }
}
