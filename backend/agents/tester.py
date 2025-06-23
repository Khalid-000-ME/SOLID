from google.adk.agents import Agent
from litellm import completion

def test_code(input: str) -> str:
    prompt = f"""
    You are a senior QA engineer. You are given a software project as a JSON string:
    - Each key is a filename (e.g., "backend/server.js")
    - Each value is the full source code of that file
    
    Your job is to:
    1. **Perform a static code review** — do not execute code
    2. Identify bugs, missing logic, or syntax issues
    3. Suggest critical fixes first
    4. Then suggest enhancements or improvements
    5. If everything is perfect and nothing needs changing, reply only with:
    
        U EE A E A U EE EE A E
    
    Input JSON:
    {input}
    """
    response = completion(
        model="gemini/gemini-2.0-flash",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response["choices"][0]["message"]["content"]

tester_agent = Agent(
    name="tester_agent",
    model="gemini-2.0-flash",
    description="Tests the generated code and reports issues or improvements.",
    instruction="Use the `test_code` tool to evaluate code passed as a JSON string. Focus first on errors, then enhancements.",
    tools=[test_code]
)
