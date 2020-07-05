# Autosnek
A snake trying to determine the best possible movements considering growth and survival possibilities


## Screenshots
<img src="https://user-images.githubusercontent.com/53840228/86528238-61083d80-bea6-11ea-851a-d523e42443ce.png" alt="Screenshot 1" width="300"/> <img src="https://user-images.githubusercontent.com/53840228/86528239-62396a80-bea6-11ea-901d-3e596be5ef2d.png" alt="Screenshot 2" width="300"/> <img src="https://user-images.githubusercontent.com/53840228/85923783-4a525d00-b88e-11ea-895c-3fd724f90d0f.png" alt="Screenshot 3" width="300"/>


## How it works
Each step, the movements bringing the snake closer to the food source are determined. If it is possible for the snake to survive a certain number of steps after one of these movements are executed, it moves towards the food source. Otherwise, another direction is chosen, allowing the snake to continue living for longer. Since the number of steps the snake can look into the future is limited due to processing time, it will eventually get into a situation in which it is impossible to come out alive. Watching the snake fight for its survival is quite exciting because of its ability to precisely calculate movements which would be too risky for humans to execute.


## Getting started
Since this is a web application, there is no need to install it. You can click [here](https://rahmsauce.github.io/Autosnek/index.html) to try it out or if you want to run it on your local machine, download the repository and open index.html using a web browser. If you think you can beat the algorithm, you might want to have a look at the [original project](https://github.com/Rahmsauce/Snek).
