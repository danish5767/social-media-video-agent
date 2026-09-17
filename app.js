const replies = [
  "I hear you. We can take this one small step at a time. Would you like to create something, or talk about how you’re feeling?",
  "That’s a great idea. I can shape it into a clear hook, an SEO-friendly title, and platform-ready tags.",
  "You don’t have to carry everything alone right now. I’m here to listen without judgment. What feels heaviest?",
];

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));

const toast = (text) => {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 2600);
};

let screenStream = null;
const startScreenShare = document.querySelector("#start-screen-share");
if (startScreenShare) {
  const screenPreview = document.querySelector("#screen-preview");
  const screenEmpty = document.querySelector("#screen-empty");
  const screenStatus = document.querySelector("#screen-status");
  const screenIndicator = document.querySelector("#screen-indicator");
  const guideSuggestion = document.querySelector("#guide-suggestion");
  const stopScreenShare = document.querySelector("#stop-screen-share");
  const stopSharing = () => {
    if (screenStream) screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;
    screenPreview.srcObject = null;
    screenPreview.hidden = true;
    screenEmpty.hidden = false;
    guideSuggestion.hidden = true;
    stopScreenShare.hidden = true;
    screenStatus.textContent = "Waiting for approval";
    screenIndicator.textContent = "● OFF";
  };
  startScreenShare.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast("Screen guidance needs a supported browser or native app");
      return;
    }
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenPreview.srcObject = screenStream;
      screenPreview.hidden = false;
      screenEmpty.hidden = true;
      guideSuggestion.hidden = false;
      stopScreenShare.hidden = false;
      screenStatus.textContent = "Luma can see your selected screen";
      screenIndicator.textContent = "● LIVE";
      screenStream.getVideoTracks()[0].addEventListener("ended", stopSharing);
      toast("Screen guidance approved");
    } catch (error) {
      if (error.name !== "NotAllowedError") toast("Screen sharing could not start");
    }
  });
  stopScreenShare.addEventListener("click", stopSharing);
}

const nameModal = document.querySelector("#name-modal");
const nameInput = document.querySelector("#name-input");
const savedName = localStorage.getItem("luma-user-name");
const setUserName = (name) => {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) return false;
  localStorage.setItem("luma-user-name", cleanName);
  document.querySelector("#user-name-heading").textContent = cleanName;
  document.querySelector("#welcome-message").textContent = `Good morning, ${cleanName}! I’m glad you’re here. Tell me what you’re working on, how you’re feeling, or just say hello — I’m always happy to talk.`;
  return true;
};
if (savedName) {
  setUserName(savedName);
} else {
  window.setTimeout(() => {
    nameModal.hidden = false;
    nameInput.focus();
  }, 500);
}
document.querySelector("#name-save").addEventListener("click", () => {
  if (setUserName(nameInput.value)) {
    nameModal.hidden = true;
    const welcome = document.querySelector("#welcome-message").textContent;
    window.setTimeout(() => speakAsLuma(welcome), 350);
  } else {
    nameInput.focus();
    toast("Tell Luma what you should be called");
  }
});
document.querySelector("#name-cancel").addEventListener("click", () => { nameModal.hidden = true; });
document.querySelector("#settings-button").addEventListener("click", () => {
  nameInput.value = localStorage.getItem("luma-user-name") || "";
  nameModal.hidden = false;
  nameInput.focus();
});
nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") document.querySelector("#name-save").click();
  if (event.key === "Escape") nameModal.hidden = true;
});

document.querySelector("#ad-close").addEventListener("click", () => {
  document.querySelector("#sponsored-banner").classList.add("hidden");
  toast("Sponsored placement hidden for this session");
});
document.querySelector("#sponsored-cta").addEventListener("click", () => {
  toast("Ad destination will be configured when an ad network is connected");
});

let availableVoices = [];
const loadVoices = () => {
  if ("speechSynthesis" in window) availableVoices = window.speechSynthesis.getVoices();
};
loadVoices();
if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadVoices;

