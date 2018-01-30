/**
 * 加强版 Tag，onclick 会返回 value
 */

import React, { PropTypes } from 'react';
import { Tag } from 'antd-mobile';

export default class AdvanTag extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string
  }

  static defaultProps = {
    onChange: () => {},
    value: 'btc'
  }

  changeCoin = (a) => {
    const { onChange, value } = this.props;

    this.props.onChange(a, value);
  }

  render() {
    const { children, onChange, ...others } = this.props;

    return (
      <Tag {...others} onChange={this.changeCoin}>{children}</Tag>
    );
  }
}
