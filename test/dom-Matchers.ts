import { toContainText } from "./matchers/toContainText.test";
import { toContainHTML } from "./matchers/toContainHTML.test";
expect.extend({ toContainText, toContainHTML});