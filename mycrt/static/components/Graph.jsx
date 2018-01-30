import React, { Component } from 'react'
// import LineChart from 'react-linechart'
import {LineChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts'
// import { line } from '../../../../../../Library/Caches/typescript/2.6/node_modules/@types/d3-shape';

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

    getRandomColor() {
        let colorValues = ["darkred", "blue", "darkolivegreen", "deepskyblue", "goldenrod", "grey", "lightsalmon", "peru" ];
        return colorValues[Math.floor(Math.random() * colorValues.length)];
    }

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

    getMin() {
        let dataMin = this.props.values.reduce(function(a, b) {
            return Math.min(a, b);
        });
        return Math.floor(dataMin)
    }

    getMax() {
        let dataMax = this.props.values.reduce(function(a, b) {
            return Math.max(a, b);
        });
        return Math.ceil(dataMax)
    }

    renderGraph() {
        if((this.props.values == 'none') || (this.props.pointsArray == 'none')) {
            return <div>Empty Graph here</div>
        }
        else {
            return (
                <div>
                    {this.getGraphLines()}
                </div>
            );
        }
    }

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
