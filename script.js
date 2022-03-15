const utterance = new SpeechSynthesisUtterance();


// alterando para pt-br a linguagem
// rate = a velocidade de fala
utterance.lang = "pt-BR";
utterance.rate = 2;

// function de fala
function speak() {
	speechSynthesis.speak(utterance);
}

// para a funcionalidade de fala
function stop() {
  speechSynthesis.cancel();
}

// permite adicionar o texto e ativa a fala 
function setText(event) {
	utterance.text = event.target.innerText;
}