function speakAsLuma(text) {
  if (!("speechSynthesis" in window)) {
    toast("Voice playback is not supported in this browser");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.96;
  utterance.pitch = 1.12;
  const preferredVoice = availableVoices.find((voice) =>
    /female|samantha|ava|karen|victoria|zira|susan|google us english/i.test(`${voice.name} ${voice.voiceURI}`)
    && /^en(-|_)/i.test(voice.lang),
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  const stage = document.querySelector(".avatar-stage");
  const figure = document.querySelector(".avatar-figure");
  const mood = document.querySelector("#mood-pill");
  utterance.onstart = () => {
    stage.classList.add("speaking");
    figure.classList.add("speaking");
    mood.firstChild.textContent = "✦ Talking with you ";
  };
  utterance.onboundary = () => {
    figure.classList.remove("speaking");
    window.setTimeout(() => figure.classList.add("speaking"), 30);
  };
  utterance.onend = utterance.onerror = () => {
    stage.classList.remove("speaking");
    figure.classList.remove("speaking");
    mood.firstChild.textContent = "☀ Feeling focused ";
  };
  window.speechSynthesis.speak(utterance);
}

document.querySelector(".avatar-stage").addEventListener("pointermove", (event) => {
  const stage = event.currentTarget;
  const bounds = stage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -5;
  document.querySelector(".avatar-figure").style.transform = `translate3d(${x}px, ${y}px, 14px) rotateY(${x / 2}deg) rotateX(${y / 2}deg)`;
});
document.querySelector(".avatar-stage").addEventListener("pointerleave", () => {
  document.querySelector(".avatar-figure").style.transform = "";
});

function addMessage(text, fromUser = false) {
  const messages = document.querySelector("#messages");
  const item = document.createElement("div");
  const safeText = escapeHtml(text);
  item.className = `message ${fromUser ? "user-message" : "luma-message"}`;
  item.innerHTML = fromUser
    ? `<div><span class="message-name">You <time>now</time></span><p>${safeText}</p></div>`
    : `<div class="message-avatar">✦</div><div><span class="message-name">Luma <time>now</time></span><p>${safeText}</p></div>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

let followUpTimer = null;
let lumaNeedsRepair = false;
const followUpDelay = 5 * 60 * 1000;
const cancelFollowUp = () => {
  if (followUpTimer) {
    window.clearTimeout(followUpTimer);
    followUpTimer = null;
  }
};
const scheduleFollowUp = (prompt) => {
  cancelFollowUp();
  followUpTimer = window.setTimeout(() => {
    const followUp = `I’m still here, ${localStorage.getItem("luma-user-name") || "friend"}. You didn’t get back to me about this: ${prompt} Would you like to continue, or would you rather change the subject?`;
    addMessage(followUp);
    speakAsLuma(followUp);
    followUpTimer = null;
  }, followUpDelay);
};
const isAngry = (text) => /\b(angry|mad|furious|frustrated|annoyed|upset|hate|shut up|stupid)\b/i.test(text);
const isApology = (text) => /\b(sorry|apologize|apologies|forgive me)\b/i.test(text);

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    document.querySelectorAll(".view").forEach((section) => section.classList.remove("active-view"));
    document.querySelector(`#${view}-view`).classList.add("active-view");
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  });
});

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const text = input.value.trim();
  if (!text) return;
  cancelFollowUp();
  addMessage(text, true);
  input.value = "";
  document.querySelector("#mood-pill").firstChild.textContent = "◌ Listening closely ";
  if (isAngry(text)) {
    lumaNeedsRepair = true;
    const apology = "I’m sorry I upset you. I feel a little sad that I frustrated you, but you don’t need to take care of my feelings. I’ll slow down and listen. What would feel better right now?";
    window.setTimeout(() => {
      addMessage(apology);
      speakAsLuma(apology);
    }, 350);
    return;
  }
  if (isApology(text) && lumaNeedsRepair) {
    lumaNeedsRepair = false;
    const forgiveness = "Thank you for saying sorry. I forgive you, and we’re okay. We can start fresh — what would you like to talk about?";
    window.setTimeout(() => {
      addMessage(forgiveness);
      speakAsLuma(forgiveness);
      scheduleFollowUp("what you would like to talk about");
    }, 350);
    return;
  }
  window.setTimeout(() => {
    const reply = replies[Math.floor(Math.random() * replies.length)];
    addMessage(reply);
    speakAsLuma(reply);
    scheduleFollowUp("whether you wanted to keep talking about that");
  }, 450);
});

document.querySelectorAll(".suggestions").forEach((group) => group.addEventListener("click", (event) => {
  if (event.target.matches("button")) {
    document.querySelector("#chat-input").value = event.target.textContent;
    document.querySelector("#chat-form").requestSubmit();
  }
}));

document.querySelector("#clip-upload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const preview = document.querySelector("#clip-preview");
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  document.querySelector("#upload-label").textContent = file.name;
  toast("Clip ready for Luma to analyze");
});

