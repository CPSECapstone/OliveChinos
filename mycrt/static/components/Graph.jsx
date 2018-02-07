import React, { Component } from 'react'
import {LineChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts'
import { connect } from 'react-redux'

class Graph extends Component {
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

    //function to get the correct colors for the lines being graphed (feel free to change the color options in this array)
    //and return random color for each different line in the graph - max lines is 8, feel free to change that too
    getRandomColor(index) {
        let colorValues = ["deepskyblue", "lightsalmon", "darkolivegreen", "darkred", "blue", "goldenrod", "grey", "peru" ];
        if(this.props.values.length < 8) {
            return colorValues[index]
        }
        else {
            alert('Maximum Lines For Graph Reached')
            return 'white'
        }
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
        for (var outer = 0; outer < listOfAnalytics.length; outer++ ) {
            let pointsValues = []
                for(let i = 0; i < listOfAnalytics[outer][this.props.metric].length; i++) {
                let currPoint = {value: `${i}`, metric: listOfAnalytics[outer][this.props.metric][i].Average}
                values.push(listOfAnalytics[outer][this.props.metric][i].Average)
                pointsValues.push(currPoint)
                }
                listOfTotalPoints.push(pointsValues)
            }
        this.setState({totalValuesArray: values})
        return listOfTotalPoints;
    }

    //helper function to get minimum value of current total data being graphed
    //in ordder to scale the x axis
    getMin() {
        let totalValues = []
        for(let i = 0; i < this.props.pointsArray.length; i++) {
            totalValues.push(this.props.pointsArray[i][this.props.metric])
        }
        let dataMin = totalValues.reduce(function(a, b) {
            return Math.min(a, b);
        });
        return Math.floor(dataMin)
    }

    //helper function to get maximum value of current total data being graphed
    getMax() {
        let totalValues = []
        for(let i = 0; i < this.props.pointsArray.length; i++) {
            totalValues.push(this.props.pointsArray[i][this.props.metric])
        }
        let dataMax = totalValues.reduce(function(a, b) {
            return Math.max(a, b);
        });
        return Math.ceil(dataMax)
    }

    //either graphs an empty graph if no replay or metric has been selected or 
    //the lines that represent the replays that have been selected for that metric
    renderGraph() {
        if((!this.props.values) || (!this.props.pointsArray)) {
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
        return (
            <div>
            <div>
                <div>
                <h3 style={{marginLeft:'20px'}}></h3>
            <LineChart width={1400} height={400}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} label={{ angle: -90, position: 'insideLeft' }}/>
            </LineChart>
            </div>
            </div>
        </div>
        );
    }

    //helper function to get all of the 'line' objects to be graphed based on currently
    //selected replays and captures for graphing
    getLines() {
        let linesForGraphing = []
        for(let i = 0; i < this.props.booleansForGraph.length; i++) {
            if(this.props.booleansForGraph[i] == true) {
                let currKey = this.props.totalNames[i];
                let line = <Line key={i} dataKey={currKey} stroke={this.getRandomColor(i)}/>
                linesForGraphing.push(line)
            }
        }
        return linesForGraphing
    }

    //returns the graph with the accurate data represented by lines on the linechart
    //when there is replay data passed in from the graphContainer
    getGraphLines() {
        let linecharts = [];
            return(
            <div>
                <div>
                    <div>
                    <h3 style={{marginLeft:'20px'}}>Metric: {this.props.metric}</h3>
                <LineChart width={1400} height={400} data={this.props.pointsArray}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[this.getMin(), this.getMax()]} label={{ value:this.props.yLabel, angle: -90, position: 'insideLeft' }}/>
                        <Tooltip />
                        <Legend />
                        {this.getLines().map(line => (
                            line
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

const mapStateToProps = state => ({
    booleansForGraph: state.booleansForGraph,
    totalNames: state.totalNames
})

export default connect(mapStateToProps)(Graph)