import React from 'react';
import { Segmented } from 'antd';
import { SearchOutlined, BulbOutlined, QuestionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

type routerType = {
  navigate: (value: string) => void;
  state: {location : {pathname: string}};
}

type Props = {
    router: routerType
};

type State = {
    selected: string;
};

export default class Footer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.getStateFromRouter(props.router)
    }
  }

  getStateFromRouter = (router: routerType) => {
    switch (router.state.location.pathname) {
      case "/study":
        return "study";
      case "/exampleGenerator":
        return "exampleGenerator";
      default:
       return "search";
    }
  };

  optionChange = (value: string) => {
    this.setState({ selected: value }); 
    this.props.router.navigate("/" + value);
  }

  render() {
    return (
      <footer>
        <div className='footer'>
          <Segmented value={this.state.selected}
            onChange={this.optionChange}
            options={[
              { value: 'search', icon: <SearchOutlined /> },
              { value: 'exampleGenerator', icon: <QuestionOutlined /> },
              { value: 'study', icon: <BulbOutlined /> },
            ]}
            block
          />
        </div>
      </footer>
    );
  }
}
