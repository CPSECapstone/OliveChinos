import React, { Component } from 'react'
import LineChart from 'react-linechart'

export default class Graph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            xLabel: this.props.xLabel,
            yLabel: this.props.yLabel,
            analytics: this.props.analytics,
            value: this.props.value
        }
    }

    render() {
            console.log(this.state)
            let pointsValues = []
            for(let i = 1; i < this.state.analytics[this.state.value].length + 1; i++) {
              let currPoint = {x: i, y: this.state.analytics[this.state.value][i - 1].Average}
              pointsValues.push(currPoint)
            }
            const data = [
              {									
                  color: "#298256", 
                  points: pointsValues 
              }
            ];
        return (
            <div>
                <div>
                    <h3 style={{marginLeft:'20px'}}>{this.state.yLabel}</h3>
                    <LineChart 
                        width={600}
                        height={400}
                        data={data}
                        xLabel={this.state.xLabel}
                        yLabel={this.state.yLabel}
                        hidePoints={true}
                        hideXAxis={false}
                        hideYAxis={false}
                    />
                </div>
              </div>
            );
    }
}