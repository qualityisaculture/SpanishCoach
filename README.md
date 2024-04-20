# Spanish Coach ![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/qualityisaculture/0862d01524296db71e2f3a6bd632ab3b/raw/jest-coverage-comment__main.json) [![Playwright Tests](https://github.com/qualityisaculture/SpanishCoach/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/qualityisaculture/SpanishCoach/actions/workflows/playwright.yml) [![Default Project](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/detailed/6oef4g&style=flat&logo=cypress)](https://cloud.cypress.io/projects/6oef4g/runs)

An mobile web extension to Anki, which allows you to quickly translate, generate examples and discuss answers for Spanish Flashcards. 

# Setup

- **Install AnkiConnect**: https://ankiweb.net/shared/info/2055492159
- **Export your ChatGPT Token**: EXPORT OPENAI_API_KEY="..."
- **Checkout Repo**
- **Install dependencies**: npm i
- **Build solution**: npm run build
- **Start the application**: npm run start

  You should now be able to navigation to localhost:8080 and start reviewing your cards

# Features

- **Translation**: Translate between English and Spanish. Save these translations to any Anki Deck with 1 click
- **Deck Review**: Review your decks as you would in Anki.
- **Discuss Answers**: If your answer diverges from Anki's, discuss the difference with ChatGPT
- **Generate Examples**: Provide fragments of text and get examples of their use
