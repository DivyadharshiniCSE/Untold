export async function moderateComment(commentText: string): Promise<{ approved: boolean; reason?: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { approved: true }; // Pass if no AI available

  const prompt = `
    You are a strict moderation AI for a personal storytelling platform called UNSAID.
    Evaluate the following comment. If it contains hate speech, extreme profanity, spam, or harassment, reject it.
    Return ONLY a JSON object with "approved" (boolean) and an optional "reason" (string) if rejected.
    
    Comment:
    "${commentText.substring(0, 500)}"
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Moderation failed", e);
    return { approved: true }; // Default to allow if API fails, manual moderation is still possible in dashboard
  }
}
