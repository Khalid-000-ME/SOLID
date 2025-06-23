from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from agents.root import root_agent

# Initialize session service
session_service = InMemorySessionService()

# Create session synchronously
session_service.create_session_blocking(
    app_name="sdlc_cycle",
    user_id="user1",
    session_id="session1"
)
MAX_ARG_LENGTH = 10000  # Gemini's function call argument limit

def before_tool_callback(tool, args, context):
    # Validate and sanitize all inputs to prevent malformed calls
    if tool.__name__ == "generate_code":
        prd = context.session.get("prd")
        if prd:
            # Truncate long inputs to prevent overflow
            args["input"] = prd[-MAX_ARG_LENGTH:]  
            
    if tool.__name__ == "test_code":
        code = context.session.get("code", "")
        # Always set input but sanitize first
        args["input"] = code[-MAX_ARG_LENGTH:]  
        if context.session.get("trigger_test_after_fix"):
            context.session["trigger_test_after_fix"] = False 
            
    if tool.__name__ == "fix_code":
        fix_count = context.session.get("fix_count", 0)
        
        # Error handling improvements
        if context.session.get("panic"):
            return {"error": "Panic mode activated. Fixer aborted."}
    
        if fix_count >= 3:
            return {"error": "Fixer exceeded safe retry limit."}
        
        test_result = context.session.get("test", "")
        if "U EE A E A U EE EE A E" in test_result:
            return {"result": "No fixing needed. All tests passed."}
    
        code = context.session.get("code", "")
        # Combine inputs safely
        args["input"] = f"{code[:5000]}\n\nTest Result:\n{test_result[:5000]}"  
        context.session["fix_count"] = fix_count + 1

def after_tool_callback(context, tool, args, result):
    # Validate results before storing
    if not isinstance(result, str):
        result = str(result)
    
    if tool.__name__ == "generate_plan":
        context.session["prd"] = result[-MAX_ARG_LENGTH:]
    elif tool.__name__ == "generate_code":
        context.session["code"] = result[-MAX_ARG_LENGTH:]
    elif tool.__name__ == "test_code":
        context.session["test"] = result[-MAX_ARG_LENGTH:]
    elif tool.__name__ == "fix_code":
        context.session["code"] = result[-MAX_ARG_LENGTH:]
        context.session["trigger_test_after_fix"] = True
runner = Runner(
    app_name="sdlc_cycle",
    agent=root_agent,
    session_service=session_service,
    before_tool_callback=before_tool_callback,
    after_tool_callback=after_tool_callback
)