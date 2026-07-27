const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not set in Vercel project settings.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const customerQuery = (body.query || '').trim();
    const presets = Array.isArray(body.presets) ? body.presets : [];

    if (!customerQuery) {
      res.status(400).json({ error: 'query is required' });
      return;
    }
    if (!presets.length) {
      res.status(200).json({ ids: [] });
      return;
    }

    // Keep the prompt small: only id + short text fields, not every field.
    const compact = presets.map(p => ({
      id: p._id || p.id,
      cat: p.cat,
      sub: p.sub,
      bn: p.bn,
      en: p.en || '',
    }));

    const prompt =
`You are matching a customer support message to the best existing reply presets.

Customer message:
"""${customerQuery}"""

Available presets (JSON array, each has id/cat/sub/bn/en):
${JSON.stringify(compact)}

Return ONLY a JSON array of up to 3 preset "id" values, best match first, from the ids above. No explanation, no markdown, just the JSON array. If nothing is a reasonable match, return [].`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      const detailMsg = geminiData?.error?.message || JSON.stringify(geminiData);
      res.status(502).json({ error: 'Gemini API error: ' + detailMsg });
      return;
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleaned = text.replace(/```json|```/g, '').trim();

    let ids = [];
    try {
      ids = JSON.parse(cleaned);
      if (!Array.isArray(ids)) ids = [];
    } catch (e) {
      ids = [];
    }

    res.status(200).json({ ids });
  } catch (err) {
    res.status(500).json({ error: 'Assistant error', detail: String(err.message || err) });
  }
};
