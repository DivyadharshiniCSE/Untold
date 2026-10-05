export async function generateTitleAndSubtitle(content: string): Promise<{ title: string; subtitle: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { title: '', subtitle: '' };

  const prompt = `
    You are an artistic storyteller. Read this short story and provide a poetic, captivating title and a brief emotional subtitle (1 sentence).
    Return ONLY a JSON object with "title" and "subtitle" fields.
    
    Story:
    "${content.substring(0, 3000)}"
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
    console.error("Title generation failed", e);
    return { title: 'Untitled', subtitle: 'A story of unsaid words.' };
  }
}
