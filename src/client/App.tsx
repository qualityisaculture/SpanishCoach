import React, { ComponentProps } from 'react';
import { Translator } from './Translator';
import { Typography, Divider, ConfigProvider } from 'antd';
import Footer from './Footer';
import Search from './pages/Search';
import Study from './pages/Study';
import ExampleGenerator from './pages/ExampleGenerator';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const { Title } = Typography;

type Props = {
  focusRef: any;
};
class App extends React.Component<Props> {
  // onSaveToDeck: ComponentProps<typeof DeckSelector>["onSaveToDeck"];
  constructor(props) {
    super(props);
  }

  render() {
    const router = createBrowserRouter([
      { path: '/', element: <Search focusRef={this.props.focusRef} /> },
      { path: '/search', element: <Search focusRef={this.props.focusRef} /> },
      { path: '/study', element: <Study /> },
      { path: '/exampleGenerator', element: <ExampleGenerator /> },
    ]);
    return (
      <>
        <ConfigProvider theme={{ token: {} }}>
          <header>
            <Title>Spanish Companion</Title>
          </header>
          <main>
            <RouterProvider router={router} />
          </main>
          <Footer router={router} />
        </ConfigProvider>
      </>
    );
  }
}
export { App };
