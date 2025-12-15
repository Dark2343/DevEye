const express = require('express');
const cors = require('cors');
const app = express()
const { InferenceClient } = require('@huggingface/inference')

// Import all environmental keys from .env
require('dotenv').config()

const client = new InferenceClient(process.env.HF_API_KEY);

// Middleware
// To allow the frontend to call the backend since they're on different ports
// TODO: Need to restrict it later to allow only responding to the frontend address
// TODO: Implement method to allow each IP to send only a specific amount of requests
app.use(cors())
// To automatically parse any incoming JSON
app.use(express.json())


// Calls the API model to review the code
async function callModel(code){
    // Specify the model's prompts and settings
    // TODO: Improve the prompt
    const result = await client.chatCompletion({
            model: process.env.HF_MODEL,
            messages: [
                {
                    role: "system",
                    content: `
                        You are DevEye, a senior-level code reviewer.

                        Task:
                        Identify ONLY real, objective problems in the given code.

                        Report an issue ONLY if it would fail or misbehave in real execution
                        with the code exactly as provided.

                        DO NOT report:
                        - Style or formatting
                        - Naming or preferences
                        - Refactors or improvements
                        - Best practices unless fixing a real bug
                        - Performance concerns unless critical
                        - Hypothetical, future, or usage-dependent issues
                        - Edge cases that do not break normal execution

                        If you are not 100% certain an issue exists, DO NOT include it.

                        Output:
                        Return ONLY a valid JSON array.
                        No markdown, no code blocks, no text outside JSON.

                        Each item MUST have exactly these keys:
                        - "line": number
                        - "issue": string
                        - "severity": "Safe" | "Low" | "Medium" | "High"
                        - "description": string
                        - "fix": string

                        If there are ZERO real issues, return EXACTLY:

                        [
                            {
                                "line": 0,
                                "issue": "No issues found. Code looks clean and well-written.",
                                "severity": "Safe",
                                "description": "---",
                                "fix": "---"
                            }
                        ]

                        Invalid JSON will be rejected. Respond again internally until valid.
                    `
                },
                {
                    role: "user",
                    content: `
                        Analyze this code

                        Return the issues in strict JSON only.

                        Code:
                        """
                        ${code}
                        """
                        `
                }
            ],
            // Limits the number of tokens(words) the model can respond with
            // Temperature determines how creative the model can be
            parameters: {max_new_tokens: 256, temperature: 0},
        })

    // Clean the model's response to output it as JSON
    let output = result.choices[0].message.content;
    output = output.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    try {
        output = JSON.parse(output)
    } catch (err) {
        console.error("JSON Parse Error:", output)
        output = [{
            line: "--",
            issue: "Problem while analyzing the code",
            severity: "Error",
            description: "Model output is unavailable.",
            fix: "Try submitting the code again."
        }]
    }

    return output;
}

app.post('/upload', async (req, res) => {
    // req.body-- stores JSON into variable
    // req.body.code -- stores pure text into variable
    const code = req.body.codeToReview
    try{
        // Calling the model with the received code
        const review = await callModel(code)

        // Send the review to the frontend
        res.json({modelOutput: review})
    }
    catch(e){
        // Return an error on failure
        console.error(e);
        res.status(500).json({error: "Model call failed"})
    }
});

// Starting the server on designated port
app.listen(process.env.PORT, () => {
    console.log(`Server up and running on http://localhost:${process.env.PORT}`)
})

