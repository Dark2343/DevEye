# DevEye - AI-Powered Code Reviewer
DevEye is an AI-driven code reviewer designed to help developers identify real, objective issues in their code without noise, nitpicks, or subjective suggestions.
The project uses a HuggingFace AI model with custom prompting logic to enforce zero hallucinations, strict JSON output, and clear explanations for every detected issue.

## Features
- Allows uploading code files, or entering code directly in the editor
- Returns **strict JSON** output for easy automation.
- Focuses only on **actual technical issues** (logic, runtime, misuse, broken patterns).
- Supports multiple languages (JS/TS, React, C++, Java, Python, Go, Dart, etc.).

## Workflow
1. User uploads a code file **OR** Enters their code in the editor.
2. Frontend extracts the code text.
3. The package is sent to the backend
4. The code is sent to DevEye with a custom specific prompt.
5. DevEye responds with structured JSON which gets sent back to the frontend.
6. The result is displayed in the review results tab according to its severity level.

## Output Format
```json
{
  "modelOutput": [
    {
      "line": 12,
      "issue": "string",
      "severity": "Low | Medium | High ",
      "description": "string",
      "fix": "string"
    }
  ]
}
```

If there are no issues:
```json
[
    {
        "message": "No issues found. Code looks clean and well-written."
    }
]
```

## Installation & Setup
```bash
git clone https://github.com/Dark2343/DevEye
cd DevEye

# Run the frontend
cd .\frontend\
npm install
npm run start

# Run the backend
cd .\backend\
npm install
npm run start
```

Make sure you have your HuggingFace key set in your environment variables, and the model you prefer:
```bash
# The platform was tested with google's gemma model
HF_MODEL='google/gemma-2-2b-it:nebius'
HF_API_KEY='your_api_key_here'
```