'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Range, Flex, WhiteSpace, Tabs, Button, Toast } from 'antd-mobile';
import Tag from '../../components/tag';
import fetch from '../../utils/ajax.js';
import constants from '../../utils/constants.js';

import 'antd-mobile/dist/antd-mobile.css';
import './index.scss';

const { defaultRefreshIntervalMs, maxIntervalMs, defaultSelectedMaps } = constants;
const getSecond = ms => ms / 1000;

class Index extends React.Component {
  static propTypes = {
    refreshIntervalMs: PropTypes.number,
    selectMaps: PropTypes.object
  }

  static defaultProps = {
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps
  }

  constructor(props) {
    super(props);
    
    const { refreshIntervalMs, selectMaps } = this.props;

    this.state = {
      refreshIntervalMs, // unit: ms
      selectMaps, // eg. {usdt: [btc, eth]}

      markets: [],
      exchangeMaps: {}, // eg. {usdt: [btc, eth]}
    };
  }

  componentDidMount() {
    this.getPairs();
  }

  getPairs = () => {
    const t = setTimeout(() => {
      Toast.loading(chrome.i18n.getMessage("loading"));
    }, 500);

    fetch({
      api: 'pairs',
      data: {},
      suc: (data = {}) => {
        clearTimeout(t);
        Toast.hide();
        const markets = [];
        const exchangeMaps = {};

        data.map((item = '') => {
          const [exchange, market] = item.split('_') || ['', ''];

          if (markets.indexOf(market) < 0) {
            markets.push(market);
          }
          
          if (!exchangeMaps[market]) {
            exchangeMaps[market] = [];
          }

          exchangeMaps[market].push(exchange);
        });
        
        this.setState({
          markets,
          exchangeMaps
        });
      },
      err: (e) => {
        clearTimeout(t);
        Toast.fail(e || chrome.i18n.getMessage("loadfail"), 2)
      }
    })
  }

  changeInterval = (range = []) => {
    if(range[1] > 0){ // interval must > 0
      this.setState({
        refreshIntervalMs: range[1]
      });
    }
  }

  changeExchange = (selected, value='') => {
    const { selectMaps } = this.state;
    const [exchange, market] = value.split('_') || ['', ''];
    let marketSelects = selectMaps[market]; // selected list under current market

    if (selected) { // add
      if(!marketSelects){
        marketSelects = [];
      }

      if (marketSelects.indexOf(exchange) < 0) {
        marketSelects.push(exchange);
      }
    } else if (marketSelects) { // remove
      marketSelects.splice(marketSelects.indexOf(exchange), 1);
    }
    
    selectMaps[market] = marketSelects;
    this.setState({ selectMaps });
  }

  save = () => {
    const { selectMaps, refreshIntervalMs } = this.state;

    if (chrome.storage) {
      chrome.storage.sync.set({
        refreshIntervalMs,
        selectMaps
      }, (items) => {
        Toast.success(chrome.i18n.getMessage("saveSuccess"), 1);
      });
    } else {
      console.log(this.state)
    }
  }

  render() {
    const { refreshIntervalMs, markets, exchangeMaps, selectMaps } = this.state;

    const tabs = markets.map((m) => {
      return {title: m};
    });

    return (
      <div className="options-page">
        <h1 className="title">{chrome.i18n.getMessage("confTitle")}</h1>
        <WhiteSpace size="lg" />

        <h2>{chrome.i18n.getMessage("chooseRefreshInterval")}</h2>
        <Flex>
          <Flex.Item>
            <Range
              handleStyle={[{display: 'none'}, {
                borderRadius: 0,
                width: '6px',
                height: '16px',
                marginLeft: '-3px',
                marginTop: '-7px',
              }]}
              min={0}
              max={maxIntervalMs}
              step={1000}
              value={[0, refreshIntervalMs]}
              onChange={this.changeInterval}
              onAfterChange={()=>{}}
            />
          </Flex.Item>
          <div className="interval">{getSecond(refreshIntervalMs)}s</div>
        </Flex>
        <WhiteSpace size="lg" />

        <h2>{chrome.i18n.getMessage("chooseExchange")}</h2>
        <Tabs tabs={tabs} animated={false}>
          {
            markets.map((m) => {
              const exList = exchangeMaps[m] || [];
              return <Flex key={m} className="ex-list" wrap="wrap" align="start">
                {
                  exList.map((ex) => {
                    return <Tag key={ex}
                      selected={selectMaps[m] && selectMaps[m].indexOf(ex) > -1}
                      onChange={this.changeExchange} value={`${ex}_${m}`}
                    >
                      {ex}
                    </Tag>;
                  })
                }
              </Flex>;
            })
          }
        </Tabs>
        <WhiteSpace size="lg" />

        <Button className="btn-save" type="primary" onClick={this.save}>{chrome.i18n.getMessage("save")}</Button>
      </div>
    );
  }
}

if (chrome.storage) {
  chrome.storage.sync.get({
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps
  }, (items) => {
    ReactDOM.render(<Index {...items} />, document.getElementById('example'));
  });
} else {
  ReactDOM.render(<Index />, document.getElementById('example'));
}