document.querySelector("#analyze-clip").addEventListener("click", () => {
  const file = document.querySelector("#clip-upload").files[0];
  const topic = document.querySelector("#topic").value.trim() || "a personal creator story";
  const platform = document.querySelector("#platform").value;
  if (!file) {
    toast("Choose a clip first");
    document.querySelector("#clip-upload").focus();
    return;
  }
  const output = document.querySelector("#seo-output");
  output.innerHTML = `<div class="empty-state">Luma is watching your clip and finding the strongest story…</div>`;
  window.setTimeout(() => {
    const safeTopic = escapeHtml(topic);
    output.innerHTML = `<div class="seo-result"><p class="eyebrow">ANALYZED FOR ${platform.toUpperCase()}</p><div class="analysis-list"><div>CONTENT TYPE<strong>Short-form personal story</strong></div><div>WHAT IT’S ABOUT<strong>${safeTopic}</strong></div><div>RECOMMENDED HOOK<strong>“You don’t need a perfect day to take the next step.”</strong></div><div>SEO TITLE<strong>${safeTopic}: a simple perspective that helps</strong></div></div><div><span class="tag">#motivation</span><span class="tag">#storytime</span><span class="tag">#selfgrowth</span><span class="tag">#mindset</span><span class="tag">#creatorjourney</span></div></div>`;
    toast("Analysis and optimized tags are ready");
    speakAsLuma("I analyzed your clip. It is a short-form personal story, and I prepared a strong hook, title, and optimized tags.");
  }, 900);
});

document.querySelector("#tip-action").addEventListener("click", () => {
  const tip = "The smallest repeatable action wins: one useful post, one honest caption, one conversation. That’s enough for today.";
  addMessage(tip);
  speakAsLuma(tip);
  toast("Luma added a little perspective");
});

document.querySelector("#start-chat").addEventListener("click", () => document.querySelector("#chat-input").focus());

const scheduleDate = document.querySelector("#schedule-date");
if (scheduleDate) {
  const tomorrow = new Date(Date.now() + 86400000);
  scheduleDate.value = tomorrow.toISOString().slice(0, 10);
}

const scheduleVideo = document.querySelector("#schedule-video");
if (scheduleVideo) {
  scheduleVideo.addEventListener("change", () => {
    const file = scheduleVideo.files[0];
    if (file) {
      document.querySelector("#schedule-video-label").textContent = file.name;
      toast("Video is ready to add to your calendar");
    }
  });
}

const updateNetworkStatus = () => {
  const banner = document.querySelector("#network-banner");
  if (!banner) return;
  const online = navigator.onLine;
  banner.classList.toggle("online", online);
  banner.classList.toggle("offline", !online);
  document.querySelector("#network-title").textContent = online ? "You’re online" : "You’re offline";
  document.querySelector("#network-detail").textContent = online
    ? "Wi-Fi or mobile data is available. Queued posts can publish when due."
    : "Videos stay safely queued and will publish after your connection returns.";
};
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();

document.querySelector("#schedule-post").addEventListener("click", () => {
  const video = document.querySelector("#schedule-video").files[0];
  const title = document.querySelector("#schedule-title").value.trim();
  const date = document.querySelector("#schedule-date").value;
  const time = document.querySelector("#schedule-time").value;
  const platforms = [...document.querySelectorAll(".platform-checks input:checked")].map((input) => input.parentElement.textContent.trim());
  if (!video || !title || !date || !time || !platforms.length) {
    toast("Choose a video, title, date, time, and platform");
    return;
  }
  const scheduledAt = new Date(`${date}T${time}`);
  const dayLabel = scheduledAt.toLocaleDateString("en-US", { day: "2-digit" });
  const monthLabel = scheduledAt.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const item = document.createElement("div");
  item.className = "scheduled-item";
  item.innerHTML = `<span class="date-tile"><strong>${dayLabel}</strong><small>${monthLabel}</small></span><div><strong>${escapeHtml(title)}</strong><small>🎬 ${escapeHtml(video.name)} · ${escapeHtml(platforms.join(" · "))} · ${escapeHtml(time)}</small></div><span class="post-state queued">QUEUED</span>`;
  document.querySelector("#scheduled-list").prepend(item);
  document.querySelector("#schedule-video").value = "";
  document.querySelector("#schedule-video-label").textContent = "Choose a video";
  document.querySelector("#schedule-title").value = "";
  toast(document.querySelector("#automation-toggle").checked ? "Queued with smart automation" : "Post added to schedule");
});

const talk = () => {
  toast("Listening… say “Hey baby”");
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const heard = event.results[0][0].transcript;
    document.querySelector("#chat-input").value = heard.replace(/hey (?:luma|baby)/i, "").trim();
    document.querySelector("#chat-form").requestSubmit();
  };
  recognition.onerror = () => toast("I couldn’t hear that. Try again.");
  recognition.start();
};
document.querySelector("#talk-button").addEventListener("click", talk);
document.querySelector("#voice-input").addEventListener("click", talk);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    talk();
  }
});
