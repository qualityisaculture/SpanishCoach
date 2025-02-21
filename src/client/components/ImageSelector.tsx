//create an image selector react component classs which extends react component
//It needs to take:
// - a description of the image which is editable
// - an optional existing image url
// - a function to call when the image is changed
// - a function to call when the image is removed
// it should request the image from the server when the image description is changed
// it should pass the images returned to the ImageList component

import React from 'react';
import { Input, Modal } from 'antd';
import ImageList from './ImageList';
import ButtonRow, { ButtonRowButtonType } from './ButtonRow';
import ServerHandler from '../ServerHandler';
import { imageSearchResponseType } from '../../server/routes/imageSearch';

type Props = {
  description: string;
  imageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onImageRemove: () => void;
};

type State = {
  description: string;
  currentImageUrl: string;
  potentialImagesUrls: string[];
  displayImageViewer: boolean;
};

export default class ImageSelector extends React.Component<Props, State> {
  simpleServerHandler: ServerHandler;
  constructor(props: Props) {
    super(props);
    this.simpleServerHandler = new ServerHandler(
      this.onImagesReceived,
      300
    );
    this.state = {
      description: props.description,
      currentImageUrl: props.imageUrl || '',
      displayImageViewer: false,
      potentialImagesUrls: []
    };
    this.simpleServerHandler.request(`/imageSearch?query=${props.description}`);
  }

  onImagesReceived = (response: imageSearchResponseType) => {
    console.log(response);
    this.setState({
      potentialImagesUrls: response.urls
    });
  }

  onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      description: e.target.value,
    });
    this.simpleServerHandler.request(`/imageSearch?query=${e.target.value}`);
  };

  render() {
    return (
      <>
        <Input
          defaultValue={this.state.description}
          value={this.state.description}
          onChange={this.onDescriptionChange}
        />
        <ImageList 
         urls={this.state.potentialImagesUrls}
         onImageSelect={this.props.onImageChange}
        />
        {/* <ButtonRow
          buttons={[
            {
              type: ButtonRowButtonType.Primary,
              text: 'Remove Image',
              onClick: this.props.onImageRemove,
            },
          ]}
        /> */}
      </>
    );
  }
}