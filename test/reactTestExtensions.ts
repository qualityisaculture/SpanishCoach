/**
 * @jest-environment jsdom
 */
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';

let reactRoot;
export let container;

const originalValueProperty = (reactElement: React.ReactElement) => {
  const prototype = Object.getPrototypeOf(reactElement);
  return Object.getOwnPropertyDescriptor(prototype, 'value');
};

export const initialiseDOM = () => {
  container = document.createElement('div');
  document.body.replaceChildren(container);
  reactRoot = ReactDOM.createRoot(container);
};
export const render = (component) => {
  return act(() => reactRoot.render(component));
};
export const renderAndWait = async (component) => {
  return act(async () => reactRoot.render(component));
};
export const element = (query) => {
  return document.querySelector(query);
};
export const elements = (query) => {
  return Array.from(document.querySelectorAll(query));
};
export const switches = () => {
  return elements('.ant-switch');
}
export const buttons = () => {
  return elements('button');
}
export const button = (buttonText?: string) => {
  let buttons = elements('button');
  if (!buttonText) {
    return buttons[0];
  }
  let firstButton = buttons.filter((button) =>
    button.textContent.includes(buttonText)
  )[0];
  if (firstButton) {
    return firstButton;
  } else {
    return null;
  }
};

export const form = () => {
  return element('form');
};
export const span = () => {
  return element('span');
};
export const submit = () => {
  return element('input[type=submit]');
};
export const textInput = () => {
  return element('textArea[type=text]');
};
export const click = (element) => {
  return act(() => element.click());
};
export const clickAndWait = async (element) => {
  return act(async () => element.click());
};
export const change = (target, value: string) => {
  let valueProperty = originalValueProperty(target);
  if (valueProperty && valueProperty.set) {
    valueProperty.set.call(target, value);
    const event = new Event('change', { bubbles: true });
    act(() => target.dispatchEvent(event));
  } else {
    throw new Error('Cannot change value of element');
  }
};
export const changeAndWait = async (target, value) => {
  let valueProperty = originalValueProperty(target);
  if (valueProperty && valueProperty.set) {
    valueProperty.set.call(target, value);
    const event = new Event('change', { bubbles: true });
    return act(async () => target.dispatchEvent(event));
  } else {
    throw new Error('Cannot change value of element');
  }
};
export const callPromiseAndWait = async (promiseResolution, response) => {
  return act(async () => {
    promiseResolution(response);
  });
};
export const mockProps = (mockClass) => {
  const classInstance = mockClass.mock.calls[0];
  const instanceProps = classInstance[0];
  return instanceProps;
};
