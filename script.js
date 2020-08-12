//Helps in scaling website when Windows has scaling settings other than 100% (For eg. 125%)
document.querySelector('body').style.zoom = `${1 / window.devicePixelRatio * 100}%`;

//Our gameBoard module, which generates and holds all functions required to manipulate our Tic-Tac-Toe gameboard.
const gameBoard = (function(){
    //Initialize Empty 3 Dimensional Array could've been done with a single dimensional array too but I like this better.
    let _gameArr =[[],[],[]];
    
    //Set defautl match state
    let matchNotOver=false;

    //Set default Ai usage state
    let ai=true;

    //Initialize empty player objects which are instantiated with factory functions defined later.
    const playerX={};
    const playerO={};

    //DOM cache
    const cells = document.querySelectorAll(".cell");
    const P1 = document.querySelector("#P1");
    const P2 = document.querySelector("#P2");
    const playGameBtn = document.querySelector("#playGameBtn");
    const closeBtn = document.querySelector("#close");
    const closeAltBtn = document.querySelector("#closeAlt");
    const playerInfo = document.querySelector("#playerInfo");
    const gridContainer = document.querySelector("#gridContainer");
    const turnContainer = document.querySelector("#turnContainer");
    const resetContainer = document.querySelector(".resetContainer");
    const alertContainer = document.querySelector("#alertContainer");
    const alertContainerAlt = document.querySelector("#alertContainerAlt");

    //Event listeners over P1 and P2 to select game type.
    P1.addEventListener("click", function(){
        P1.className="border";
        P2.className="noBorder";
        playerInfo.style.display="flex";
        document.querySelector("#playerO").value="CPU"
        document.querySelector("#playerO").disabled=true;
    });
    
    P2.addEventListener("click", function(){
        P2.className="border";
        P1.className="noBorder";
        playerInfo.style.display="flex";
        document.querySelector("#playerO").value="PLAYER 2";
        document.querySelector("#playerO").disabled=false;
    });
    
    //For closing alert boxes
    closeBtn.addEventListener("click", function(){
        alertContainer.style.display="none";
    })
    
    closeAltBtn.addEventListener("click", function(){
        alertContainerAlt.style.display="none";
    })

    //Check conditions and begin new game
    playGameBtn.addEventListener("click", function(){
        if((P1.className=="border" || P2.className=="border")&&(document.querySelector("#playerX").value.trim()!=""&&document.querySelector("#playerO").value.trim()!="")){        
            newGame();
            gridContainer.style.visibility="visible";
            gridContainer.style.opacity="1";
            resetContainer.style.visibility="visible";
            resetContainer.style.opacity="1";
            playerInfo.style.display="none";
            playGameBtn.innerHTML="NEW GAME";
            P1.className="noBorder"
            P2.className="noBorder"
        }
        else{
            if(P1.className=="noBorder" && P2.className=="noBorder"){
                alertContainer.style.display="flex";
            }
            else{
                alertContainerAlt.style.display="flex";
            }
        }
    });

    //reset gameboard
    resetContainer.addEventListener("click", function(){
        reset();
        resetContainer.classList.toggle("resetLoad");
    });

    cells.forEach(cell => cell.addEventListener('click', function(){
        gameBoard.playMove(cell.id.split('')[1],cell.id.split('')[2])
    }));

    //Set turn for which player goes first
    function _setTurn(){
        matchNotOver=true;
        turn = Math.round(Math.random())?"X":"O";
        if(ai){
            turn="X";
        }
        turnContainer.innerHTML=`${turn} GOES FIRST`;
        turnContainer.style.visibility="visible";
        turnContainer.style.opacity="1";
        setTimeout(function(){
            turnContainer.style.visibility="hidden";
            turnContainer.style.opacity="0";
        },3000);
    }

    //playMove on required space on gameboard
    function playMove(x,y){
        if(_gameArr[x][y]===undefined && matchNotOver){
            _gameArr[x][y]=turn;
            turn = turn === "X" ? "O" : "X";
            _render();
            _checkWin();
        }
    }

    //Render current state of gameboard
    function _render(){
        for(let i=0; i<3;i++){
            for(let j=0; j<3; j++){
                const cell = document.querySelector(`#c${i}${j}`);
                cell.innerHTML=_gameArr[i][j] === undefined ? '' : _gameArr[i][j];
            }
        }
    }

    //Begin new game by initializing new player objects, contrary to reset which just resets the gameboard without initializing new player objects.
    function newGame(){
        _clear();
        Object.assign(playerX,playerFactory(document.querySelector("#playerX")));
        Object.assign(playerO,playerFactory(document.querySelector("#playerO")));
        ai=P1.className=="border"?true:false;
        _setTurn();
    }

    //helper function for function reset()
    function _clear(){
        for(let i=0; i<3; i++){
            _gameArr[i].splice(0,3);
        }
        cells.forEach(cell => cell.removeAttribute("style"));
        _render();
    }

    //Reset game board without creating new players
    function reset(){
        _clear();
        _setTurn();
    }

    //Check for all win conditions and call helper function for checking tie.
    function _checkWin(){
        //Check Rows
        for(let i=0; i<3; i++){
            if(_gameArr[i][0]==_gameArr[i][1] && _gameArr[i][1]==_gameArr[i][2] && _gameArr[i][0] !== undefined){
                _winMsg(_gameArr[i][0]);
                _winAnim(1, i);
                return;
            }
        }
        //Check Column
        for(let i=0; i<3; i++){
            if(_gameArr[0][i]==_gameArr[1][i] && _gameArr[1][i]==_gameArr[2][i] && _gameArr[0][i] !== undefined){
                _winMsg(_gameArr[0][i]);
                _winAnim(2, i);
                return;
            }
        }
        //Check Diag
        if(_gameArr[0][0]==_gameArr[1][1] && _gameArr[1][1]==_gameArr[2][2] && _gameArr[0][0] !== undefined){
            _winMsg(_gameArr[0][0]);
            _winAnim("d1", 0);
        }
        else if(_gameArr[0][2]==_gameArr[1][1] && _gameArr[1][1]==_gameArr[2][0] && _gameArr[0][2] !== undefined){
            _winMsg(_gameArr[0][2]);
            _winAnim("d2", 0);
        }
        else{
            _checkTie();
            if(turn=="O" && matchNotOver && ai){
                playBestMove();
            }
        }
    }

    //Checks tie condition
    function _checkTie(){
        for(let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                if(_gameArr[i][j]===undefined){
                    return;
                }
            }
        }
        _winMsg("TIE");
    }

    //Creates game end messages.
    function _winMsg(winner){
        if(winner=="X"){
            turnContainer.innerHTML=`${playerX.getName()} WON`;
            turnContainer.style.visibility="visible";
            turnContainer.style.opacity="1";       
            matchNotOver=false; 
        }
        if(winner=="O"){
            turnContainer.innerHTML=`${playerO.getName()} WON`;
            turnContainer.style.visibility="visible";
            turnContainer.style.opacity="1";        
            matchNotOver=false;
        }
        if(winner=="TIE"){
            turnContainer.innerHTML=`IT'S A TIE`;
            turnContainer.style.visibility="visible";
            turnContainer.style.opacity="1";        
            matchNotOver=false;
        }
    }

    //Displays winning combination in red
    function _winAnim(l,no){
        cells.forEach(cell => {
            if(cell.id.split('')[l]==no){
              cell.style.color="red"
            }
        });
        if(l=="d1"){
            cells[0].style.color="red"
            cells[4].style.color="red"
            cells[8].style.color="red"
        }
        if(l=="d2"){
            cells[2].style.color="red"
            cells[4].style.color="red"
            cells[6].style.color="red"
        }
    }


    //Scores each board arrangement and returns score
    function evaluate(){
        //Check Rows
        for(let i=0; i<3; i++){
            if(_gameArr[i][0]==_gameArr[i][1] && _gameArr[i][1]==_gameArr[i][2] && _gameArr[i][0] !== undefined){
                return _gameArr[i][0]=="O"?10:-10;
            }
        }
        //Check Column
        for(let i=0; i<3; i++){
            if(_gameArr[0][i]==_gameArr[1][i] && _gameArr[1][i]==_gameArr[2][i] && _gameArr[0][i] !== undefined){
                return _gameArr[0][i]=="O"?10:-10;
            }
        }
        //Check Diag
        if(_gameArr[0][0]==_gameArr[1][1] && _gameArr[1][1]==_gameArr[2][2] && _gameArr[0][0] !== undefined){
            return _gameArr[0][0]=="O"?10:-10;
        }
        else if(_gameArr[0][2]==_gameArr[1][1] && _gameArr[1][1]==_gameArr[2][0] && _gameArr[0][2] !== undefined){
            return _gameArr[0][2]=="O"?10:-10;
        }
        else{
            return 0;
        }
    }

    //Checks if there are any moves left in the board, helper function for minimax
    function movesLeft(){
        for(let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                if(_gameArr[i][j]===undefined){
                    return true;
                }
            }
        }
        return false;
    }

    //The heart and brain for the Ai, basically plays all game states and plays move which has the highest score. Alpha-delta pruning isn't implemented so quickest route to win is sometimes not taken.
    function minimax(depth, maxTurn){

        //Get score of current board state from evaluate()
        let score=evaluate();

        //Terminal Conditions
        if(score==10){
            return score;
        }
        if(score==-10){
            return score;
        }
        if(movesLeft()==false){
            return 0;
        }

        //Maximizing players turn
        if(maxTurn){
            let best = -Infinity;
            for(let i=0; i<3; i++){
                for(let j=0; j<3; j++){
                    if(_gameArr[i][j]===undefined){
                        _gameArr[i][j]="O";
                        best = Math.max(best, minimax(depth+1, !maxTurn));
                        _gameArr[i][j]=undefined;
                    }
                }
            }
            return best;
        }

        //Minimizing players turn
        else{
            let best = Infinity;
            for(let i=0; i<3; i++){
                for(let j=0; j<3; j++){
                    if(_gameArr[i][j]===undefined){
                        _gameArr[i][j]="X";
                        best = Math.min(best, minimax(depth+1, !maxTurn));
                        _gameArr[i][j]=undefined;
                    }
                }
            }
            return best;
        }
    }

    //Driver code for minimax function, chooses and plays best move
    function playBestMove(){
        let bestVal=-Infinity;
        let bestRow=-1;
        let bestCol=-1;
        for(let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                if(_gameArr[i][j]===undefined){
                    _gameArr[i][j]="O";
                    let moveVal = minimax(0, false);
                    _gameArr[i][j]=undefined;
                    if(moveVal>bestVal){
                        bestRow=i;
                        bestCol=j;
                        bestVal=moveVal;
                    }
                }
            }
        }
        playMove(bestRow, bestCol);
    }

    //Exposed game api, to be honest serves no purpose but is good practice I suppose.
    return {playMove,newGame,playerX,playerO,reset};
    
})();

//Factory function for generating player objects
const playerFactory = function(info){
    let _name = info.value;
    const getName = () => _name;
    return{getName};
}

