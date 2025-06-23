from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from agents.root import root_agent


session_service = InMemorySessionService()

def before_tool_callback(tool, args, context):
    if tool.__name__ == "generate_code":
        prd = context.session.get("prd")
        if prd:
            args["input"] = prd
    if tool.__name__ == "test_code":
        fixes = context.session.get("fixes")
        code = context.session.get("code")
        if fixes:
            args["input"] = fixes
        elif code:
            args["input"] = code
    if tool.__name__ == "fix_code":
        test = context.session.get("test")
        if test:
            args["input"] = test

def after_tool_callback(context, tool, args, result):
    if tool.__name__ == "generate_plan":
        context.session["prd"] = result
    elif tool.__name__ == "generate_code":
        context.session["code"] = result
    elif tool.__name__ == "test_code":
        context.session["test"] = result
    elif tool.__name__ == "fix_code":
        context.session["fixes"] = result

runner = Runner(
    app_name="sdlc_cycle",
    agent=root_agent,
    session_service=session_service,
    before_tool_callback=before_tool_callback,
    after_tool_callback=after_tool_callback
)