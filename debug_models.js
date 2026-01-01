require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log('❌ No API KEY found in .env');
            return;
        }

        console.log('API Key loaded (starts with):', apiKey.substring(0, 5));

        const genAI = new GoogleGenerativeAI(apiKey);
        // Unfortunately the Node SDK simpler client doesn't have a direct listModels method on the instance easily accessible in all versions.
        // But we can try to get a model and run a simple prompt. 
        // Actually, let's try a known valid model 'gemini-pro' with a simple prompt and print the error detailed if it fails.

        const modelsToCheck = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of modelsToCheck) {
            console.log(`\nChecking model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${modelName} is working! Response:`, result.response.text());
                break; // Found one!
            } catch (error) {
                console.log(`❌ ${modelName} failed:`, error.message);
            }
        }

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

listModels();
