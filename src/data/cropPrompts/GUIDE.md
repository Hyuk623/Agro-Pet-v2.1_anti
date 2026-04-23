# AI Crop Asset Creation Guide

This guide explains how to generate consistent character assets for Agro-Pet using the internal prompt template system.

## 1. System Overview
We use a structured template system to ensure that different stages and conditions of a crop feel like the same "character."

- **Types**: `CropPromptTemplate` (defined in `src/types/game.ts`)
- **Templates**: Located in `src/data/cropPrompts/`
- **Builder**: `buildCropAIPrompt` in `src/utils/promptBuilder.ts`

## 2. Generating Prompts
You can generate prompts by calling the builder in a script or using a developer console.

```typescript
import { buildCropAIPrompt } from './src/utils/promptBuilder';

const prompt = buildCropAIPrompt('strawberry', 'fruit', 'thriving');
console.log(prompt);
```

## 3. Recommended AI Image Tools
- **Midjourney**: Use `--no background` or specify `white background` for easier transparency removal.
- **DALL-E 3**: Excellent at following the specific condition and stage notes.
- **Stable Diffusion**: Use with a consistent Lora if you want extreme stylistic continuity.

## 4. Visual Consistency Rules
To keep the UI clean, every asset MUST follow these rules:
1. **Plain Background**: Use a transparent or solid white background.
2. **2D Flat Style**: Avoid 3D rendering or realistic textures.
3. **Outlines**: Maintain clean, thick outlines for visibility on mobile screens.
4. **Centered**: Keep the character in the center of the canvas.

## 5. Workflow
1. **Define common traits** in `strawberryPrompt.ts` (Colors, Style, Facial style).
2. **Run the builder** to get strings for all 24+ combinations (4 stages * 6 conditions).
3. **Generate & Curate** images.
4. **Store in `public/assets/crops/{cropId}/`** with naming convention: `{stage}_{condition}.png`.
5. **Update Registry**: Ensure the path is mapped in `src/data/visualRegistry.ts`.
