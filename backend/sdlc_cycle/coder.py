from google.adk.agents import Agent
from litellm import completion

def generate_code(prd: str) -> str:
    '''
        Reads the PRD from session memory and generates corresponding code.
    '''
    
    if not prd:
        return "No PRD found in session. Please run the planner agent first."
        
    prompt = f"""
    You are a senior software developer. Based on this PRD, generate code as a JSON dictionary where:
    - keys = filenames (e.g., 'main.py', 'models/book.py')
    - values = code for that file as string
    
    Respond with only the JSON. No explanation.
    
    PRD:
    {prd}
    """
    
    response = completion(
        model="gemini/gemini-2.0-flash",
        messages=[{"role":"user", "content":prompt}]
    )
    
    code = response["choices"][0]["message"]["content"]
    
    return code
    
coder_agent = Agent(
    name="coder_agent",
    model='gemini-2.0-flash',
    description="Reads PRD and writes clean Python code.",
    instruction="Use the PRD from the planner to write code. Use generate_code.",
    tools=[generate_code]
)