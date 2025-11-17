
const API_KEY = "YOUR_OPENAI_API_KEY"; // replace with your actual key
const API_URL = "https://api.openai.com/v1/audio/speech";

const historyCollection = new webix.DataCollection({
  data: [
    {
      id: 1,
      timestamp: new Date(),
      preview: "This UI is built with Webix.",
      voice: "nova",
      audioUrl:
        "https://docs.webix.com/filemanager-backend/direct?id=%2FMusic%2Fbensound-betterdays.mp3",
    },
  ],
});

let currentRowId = null;

// Helper to update play button text
function updatePlayButtonText(rowId, text) {
  const rowNode = $$("historyTable").getItemNode(rowId);
  if (rowNode) {
    const btn = rowNode.querySelector(".playBtn");
    if (btn) btn.textContent = text;
  }
}

// Handler for audio events
function handleAudioEvent(event) {
  if (!currentRowId) return;

  switch (event.type) {
    case "play":
      updatePlayButtonText(currentRowId, "Pause");
      break;
    case "pause":
      updatePlayButtonText(currentRowId, "Play");
      break;
    case "ended":
      updatePlayButtonText(currentRowId, "Play");
      currentRowId = null;
      break;
  }
}

// Attach audio event listeners after UI is built
webix.ready(() => {
  $$("historyTable").sync(historyCollection);

  const audioElem = document.getElementById("audioPlayer");

  ["play", "pause", "ended"].forEach((ev) =>
    audioElem.addEventListener(ev, handleAudioEvent)
  );
});

async function convertTextToSpeech() {
  const { text, voice, instructions } = $$("ttsForm").getValues();

  $$("statusBar").setHTML("Converting...");
  $$("convertBtn").disable();

  try {
    let audioUrl;

    // If API key is missing, fall back to test mode
    if (!API_KEY || API_KEY === "YOUR_OPENAI_API_KEY") {
      webix.message("Using test mode: no API key provided.");
      audioUrl =
        "https://docs.webix.com/filemanager-backend/direct?id=%2FMusic%2Fbensound-betterdays.mp3";
    } else {
      // Real API call
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          input: text,
          voice: voice,
          response_format: "mp3",
          speed: 1.0,
          ...(instructions && { prompt: instructions }),
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const audioBlob = await response.blob();
      audioUrl = URL.createObjectURL(audioBlob);
    }

    // Update player and history
    const audioElem = document.getElementById("audioPlayer");
    audioElem.src = audioUrl;

    historyCollection.add({
      id: webix.uid(),
      timestamp: new Date(),
      preview: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
      voice,
      audioUrl,
    });

    $$("statusBar").setHTML("Conversion successful!");
  } catch (err) {
    console.error(err);
    webix.message({
      type: "error",
      text: "Conversion failed. See console for details.",
    });
    $$("statusBar").setHTML("Conversion failed.");
  } finally {
    $$("convertBtn").enable();
  }
}

// Play/pause logic from table
function playAudio(id) {
  const item = historyCollection.getItem(id);
  if (item && item.audioUrl) {
    const audioElem = document.getElementById("audioPlayer");

    if (audioElem.src !== item.audioUrl) {
      audioElem.src = item.audioUrl;
    }

    currentRowId = id; // track active row

    if (audioElem.paused) {
      audioElem.play();
      updatePlayButtonText(id, "Pause");
    } else {
      audioElem.pause();
      updatePlayButtonText(id, "Play");
    }
  } else {
    webix.message({ type: "error", text: "Audio not found." });
  }
}

