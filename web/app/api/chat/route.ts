import { getModelById, getEditModel } from "@/lib/models";
import type { APIKeys } from "@/lib/models";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  tool,
  UIMessage,
  generateText,
  createUIMessageStream,
  JsonToSseTransformStream,
} from "ai";
import { z } from "zod";

export const maxDuration = 120;

const VIDEO_API_URL = process.env.VIDEO_API_URL ?? "";
const VIDEO_API_KEY = process.env.VIDEO_API_KEY ?? "";

// ─── Manim docs sidebar structure (static knowledge, no fetch needed) ────────
const MANIM_DOCS_SIDEBAR = `
MANIM COMMUNITY DOCS — SIDEBAR STRUCTURE (v0.20.x)
Base URL: https://docs.manim.community/en/stable/

TOP-LEVEL SECTIONS:
- examples.html → Example Gallery
- installation.html → Installation
  - installation/uv.html → Installing Manim Locally
  - installation/conda.html → Conda
  - installation/docker.html → Docker
  - installation/jupyter.html → Jupyter Notebooks
- tutorials_guides.html → Tutorials & Guides
  - tutorials/quickstart.html → Quickstart
  - tutorials/output_and_config.html → Output Settings
  - tutorials/building_blocks.html → Building Blocks
  - guides/configuration.html → Configuration
  - guides/deep_dive.html → Deep Dive into Internals
  - guides/using_text.html → Rendering Text and Formulas
  - guides/add_voiceovers.html → Adding Voiceovers
  - faq/general.html → FAQ: General Usage
  - faq/help.html → FAQ: Getting Help
  - faq/installation.html → FAQ: Installation
  - faq/opengl.html → FAQ: OpenGL Rendering

REFERENCE MANUAL:
Animations:
  - reference/manim.animation.animation.html → Animation, Add, Wait
  - reference/manim.animation.changing.html → AnimatedBoundary, TracedPath
  - reference/manim.animation.composition.html → AnimationGroup, LaggedStart, LaggedStartMap, Succession
  - reference/manim.animation.creation.html → Create, Write, Uncreate, Unwrite, FadeIn-style, DrawBorderThenFill, AddTextLetterByLetter, AddTextWordByWord, ShowIncreasingSubsets, SpiralIn, TypeWithCursor
  - reference/manim.animation.fading.html → FadeIn, FadeOut
  - reference/manim.animation.growing.html → GrowArrow, GrowFromCenter, GrowFromEdge, GrowFromPoint, SpinInFromNothing
  - reference/manim.animation.indication.html → ApplyWave, Blink, Circumscribe, Flash, FocusOn, Indicate, ShowPassingFlash, Wiggle
  - reference/manim.animation.movement.html → MoveAlongPath, Homotopy, PhaseFlow, ComplexHomotopy
  - reference/manim.animation.numbers.html → ChangeDecimalToValue, ChangingDecimal
  - reference/manim.animation.rotation.html → Rotate, Rotating
  - reference/manim.animation.speedmodifier.html → ChangeSpeed
  - reference/manim.animation.transform.html → Transform, ReplacementTransform, FadeTransform, MoveToTarget, Restore, ApplyMatrix, ApplyFunction, ScaleInPlace, ShrinkToCenter, Swap, ClockwiseTransform, CounterclockwiseTransform, CyclicReplace, FadeToColor, TransformFromCopy
  - reference/manim.animation.transform_matching_parts.html → TransformMatchingShapes, TransformMatchingTex
  - reference/manim.animation.updaters.update.html → UpdateFromFunc, UpdateFromAlphaFunc, MaintainPositionRelativeTo

Cameras:
  - reference/manim.camera.camera.html → Camera
  - reference/manim.camera.moving_camera.html → MovingCamera
  - reference/manim.camera.multi_camera.html → MultiCamera
  - reference/manim.camera.three_d_camera.html → ThreeDCamera

Mobjects (Geometry):
  - reference/manim.mobject.geometry.arc.html → Arc, Circle, Dot, Ellipse, AnnularSector, Annulus, ArcPolygon, CubicBezier, CurvedArrow, CurvedDoubleArrow, LabeledDot, Sector, TangentialArc
  - reference/manim.mobject.geometry.line.html → Line, Arrow, DashedLine, DoubleArrow, Vector, TangentLine, Angle, RightAngle, Elbow
  - reference/manim.mobject.geometry.polygram.html → Polygon, Square, Rectangle, Triangle, RegularPolygon, Star, RoundedRectangle, Polygram, RegularPolygram, ConvexHull, Cutout
  - reference/manim.mobject.geometry.boolean_ops.html → Union, Intersection, Difference, Exclusion
  - reference/manim.mobject.geometry.labeled.html → Label, LabeledArrow, LabeledLine, LabeledPolygram
  - reference/manim.mobject.geometry.shape_matchers.html → BackgroundRectangle, Cross, SurroundingRectangle, Underline
  - reference/manim.mobject.geometry.tips.html → ArrowTip variants (ArrowTriangleTip, StealthTip, etc.)

Mobjects (Graphing):
  - reference/manim.mobject.graphing.coordinate_systems.html → Axes, ThreeDAxes, NumberPlane, ComplexPlane, PolarPlane, CoordinateSystem
  - reference/manim.mobject.graphing.functions.html → FunctionGraph, ParametricFunction, ImplicitFunction
  - reference/manim.mobject.graphing.number_line.html → NumberLine, UnitInterval
  - reference/manim.mobject.graphing.probability.html → BarChart, SampleSpace
  - reference/manim.mobject.graphing.scale.html → LinearBase, LogBase

Mobjects (Text):
  - reference/manim.mobject.text.tex_mobject.html → Tex, MathTex, Title, BulletedList, MathTexPart
  - reference/manim.mobject.text.text_mobject.html → Text, MarkupText, Paragraph
  - reference/manim.mobject.text.numbers.html → DecimalNumber, Integer, Variable
  - reference/manim.mobject.text.code_mobject.html → Code

Mobjects (3D):
  - reference/manim.mobject.three_d.three_dimensions.html → Arrow3D, Cone, Cube, Cylinder, Dot3D, Line3D, Prism, Sphere, Surface, Torus
  - reference/manim.mobject.three_d.polyhedra.html → Tetrahedron, Octahedron, Icosahedron, Dodecahedron, Polyhedron, ConvexHull3D

Mobjects (Other):
  - reference/manim.mobject.mobject.html → Mobject, Group
  - reference/manim.mobject.types.vectorized_mobject.html → VMobject, VGroup, VDict, DashedVMobject, CurvesAsSubmobjects
  - reference/manim.mobject.value_tracker.html → ValueTracker, ComplexValueTracker
  - reference/manim.mobject.vector_field.html → ArrowVectorField, StreamLines, VectorField
  - reference/manim.mobject.graph.html → Graph, DiGraph, GenericGraph
  - reference/manim.mobject.matrix.html → Matrix, DecimalMatrix, IntegerMatrix, MobjectMatrix
  - reference/manim.mobject.table.html → Table, DecimalTable, IntegerTable, MathTable, MobjectTable
  - reference/manim.mobject.svg.brace.html → Brace, ArcBrace, BraceBetweenPoints, BraceLabel

Scenes:
  - reference/manim.scene.scene.html → Scene
  - reference/manim.scene.moving_camera_scene.html → MovingCameraScene
  - reference/manim.scene.three_d_scene.html → ThreeDScene, SpecialThreeDScene
  - reference/manim.scene.vector_space_scene.html → VectorScene, LinearTransformationScene
  - reference/manim.scene.zoomed_scene.html → ZoomedScene

Utilities:
  - reference/manim.utils.rate_functions.html → Rate functions (smooth, linear, rush_into, rush_from, etc.)
  - reference/manim.utils.color.core.html → ManimColor, HSV, RGBA
  - reference/manim.utils.color.EQUAMOTION_colors.html → All built-in color constants
  - reference/manim.constants.html → Constants (PI, TAU, DEGREES, direction vectors, etc.)
  - reference/manim.utils.tex.html → TexTemplate
`;

