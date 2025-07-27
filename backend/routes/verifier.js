const express = require('express');
const axios = require('axios');
const router = express.Router();

const tapikey = process.env.TAVILY_API_KEY;
const gapaikey = process.env.GROQ_API_KEY;

router.post('/', async (req, res) => {
  const { news } = req.body;

  try {

    const tavilyRes = await axios.post("https://api.tavily.com/search", {
      api_key: tapikey,
      query: news,
      search_depth: "advanced",
      include_answer: false,
      include_raw_content: false,
      max_results: 3
    });
    const sources = tavilyRes.data.results || [];

    const context = sources.map(s => `${s.title}: ${s.content || s.url}`).join("\n\n");

    // 2. Groq Prompt
    const prompt = `
Given the following claim:
"${news}"

And these trusted sources:
${context}

Determine:
1. Is the news Real or Fake?
2. Provide a short reason.
3. Show the top 3 sources.

Respond in JSON:
{
  "verdict": "Real" or "Fake",
  "reason": "short reason",
  "top_sources": ["source1", "source2", "source3"]
}
`;

    const groqRes = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a truthful AI that checks news authenticity using sources." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    }, {
      headers: {
        Authorization: `Bearer ${gapaikey}`,
        "Content-Type": "application/json"
      }
    });

    const content = groqRes.data.choices[0].message.content;
    const result = JSON.parse(content.match(/{[\s\S]+}/)[0]);

    // const matchedSources = result.top_sources.map(title =>
    //   sources.find(src => src.title.toLowerCase().includes(title.toLowerCase()))
    // ).filter(Boolean).map(src => ({ title: src.title, url: src.url }));
    const verdict = result.verdict?.toLowerCase();
    const matchedSources = result.top_sources.map(title =>
      sources.find(src => src.title.toLowerCase().includes(title.toLowerCase()))
    ).filter(Boolean);

    let trust_score = 50;

    if (verdict === "real") {
      trust_score = 60 + matchedSources.length * 10; // 60–90
    } else if (verdict === "fake") {
      trust_score = 10 + matchedSources.length * 10; // 10–40
    } else {
      trust_score = 50;
    }

    trust_score = Math.min(trust_score, 90);


    return res.json({
      verdict: result.verdict,
      reason: result.reason,
      trust_score,
      sources: matchedSources.map(src => ({ title: src.title, url: src.url }))
    });


  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to verify news." });
  }
});

module.exports = router;
