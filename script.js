let currentQuestion = 0
let score = 0
let weakTopics = []

let questions = [
{topic:"arithmetic", q: "5 + 7", a:12},
{topic:"algebra", q: "Solve for x: x + 4 = 10", a:6},
{topic:"geometry", q: "Area of square with side 4", a:16}
]

function startTest(){

document.getElementById("start").classList.add("hidden")
document.getElementById("test").classList.remove("hidden")

showQuestion()
}

function showQuestion(){

document.getElementById("question").innerText = questions[currentQuestion].q
}

function submitAnswer(){

let answer = Number(document.getElementById("answer").value)
let correct = questions[currentQuestion].a

if(answer === correct){
score++
document.getElementById("feedback").innerText="Correct!"
}else{
document.getElementById("feedback").innerText="Incorrect"
weakTopics.push(questions[currentQuestion].topic)
}

currentQuestion++

if(currentQuestion < questions.length){
setTimeout(()=>{
document.getElementById("answer").value=""
document.getElementById("feedback").innerText=""
showQuestion()
},1000)
}
else{
generateLearningPath()
}

}

function generateLearningPath(){

document.getElementById("test").classList.add("hidden")
document.getElementById("learningPath").classList.remove("hidden")

let topicList = document.getElementById("topics")
topicList.innerHTML=""

if(weakTopics.length === 0){
topicList.innerHTML = "<li>No weak topics detected. Great job!</li>"
}else{

weakTopics.forEach(topic=>{
let li=document.createElement("li")
li.innerText=topic
topicList.appendChild(li)
})

}

}

function startPractice(){

document.getElementById("learningPath").classList.add("hidden")
document.getElementById("practice").classList.remove("hidden")

generateProblem()
}

let currentAnswer

function generateProblem(){

let a = Math.floor(Math.random()*10)+1
let b = Math.floor(Math.random()*10)+1

currentAnswer = a + b

document.getElementById("practiceQuestion").innerText = `${a} + ${b}`
}

function checkPractice(){

let user = Number(document.getElementById("practiceAnswer").value)

if(user === currentAnswer){

document.getElementById("practiceFeedback").innerText="Correct!"
generateProblem()

}else{

document.getElementById("practiceFeedback").innerText="Try Again"
}

document.getElementById("practiceAnswer").value=""
} 