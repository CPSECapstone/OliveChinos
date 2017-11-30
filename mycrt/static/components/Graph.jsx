import React, { Component } from 'react'
// import LineChart from 'react-linechart'
import {LineChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts'

export default class Graph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            analytics: this.props.analytics,
            value: this.props.value,
            title: this.props.title,
            color: this.props.color
        };
    };


    render() {
        console.log('WHAT: ', this.state)
            let pointsValues = []
            let values = []
            let dataMin = 0
            let dataMax = 0
            for(let i = 1; i < this.state.analytics[this.state.value].length + 1; i++) {
              let currPoint = {name: `${i}`, Time: this.state.analytics[this.state.value][i - 1].Average}
              values.push(this.state.analytics[this.state.value][i - 1].Average)
              pointsValues.push(currPoint)
            }
            console.log('THIS IS WHAT U WANNA LOOK AT: ', values)
            dataMin = values.reduce(function(a, b) {
                return Math.min(a, b);
            });
            
            dataMax = values.reduce(function(a, b) {
                return Math.max(a, b);
            });
            dataMin = Math.floor(dataMin)
            dataMax= Math.ceil(dataMax)
            console.log('min: ', Math.floor(dataMin))
            console.log('max: ', Math.ceil(dataMax))
            return(
            <div>
            <div>
                <h3 style={{marginLeft:'20px'}}>{this.state.title}</h3>
                <LineChart width={730} height={250} data={pointsValues}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[dataMin, dataMax]} label={{ value: this.state.yLabel, angle: -90, position: 'insideLeft' }}/>
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Time" stroke={this.state.color} activeDot={{r: 8}} />
                        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                </LineChart>
            </div>
            <hr/>
            </div>
            );
    }
}