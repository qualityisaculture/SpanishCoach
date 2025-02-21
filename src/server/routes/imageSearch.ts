const express = require('express');
const imageSearchRoutes = express.Router();
const GoogleImages = require('google-images');
import {
  TypedResponse as TR,
  TypedRequestQuery as TRQ,
  TypedRequestBody as TRB,
} from '../../Types';

let CSE_ID = process.env.GOOGLE_CSE_ID;
let API_KEY = process.env.GOOGLE_API_KEY;
const client = new GoogleImages(CSE_ID, API_KEY);

type GoogleImagesResponse = {
  url: string;
  type: string;
  width: number;
  height: number;
  size: number;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
};

export type imageSearchRequestType = {
  query: string;
};
export type imageSearchResponseType = {
  urls: string[];
};
imageSearchRoutes.get(
  '/imageSearch',
  async (
    req: TRQ<imageSearchRequestType>,
    res: TR<imageSearchResponseType>
  ) => {
    let query = req.query.query;
    let options = {
      lr: 'lang_es',
    };
    try {
      client
        .search(query, options)
        .then((images: GoogleImagesResponse[]) => {
          res.json({ urls: images.map((image) => image.url) });
        }).catch((err: Error) => {
          console.error(err);
          res.json({ urls: [] });
        });
    } catch (err) {
      console.error(err);
      res.json({ urls: [] });
    }
  }
);

module.exports = imageSearchRoutes;
