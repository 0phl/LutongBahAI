<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Recipe & Image Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-800">
    <div class="container mx-auto p-4 md:p-8 max-w-4xl">
        <header class="text-center mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900">AI Recipe & Image Generator</h1>
            <p class="text-lg text-gray-600 mt-2">Enter a dish you want to cook, and let AI do the rest!</p>
        </header>

        <main>
            <div class="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <div class="flex flex-col sm:flex-row gap-4">
                    <input type="text" id="recipe-input" placeholder="E.g., 'Spaghetti Carbonara' or 'Vegan Chocolate Cake'" class="flex-grow w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    <button id="generate-btn" class="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">
                        Generate
                    </button>
                </div>
            </div>

            <div id="loading-container" class="hidden text-center my-8">
                <div class="loader inline-block"></div>
                <p class="mt-4 text-gray-600 font-medium">Generating your masterpiece... this might take a moment!</p>
            </div>
            
            <div id="error-container" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4" role="alert">
                <strong class="font-bold">Oops!</strong>
                <span class="block sm:inline" id="error-message">Something went wrong. Please try again.</span>
            </div>

            <div id="results-container" class="hidden grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Image Section -->
                <div class="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 class="text-2xl font-bold mb-4">Generated Image</h2>
                    <div id="image-loader" class="flex justify-center items-center h-80 bg-gray-200 rounded-lg">
                         <div class="loader"></div>
                    </div>
                    <img id="recipe-image" src="" alt="Generated recipe image" class="hidden w-full h-auto object-cover rounded-lg aspect-square">
                </div>

                <!-- Recipe Section -->
                <div class="bg-white p-6 rounded-2xl shadow-lg">
                     <h2 class="text-2xl font-bold mb-4">Generated Recipe</h2>
                    <div id="recipe-loader" class="space-y-4">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div id="recipe-content" class="prose max-w-none hidden"></div>
                </div>
            </div>
        </main>
    </div>

    <script>
        const recipeInput = document.getElementById('recipe-input');
        const generateBtn = document.getElementById('generate-btn');
        const loadingContainer = document.getElementById('loading-container');
        const resultsContainer = document.getElementById('results-container');
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        
        const recipeImage = document.getElementById('recipe-image');
        const recipeContent = document.getElementById('recipe-content');
        const imageLoader = document.getElementById('image-loader');
        const recipeLoader = document.getElementById('recipe-loader');


        generateBtn.addEventListener('click', handleGeneration);
        recipeInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleGeneration();
            }
        });

        async function handleGeneration() {
            const userQuery = recipeInput.value.trim();
            if (!userQuery) {
                showError("Please enter a recipe name.");
                return;
            }

            // Reset UI
            generateBtn.disabled = true;
            loadingContainer.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
            errorContainer.classList.add('hidden');
            recipeImage.classList.add('hidden');
            recipeContent.classList.add('hidden');
            imageLoader.classList.remove('hidden');
            recipeLoader.classList.remove('hidden');


            try {
                resultsContainer.classList.remove('hidden');
                // Kick off both API calls in parallel
                const recipePromise = generateRecipe(userQuery);
                const imagePromise = generateImage(userQuery);

                // Wait for both to complete
                await Promise.all([recipePromise, imagePromise]);

            } catch (error) {
                console.error("An error occurred:", error);
                showError(error.message || "An unexpected error occurred during generation.");
                resultsContainer.classList.add('hidden');
            } finally {
                loadingContainer.classList.add('hidden');
                generateBtn.disabled = false;
            }
        }

        async function makeApiCall(apiUrl, payload) {
            let backoff = 1000; // Start with 1 second
            for (let i = 0; i < 5; i++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
                    }
                    return await response.json();
                } catch (error) {
                    if (i === 4) throw error; // Last attempt failed
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    backoff *= 2; // Exponential backoff
                }
            }
        }

        async function generateRecipe(query) {
             const apiKey = "AIzaSyAER31n9ljZGP_3eGaJBH118Pk2HOlwchM"; // API key will be provided by the environment
             const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
             
             const systemPrompt = "You are a world-class chef. Generate a clear, easy-to-follow recipe for the user's requested dish. Include a list of ingredients with quantities, and step-by-step instructions. Format the response in Markdown.";
             const userPrompt = `Generate a recipe for: ${query}`;

             const payload = {
                 contents: [{ parts: [{ text: userPrompt }] }],
                 systemInstruction: { parts: [{ text: systemPrompt }] },
             };

            try {
                const result = await makeApiCall(apiUrl, payload);
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    // Simple markdown to HTML conversion
                    let html = text
                        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
                        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
                        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*)\*/g, '<em>$1</em>')
                        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
                        .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
                        .replace(/((\r\n|\n|\r)+)/g, '<br>');

                    // Wrap lists in <ul> or <ol>
                    html = html.replace(/(<li.*<\/li>)/gs, (match) => {
                         if (match.includes('.')) return `<ol class="list-decimal list-inside">${match}</ol>`;
                         return `<ul class="list-disc list-inside">${match}</ul>`;
                    });

                    recipeContent.innerHTML = html;
                } else {
                    throw new Error("No recipe text was generated.");
                }
            } catch (error) {
                console.error("Recipe generation failed:", error);
                recipeContent.innerHTML = `<p class="text-red-500">Failed to generate recipe. Please try again.</p>`;
                throw error; // Re-throw to be caught by handleGeneration
            } finally {
                recipeLoader.classList.add('hidden');
                recipeContent.classList.remove('hidden');
            }
        }

        async function generateImage(query) {
            const apiKey = ""; // API key will be provided by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{
                    parts: [{ text: `A delicious, professionally photographed plate of ${query}. Centered, vibrant colors, appetizing, high-resolution food photography.` }]
                }],
                generationConfig: {
                    responseModalities: ['IMAGE']
                },
            };

            try {
                const result = await makeApiCall(apiUrl, payload);
                const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
                
                if (base64Data) {
                    const imageUrl = `data:image/png;base64,${base64Data}`;
                    recipeImage.src = imageUrl;
                    recipeImage.alt = `Generated image of ${query}`;
                } else {
                    throw new Error("No image data was found in the API response.");
                }
            } catch (error) {
                console.error("Image generation failed:", error);
                recipeImage.src = `https://placehold.co/600x600/ccc/444?text=Image+Failed`;
                throw error; // Re-throw to be caught by handleGeneration
            } finally {
                imageLoader.classList.add('hidden');
                recipeImage.classList.remove('hidden');
            }
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
        }

    </script>
</body>
</html>

