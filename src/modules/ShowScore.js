const showScore = (score) => {
    switch(score%10){
        case 0:{
            return require('../assets/img/Score/score_10.png');
        }
        case 1:{
            return require('../assets/img/Score/score_1.png');
        }
        case 2:{
            return require('../assets/img/Score/score_2.png');
        }
        case 3:{
            return require('../assets/img/Score/score_3.png');
        }
        case 4:{
            return require('../assets/img/Score/score_4.png');
        }
        case 5:{
            return require('../assets/img/Score/score_5.png');
        }
        case 6:{
            return require('../assets/img/Score/score_6.png');
        }
        case 7:{
            return require('../assets/img/Score/score_7.png');
        }
        case 8:{
            return require('../assets/img/Score/score_8.png');
        }
        case 9:{
            return require('../assets/img/Score/score_9.png');
        }
    }
}

module.exports = showScore;