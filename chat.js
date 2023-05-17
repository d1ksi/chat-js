let nextMessageId = 0;
let lastMessageId = 0;

async function jsonPost(url, data) {
   try {
      const response = await fetch(url, {
         method: 'POST',
         body: JSON.stringify({ ...data, nextMessageId })
      });
      if (response.ok) {
         const json = await response.json();
         nextMessageId = json.nextMessageId;
         nextMessageId++;
         if (nextMessageId > lastMessageId) {
            lastMessageId = nextMessageId;
         }
         return json;
      } else {
         throw new Error('status is not 200');
      }
   } catch (error) {
      throw new Error('jsonPost failed');
   }
}

async function sendMessage(nick, message) {
   try {
      await jsonPost("http://students.a-level.com.ua:10012", { func: 'addMessage', nick, message });
   } catch (error) {
      console.error('Failed to send message:', error);
   }
}

async function getMessages() {
   try {
      const response = await jsonPost("http://students.a-level.com.ua:10012", { func: 'getMessages' });
      if (response && response.data && Array.isArray(response.data)) {
         for (const message of response.data) {
            drawMessage(message);
         }
      }
   } catch (error) {
      console.error('Failed to get messages:', error);
   }
}

function drawMessage(message) {
   const { nick, message: text, time } = message;
   const nickDiv = document.createElement("div");
   const newDiv = document.createElement("div");
   const timeDiv = document.createElement("div");
   const container = document.getElementById("message");
   if (nick !== 'Vlad') {
      nickDiv.className = "nickRight";
      newDiv.className = "smsRight";
      timeDiv.className = "timeRight";
   } else {
      nickDiv.className = "nick";
      newDiv.className = "sms";
      timeDiv.className = "time";
   }
   nickDiv.innerHTML = nick;
   newDiv.innerHTML = text;
   timeDiv.innerHTML = time;
   container.appendChild(nickDiv);
   container.appendChild(newDiv);
   container.appendChild(timeDiv);
}


document.getElementById('botton').onclick = sendAndCheck;
async function sendAndCheck() {
   const inputText = document.getElementById('textMessage').value.trim();
   const nickText1 = document.getElementById('nickMessage').value.trim();
   if (inputText === '' || nickText === '') {
      return;
   }
   await Promise.all([sendMessage(nickText, inputText), getMessages()]);

   let nickText = nickText1[0].toUpperCase() + nickText1.slice(1);
   let currentTime = getCurrentTime();
   if (nickText !== 'Vlad') {
      const nickDiv = document.createElement("div");
      nickDiv.className = "nickRight";
      nickDiv.innerHTML = nickText;
      const newDiv = document.createElement("div");
      newDiv.className = "smsRight";
      newDiv.innerHTML = inputText;
      const timeDiv = document.createElement("div");
      timeDiv.className = "timeRight";
      timeDiv.innerHTML = currentTime;
      const container = document.getElementById("message");
      container.appendChild(nickDiv);
      container.appendChild(newDiv);
      container.appendChild(timeDiv);
      document.getElementById('textMessage').value = '';
   } else {
      const nickDiv = document.createElement("div");
      nickDiv.className = "nick";
      nickDiv.innerHTML = nickText;
      const newDiv = document.createElement("div");
      newDiv.className = "sms";
      newDiv.innerHTML = inputText;
      const timeDiv = document.createElement("div");
      timeDiv.className = "time";
      timeDiv.innerHTML = currentTime;
      const container = document.getElementById("message");
      container.appendChild(nickDiv);
      container.appendChild(newDiv);
      container.appendChild(timeDiv);
   }
   document.getElementById('textMessage').value = '';
   await sendMessage(nickText1, inputText);
}

async function checkLoop() {
   while (true) {
      await getMessages();
      await delay(2000); // Затримка 2 секунди
   }
}

function delay(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById('textMessage').addEventListener('input', toggleButton);
document.getElementById('nickMessage').addEventListener('input', toggleButton);

function toggleButton() {
   const inputText = document.getElementById('textMessage').value.trim();
   const nickText = document.getElementById('nickMessage').value.trim();
   const button = document.getElementById('botton');
   button.disabled = inputText === '' || nickText === '';
}

document.getElementById('botton').addEventListener('click', sendAndCheck);

checkLoop();