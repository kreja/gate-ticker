'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { List, Toast, Icon, Flex } from 'antd-mobile';
import fetch from '../../utils/ajax.js';
import constants from '../../utils/constants.js';

import 'antd-mobile/dist/antd-mobile.css';
import './index.scss';

const Item = List.Item;
const { defaultRefreshIntervalMs, defaultSelectedMaps, symbols } = constants;

class Index extends React.Component {
  static propTypes = {
    dataList: PropTypes.array,
    refreshIntervalMs: PropTypes.number,
    selectMaps: PropTypes.object
  }

  static defaultProps = {
    dataList: [],
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps
  }

  constructor(props) {
    super(props);
    
    const { dataList } = this.props;

    this.state = {
      dataList,
      isLoading: false
    };
  }

  componentDidMount() {
    this.getData();
    setInterval(this.getData, this.props.refreshIntervalMs);
  }

  getData = () => {
    this.setState({
      isLoading: true
    });

    fetch({
      api: 'tickers',
      data: {},
      suc: (data = {}) => {
        const dataList = this.processData(data);

        this.setState({
          dataList,
          isLoading: false
        });

        chrome.storage && chrome.storage.sync.set({
          dataList
        });
      },
      err: (e) => {
        this.setState({
          isLoading: false
        });
        Toast.fail(e || chrome.i18n.getMessage("loadfail"), 2)
      }
    })
  }

  processData = (allTickers) => {
    const { selectMaps } = this.props; // {usdt: [btc, eth]}
    let dataList = [];

    for(var market in selectMaps){
      const curExchangeList = selectMaps[market] || [];

      curExchangeList.map((coin) => {
        const exchange = `${coin}_${market}`;
        dataList.push(Object.assign({}, allTickers[exchange], { exchange }));
      });
    }

    return dataList;
  }

  render() {
    const { dataList, isLoading } = this.state;
    const { noticeMaps } = this.props;

    return (
      <div className="index-page">
        <Flex align="center">
          <a className="btn-setting iconfont icon-setting" href="./options.html" target="_blank"></a>
          <Flex.Item><h1 className="title"><a href="https://gate.io/ref/707518" target="_blank">{chrome.i18n.getMessage("appName")}</a></h1></Flex.Item>
          <span className="loading">{ isLoading && <Icon type="loading" /> }</span>
        </Flex>
        <List className="coin-list">
          {
            dataList.map((item, index) => {
              const { last, percentChange, exchange } = item;
              let cls;
              let reached = false;

              switch(true) {
                case percentChange > 0:
                  cls = 'up';
                  break;
                case percentChange < 0:
                  cls = 'down';
                  break;
                default:
                  cls = 'same';
                  break;
              }

              symbols.map((syItem) => {
                const { symbol, flag } = syItem;
                const curNotice = noticeMaps[`${exchange}${symbol}`];

                if(curNotice && (last - curNotice.rate) * flag >= 0){
                  reached = symbol;
                }
              });

              return <Item key={index} extra={<span className={`percent ${cls}`}>
                  {percentChange > 0 ? <span>+</span> : ''}
                  <span className="rate-change">{percentChange != undefined ? `${percentChange.toFixed(2)}` : '--'}%</span>
                </span>}>
                <div className="coin-name">
                  <a href={`https://gate.io/trade/${exchange}`} target="_blank">{exchange}</a>
                  { reached && <span className={`iconfont icon-tip ${reached}`}></span> }
                  <span className={`price ${cls}`}>{last != undefined ? last : '--'}</span>
                </div>
              </Item>;
            })
          }
        </List>
      </div>
    );
  }
}

if (chrome.storage) {
  chrome.storage.sync.get({
    dataList: [],
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps,
    noticeMaps: {}
  }, (items) => {
    ReactDOM.render(<Index {...items} />, document.getElementById('example'));
  });
} else {
  ReactDOM.render(<Index />, document.getElementById('example'));
}

