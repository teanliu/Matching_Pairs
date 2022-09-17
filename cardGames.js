const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const view = {
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return  `<p> ${ number }</p>
        <img src="${symbol}" alt="">
          <p>${number}</p>
          `
  },
  getCardsElement (index) {
    return `
      <div data-index="${index}"class="card back"></div>
    `
  },
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => 
      this.getCardsElement(index)).join('')
  },
  flipCards (...cards) {
    cards.map(card => {
      console.log(card)
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      } else {
        card.classList.add('back')
        card.innerHTML = null
      }  
    }) 
  },
  pairCard (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore (score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },
  renderTriedTimes (times) {
    document.querySelector('.tried').innerText = `You've tried: ${times} times`
  },
  appendWrongAnimation (...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTime} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}



const model = {
  revealCards: [],

  isRevealedCardsMatched () {
    return this.revealCards[0].dataset.index % 13 == this.revealCards[1].dataset.index % 13
  },

  score: 0,

  triedTime: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        return
      
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTime)
        view.flipCards(card)
        model.revealCards.push(card)
        console.log(model.isRevealedCardsMatched())
        if (model.isRevealedCardsMatched()) {
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardMatched
          view.pairCard(...model.revealCards)
          model.revealCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000)
        }

    }
    console.log(this.currentState, model.revealCards)
  },
  resetCards () {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }


}

controller.generateCards()


// node list
document.querySelectorAll('.card').forEach(card => 
  card.addEventListener('click', event => {
    // view.appendWrongAnimation(card)
    controller.dispatchCardAction(card)
  })
  )