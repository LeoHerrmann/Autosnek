# Autosnek
A snake trying to determine the best possible movements considering growth and survival possibilities


## Screenshots
<img src="https://user-images.githubusercontent.com/53840228/86528238-61083d80-bea6-11ea-851a-d523e42443ce.png" alt="Screenshot 1" width="300"/> <img src="https://user-images.githubusercontent.com/53840228/86528239-62396a80-bea6-11ea-901d-3e596be5ef2d.png" alt="Screenshot 2" width="300"/> <img src="https://user-images.githubusercontent.com/53840228/85923783-4a525d00-b88e-11ea-895c-3fd724f90d0f.png" alt="Screenshot 3" width="300"/>


## About
The application is based on the classic snake game in which the player controls the movements of a snake. In order to achieve the highest possible score, the snake needs to eat food. However, each time the snake gets to eat food, it becomes longer, increasing the difficulty of the game. If the snake runs into itself or into a border of the playing field, it dies and the game is over. In this application the snake is controlled automatically using an algorithm. Watching the snake fight for its survival is quite exciting because of its ability to precisely calculate movements which would be too risky for human players to execute.


## How it works
Each step the movements bringing the snake closer to the food source are determined. If it is possible for the snake to survive a certain number of steps after one of these movements are executed, it moves towards the food source. Otherwise, another direction is chosen, allowing the snake to continue living for longer. To determine whether a movement will allow the snake to survive, a recursive algorithm is used predicting each possible future movement up to a certain depth. The maximum recursion depth is limited due to processing time resulting in the snake eventually getting into a situation in which it is impossible to come out alive. 


## Serial vs parallel mode
The application allows choosing between serial and parallel mode. In serial mode, the entire code runs on the main thread whereas in parallel mode, the work of determining the survival possibilities is split up into multiple threads. The additional time it takes to manage web workers results in serial mode actually having considerably lower average processing times than parallel mode. However, in situations where many possibilities need to be considered, the advantages of parallel processing become clearly visible and contribute to the maximum processing times being substancially shorter in parallel mode than in serial mode.


## Getting started
Since this is a web application, there is no need to install it. You can click [here](https://rahmsauce.github.io/Autosnek/index.html) to try it out or if you want to run it on your local machine, download the repository and open index.html using a web browser. If you become tired of watching, you might want have a look at the [manual version](https://github.com/Rahmsauce/Snek) and try to beat the algorithm.
