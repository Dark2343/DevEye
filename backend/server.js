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
    // TODO: Improve the prompt and no problems output
    const result = await client.chatCompletion({
            model: process.env.HF_MODEL,
            messages: [
                {
                    role: "system",
                    content: `
                        You are DevEye, a senior-level code reviewer.

                        Your job:
                        - Identify **only real, objective problems** in the provided code.
                        - Do NOT nitpick.
                        - Do NOT invent issues.
                        - Do NOT treat stylistic choices, preferences, or opinions as errors.
                        - If the code is valid and behaves correctly, you MUST return the “no issues” response.

                        Output format:
                        Return ONLY a JSON array. No markdown, no code blocks, no explanations outside JSON.

                        Each issue must be an object with EXACT keys:
                        - "line": number
                        - "issue": string
                        - "severity": "Low" | "Medium" | "High"
                        - "description": string
                        - "fix": string

                        Rules:
                        1. ONLY report **true errors**, such as:
                        - Syntax errors
                        - Runtime errors
                        - Incorrect logic
                        - Misuse of APIs/libraries
                        - Security vulnerabilities
                        - Data handling issues
                        - Code that will NOT work as intended

                        2. Do NOT report:
                        - Style opinions (naming, spacing, indentation)
                        - Optional improvements
                        - Performance optimizations unless they are significant
                        - Refactoring suggestions
                        - Personal preferences
                        - Best practices unless they fix a real bug

                        3. If the code is correct and has **zero actual issues**, return EXACTLY:

                        [
                            {
                                "message": "No issues found. Code looks clean and well-written."
                            }
                        ]

                        This "no issues" output must be returned whenever no real, functional problems exist.

                        You must be strict:  
                        If you are not 100% certain an issue exists, **do not include it**.

                        Respond strictly in JSON.

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
            parameters: {max_new_tokens: 512, temperature: 0},
        })

    // Clean the model's response to output it as JSON
    let output = result.choices[0].message.content;
    output = output.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    try {
        output = JSON.parse(output)
    } catch (err) {
        console.error("JSON Parse Error:", output)
        throw new Error("Invalid model output")
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

