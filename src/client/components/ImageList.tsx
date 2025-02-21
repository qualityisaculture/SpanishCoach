import React from 'react';
import { List } from 'antd';

type ImageListProps = {
  urls: string[];
  onImageSelect: (url: string) => void;
};

const ImageList: React.FC<ImageListProps> = ({urls, onImageSelect}) => (
  <List
    itemLayout="vertical"
    size="large"
    pagination={{
      onChange: (page) => {
        console.log(page);
      },
      pageSize: 3,
    }}
    dataSource={urls}
    renderItem={(url) => (
      <List.Item
        key={url}
      >
        <img
            width={272}
            alt="logo"
            src={url}
            onClick={() => onImageSelect(url)}
          />
      </List.Item>
    )}
  />
);

export default ImageList;