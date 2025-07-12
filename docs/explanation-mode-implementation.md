# Spanish Explanation Mode Implementation Plan

## Overview
Transform the Spanish translation app into a Spanish explanation app that keeps users thinking in Spanish by providing explanations in simpler Spanish rather than English translations.

## Core Concept
- **Front of card**: Original Spanish word/phrase
- **Back of card**: Explanation in simpler Spanish only
- **Goal**: Keep users immersed in Spanish thinking patterns
- **Default Mode**: Explanation mode (translation mode available via toggle)
- **Key Insight**: Only change the Search page behavior - card structure remains unchanged

## User Preferences (Confirmed)
1. **Explanation Complexity**: Start with intermediate level, with "simplify" button option
2. **Explanation Types**: Both simple synonyms/definitions and contextual explanations
3. **Mode Switching**: Toggle button on main interface
4. **Flashcard Structure**: Front = Spanish, Back = Spanish explanation only (same card structure)
5. **AI Strategy**: Spanish explanations only, no English. Example sentences for single words, phrase explanations for longer inputs
6. **UI**: No complexity selection, card preview helpful, toggle is the indicator
7. **Backward Compatibility**: Existing cards remain unchanged, no migration needed
8. **Study Mode**: Remains completely unchanged - handles all cards the same way

## Architecture Changes

### 1. Frontend Changes

#### New Components Needed:
- `ExplanationMode.tsx` - New main component for explanation functionality
- `ModeToggle.tsx` - Toggle between explanation and translation modes
- `ExplanationCard.tsx` - Display explanation results with preview
- `SimplifyButton.tsx` - Button to simplify complex explanations

#### Modified Components:
- `App.tsx` - Add mode switching capability
- `Search.tsx` - Default to explanation mode, add mode toggle
- `Translator.tsx` - Add explanation mode functionality

#### New Routes:
- `/explain` - Explanation mode (default)
- `/translate` - Translation mode (secondary)

### 2. Backend Changes

#### New API Endpoints:
- `POST /explain` - Generate Spanish explanations
- `POST /simplify` - Simplify existing explanation
- `GET /explanation-settings` - Get user explanation preferences
- `POST /explanation-settings` - Update explanation preferences

#### Modified Endpoints:
- `POST /addCard` - No changes needed (same card structure)
- `GET /translate` - Keep for backward compatibility

#### New LangChain Schemas:
- `explanationResponse` - Spanish explanation with complexity levels
- `simplifyResponse` - Simplified version of explanation

### 3. Data Model Changes

#### New Types:
```typescript
enum AppMode {
  Explanation = 'explanation',
  Translation = 'translation'
}

enum ExplanationComplexity {
  Simple = 'simple',
  Intermediate = 'intermediate'
}

interface ExplanationResponse {
  explanation: string;
  complexity: ExplanationComplexity;
}

interface SimplifyResponse {
  simplifiedExplanation: string;
}
```

**Note**: No changes to existing card types - we use the same card structure but with different content.

## Implementation Phases

### Phase 1: Frontend Foundation
1. Create new enums for explanation modes
2. Create `ExplanationMode` component (stub)
3. Add mode toggle to main interface
4. Update routing to support explanation mode
5. Create basic explanation card display with preview

### Phase 2: Backend Foundation
1. Add new enums to `Enums.ts`
2. Create explanation API endpoints (stubs)
3. Add explanation schemas to `LangChainHandler.ts`
4. Update `Types.ts` with new interfaces

### Phase 3: Core Explanation Logic
1. Implement Spanish explanation generation in `LangChainHandler.ts`
2. Create explanation complexity levels (intermediate default)
3. Implement explanation card saving (using existing card structure)
4. Add simplify functionality

### Phase 4: UI/UX Enhancement
1. Polish explanation mode interface
2. Add explanation preview before saving
3. Implement simplify button
4. Add visual indicators for current mode (toggle)

### Phase 5: Study Mode Integration
1. Verify study mode works with explanation cards (should work unchanged)
2. Test both card types work in study mode
3. Ensure no breaking changes to existing functionality

### Phase 6: Testing & Polish
1. Add comprehensive tests for explanation functionality
2. Performance optimization
3. User experience refinements
4. Documentation updates

## Technical Considerations

### AI Prompt Strategy
- Use GPT-4 to generate intermediate-level Spanish explanations
- For single words: provide explanation + 1-2 example sentences
- For phrases: provide contextual explanation without examples
- Include "simplify" option that generates simpler explanations
- No English translations in explanations

### Performance
- Cache common explanations
- Implement streaming for long explanations
- Optimize card saving process

### User Experience
- Clear visual distinction between modes (toggle)
- Intuitive mode switching
- Simplify button for complex explanations
- Preview functionality before saving
- Settings persistence

### Backward Compatibility
- Existing translation cards continue to work unchanged
- Study mode handles all cards the same way (no changes needed)
- No migration needed
- Card structure remains identical

## Success Metrics
- User engagement with explanation mode
- Reduction in English thinking patterns
- Improved Spanish comprehension
- User feedback on explanation quality
- Usage of simplify button

## Future Enhancements
- Multiple explanation styles (formal/casual)
- Context-aware explanations
- Spaced repetition optimization for explanations
- Community explanation sharing 