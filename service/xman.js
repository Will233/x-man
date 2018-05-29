const shuffle = require('./shuffle.js');
const wordsDB = require('./data.js');

function Xman() {
  let _self = this;
  // 玩家
  let playersNumber,
    xmanNumber,
    blankNumber,
    plainNumber,
    playerAliveNumber;

  // 用户类型
  const TYPE_XMAN = 1;
  const TYPE_MAN = 0;
  const TYPE_BLANK = 2;
  // 生存状态
  const STATUS_ALIVE = 1;
  const STATUS_DEAD = 0;

  const GAME_INIT = 0;
  const GAME_START = 1;
  const GAME_OVER = 2;
  const GAME_EXIT = -1;
  // 游戏状态
  let gameStatus = GAME_INIT;
  // Array | { id: '', desc: '' , type:'', status: 1}
  // s身份数组 

  let idArray = [];
  let descArray = [];
  _self.setStupidNumber = function (num) {
    playersNumber = num;
    return _self;
  }

  _self.setPlaysNumber = function (num) {
    playersNumber = num;
    return _self;
  }

  _self.checkPlayer = function (index) {
    // 校验index 合法性
    return idArray[index];
  }

  // 初始化游戏
  _self.init = function (players, xman, blank) {
    // console.log('Who is the x-man init ...')
    playersNumber = players
    xmanNumber = xman
    blankNumber = blank
    plainNumber = players - xman - blank
    playerAliveNumber = playersNumber

    if (playersNumber < xmanNumber + blankNumber) {
      throw new Error('Init Game Error, playersNumber must be more than the sum of xman and blank ..')
    }
    // console.log('init over')
    console.log(`====== 初始化完毕: ======`)
    console.log(`玩家数量: ${playersNumber}`)
    console.log(`卧底 : ${xmanNumber}`)
    console.log(`白板: ${blankNumber}`)
    console.log(`平民: ${plainNumber}`)
    console.log(`============================`)
  }

	/**
	 * @see 游戏开始。指定角色和发牌
	 * @param words 不同的词语
	 *
	 */
  _self.start = function (words) {
    // 每个人的单词
    if (!words) {
      let length = wordsDB.length;
      let index = Math.floor(Math.random() * length)
      words = wordsDB[index]
      let tmp = wordsDB[0];
      wordsDB[0] = words;
      wordsDB[index] = tmp;
      // 避免重复，删除节点
      wordsDB.shift();
    }

    playerAliveNumber = playersNumber
    // 选牌
    _self.initCards(words);
    // 洗牌 && 发牌
    _self.shuffle(idArray);
    gameStatus = GAME_START;
    _self.display();
    return _self;
  }
  
  _self.reset = function () {
    gameStatus = GAME_INIT;
    idArray = [];
    return _self;
  }
  _self.finish = function () {
    gameStatus = GAME_OVER;
    return _self;
  }

  // 选牌
  _self.initCards = function (words) {
    idArray = [];
    for (let i = 0; i < playersNumber; i++) {
      if (i < xmanNumber) {
        idArray.push({
          role: '卧底',
          desc: words[TYPE_XMAN],
          type: TYPE_XMAN,
          status: STATUS_ALIVE
        })
      } else if (i >= xmanNumber && i < (xmanNumber + plainNumber)) {
        idArray.push({
          role: '平民',
          desc: words[TYPE_MAN],
          type: TYPE_MAN,
          status: STATUS_ALIVE
        })
      } else {
        idArray.push({
          role: '白板',
          desc: '',
          type: TYPE_BLANK,
          status: STATUS_ALIVE
        })
      }
    }
  }

  _self.shuffle = function () {
    // 洗牌
    idArray = shuffle(idArray);
    return _self;
  }
  // 获取游戏状态
  _self.getStatus = function () {
    return gameStatus;
  }
  _self.display = function () {
    let descs = idArray.map(item => {
      return item.desc;
    });
    console.log(descs)
    return _self;
  }

  // 检查身份
  _self.confirmWord = function (index) {
    if (index < 0 || index >= idArray.length) {
      throw new Error('illegal index of the array');
      return _self;
    }
    return idArray[index];
  }

  _self.exposePlayer = function (index) {
    // 校验合法性
    if (index < 0 || index >= idArray.length) {
      throw new Error('illegal index of the array');
    }
    if (gameStatus === GAME_OVER) {
      return '游戏已结束'
    }
    idArray[index].status = STATUS_DEAD;
    // 生存人数减少一人
    playerAliveNumber -= 1;
    let round = playersNumber - playerAliveNumber
    console.log(`Round ${round} , ${idArray[index].role} is DEAD ...`)
    // 检查游戏状态
    let status = _self.checkEnd();
    // return idArray[index];
    if (status) {
      console.log(status)
      return status;
    } else {
      return idArray[index].role;
    }
  }
  _self.getIdArray = function () {
    return idArray;
  },
  _self.checkEnd = function () {
    if (gameStatus === GAME_START) {
      let xmanCount = 0;
      let plainCount = 0;
      let blankCount = 0;
      idArray.forEach(function (player) {
        if (player.status === STATUS_ALIVE) {
          if (player.type === TYPE_MAN) {
            plainCount++;
          } else if (player.type === TYPE_XMAN) {
            xmanCount++;
          } else if (player.type === TYPE_BLANK) {
            blankCount++;
          }
        }
      })
      let round = playersNumber - playerAliveNumber;
      // 游戏结束条件
      if (xmanCount === 0 && blankCount === 0) {
        _self.finish();
        return `平民胜利`;
      } else {
        // 1、参与人数 < 7, 剩余两人时，卧底存活，则卧底胜利
        if (playersNumber < 7) {
          if (playerAliveNumber === 2 && xmanCount >= 1) {
            _self.finish();
            return `卧底胜利`;
          } else if (playerAliveNumber === 2 && blankCount >= 1 && xmanCount === 0) {
            _self.finish();
            return `白板胜利`;
          } else {
            return false;
          }
          // 2、7人场， 3人结算
        } else if (playersNumber >= 7) {
          if (playerAliveNumber === 3 && xmanCount >= 1) {
            _self.finish();
            return `卧底胜利`;
          } else if (playerAliveNumber === 3 && blankCount >= 1 && xmanCount === 0) {
            _self.finish();
            return `白板胜利`;
          } else {
            return false
          }
        }
      }
    } else if (gameStatus === GAME_OVER) {
      return '游戏已结束'
    } else {
      // console.log('')
      return '游戏未开始'
    }
  }
}


function fakeLoop(xman, words, times) {
  console.log(`==== GAME ${times} ====`)
  xman.start()
  let i = len
  while (i-- > 0) {
    xman.confirmWord(i)
  }

  let j = len
  while (j-- > 0) {
    xman.exposePlayer(j)
  }
}
/*
var xman = new Xman();
var len = 7
xman.init(len, 1, 1);

let i = wordsDB.length;
let loop = 1
while(i-- > 0) {
	fakeLoop(xman, [], loop++);
}
*/

module.exports = Xman
