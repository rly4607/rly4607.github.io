var React = require('react')

var ReactChartJS = require('react-chartjs-2')
var {Pie} = ReactChartJS

import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

//// Make a library???? ///

// var Converter = require("csvtojson").Converter;
//
// var fs=require("fs");
//
// var csvFileName="../data/ProductionYields.csv"
//
// var csvConverter=new Converter({});
//
// csvConverter.on("end_parsed",function(jsonObj){
//   console.log(jsonObj);
// });
//
// fs.createReadStream(csvFileName).pipe(csvConverter)

//// Make a library???? ///

var YieldData = require('../data/ProductionYields.json')

var ProdYieldChart = React.createClass({
  handleChange: function(event) {
    this.setState({
      query: event.value
    })
  },
  handleChangeDate1: function(event) {
    this.setState({
      startDate: event.value
    })
  },
  handleChangeDate2: function(event) {
    this.setState({
      finishDate: event.value
    })
  },
  getInitialState: function() {
    return {
      query: "Loading...",
      startDate: "1/1/2000",
      finishDate: "1/1/2100"
    }
  },
  render: function() {

    // Filter out blank rows from JSON data

    Array.prototype.contains = function(v) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = function() {
        var arr = [];
        for(var i = 0; i < this.length; i++) {
            if(!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    }

    var FilteredData = [0]
    var ProductTypes = [0]
    var DateRange = [0]
    var i=0;
    var k=0;

    for (i=0; i<YieldData.length; i++) {
      if(YieldData[i]["Part Type"]) {
        FilteredData[k] = YieldData[i];
        ProductTypes[k] = FilteredData[k]["Part Number"];
        DateRange[k] = FilteredData[k].Date;
        FilteredData[k].DateData = new Date(FilteredData[k].Date);
        k++;
      }
    }

    window.FilteredData = FilteredData
    window.DateRange = DateRange

    const MenuOptions = ProductTypes.unique()
    const DateOptions = DateRange.unique()

    if(this.state.query === "Loading...") {
      var testCase = MenuOptions[0];
    }
    else {
      testCase = this.state.query;
    }

    var startDateData = new Date(this.state.startDate)
    var finishDateData = new Date(this.state.finishDate)

    var Pass = FilteredData.reduce(function(count, failure) {
      return count + ((failure["Pass / Fail"] === 'Pass') && (failure["Part Number"] === testCase) && (failure.DateData.getTime() >= startDateData.getTime()) && (failure.DateData.getTime() <= finishDateData.getTime()))
    }, 0)
    var Fail = FilteredData.reduce(function(count, failure) {
      return count + ((failure["Pass / Fail"] === 'Fail') && (failure["Part Number"] === testCase) && (failure.DateData.getTime() >= startDateData.getTime()) && (failure.DateData.getTime() <= finishDateData.getTime()))
    }, 0)

    var PassLabel = "Pass: " + Math.round((Pass/(Pass+Fail))*100) + "%"
    var FailLabel = "Fail: " + Math.round((Fail/(Pass+Fail))*100) + "%"

    var data = {
      labels: [
        PassLabel,
        FailLabel
      ],
      datasets: [
        {
          data: [Pass, Fail],
          backgroundColor: [
              "#36A2EB",
              "#FF6384"
          ],
          hoverBackgroundColor: [
              "#000088",
              "#000088"
          ]
        }
      ]
    }

    var ChartOptions = {}

    console.log("States... Query: ", this.state.query, " startDate: ", this.state.startDate, " finishDate: ", this.state.finishDate)

    return (
      <div className="row">
        <div className="col-sm-4 SelectMenu">
          <h2 className="select">Select Product: </h2>
          <Dropdown options={MenuOptions} onChange={this.handleChange} value={this.state.query} placeholder={"Select an option"} />
          <h2 className="select">Select Date Range </h2>
          <Dropdown options={DateOptions} onChange={this.handleChangeDate1} value={this.state.startDate} placeholder={"Select an option"} />
          <Dropdown options={DateOptions} onChange={this.handleChangeDate2} value={this.state.finishDate} placeholder={"Select an option"} />
          <h2 className="results">Date Range: {this.state.startDate + " to " + this.state.finishDate}</h2>
          <h2 className="results"><br /></h2>
          <h2 className="results">Total Units Tested: {Math.round(Pass+Fail)}</h2>
          <h2 className="results">Units Passed: {Math.round(Pass)}</h2>
          <h2 className="results">Units Failed: {Math.round(Fail)}</h2>
        </div>
        <div className="map col-sm-8">
          <Pie data={data} height={150} options={ChartOptions} />
        </div>
      </div>
    )
  }
})

module.exports = ProdYieldChart
