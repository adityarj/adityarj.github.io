function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {
        "HYBYCOZO":"#002A49",
        "artbox":"#000000",
        "artzoo":"#C1C0E0",
        "colourful garden of lights":"#3E1283",
        "dande-lier":"#AFCCEA",
        "gastrobeats":"#4245B6",
        "home":"#F9F8FD",
        "horizontal interference":"#AD79FF",
        "moonflower":"#92909D",
        "ocean pavilion":"#085DB7",
        "passage of inner reflection":"#C9CCDB",
        "the urchin":"#FAFBF5",
        "ultra light network":"#ff8005",
        "uncle ringo":"#AA331F"
    }[c]; }
    
    fData.forEach(function(d){
        d.total = 0;
        var counts = Object.values(d.freq);
        for (var i = 0; i< counts.length; i++) {
            d.total += counts[i];
        }
    });
    

    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r, 
        hGDim.h = 300 - hGDim.t - hGDim.b;
            
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        hGsvg.append("text")
        .attr("x", (hGDim.w / 2))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
            .style("font-family","Dosis")
        .text("");

        var x = d3.scaleBand().rangeRound([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.axisBottom().scale(x));

        var y = d3.scaleLinear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");
        
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.
            
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .style("font-family","Dosis")
            .attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");
        
        function mouseover(d){
            var st = fData.filter(function(s){ return s.Day == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
            pC.updateTitle(d[0]);
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){ 
            pC.updateTitle("");
            pC.update(tF);
            leg.update(tF);
        }
        
        hG.update = function(nD, color){
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            var bars = hGsvg.selectAll(".bar").data(nD);

            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }

        hG.updateTitle = function(exhibit) {
            hGsvg.select("text").transition().duration(500)
                .text(exhibit);
        }

        return hG;
    }
    
    function pieChart(pD){
        var pC ={},    pieDim ={w:300, h: 300};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
        
        piesvg.append("text")
        .attr("x", 0)
        .attr("y", -135)
        .attr("text-anchor", "middle")
            .style("font-family","Dosis")
        .text("");

        var arc = d3.arc().outerRadius(pieDim.r - 30).innerRadius(0);
        var pie = d3.pie().sort(null).value(function(d) { return d.freq; });

        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }

        pC.updateTitle = function(day) {
            piesvg.select("text").transition().duration(500)
                .text(day);
        }

        function mouseover(d){
            hG.updateTitle(d.data.type);
            hG.update(fData.map(function(v){ 
                return [v.Day,v.freq[d.data.type]];}),segColor(d.data.type));
        }

        function mouseout(d){
            hG.updateTitle("");
            hG.update(fData.map(function(v){
                return [v.Day,v.total];}), barColor);
        }
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
        return pC;
    }
    
    function legend(lD){
        var leg = {};
            
        var legend = d3.select(id).append("table").attr('class','legend');
        
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
            
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
      .attr("fill",function(d){ return segColor(d.type); });
            
        tr.append("td")
            .style("font-family","dosis")
            .text(function(d){ return d.type;});

        tr.append("td").attr("class",'legendFreq')
            .style("font-family","dosis")
            .text(function(d){ return d3.format(",")(d.freq);});


        leg.update = function(nD){
            var l = legend.select("tbody").selectAll("tr").data(nD);
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        
        function getLegend(d,aD){
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }

    var exhibits = [
        "HYBYCOZO",
        "artbox",
        "artzoo",
        "colourful garden of lights",
        "dande-lier",
        "gastrobeats",
        "home",
        "horizontal interference",
        "moonflower",
        "ocean pavilion",
        "passage of inner reflection",
        "the urchin",
        "ultra light network",
        "uncle ringo"
    ]
    

    var tF = exhibits.map(function(d){
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });    
    
    var sF = fData.map(function(d){return [d.Day,d.total];});

    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
}

var exhibitdata;
d3.csv("data/exhibition-days-week.csv",function (error,data) {
    exhibitdata =[
        {Day:'Sun',freq:{}}
        ,{Day:'Mon',freq:{}}
        ,{Day:'Tue',freq:{}}
        ,{Day:'Wed',freq:{}}
        ,{Day:'Thur',freq:{}}
        ,{Day:'Fri',freq:{}}
        ,{Day:'Sat',freq:{}}
    ];
    for (var i = 0; i < data.length; i++) {
        // console.log(data[i]);
        // console.log(freqData[data[i].DAY])
        exhibitdata[data[i].DAY].freq[data[i].exhibition] = parseInt(data[i].count);
    }
    // console.log(exhibitdata);
    dashboard('#daysWeek',exhibitdata);
});