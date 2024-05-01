const fs = require('fs') as typeof import('fs');

export default async function DynamicScenarioOutlinePlugin(
  content: string
): Promise<string> {
  if (!content.includes('Examples:')) {
    return content;
  }
  let match: RegExpExecArray | null;
  while ((match = /Examples:\s*(.*?\.examples)/gi.exec(content))) {
    let file = await fs.promises.readFile(`./cypress/fixtures/${match[1]}`);
    content = content.replace(match[0], 'Examples:\n' + file);
  }
  return content;
}
