import LangChainHandler from './LangChainHandler';
import { translationDirections, SpanishTenses } from '../Enums';

let handler = new LangChainHandler();
// let input = "hello";
// let output = handler.translate(translationDirections.EnglishToSpanish, input);
// output.then((result) => {
//     console.log(result);
// });

// Test for generateVerbExamples
let verb = "comer";
let tense = SpanishTenses.Presente;
let note = "Generate examples for the verb 'comer' in present tense.";
let verbExamples = handler.generateVerbExamples(verb, tense, note);
verbExamples.then((result) => {
    console.log(result);
});

// Test for detectTense
let sentence = "Yo como";
let detectedTense = handler.detectTense(sentence);
detectedTense.then((result) => {
    console.log(result);
});

