import { interval, fromEvent} from 'rxjs';
import { map, scan, filter, merge, flatMap, take, concat, endWith} from 'rxjs/operators';

function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to getAttribute ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
       
    const svg = document.getElementById("canvas")!,
          ball = document.getElementById("ball"),
          userPaddle = document.getElementById("userPaddle"),
          compPaddle = document.getElementById("compPaddle"),
          user_score = document.getElementById("userScore"),
          comp_score = document.getElementById("compScore"),
          user_wins = document.getElementById("player_wins"),
          comp_wins = document.getElementById("comp_wins"),
          game_over = document.getElementById("game_over"),
          enter = document.getElementById("enter")

    mouseControl(); // function to control the user's paddle using mouse

    /**
     * Function for controlling user's paddle using the mouse
     */
    function mouseControl(){
      const userPaddle = document.getElementById("userPaddle")
    
      let
      userPaddle_location = fromEvent<MouseEvent>(svg, "mousemove")
      userPaddle_location.pipe(
      filter(({x, y}) => x < 600 && y < 600),
      map(({clientX, clientY}) => ({x: clientX, y: clientY-90})))
      .subscribe(e => {
        userPaddle.setAttribute('y', String(e.y))
        })
    }


    /**
     * logic for tracking the ball so compPaddle follows the ball
     */
    const compPaddle_move =
      interval(10)
      .pipe(map(() => (  {cy: Number(ball.getAttribute('cy')) })))
      .subscribe(({ cy }) => { 
        compPaddle.setAttribute('y', String(cy - 75))
      });


    // state of the ball
    const state={x_velocity:1,y_velocity:1}
    const speed = 2
    const animate = setInterval(
      () => {
      movement(state.x_velocity,state.y_velocity),
      ball.setAttribute('cx', String(state.x_velocity*speed + Number(ball.getAttribute('cx'))))
      ball.setAttribute('cy', String(state.y_velocity*speed + Number(ball.getAttribute('cy'))))},10);
      
    function movement(x:number,y:number):void{ 
      /***
       * Function that controls movement, collision and velocity of the ball
       */
      const 
          // ball's attribute
          ball_x: Number = Number(ball.getAttribute('cx')),
          ball_y: Number = Number(ball.getAttribute('cy')),
          ball_left:Number = (Number(ball.getAttribute('cx')) - Number(ball.getAttribute('r'))),
          ball_right:Number = (Number(ball.getAttribute('cx')) + Number(ball.getAttribute('r'))),
          ball_top:Number = (Number(ball.getAttribute('cy')) - Number(ball.getAttribute('r'))),
          ball_bottom:Number = (Number(ball.getAttribute('cy')) + Number(ball.getAttribute('r'))),
          // user's attribute
          userPaddle_left:Number = Number(userPaddle.getAttribute('x')),
          userPaddle_right:Number = Number(userPaddle.getAttribute('x')) + Number(userPaddle.getAttribute('width')),
          userPaddle_top:Number = Number(userPaddle.getAttribute('y')),
          userPaddle_bottom:Number= Number(userPaddle.getAttribute('y')) + Number(userPaddle.getAttribute('height')),
          // comp's attribute
          compPaddle_left:Number = Number(compPaddle.getAttribute('x')),
          compPaddle_right:Number = Number(compPaddle.getAttribute('x')) + Number(userPaddle.getAttribute('width')),
          compPaddle_top:Number = Number(compPaddle.getAttribute('y')),
          compPaddle_bottom:Number= Number(compPaddle.getAttribute('y')) + Number(userPaddle.getAttribute('height'));


      // collision with ceiling or floor, inverse y-velocity
      (ball_bottom>=600 || ball_top<=0) ? state.y_velocity *= -1 : state.y_velocity *= 1; 


      // ball's collision with the right paddle
      // Referenced from: https://github.com/CodeExplainedRepo/Ping-Pong-Game-JavaScript/blob/master/pong.js
      if ((ball_right >= userPaddle_left) && (ball_left <= userPaddle_right) && (ball_bottom > userPaddle_top) && (ball_top < userPaddle_bottom)){
        // point of paddle that collide with ball and normalize the value of collide point to get value between -1 and 1
        const collidePoint = (Number(ball_y) - (Number(userPaddle.getAttribute("y")) + (Number(userPaddle.getAttribute("height"))/2)))/ (Number(userPaddle.getAttribute("height"))/2);
        // take -45degress, 0 degrees, 45 degress when the ball hits the top, center and bottom of the paddle respectively
        const angleRad = (Math.PI/3) * collidePoint;
       // change the X and Y velocity direction
        const direction = (Number(ball_x) + Number(ball.getAttribute("r")) < Number(svg.getAttribute("width"))/2) ? 1 : -1;
        state.x_velocity=  direction * speed * Math.cos(angleRad);
        state.y_velocity = speed * Math.sin(angleRad);
      }


      // ball's collision with the left paddle
      // Referenced from: https://github.com/CodeExplainedRepo/Ping-Pong-Game-JavaScript/blob/master/pong.js
      if ((ball_left <= compPaddle_right) && (ball_right >=  compPaddle_left) && (ball_y > compPaddle_top) && (ball_y < compPaddle_bottom) ){
        // point of paddle that collide with ball and normalize the value of collide point to get value between -1 and 1
        const collidePoint = (Number(ball_y) - (Number(compPaddle.getAttribute("y")) + (Number(compPaddle.getAttribute("height"))/2)))/ (Number(compPaddle.getAttribute("height"))/2);
        // take -45degress, 0 degrees, 45 degress when the ball hits the top, center and bottom of the paddle respectively
        const angleRad = (Math.PI/3) * collidePoint;
        // change the X and Y velocity direction
        const direction = (Number(ball_x) + Number(ball.getAttribute("r")) < (Number(svg.getAttribute("width"))/2) )? 1 : -1;
        state.x_velocity=  direction * speed * Math.cos(angleRad);
        state.y_velocity = speed * Math.sin(angleRad);
      }


      // updating scoreboard
      (ball_right>=600)   // if ball collides with the right wall, comp_score++
        ? (comp_score!.textContent = (Number(comp_score.textContent) + 1).toString(),
        ball.setAttribute('cx', '300'),   // place the ball back at the middle
        ball.setAttribute('cy', '300'))
        : comp_score!.textContent = String(comp_score!.textContent);

      (ball_left<=0) // if ball collides with the left wall, user_score++
        ? (user_score!.textContent = (Number(user_score.textContent) + 1).toString(),
        ball.setAttribute('cx', '300'),   // place the ball back at the middle
        ball.setAttribute('cy', '300'))
        : user_score!.textContent = String(user_score!.textContent);
    }


    /**
     * Observable to observe the score to end the game
     */
    const gameOver=
      interval(10).pipe 
      (map(() => ({ compScore: String(comp_score.textContent), userScore: String(user_score.textContent), ball: ball})), 
      filter(({ compScore, userScore}) => (compScore == String(7) || userScore == String(7))))    // if either one of the scores === 7
      .subscribe(() => { 
        // displaying text when game over
        game_over.innerHTML = "Game Over"
        user_score.textContent === String("7") ? user_wins.innerHTML="You Win !!!" : comp_wins.innerHTML="You Lose :("
        enter.innerHTML = "Press Enter to restart"
        
        // reset the score and position of the objects
        comp_score!.textContent = String("0"),
        user_score!.textContent = String("0"),
        userPaddle.setAttribute('y', '250'),
        compPaddle.setAttribute('y', '250'),
        ball.setAttribute('cx', '300'),
        ball.setAttribute('cy','300'),
        compPaddle_move.unsubscribe(),  // stop the compPaddle
        clearInterval(animate)  // stop the ball
      });


    /**
     * Observable for restarting the game whenever user pressed enter
     */
    const restart =
      fromEvent<KeyboardEvent>(document, "keydown").
      pipe(filter(e => ["Enter"].includes(e.key)))    // detect the event when user press "Enter"
      .subscribe(e=> {
        // remove the text when game restarts
        game_over.innerHTML = "",
        user_wins.innerHTML = "",   
        comp_wins.innerHTML = "",
        enter.innerHTML = "",
        pong()  // call pong() again
      })
  }
  

  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
  
  
  
