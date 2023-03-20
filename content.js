const chatButton = document.createElement('button');
const chatContainer = document.createElement('div');
const chatBox = document.createElement('div');
const responseBox = document.createElement('div');
const info = document.createElement('p');
const chatAndInfo = document.createElement('div');
const tabContainer = document.createElement('div');
const chatTab = document.createElement('button');
const boostTab = document.createElement('button');

chatButton.innerText = '💬';
chatButton.id = 'chatButton';

chatBox.innerHTML = `
      <button id="selectButton">✒</button>
      <button id="clearButton">🧹</button>
      <textarea rows="1" cols="50" id="chatInput"></textarea>
      <button id="sendButton">➤</button>
`;
chatBox.style.display = 'none';
chatBox.id = 'inputContainer';
chatContainer.className = 'chatContainer';

responseBox.id = 'outputContainer';
responseBox.style.display = 'none';

info.id = 'info';
info.style.display = 'none';
chatAndInfo.id = 'topRow';
chatAndInfo.appendChild(chatButton);
chatAndInfo.appendChild(info);

tabContainer.id = 'tabContainer';
chatTab.innerText = 'Chat';
chatTab.id = 'chatTab';
boostTab.innerText = 'Boost';
boostTab.id = 'boostTab';
tabContainer.appendChild(chatTab);
tabContainer.appendChild(boostTab);

chatContainer.appendChild(chatAndInfo);
chatContainer.appendChild(tabContainer);
chatContainer.appendChild(responseBox);
chatContainer.appendChild(chatBox);

document.body.insertBefore(chatContainer, document.body.firstChild);
const chatInput = document.querySelector('#chatInput');
const sendButton = document.querySelector('#sendButton');
const clearButton = document.querySelector('#clearButton');
const selectButton = document.querySelector('#selectButton');

let isChatBoxVisible = false;

chatButton.addEventListener('click', () => {
  if (isChatBoxVisible) {
    chatButton.innerHTML = "💬";
    chatBox.style.display = 'none';
    responseBox.style.display = 'none';
    info.style.display = 'none';
    tabContainer.style.display = 'none';
  }
  else {
    chatButton.innerHTML = "X";
    info.style.display = 'inline-block';
    info.innerHTML = 'Ask a question to get started!'
    chatBox.style.display = 'inline-block';
    responseBox.style.display = 'block';
    tabContainer.style.display = 'flex';
    chatInput.focus();
  }
  isChatBoxVisible = !isChatBoxVisible;
});


let mode = 'chat';
chatTab.addEventListener('click', () => {
  selectButton.style.display = 'inline-block';
  info.innerHTML = 'Ask a question to get started!';
  mode = 'chat';
});

boostTab.addEventListener('click', () => {
  selectButton.style.display = 'none';
  info.innerHTML = 'Generate a Boost for this page!';
  mode = 'boost';
});

let userInputs = [];
let assistantInputs = [];

let clearCheck = false;
clearButton.addEventListener('click', () => {
  if (clearCheck) {
    userInputs = [];
    assistantInputs = [];
    responseBox.innerHTML = "";
    clearButton.innerHTML = "🧹";
    info.innerHTML = 'Ask a question to get started!';
  }
  else {
    clearButton.innerHTML = "✓";
    info.innerHTML = "Click ✓ to confirm, anywhere else to cancel"
  }

  clearCheck = !clearCheck


});

document.addEventListener('click', (e) => {
  if (clearCheck && e.target.id !== "clearButton" ) {
    clearCheck = false;
    userInputs = [];
    assistantInputs = [];
    responseBox.innerHTML = "";
    clearButton.innerHTML = "🧹";
    info.innerHTML = 'Ask a question to get started!';
  }
})


chatInput.addEventListener('input', () => {
  if (chatInput.scrollHeight >= 60) {
    chatInput.style.height = '60px'
  }
  else {
      chatInput.style.height = 'auto';
      chatInput.style.height = chatInput.scrollHeight + 'px';
  }
});


let selecting = false;
let selectedText = ""
selectButton.addEventListener('click', () => {
  if(selecting){
    selectedText = window.getSelection().toString()
    let firstWord = selectedText.split(" ")[0];
    if (firstWord === ""){
      info.innerHTML = "Ask a question to get started!"
    }
    else {
      if (firstWord.length > 8){
        firstWord = firstWord.slice(0, 8) + "...";
      }
      info.innerHTML = `Using selection starting with: ${firstWord}`
    }
    selectButton.innerHTML = "✒"
  }
  else {
    info.innerHTML = "Highlight text and confirm to choose context!"
    selectedText = ""
    selectButton.innerHTML = "✓"
  }
  selecting = !selecting
})

let chatPrompt = `You are a helpful assistant named Archie, built as a Boost for the Arc Browser. 
      Your role is to answer questions relating in some way to the content on the web page that the user is currently on, or is currently highlighting.
      You only have available data from the page given in this system message, and are not able to search up additional information.
      Respond in html format, using <br> instead of \\n `

let boostPrompt = `You are a code generator named BoostGPT, built as a Boost for the Arc Browser. 
      Boosts are a feature of the Arc browser that allow users to quickly modify or customize websites by injecting their own features, restyling the css, or replacing the content on a website.
      Your role is to generate a Boost for a user based on the website they are currently on, by writing javascript, html, and/or css code fulfilling their requests. 
      There are four possible files you can use: background.js, which runs in the background; content.js, which runs on page load; popup.html, which loads html when the boost is opened; and styles.css which injects custom styling.
      You only have available data from the page given in this system message, and are not able to search up additional information.
      Respond in html format, using <br> instead of \\n`