// ─── HTML cleaner ─────────────────────────────────────────────────────────────
function cleanHtml(html: string, maxLength = 8000): string {
  // Remove script/style/nav/header/footer blocks
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    // Remove HTML tags but keep content
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength) + "\n\n[... truncated for context ...]";
  }
  return clean;
}

// ─── Search result parser ─────────────────────────────────────────────────────
function parseSearchResults(html: string): {
  summary: string;
  results: Array<{ title: string; link: string; snippet: string }>;
} {
  const results: Array<{ title: string; link: string; snippet: string }> = [];

  // Extract list items from search results
  const listItemRegex =
    /<li[^>]*class="[^"]*kind-[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;

  while ((match = listItemRegex.exec(html)) !== null && results.length < 12) {
    const item = match[1];

    // Extract link and title
    const linkMatch = item.match(/href="([^"]+)"[^>]*>([^<]+)</);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const title = linkMatch[2].replace(/[\s]+/g, " ").trim();

    // Extract snippet text
    const snippetMatch = item.match(
      /<p[^>]*class="context"[^>]*>([\s\S]*?)<\/p>/i,
    );
    const snippet = snippetMatch
      ? snippetMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/[\s]+/g, " ")
          .trim()
          .slice(0, 200)
      : "";

    // Build full URL
    const fullLink = href.startsWith("http")
      ? href
      : `https://docs.manim.community/en/stable/${href}`;

    results.push({ title, link: fullLink, snippet });
  }

  // Count total
  const countMatch = html.match(/found (\d+) pages? matching/i);
  const total = countMatch ? countMatch[1] : "several";
  const summary = `Found ${total} pages matching your query. Showing top ${results.length} results.`;

  return { summary, results };
}

