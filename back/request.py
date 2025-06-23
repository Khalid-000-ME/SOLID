import requests

task_description = "Create a Python function that sorts a list of dictionaries by a specific key"
response = requests.post(
    "http://localhost:8000/task/start",
    json={"task_description": task_description}
)

print(response.json())