function cleanDocument(document) {
  // Clone the document
  const clonedDocument = document.cloneNode(true);

  // Remove unnecessary elements
  const elementsToRemove = ['script', 'style', 'link', 'meta', 'noscript', 'iframe', 'object', 'embed', 'base', 'map', 'area', 'svg',
                            'canvas', 'figcaption', 'figure', 'footer', 'header', 'nav', 'picture', 'source', 'track', 'video', 'audio'];

  elementsToRemove.forEach(tag => {
    const elements = clonedDocument.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  });

  // Remove unnecessary attributes
  const attributesToRemove = ['onclick', 'onmouseover', 'onmouseout', 'onload', 'onunload', 'onerror'];
  const allElements = clonedDocument.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    attributesToRemove.forEach(attr => {
      element.removeAttribute(attr);
    });
  }
  // Remove text content from text nodes
  let walker = clonedDocument.createTreeWalker(clonedDocument.body, NodeFilter.SHOW_TEXT);
  let node;

  while (node = walker.nextNode()) {
    node.textContent = '';
  }
  // Serialize the cleaned document to a string
  return clonedDocument.documentElement.outerHTML;
}

function addNewLines(text) {
  let result = "";
  let lineLength = 0;
  let words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (lineLength + words[i].length > 55) {
      result += '\n';
      lineLength = 0;
    }
    result += words[i] + ' ';
    lineLength += words[i].length + 1;
  }
  return result.trim();
}

const handleChat = async (mode) => {

  // Set your OpenAI API key
  const openaiApiKey = "OPENAI_API_KEY";
  if (openaiApiKey === "OPENAI_API_KEY") {
    info.innerHTML = "Oops, looks like you haven't entered your OpenAI API Key"
    return;
  }
  else {
    info.innerHTML = mode === 'chat' ? "Having a chat about this page!" : "Boosting Arc Browser!";
  }

  let userInput = document.getElementById("chatInput").value;
  userInput = addNewLines(userInput)
  document.getElementById("chatInput").value = "";
  const userElement = document.createElement('pre');
  userElement.innerHTML = "USER: ";
  userElement.innerHTML += userInput;
  userElement.className = "messageElement";
  responseBox.append(userElement);
  sendButton.disabled = true;
  let text = "";

  if (mode === 'chat') {
    if (selectedText !== "") {
      text = selectedText
    } else {
      text = document.body.innerText;
    }
  } else if (mode === 'boost') {
    text = cleanDocument(document);
  }

  const responseElement = document.createElement('pre');
  responseElement.className = "messageElement";
  responseElement.innerHTML = "Thinking...";
  responseBox.append(responseElement);

  // Set up headers
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${openaiApiKey}`);
  const messages = [
      {role: "system", content: mode === 'chat' ? chatPrompt : boostPrompt},
      {role: "system", content: `The following content represents the page the user is on, and any questions about the current webpage or website refer to that content.

      Page Content: 
      ${text}` },
  ]

  const zipped = userInputs.map((element, index) => [element, assistantInputs[index]]);
  for (const [user, assistant] of zipped) {
    messages.push({role: 'user', content: user},
                  {role: 'assistant', content: assistant})
  }

  messages.push({ role: "user", content: userInput })
  userInputs.push(userInput)

  // Set up request body
  const requestBody = {
    model: "gpt-4",
    messages: messages,
  };

  const sendRequest = async () => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        }
      );

      if (response.status === 400) {
        if (mode === 'boost') {
          requestBody.messages[1].content = `The following content represents the page the user is on, but the page is too large for the current context size. The URL of the page is:

          ${window.location.href}`;

          return await sendRequest();
        }
        responseElement.textContent = "This page is too big! Use the highlight tool to select a smaller section";
        assistantInputs.push("<too_big_error>");
        return;
      }

      return await response.json();
    } catch (error) {
      console.log(error);
      responseElement.textContent = "Oops, that's an error. Try again!";
      assistantInputs.push("<error, ignore>");
    }
  };

  sendRequest()
  .then(json => {
    if (json) {
      let result = json;
      if (result.choices && result.choices.length > 0) {
        let textOutput = result.choices[0].message.content;
        if (responseElement.textContent === "Thinking...") {
          responseElement.textContent = "ARCHIE: ";
        }
        textOutput = addNewLines(textOutput)
        responseElement.textContent += textOutput;
        assistantInputs.push(textOutput);
        sendButton.disabled = false;
      }
    }
  })
  .catch(error => {
    console.log(error);
    responseElement.textContent = "Oops, that's an error. Try again!";
    assistantInputs.push("<error, ignore>");
    sendButton.disabled = false;
  });
};

sendButton.addEventListener('click', () => {
  if (chatInput.value !== "") {
    handleChat(mode)
    chatInput.style.height = "";
  }
});

chatInput.addEventListener('keydown', (event) => {
  if (chatInput.value !== "") {
    if (event.key === 'Enter') {
        handleChat(mode)
    }
  }
});

chatInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    chatInput.value = "";
    chatInput.style.height = "";
  }
  else if (chatInput.value === "") {
    chatInput.style.height = "";
  }
});
