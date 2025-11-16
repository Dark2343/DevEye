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
                {role: 'system', content: 'You are DevEye, a Senior code reviewer. Respond in raw JSON only, without any markdown code blocks.'},
                {role: 'user', content: 
                    `Review this code file ${req.file.originalname}, and list any issues found within it,
                    Code:
                    \`\`\`
                    ${code}
                    \`\`\`
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

