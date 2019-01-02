import React from "react";
import axios from "axios";

import StockAreaChart from "./StockAreaChart"
import { RoundOf } from "../utils/utils"

const _ = require("lodash");

class View extends React.Component {

    state = {
        symbol: "",
        quote: null,
        loading: false,
        error: "",
        data: [],
        dataLoad: false
    }

    getData = () => {
        this.setState({loading: true})
        axios.
            get(`${process.env.REACT_APP_API_URL}/${String(this.state.symbol).trim()}/batch?types=quote`).
            then(data => {
                this.setState({quote: data.data.quote, symbol: "", loading: false});
            }).catch(() => {
                this.setState({error: "Please check the Stock Symbol again", loading: false})
            })
    }

    handleEnterPress = (e) => {
        if(e.key === 'Enter') {
            this.getData();
            this.getStockData()
        }
    }

    handleClick = () => {
        this.getData();
        this.getStockData()
    }

    handleOnChange = (e) => {
        this.setState({symbol: e.target.value, quote: null, error: "", loading: false, dataLoad: false})
    }

    getStockData = () => {
        let stockData = []
        axios.get(`${process.env.REACT_APP_API_URL}/${this.state.symbol}/chart/1y?chartInterval=10`).then(data => {
            data.data.map(item => {
                let temp = {
                    "date": item.date,
                    "price": RoundOf(item.close, 2)
                }
                stockData.push(temp)
            })

            this.setState({data: stockData, dataLoad: true})
        }) 
    }

    render() {
        return (
            <div className="container" id="search_box_view">
                <div className="field is-horizontal">
                    <div className="control has-icons-right field-label">
                        <span className="icon is-small is-right">
                            <img src={require("../assets/search.png")} alt=""/>
                        </span>
                        <input 
                            className="input"
                            type="text" 
                            name="symbol"
                            onChange={this.handleOnChange}
                            onKeyPress={this.handleEnterPress}
                            autoComplete={"off"}
                            value={this.state.symbol}
                            placeholder="Enter a NASDAQ Stock Symbol(Ex. AAPL)"
                        />
                        {this.state.error ? <p className="help is-danger">{this.state.error}</p> : undefined}
                    </div>

                    <div className="field-item">
                        {this.state.loading ? <button className="button is-link is-loading">Loading</button> :
                        <button className="button is-link" onClick={this.handleClick} >Search</button>}
                    </div>
                </div>

                {_.isEmpty(this.state.quote) ? undefined : 
                    <div>
                        <ul className="view_list">
                            <li>Company Name: <span>{this.state.quote.companyName}</span></li>
                            <li>Symbol: <span>{this.state.quote.symbol}</span></li>
                            <li>Sector: <span>{this.state.quote.sector}</span></li>
                            <li>Current Price: <span id="currPrice">$ {this.state.quote.latestPrice}</span></li>
                            <li>Open Price: <span>$ {this.state.quote.open}</span></li> 
                            <li>Hign Price <span>$ {this.state.quote.high}</span></li> 
                            <li>Low Price <span>$ {this.state.quote.low}</span></li> 
                            <li>Close Price: <span>$ {this.state.quote.close}</span></li>
                            <li>52 Week High: <span>$ {this.state.quote.week52High}</span></li>
                            <li>52 Week Low: <span>$ {this.state.quote.week52Low}</span></li>
                        </ul>
                    </div>
                }
                
                {(!this.state.dataLoad || _.isEmpty(this.state.quote)) ? undefined :
                    <div>
                        <h3 id="view_title" className="title has-text-centered">Historical Data of {this.state.quote.companyName}</h3>
                        <StockAreaChart data={this.state.data} />
                    </div>
                }
            </div>
        )
    };
};

export default View;