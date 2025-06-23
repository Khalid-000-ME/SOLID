from google.adk.agents import Agent
from litellm import completion


def fix_code(input: str) -> str:
    '''
    The input is a JSON string of code and/or test report.
    The tool fixes the bugs found and returns an updated code JSON.
    '''

    prompt = f"""
You are a senior code fixer and bug resolver. The input is a string that includes:
- The original code (as JSON with filenames as keys)
- The test result describing bugs or enhancements

Your task:
1. Carefully parse the code JSON
2. Fix **only the bugs and errors mentioned in the test result**
3. Preserve the existing file structure and filenames
4. Output only the corrected JSON with the same format:
   {{
     "path/to/file1": "fixed code here",
     "path/to/file2": "..."
   }}

**Do not** include explanations, extra text, markdown, or comments.

Input:
{input}
"""

    response = completion(
        model="gemini/gemini-2.0-flash",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response["choices"][0]["message"]["content"]

fixer_agent = Agent(
    name="fixer_agent",
    model='gemini-2.0-flash',
    description="Fixes bugs in code based on test result.",
    instruction="Use the `fix_code` tool to correct code provided as JSON based on the test report.",
    tools=[fix_code]
)