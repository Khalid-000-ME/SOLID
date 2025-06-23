from google.adk.agents import Agent
from litellm import completion


def generate_plan(input: str) -> str:
    '''
    This tool is used to generate a PRD document for building a software.
    
    Args:
        input (str): The prompt given by the user to build the software.
    
    Returns:
        str: A well-formatted PRD.
    '''
    prompt = f"""
        You are a senior product manager. Based on the following user input, create a clean Product Requirements Document (PRD) using markdown format, with sections:
        - Introduction
        - Goals
        - Key Features
        - User Stories
        - Technical Requirements
        - Constraints
        - Success Criteria
    
        Respond ONLY with the PRD — no introduction or closing comments.
    
        User input: {input}
    """

    response = completion(
        model="gemini/gemini-2.0-flash",
        messages=[{"role": "user", "content": prompt}],
    )
    
    prd = response["choices"][0]["message"]["content"]
    
    return prd
    
def after_tool_callback(context, tool, args, result):
    if tool.__name__ == "generate_plan":
        context.session["prd"] = result

planner_agent = Agent(
    name="planner_agent",
    model="gemini-2.0-flash",
    description="Creates a PRD from user input.",
    instruction="Use the `generate_plan` tool to convert user task requests into a proper PRD.",
    tools=[generate_plan]
)
