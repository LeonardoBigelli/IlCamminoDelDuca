const startButton = document.getElementById('start-btn') //bottone inizia il quiz
const nextButton = document.getElementById('next-btn')  //bottone prossimo
const questionContainerElement = document.getElementById('question-container')  //div con le domande
const questionElement = document.getElementById('question') //domanda
const answerButtonsElement = document.getElementById('answer-buttons')  //div con le risposte

let puntiTot = 0;

let shuffledQuestions, currentQuestionIndex

startButton.addEventListener('click', startGame)  //al click del bottone start, invoca startgame
nextButton.addEventListener('click', () => {    //al click di prossimo, passa alla domanda successiva
  currentQuestionIndex++;
  setNextQuestion();
})




//funzione per cominciare il quiz
function startGame() {
  startButton.classList.add('hide') //aggiungi hide alla classe del bottone start, così con display:none 
                                    //fai scomparire il bottone start una volta cominciato il quiz
  document.getElementById("results").classList.add('hide');
  document.getElementById("container").classList.remove('hide');
  shuffledQuestions = questions.sort(() => Math.random() - .5)  //rimescolamento domande
  currentQuestionIndex = 0
  questionContainerElement.classList.remove('hide')
  setNextQuestion()
}

function setNextQuestion() {
  resetState()
  showQuestion(shuffledQuestions[currentQuestionIndex])
}

function resetState() {
  clearStatusClass(document.body)
  nextButton.classList.add('hide')
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
}

//funzione per mostrare le domande
function showQuestion(question) {
  questionElement.innerText = question.question //scrivi la domanda nell'HTML
  question.answers.forEach(answer => {          
    const button = document.createElement('button')
    button.innerText = answer.text
    button.classList.add('btn')
    
    /*if (answer.correct) {
      button.dataset.correct = answer.correct
    }*/

    //assegno i punti ad ogni bottone, cioè ad ogni risposta
    switch(answer.points){
      case 1:
        button.dataset.points = answer.points;
        //console.log(button.dataset.points);
        break;
      case 2:
        button.dataset.points = answer.points;
        break;
      case 3:
        button.dataset.points = answer.points;
        break;
      case 4:
        button.dataset.points = answer.points;
        break;
      default:
        console.log("Errore assegnamento punti");
    }

    button.addEventListener('click', selectAnswer)
    answerButtonsElement.appendChild(button)
  })
}



function selectAnswer(e) {
  const selectedButton = e.target
  //const correct = selectedButton.dataset.correct
  let punti = selectedButton.dataset.points;
  //setStatusClass(document.body, correct)
  //setStatusClass(document.body, punti)
  /*Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct)
  })*/

  puntiTot += parseInt(punti);

  console.log(puntiTot);

  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide')
  } else {
    startButton.innerText = 'Ricomincia il test';
    startButton.classList.remove('hide')
    calcolaPunti();
    puntiTot = 0;
  }
}

function setStatusClass(element, punti) {
  /*clearStatusClass(element)
  if (correct) {
    element.classList.add('correct')
  } else {
    element.classList.add('wrong')
  }*/
  

}

function clearStatusClass(element) {
  /*element.classList.remove('correct')
  element.classList.remove('wrong')*/
}

function calcolaPunti(){
  const risultati = JSON.parse(tipi);
  //console.log(risultati);

  document.getElementById("results").classList.remove('hide');

  if (puntiTot < 7){
    // Recupera il tipo dal primo risultato
    const tipoPrimoRisultato = risultati[0].risultato[0].tipo;
    console.log(tipoPrimoRisultato); // Output: "Pigro"
    document.getElementById("results").innerHTML = "<p style='text-align: center; font-family: Nunito, sans-serif; font-size: 30px; font-weight: bold;'>"
                                                    + "Sei " + tipoPrimoRisultato
                                                    + "</p>";
  }

  if(puntiTot >= 7 && puntiTot < 11){
    // Recupera il tipo dal secondo risultato
    const tipoSecondoRisultato = risultati[1].risultato[0].tipo;
    console.log(tipoSecondoRisultato); // Output: "Medio"
    document.getElementById("results").innerHTML = "<p style='text-align: center; font-family: Nunito, sans-serif; font-size: 30px; font-weight: bold;'>"
                                                    + "Sei " + tipoSecondoRisultato
                                                    + "</p>";
  }

  if(puntiTot >= 11 && puntiTot < 14){
    // Recupera il tipo dal terzo risultato
    const tipoTerzoRisultato = risultati[2].risultato[0].tipo;
    console.log(tipoTerzoRisultato); // Output: "Medio"
    document.getElementById("results").innerHTML = "<p style='text-align: center; font-family: Nunito, sans-serif; font-size: 30px; font-weight: bold;'>"
                                                    + "Sei " + tipoTerzoRisultato
                                                    + "</p>";
  }

  if(puntiTot >= 14 && puntiTot < 18){
    // Recupera il tipo dal quarto risultato
    const tipoQuartoRisultato = risultati[3].risultato[0].tipo;
    console.log(tipoQuartoRisultato); // Output: "Iperattivo"
    document.getElementById("results").innerHTML = "<p style='text-align: center; font-family: Nunito, sans-serif; font-size: 30px; font-weight: bold;'>"
                                                    + "Sei " + tipoQuartoRisultato
                                                    + "</p>";
  }
}


/*--- Domande ---*/
const questions = [
  {
    question: 'A che ora ti svegli la mattina?',
    answers: [
      { text: '5', points: 4 },
      { text: '6', points: 3 },
      { text: '7', points: 2 },
      { text: '8', points: 1 }
    ]
  },
  {
    question: 'Ti piace passeggiare?',
    answers: [
      { text: 'No, per niente', points: 1  },
      { text: 'Poco', points: 2  },
      { text: 'Abbastanza', points: 3 },
      { text: 'Sì, molto', points: 4 }
    ]
  },
  {
    question: 'Fai sport?',
    answers: [
      { text: 'Cos\'è?', points: 1  },
      { text: 'Ogni tanto', points: 2  },
      { text: 'Sì, 3/4 volte a settimana', points: 3  },
      { text: 'Sono un professionista', points: 4 }
    ]
  },
  {
    question: 'Ogni quanto vai a fare le passeggiate?',
    answers: [
      { text: 'Mai', points: 1 },
      { text: 'Una volta ogni tanto', points: 2 },
      { text: 'Spesso', points: 3 },
      { text: 'Quasi tutti i giorni', points: 4 }
    ]
  }
]


/* --- Risultati del test --- */
const tipi = `[
  {
    "id": 1,
    "risultato": [
      { "tipo": "un pigrone", "desc": "aaaaaaaaaaaaaa"}
    ]
  },
  {
    "id": 2,
    "risultato": [
      { "tipo": "un normale camminatore", "desc": "bbbbbbbbbbbbb"}
    ]
  },
  {
    "id": 3,
    "risultato": [
      { "tipo": "un discreto cultore della camminata", "desc": "ccccccccccccc"}
    ]
  },
  {
    "id": 4,
    "risultato": [
      { "tipo": "il maestro supremo della camminata", "desc": "dddddddddd"}
    ]
  }
]`;