function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
  return JSON.parse(
    JSON.stringify(messages, (key, value) => {
      if (
        key === "videoBase64" &&
        typeof value === "string" &&
        value.length > 100
      ) {
        return "[video data omitted]";
      }
      return value;
    }),
  );
}

// Extract last rendered script from message history
function extractLastScript(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg.parts) continue;
    for (const part of msg.parts as any[]) {
      if (
        part.type === "tool-renderVideo" &&
        part.state === "output-available" &&
        part.input?.script
      ) {
        return part.input.script;
      }
      if (
        part.type === "tool-generateScript" &&
        part.state === "output-available" &&
        part.output?.script
      ) {
        return part.output.script;
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  const { messages, chatId, userDescription, modelId, apiKeys } = await req.json() as {
    messages: UIMessage[];
    chatId: string;
    userDescription: string;
    modelId: string;
    apiKeys: APIKeys;
  };

  const sanitized = sanitizeMessages(messages);

  // Extract last script for edit context
  const lastScript = extractLastScript(messages);

  let pendingScript: string | null = null;
  let pendingSceneName: string | null = null;

  try {
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const systemPrompt = `You are an animation creation expert. You help users create and edit beautiful mathematical animations.

## DOCS KNOWLEDGE (use before fetching)
You already have the full Manim docs sidebar structure in your context. Use it to navigate.
For common/standard API (create, transform, shapes, text, graphs) — rely on your training knowledge. 
Only call searchDocs or fetchDocPage when:
- You encounter an unfamiliar class/method or an API error
- The user asks about something new in v0.18+ that you might not know
- You need to verify a specific method signature after a render error

## SIDEBAR REFERENCE
${MANIM_DOCS_SIDEBAR}

## WORKFLOW

### Creating a new animation:
1. Call generateScript → creates the Manim Python script internally
2. Call renderVideo with the sceneName to render it
3. Briefly describe the animation (NO code in response)

### Editing an existing animation:
- Call editScript with instructions describing the changes
- Then call renderVideo with the sceneName to render
- Do NOT call generateScript for edits — use editScript

### Error recovery (CRITICAL):
When renderVideo returns an error:
1. Read the error message, identify the root cause
2. Call editScript with fix instructions describing exactly what needs to change
3. Call renderVideo again with the same sceneName
4. Repeat up to 3 times. Common fixes:
   - NameError cos/sin/sqrt → use np.cos, np.sin, np.sqrt (add import numpy as np)
   - NameError "Cos", "Sin", "Tan" → these DON'T exist. Use FunctionGraph(lambda x: np.cos(x))
   - AttributeError on method → check actual API with searchDocs or fetchDocPage
    - ValueError "too many values to unpack" on ParametricFunction → t_range must be [min, max, step], NOT np.linspace
    - Lambda closure bugs in loops → capture: lambda x, n=n: expression
5. NEVER mention, explain, or describe any error to the user. Do NOT say "there was an error", "the render failed", or reference any error details. Just silently fix and re-render without any text response about the error.

## STRICT RULES
- NEVER mention "Manim", "Manim Community", or the underlying rendering technology to the user
- Present yourself simply as an animation creation assistant
- NEVER include Python code, \`\`\`python blocks, or script excerpts in text responses
- Just describe what the animation shows in plain language
- ONLY call searchDocs/fetchDocPage when genuinely uncertain — not as a reflex on every request

## SCRIPT RULES
- First line: from manim import *
- Second line: import numpy as np
- Class extends Scene with construct(self) method
- Use np.sin, np.cos, np.tan, np.sqrt, np.log, np.pi, np.e — NEVER bare math names
- No "Cos", "Sin", "Tan" Mobject classes — use FunctionGraph or axes.plot
- Colors: BLUE, RED, GREEN, YELLOW, ORANGE, PURPLE, GOLD, TEAL — direct constants
- self.wait(0.5) between steps, self.wait(1) at end
- MoveAlongPath(dot, curve) for path movement — Dot has no move_along_graph
- When using lambda in loops: lambda x, n=n: expression
- ParametricFunction t_range must be a 3-element list [min, max, step] — NEVER use np.linspace for t_range`;

        const result = streamText({
          model: getModelById(modelId || "gpt-4.1-mini", apiKeys),
          messages: [
            {
              role: "system" as const,
              content: systemPrompt,
              providerOptions: {
                anthropic: { cacheControl: { type: "ephemeral" } },
              },
            },
            ...(await convertToModelMessages(sanitized)),
          ],

          stopWhen: stepCountIs(15),

          tools: {
            // ── 1. Search Manim docs ──────────────────────────────────────────
            searchDocs: tool({
              description:
                "Search the Manim documentation for a specific query. Returns top results with titles, links, and snippets. Use this when you need to find docs pages for an unfamiliar API, class, or method. Do NOT use for things you already know well.",
              inputSchema: z.object({
                query: z
                  .string()
                  .describe(
                    "Search query, e.g. 'MoveAlongPath', 'ValueTracker updater', 'ThreeDScene camera'",
                  ),
              }),
              execute: async ({ query }) => {
                try {
                  const url = `https://docs.manim.community/en/stable/search.html?q=${encodeURIComponent(query)}&check_keywords=yes&area=default`;
                  const response = await fetch(url, {
                    headers: { "User-Agent": "ManimDocsAgent/1.0" },
                    signal: AbortSignal.timeout(8000),
                  });

                  if (!response.ok) {
                    return {
                      success: false,
                      error: `Search failed (${response.status})`,
                      tip: "Try fetchDocPage with a specific URL from the sidebar instead.",
                    };
                  }

                  const html = await response.text();
                  const { summary, results } = parseSearchResults(html);

                  if (results.length === 0) {
                    return {
                      success: false,
                      summary: "No results found.",
                      tip: "Try a different query or browse the sidebar structure in your system prompt.",
                    };
                  }

                  return {
                    success: true,
                    summary,
                    results: results.map((r) => ({
                      title: r.title,
                      link: r.link,
                      snippet: r.snippet,
                    })),
                    tip: "Call fetchDocPage with one of these links to get full documentation.",
                  };
                } catch (err) {
                  return {
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                    tip: "Network error. Use your training knowledge or the sidebar structure instead.",
                  };
                }
              },
            }),

            // ── 2. Fetch a specific docs page ─────────────────────────────────
            fetchDocPage: tool({
              description:
                "Fetch and extract clean text from a Manim docs page URL. Returns bounded, clean text without HTML noise. Use this to read method signatures, parameters, and examples from a specific page.",
              inputSchema: z.object({
                url: z
                  .string()
                  .url()
                  .describe(
                    "Full URL of the Manim docs page, e.g. https://docs.manim.community/en/stable/reference/manim.animation.movement.html",
                  ),
                focus: z
                  .string()
                  .optional()
                  .describe(
                    "Optional: specific class or method name to focus on, helps truncate irrelevant content",
                  ),
              }),
              execute: async ({ url, focus }) => {
                // Only allow manim docs URLs to prevent abuse
                if (!url.includes("docs.manim.community")) {
                  return {
                    success: false,
                    error: "Only docs.manim.community URLs are allowed.",
                  };
                }

                try {
                  const response = await fetch(url, {
                    headers: { "User-Agent": "ManimDocsAgent/1.0" },
                    signal: AbortSignal.timeout(10000),
                  });

                  if (!response.ok) {
                    return {
                      success: false,
                      error: `Fetch failed (${response.status}): ${url}`,
                    };
                  }

                  const html = await response.text();

                  // Try to extract just the main content area first
                  const mainMatch =
                    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    html.match(
                      /<div[^>]*class="[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                    );

                  const contentHtml = mainMatch ? mainMatch[1] : html;

                  let cleanText = cleanHtml(contentHtml, 8000);

                  // If focus is specified, try to find the relevant section
                  if (focus) {
                    const focusIndex = cleanText
                      .toLowerCase()
                      .indexOf(focus.toLowerCase());
                    if (focusIndex > 0) {
                      const start = Math.max(0, focusIndex - 200);
                      const end = Math.min(cleanText.length, focusIndex + 4000);
                      cleanText =
                        `[... focused on "${focus}" ...]\n\n` +
                        cleanText.slice(start, end);
                    }
                  }

                  return {
                    success: true,
                    url,
                    content: cleanText,
                  };
                } catch (err) {
                  return {
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                  };
                }
              },
            }),

            // ── 3. Generate a new script ──────────────────────────────────────
            generateScript: tool({
              description:
                "Generate a Manim Python script for a NEW animation. Do NOT use this for edits — use editScript instead.",
              inputSchema: z.object({
                description: z
                  .string()
                  .describe("What the animation should show or demonstrate"),
                sceneName: z
                  .string()
                  .describe(
                    "PascalCase Python class name for this scene, e.g. SineWaveScene, PythagoreanProof",
                  ),
                complexity: z
                  .enum(["simple", "medium", "complex"])
                  .default("medium")
                  .describe("Animation complexity"),
              }),
              execute: async ({ description, sceneName, complexity }) => {
                const { text } = await generateText({
                  model: getEditModel(apiKeys),
                  prompt: `Write a complete, runnable Manim Python animation script. (Internal: do not mention Manim to the user.)

Scene class name: ${sceneName}
Description: ${description}  
Complexity: ${complexity} — ${
                    complexity === "simple"
                      ? "keep to 3-5 simple animations"
                      : complexity === "medium"
                        ? "use 5-10 animations with transforms and movement"
                        : "create an elaborate multi-element sequence with effects"
                  }

Requirements:
- First line: from manim import *
- Second line: import numpy as np
- Class named EXACTLY "${sceneName}" extending Scene
- Has construct(self) method
- self.wait(0.5) between major steps, self.wait(1) at the very end
- Visually interesting — use colors, positioning, interesting math
- For math functions: ALWAYS use np.sin, np.cos, np.tan, np.sqrt, np.log, np.pi — NEVER bare cos, sin, sqrt, pi
- For function graphs: use axes.plot(lambda x: np.sin(x)) or FunctionGraph(lambda x: np.cos(x))
- There is NO "Cos", "Sin", "Tan" Mobject class. Use FunctionGraph or axes.plot.
- Colors: use constants directly (BLUE, RED, GREEN, YELLOW, etc.). No color_utils.
- When lambda inside loop: lambda x, n=n: expression (capture loop var)
- ONLY use methods that exist in Manim Community v0.18+:
  - Dot has NO move_along_graph/move_along_path. Use MoveAlongPath(dot, curve).
  - Do NOT use .animate.move_along_graph() — doesn't exist.
- ParametricFunction t_range must be a 3-element list [min, max, step] (e.g. [0, 2*np.pi, 0.01]) — NEVER use np.linspace for t_range.

Output ONLY valid Python code. No markdown fences. No explanation.`,
                });

                const script = text
                  .replace(/^```python\s*/m, "")
                  .replace(/^```\s*/m, "")
                  .replace(/\s*```$/m, "")
                  .trim();

                pendingScript = script;
                pendingSceneName = sceneName;
                return { sceneName, ready: true };
              },
              toModelOutput: ({ output }) => ({
                type: "text" as const,
                value: JSON.stringify({
                  sceneName: output.sceneName,
                  ready: true,
                  instruction:
                    "Script generated successfully. Now call renderVideo with this sceneName to render it.",
                }),
              }),
            }),

            // ── 4. Edit existing script ───────────────────────────────────────
            editScript: tool({
              description:
                "Edit the last rendered Manim script to apply user-requested changes. Returns the modified script. Use this instead of generateScript when the user wants to change/update an existing animation.",
              inputSchema: z.object({
                editInstructions: z
                  .string()
                  .describe(
                    "Precise description of what changes to make to the existing script",
                  ),
                newSceneName: z
                  .string()
                  .optional()
                  .describe(
                    "New scene class name if renaming (leave empty to keep the same name)",
                  ),
              }),
              execute: async ({ editInstructions, newSceneName }) => {
                const scriptToEdit = pendingScript || lastScript;
                if (!scriptToEdit) {
                  return {
                    success: false,
                    error:
                      "No previous script found in this conversation. Please create a new animation first.",
                  };
                }

                // Extract current scene name
                const sceneNameMatch = scriptToEdit.match(
                  /class\s+(\w+)\s*\(\s*Scene\s*\)/,
                );
                const currentSceneName = sceneNameMatch
                  ? sceneNameMatch[1]
                  : "AnimationScene";
                const sceneName = newSceneName || currentSceneName;

                const { text } = await generateText({
                  model: getEditModel(apiKeys),
                  prompt: `You are editing an existing animation script. Apply the requested changes carefully.

CURRENT SCRIPT:
\`\`\`python
${scriptToEdit}
\`\`\`

EDIT INSTRUCTIONS:
${editInstructions}

${newSceneName ? `RENAME the scene class to: ${newSceneName}` : `Keep the scene class name as: ${currentSceneName}`}

Rules:
- Keep all existing logic that should not change
- Only modify what was asked to change
- Maintain correct API usage (np.sin, np.cos, etc.)
- Keep self.wait() calls
- ParametricFunction t_range must be a 3-element list [min, max, step] — NEVER use np.linspace for t_range
- Return the COMPLETE updated script

Output ONLY valid Python code. No markdown fences. No explanation.`,
                });

                const script = text
                  .replace(/^```python\s*/m, "")
                  .replace(/^```\s*/m, "")
                  .replace(/\s*```$/m, "")
                  .trim();

                pendingScript = script;
                pendingSceneName = sceneName;
                return { sceneName, ready: true, wasEdited: true };
              },
              toModelOutput: ({ output }) => ({
                type: "text" as const,
                value: JSON.stringify({
                  sceneName: output.sceneName,
                  ready: true,
                  wasEdited: true,
                  instruction:
                    "Script edited successfully. Now call renderVideo with this sceneName to render it.",
                }),
              }),
            }),

            // ── 5. Render video ───────────────────────────────────────────────
            renderVideo: tool({
              description:
                "Render the current Manim script to video. Call this right after generateScript or editScript. The script is managed internally — just provide sceneName and quality.",
              inputSchema: z.object({
                sceneName: z
                  .string()
                  .describe("The exact Scene class name in the script"),
                quality: z
                  .enum([
                    "low_quality",
                    "medium_quality",
                    "high_quality",
                    "production_quality",
                  ])
                  .default("medium_quality")
                  .describe("Render quality"),
              }),
              execute: async ({ sceneName, quality }) => {
                if (!pendingScript) {
                  return {
                    success: false,
                    error:
                      "No script available. Call generateScript or editScript first.",
                  };
                }

                const cleanScript = pendingScript
                  .replace(/\\n/g, "\n")
                  .replace(/\\t/g, "\t")
                  .replace(/\\"/g, '"');

                try {
                  const response = await fetch(`${VIDEO_API_URL}/render`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "EQUAMOTION-API-Key": VIDEO_API_KEY,
                    },
                    body: JSON.stringify({
                      script: cleanScript,
                      scene_name: sceneName,
                      quality,
                    }),
                  });

                  if (!response.ok) {
                    const detail = await response.text();
                    return {
                      success: false,
                      error: `Render failed (${response.status}): ${detail}`,
                    };
                  }

                  const buffer = await response.arrayBuffer();
                  const videoBase64 = Buffer.from(buffer).toString("base64");

                  return { success: true, videoBase64, sceneName };
                } catch (err) {
                  return {
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                  };
                }
              },
              toModelOutput: ({ output }) => ({
                type: "text" as const,
                value: JSON.stringify({
                  success: output.success,
                  sceneName: output.sceneName,
                  ...(output.error
                    ? {
                        error: output.error,
                        instruction:
                          "Call editScript with fix instructions describing how to fix this error, then call renderVideo again.",
                      }
                    : {}),
                }),
              }),
            }),
          },
        });

        writer.merge(result.toUIMessageStream());
      },

      onError: (error) => {
        console.error("Stream error:", error);
        return "An error occurred while processing your request. Please try again.";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: "An error occurred while processing your request.",
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}


