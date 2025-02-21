const languages = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German", "zh-cn": "Chinese (Simplified)",
    "ru": "Russian", "ar": "Arabic", "hi": "Hindi", "pt": "Portuguese", "ja": "Japanese",
    "ko": "Korean", "it": "Italian", "tr": "Turkish", "nl": "Dutch", "sv": "Swedish",
    "pl": "Polish", "da": "Danish", "fi": "Finnish", "el": "Greek", "he": "Hebrew",
    "id": "Indonesian", "ms": "Malay", "th": "Thai", "vi": "Vietnamese", "uk": "Ukrainian",
    "hu": "Hungarian", "cs": "Czech", "ro": "Romanian", "bg": "Bulgarian", "sr": "Serbian",
    "hr": "Croatian", "sk": "Slovak", "sl": "Slovenian", "lt": "Lithuanian", "lv": "Latvian",
    "et": "Estonian", "fa": "Persian", "bn": "Bengali", "ta": "Tamil", "te": "Telugu",
    "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi", "pa": "Punjabi", "gu": "Gujarati",
    "si": "Sinhala", "my": "Burmese", "km": "Khmer", "lo": "Lao", "mn": "Mongolian",
    "ne": "Nepali", "sw": "Swahili", "tl": "Tagalog", "hy": "Armenian", "ka": "Georgian",
    "uz": "Uzbek", "kk": "Kazakh", "tg": "Tajik", "ky": "Kyrgyz", "tk": "Turkmen",
    "ps": "Pashto", "sd": "Sindhi", "am": "Amharic", "so": "Somali", "yo": "Yoruba",
    "zu": "Zulu", "xh": "Xhosa"
};

$(document).ready(function() {
    $(".language-select").select2({ width: '100%' });

    for (let code in languages) {
        $("#source-lang, #target-lang-1, #target-lang-2").append(`<option value="${code}">${languages[code]}</option>`);
    }
});

$("#translate-btn").click(function() {
    let text = $("#source-text").val();
    let sourceLang = $("#source-lang").val();
    let targetLang1 = $("#target-lang-1").val();
    let targetLang2 = $("#target-lang-2").val();

    if (!text || !targetLang1) {
        alert("Please enter text and select at least one target language.");
        return;
    }

    fetch('/translate', {
        method: 'POST',
        body: JSON.stringify({ text, source_lang: sourceLang, target_langs: [targetLang1, targetLang2] }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let result1 = data.results[targetLang1]?.text || "Translation unavailable";
            let result2 = targetLang2 ? (data.results[targetLang2]?.text || "Translation unavailable") : "";

            $("#translated-text").html(
                `<strong>${languages[targetLang1]}:</strong> ${result1}<br>
                 ${targetLang2 ? `<strong>${languages[targetLang2]}:</strong> ${result2}` : ''}`
            );

            saveToHistory(text, result1, result2);
        } else {
            alert("Translation failed: " + data.error);
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
        alert("Error: " + error.message);
    });
});

function saveToHistory(input, output1, output2) {
    let history = JSON.parse(localStorage.getItem("translationHistory")) || [];
    history.push({ input, output1, output2, date: new Date().toLocaleString() });
    localStorage.setItem("translationHistory", JSON.stringify(history));
}

$("#clear-btn").click(function() {
    $("#source-text").val('');
    $("#output-text").html('');
});

$("#history-btn").click(function() {
    window.open('/history', '_blank');
});

function saveToHistory(input, output1, output2) {
    let history = JSON.parse(localStorage.getItem("translationHistory")) || [];
    history.push({ input, output1, output2, date: new Date().toLocaleString() });
    localStorage.setItem("translationHistory", JSON.stringify(history));
}

document.getElementById("speak-btn").addEventListener("click", function() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

        recognition.lang = document.getElementById("source-lang").value || "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onstart = function() {
            console.log("🎤 Voice recognition started. Speak now...");
        };

        recognition.onspeechend = function() {
            recognition.stop();
            console.log("🛑 Voice recognition stopped.");
        };

        recognition.onresult = function(event) {
            let transcript = event.results[0][0].transcript;
            console.log("✅ Recognized text:", transcript);
            document.getElementById("source-text").value = transcript;
        };

        recognition.onerror = function(event) {
            console.error("❌ Speech recognition error:", event.error);
            alert("Error: " + event.error);
        };

    }).catch(function(error) {
        console.error("🚫 Microphone permission error:", error);
        alert("Please allow microphone access in your browser settings.");
    });
});


// ✅ Speak Out Feature: Read Translated Text
document.getElementById("speak-out-btn").addEventListener("click", function() {
    let translatedText = document.getElementById("translated-text").innerText;

    if (!translatedText) {
        alert("No translation available to read aloud.");
        return;
    }

    let speech = new SpeechSynthesisUtterance();
    speech.text = translatedText;
    speech.lang = document.getElementById("target-lang-1").value || "en-US"; // Use selected target language

    window.speechSynthesis.speak(speech);
});


function speakOut(text, lang) {
    if (!text) {
        alert("No text available for speech.");
        return;
    }

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;  // Set language for speech synthesis

    // Optional: Find the best matching voice
    let voices = speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
    utterance.voice = selectedVoice;

    speechSynthesis.speak(utterance);
}
