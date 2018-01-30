import React, { Component } from 'react'
import {LineChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts'

export default class Graph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            xLabel: '',
            yLabel: '',
            metric: this.props.nameOfMetric,
            selectedData: this.props.selectedData,
            title: ''
        };
    };

    //function to get a random color from this array (feel free to change the color options in this array)
    //and return random color for each different line in the graph
    getRandomColor() {
        let colorValues = ["darkred", "blue", "darkolivegreen", "deepskyblue", "goldenrod", "grey", "lightsalmon", "peru" ];
        return colorValues[Math.floor(Math.random() * colorValues.length)];
    }

    //this function gets the total points to be graphed and the values for
    //the actual linechart. it also sets the state of the totalValuesArray for the linechart
    getTotalPoints() {
        let pointsValues = []
        let values = []
        let dataMin = 0
        let dataMax = 0
        let listOfAnalytics = this.state.selectedData;
        let listOfTotalPoints = []
        // if(this.props.metric == 'CPUUtilization') {
            for (var outer = 0; outer < listOfAnalytics.length; outer++ ) {
                let pointsValues = []
                  for(let i = 0; i < listOfAnalytics[outer][this.props.metric].length; i++) {
                    let currPoint = {value: `${i}`, metric: listOfAnalytics[outer][this.props.metric][i].Average}
                    values.push(listOfAnalytics[outer][this.props.metric][i].Average)
                    pointsValues.push(currPoint)
                  }
                  listOfTotalPoints.push(pointsValues)
                }
        // }
        this.setState({totalValuesArray: values})
        return listOfTotalPoints;
    }

    //helper function to get minimum value of current total data being graphed
    //in ordder to scale the x axis
    getMin() {
        let dataMin = this.props.values.reduce(function(a, b) {
            return Math.min(a, b);
        });
        return Math.floor(dataMin)
    }
    //helper function to get maximum value of current total data being graphed
    //in ordder to scale the x axis
    getMax() {
        let dataMax = this.props.values.reduce(function(a, b) {
            return Math.max(a, b);
        });
        return Math.ceil(dataMax)
    }

    //either graphs an empty graph if no replay or metric has been selected or 
    //the lines that represent the replays that have been selected for that metric
    renderGraph() {
        if((this.props.values == 'none') || (this.props.pointsArray == 'none')) {
            return <div>{this.emptyGraph()}</div>
        }
        else {
            return (
                <div>
                    {this.getGraphLines()}
                </div>
            );
        }
    }

    //empty graph for when no replay has been selected
    emptyGraph() {
        console.log('AYYYYY')
        return (
            <div>
            <div>
                <div>
                <h3 style={{marginLeft:'20px'}}>{this.props.metric}</h3>
            <LineChart width={730} height={250}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} label={{ angle: -90, position: 'insideLeft' }}/>
            </LineChart>
            </div>
            </div>
        </div>
        );
    }

    //returns the graph with the accurate data represented by lines on the linechart
    //when there is replay data passed in from the graphContainer
    getGraphLines() {
        let linecharts = [];
            return(
            <div>
                <div>
                    <div>
                    <h3 style={{marginLeft:'20px'}}>{this.props.metric}</h3>
                <LineChart width={730} height={250} data={this.props.pointsArray}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[this.getMin(), this.getMax()]} label={{ value:this.props.yLabel, angle: -90, position: 'insideLeft' }}/>
                        <Tooltip />
                        <Legend />
                        {this.props.keys.map(currKey => (
                        <Line type="monotone" dataKey={currKey} stroke={this.getRandomColor()} />
                        ))}
                </LineChart>
                </div>
                </div>
            </div>
            );
    }
        

    render() {
        return(
            <div>
                {this.renderGraph()}
            </div>
        );
    }
}
