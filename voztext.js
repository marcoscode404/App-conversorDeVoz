try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
  }
  catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
  }
  
  
  var noteTextarea = $('#note-textarea');
  var instructions = $('#recording-instructions');
  var notesList = $('ul#notes');
  
  var noteContent = '';
  
  // Obter todas as notas de sessões anteriores e exibi-las.
  var notes = getAllNotes();
  renderNotes(notes);
  
  
  
  /*-----------------------------
        Voice Recognition => Reconhecimento de voz
  ------------------------------*/
  
  // Se false, a gravação será interrompida após alguns segundos de silêncio.
  // Quando verdadeiro, o período de silêncio é maior (cerca de 15 segundos),
  // permitindo que continuemos gravando mesmo quando o usuário faz uma pausa.
  recognition.continuous = true;
  
   // This block is called every time the Speech APi captures a line.
  recognition.onresult = function(event) {
  
    // evento é um objeto SpeechRecognitionEvent.
    // Ele contém todas as linhas que capturamos até agora.
    // Só precisamos do atual.
    var current = event.resultIndex;
  
    // Obter uma transcrição do que foi dito.
    var transcript = event.results[current][0].transcript;
  
   // Adiciona a transcrição atual ao conteúdo de nossa Nota.
    // Há um bug estranho no celular, onde tudo é repetido duas vezes.
    // Não há solução oficial até agora, então temos que lidar com um caso extremo.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
  
    if(!mobileRepeatBug) {
      noteContent += transcript;
      noteTextarea.val(noteContent);
    }
  };
  
  recognition.onstart = function() { 
    instructions.text('Reconhecimento de voz ativado. Tente falar no microfone.');
  }
  
  recognition.onspeechend = function() {
    instructions.text('Você ficou quieto por um tempo, então o reconhecimento de voz se desligou.');
  }
  
  recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
      instructions.text('Nenhuma fala foi detectada. Tente novamente.');  
    };
  }
  
  
  
  /*-----------------------------
        App buttons and input 
  ------------------------------*/
  
  $('#start-record-btn').on('click', function(e) {
    if (noteContent.length) {
      noteContent += ' ';
    }
    recognition.start();
  });
  
  
  $('#pause-record-btn').on('click', function(e) {
    recognition.stop();
    instructions.text('Reconhecimento de voz pausado.');
  });
  
  // Sincroniza o texto dentro da área de texto com a variável noteContent.
  noteTextarea.on('input', function() {
    noteContent = $(this).val();
  })
  
  $('#save-note-btn').on('click', function(e) {
    recognition.stop();
  
    if(!noteContent.length) {
      instructions.text('Não foi possível salvar a nota vazia. Por favor, adicione uma mensagem à sua nota.');
    }
    else {
      // Salva a nota em localStorage.
      // A chave é o dateTime com segundos, o valor é o conteúdo da nota.
      saveNote(new Date().toLocaleString(), noteContent);
  
      // Reset variables and update UI.
      noteContent = '';
      renderNotes(getAllNotes());
      noteTextarea.val('');
      instructions.text('Note saved successfully.');
    }
        
  })
  
  
  notesList.on('click', function(e) {
    e.preventDefault();
    var target = $(e.target);
  
    // Listen to the selected note.
    if(target.hasClass('listen-note')) {
      var content = target.closest('.note').find('.content').text();
      readOutLoud(content);
    }
  
    // Delete note.
    if(target.hasClass('delete-note')) {
      var dateTime = target.siblings('.date').text();  
      deleteNote(dateTime);
      target.closest('.note').remove();
    }
  });
  
  
  
  /*-----------------------------
        Speech Synthesis 
  ------------------------------*/
  
  function readOutLoud(message) {
      var speech = new SpeechSynthesisUtterance();
  
    // Set the text and voice attributes.
      speech.text = message;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
    
      window.speechSynthesis.speak(speech);
  }
  
  
  
  /*-----------------------------
        Helper Functions 
  ------------------------------*/
  
  function renderNotes(notes) {
    var html = '';
    if(notes.length) {
      notes.forEach(function(note) {
        html+= `<li class="note">
          <p class="header">
            <span class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note">Ouvir Nota</a>
            <a href="#" class="delete-note" title="Delete">Deletar</a>
          </p>
          <p class="content">${note.content}</p>
        </li>`;    
      });
    }
    else {
      html = '<li><p class="content">Você ainda \ não tem notas.</p></li>';
    }
    notesList.html(html);
  }
  
  
  function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
  }
  
  
  function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
  
      if(key.substring(0,5) == 'note-') {
        notes.push({
          date: key.replace('note-',''),
          content: localStorage.getItem(localStorage.key(i))
        });
      } 
    }
    return notes;
  }
  
  
  function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime); 
  }
  
  