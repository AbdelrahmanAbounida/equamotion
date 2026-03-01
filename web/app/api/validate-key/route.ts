export async function POST(req: Request) {
  const { provider, key } = (await req.json()) as {
    provider: "openai" | "anthropic" | "deepseek" | "xai" | "google";
    key: string;
  };

  if (!provider || !key) {
    return Response.json(
      { valid: false, error: "Missing provider or key" },
      { status: 400 },
    );
  }

  try {
    let valid = false;

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      valid = res.status === 200;
    } else if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      valid = res.status === 200 || res.status === 201;
    } else if (provider === "deepseek") {
      const res = await fetch("https://api.deepseek.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      valid = res.status === 200;
    } else if (provider === "xai") {
      const res = await fetch("https://api.x.ai/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      valid = res.status === 200;
    } else if (provider === "google") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      );
      valid = res.status === 200;
    } else {
      return Response.json(
        { valid: false, error: "Unsupported provider" },
        { status: 400 },
      );
    }

    if (valid) {
      return Response.json({ valid: true });
    }

    return Response.json(
      { valid: false, error: "Invalid API key" },
      { status: 401 },
    );
  } catch (err) {
    return Response.json(
      {
        valid: false,
        error: err instanceof Error ? err.message : "Validation failed",
      },
      { status: 500 },
    );
  }
}
