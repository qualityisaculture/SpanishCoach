import LangChainHandler from './LangChainHandler';
import { translationDirections } from '../Enums';

let handler = new LangChainHandler();
let input = "hello";
let output = handler.translate(translationDirections.EnglishToSpanish, input);
output.then((result) => {
    console.log(result);
});

