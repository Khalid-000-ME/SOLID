import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('🔵 [API] Received request to /api/stream');
  const startTime = performance.now();
  
  try {
    const { message } = await req.json();
    
    const appName = "sdlc_cycle";
    const userId = "user1";
    const sessionId = "session1";
    const messages: Array<{text: string, isUser: boolean}> = [];
    
    // 1. Create session
    const sessionUrl = `http://localhost:8000/apps/${appName}/users/${userId}/sessions/${sessionId}`;
    const sessionRes = await fetch(sessionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    
    // 2. Send message to agent
    const upstream = await fetch('http://localhost:8000/run_sse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appName,
        userId,
        sessionId,
        newMessage: {
          role: "user",
          parts: [{ text: message }]
        }
      })
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      throw new Error(`Message delivery failed: ${upstream.status} - ${upstream.statusText}`);
    }

    const reader = upstream.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let messageCount = 0;

    if (!reader) throw new Error("Failed to get reader from upstream response");

    // Process stream incrementally
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      
      // Improved SSE parsing
      const eventDelimiter = '\n\n';
      let eventEnd;
      
      while ((eventEnd = buffer.indexOf(eventDelimiter)) !== -1) {
        const eventChunk = buffer.substring(0, eventEnd);
        buffer = buffer.substring(eventEnd + eventDelimiter.length);
        
        if (eventChunk.startsWith('data:')) {
          const jsonStr = eventChunk.replace('data:', '').trim();
          try {
            const event = JSON.parse(jsonStr);
            
            // Extract text from all parts
            if (event.content?.parts) {
              for (const part of event.content.parts) {
                if (part.text) {
                  messageCount++;
                  messages.push({ 
                    text: `[${event.author}]: ${part.text}`, 
                    isUser: false 
                  });
                }
              }
            }
          } catch (err) {
            console.error("JSON parse error:", jsonStr, err);
          }
        }
      }
    }

    return NextResponse.json({ messages });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      message: errorMessage
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
