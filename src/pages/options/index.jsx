'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Range, Flex, WhiteSpace, Tabs, Button, Toast, List, InputItem } from 'antd-mobile';
import Tag from '../../components/tag';
import fetch from '../../utils/ajax.js';
import constants from '../../utils/constants.js';

import 'antd-mobile/dist/antd-mobile.css';
import './index.scss';

const Item = List.Item;
const { defaultRefreshIntervalMs, maxIntervalMs, defaultSelectedMaps, symbols } = constants;
const getSecond = ms => ms / 1000;

class Index extends React.Component {
  static propTypes = {
    refreshIntervalMs: PropTypes.number,
    selectMaps: PropTypes.object,
    noticeMaps: PropTypes.object
  }

  static defaultProps = {
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps,
    noticeMaps: {}
  }

  constructor(props) {
    super(props);
    
    const { refreshIntervalMs, selectMaps, noticeMaps } = this.props;

    this.state = {
      refreshIntervalMs, // unit: ms
      selectMaps, // eg. {usdt: [btc, eth]}
      noticeMaps,

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

  setNotice = (val, key) => {
    const noticeMaps = Object.assign({}, this.state.noticeMaps);

    if(val === ""){
      delete noticeMaps[key];
    }else{
      noticeMaps[key] = {
        rate: Number(val),
        hasReached: false
      };
    }

    this.setState({ noticeMaps });
  }

  save = () => {
    const { selectMaps, refreshIntervalMs, noticeMaps } = this.state;

    if (chrome.storage) {
      chrome.storage.sync.set({
        refreshIntervalMs,
        selectMaps,
        noticeMaps
      }, (items) => {
        Toast.success(chrome.i18n.getMessage("saveSuccess"), 1);

        chrome.runtime.sendMessage({
          method: 'CFGCHANGE'
        }, (response) => {});
      });
    } else {
      console.log(this.state)
    }
  }

  render() {
    console.log(this.state.noticeMaps)
    const { refreshIntervalMs, markets, exchangeMaps, selectMaps, noticeMaps } = this.state;

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

        <Flex align="start">
          <Flex.Item>
            <h2>{chrome.i18n.getMessage("chooseExchange")}</h2>
            <Tabs tabs={tabs} animated={false} className="ex-box">
              {
                markets.map((m) => {
                  const curMarketExList = exchangeMaps[m] || [];
                  return <Flex key={m} className="ex-list" wrap="wrap" align="start">
                    {
                      curMarketExList.map((ex) => {
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
          </Flex.Item>
          <Flex.Item>
            <h2>设置提醒todo::（价格延迟，建议设置宽松一些）</h2>
            <List className="notice-list">
              {
                markets.map((m) => {
                  return (selectMaps[m] || []).map((coin) => {
                    const exchange = `${coin}_${m}`;

                    return <Item key={exchange}>
                      <Flex>
                        <div className="name">{exchange}</div>
                        {
                          symbols.map((item) => {
                            const sym = item.symbol;
                            const curNoticeKey = `${exchange}${sym}`;

                            return <Flex.Item className="notice-set" key={sym}>
                              <InputItem type="digit" value={(noticeMaps[curNoticeKey] || {}).rate} clear onChange={(val) => {
                                this.setNotice(val, curNoticeKey);
                              }}>{sym}</InputItem>
                            </Flex.Item>
                          })
                        }
                      </Flex>
                    </Item>
                  });
                })
              }
            </List>
          </Flex.Item>
        </Flex>
        <WhiteSpace size="lg" />

        <Button className="btn-save" type="primary" onClick={this.save}>{chrome.i18n.getMessage("save")}</Button>
      </div>
    );
  }
}

if (chrome.storage) {
  chrome.storage.sync.get({
    refreshIntervalMs: defaultRefreshIntervalMs,
    selectMaps: defaultSelectedMaps,
    noticeMaps: {}
  }, (items) => {
    ReactDOM.render(<Index {...items} />, document.getElementById('example'));
  });
} else {
  ReactDOM.render(<Index />, document.getElementById('example'));
}
