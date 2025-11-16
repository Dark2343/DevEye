const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const app = express()
const { InferenceClient } = require('@huggingface/inference')

// Import all environmental keys from .env
require('dotenv').config()

const client = new InferenceClient(process.env.HF_API_KEY);

// Middleware
// To allow the frontend to call the backend since they're on different ports
// TODO: Need to restrict it later to allow only responding to the frontend address
app.use(cors())
// To automatically parse any incoming JSON
app.use(express.json())

// Root page
app.get('/', (req, res) => {
    res.send('<h1>Hello from your Express server!</h1>');
});

// The most important call
// Calls the API model to review the code
app.post('/upload', upload.single('file'), async (req, res) => {
    // Turn the stored raw file into text
    const code = req.file.buffer.toString('utf-8');

    try{
        // Specify the model's prompts and settings
        // TODO: Specify exactly to the model the structure of JSON it should respond in
        const result = await client.chatCompletion({
            model: process.env.HF_MODEL,
            messages: [
                {
                    role: "system",
                    content: `
                        You are DevEye, a senior-level code reviewer. 
                        Your job is to analyze the provided code and return only valid JSON. 
                        Do NOT include markdown, explanations, code blocks, text outside JSON, or commentary. 
                        Respond with a JSON array of objects. 
                        Each object must have the following EXACT keys:

                        - "line": number
                        - "issue": string
                        - "severity": "low" | "medium" | "high"
                        - "description": string
                        - "fix": string   // A clear and concise suggestion on how to fix the issue

                        If there are no issues, return a JSON array with EXACTLY one object:
                        [
                            {
                                "message": "No issues found. Code looks clean and well-written."
                            }
                        ]

                        Output must be strictly valid JSON.`
                },
                {
                    role: "user",
                    content: `
                        Analyze this code file: ${req.file.originalname}

                        Return the issues in strict JSON only.

                        Code:
                        ${code}
                        `
                            }
                        ],
            // Limits the number of tokens(words) the model can respond with
            // Temperature determines how creative the model can be
            parameters: {max_new_tokens: 512, temperature: 0},
        })

        // Clean the model's response to output it as JSON
        let output = result.choices[0].message.content;
        output = output.replace(/^```json\s*/, "").replace(/```$/, "");
        output = JSON.parse(output)

        // Send it back to the front
        res.json({modelOutput: output})
    }
    catch(e){
        console.error(e);
        res.status(500).json({error: "Model call failed"})
    }
});

// Starting the server on designated port
app.listen(process.env.PORT, () => {
    console.log(`Server up and running on http://localhost:${process.env.PORT}`)
})

