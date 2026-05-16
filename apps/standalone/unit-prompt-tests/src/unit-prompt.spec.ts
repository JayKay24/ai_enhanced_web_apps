import { generateText } from "ai";
// @ts-ignore - Ignore if string-comparison lacks type definitions
import stringComparison from 'string-comparison';

jest.mock("ai", () => ({
  generateText: jest.fn(),
}));

function semanticSimilarity(text1: string, text2: string): number {
  const cos = stringComparison.cosine;
  return cos.similarity(text1, text2);
}

describe("Unit Prompt Tests", () => {
  it("generated text is semantically similar to expected output", async () => {
    (generateText as jest.Mock).mockResolvedValue(
      "AI greatly influences modern life in many ways."
    );

    const expected = "AI has a significant impact on modern society.";
    // Note: Casting to unknown then string since we mocked it to return a raw string in this test
    const generated = await generateText({
      model: "fakeModel" as any,
      prompt: "Describe the role of AI in today's world."
    }) as unknown as string;

    const similarity: number = semanticSimilarity(expected, generated);
    expect(similarity).toBeGreaterThan(0.7);
  });

  function validateConstraints(
    text: string, 
    minWords: number, 
    maxWords: number, 
    requiredWords: string[]
  ): boolean {
    const words: string[] = text.split(/\s+/);
    return (
      words.length >= minWords &&
      words.length <= maxWords &&
      requiredWords.every((word: string) =>
        text.toLowerCase().includes(word.toLowerCase())
      )
    );
  }

  it("generated text meets constraints", async () => {
    (generateText as jest.Mock).mockResolvedValue({
      text: "Regular exercise significantly improves health and fitness by boosting energy, enhancing mood, and reducing the risk of many chronic diseases."
    });

    const result = await generateText({
      model: "fakeModel" as any,
      prompt:
        "Summarize the benefits of exercise in 20-30 words. Include 'health' and 'fitness'.",
    }) as unknown as { text: string };

    expect(validateConstraints(result.text, 20, 30, ["health", "fitness"])).toBe(true);
  });
});
