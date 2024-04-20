const model = 'gpt-4';
export const openaiFunctionCall = (spanish) => {
  return {
    model: model,
    messages: [
      {
        role: 'user',
        content: `What is the English translation of "${spanish}"? Please only return the translation in English.`,
      },
    ],
    functions: [
      {
        name: 'translatePhrase',
        parameters: {
          type: 'object',
          properties: {
            spanish: {
              type: 'string',
            },
            english: {
              type: 'string',
            },
          },
          required: ['spanish', 'english'],
        },
      },
    ],
    function_call: { name: 'translatePhrase' },
  };
};

export const openaiResponse = (spanish, english) => {
  return {
    choices: [
      {
        message: {
          content: 'Hello',
          function_call: {
            name: 'translatePhrase',
            arguments: JSON.stringify({ spanish, english }),
          },
        },
      },
    ],
  };
};
