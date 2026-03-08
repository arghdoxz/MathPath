// =============================
// CATEGORY SCORE TRACKING
// =============================

let categoryScores = {
pemdas: 0,
algebra: 0,
geometry: 0
}

let currentQuestionIndex = 0
let diagnosticQuestions = []

let preTestScore = 0
let postTestScore = 0

let postQuestions = []
let postIndex = 0

let weakestTopic = ""
let practiceQuestions = []
let practiceIndex = 0
let currentAnswer = 0

// adaptive difficulty variables
let difficulty = "medium"
let correctStreak = 0
let wrongStreak = 0
// =============================
// MASTERY SYSTEM
// =============================

let mastery = {
pemdas:0,
algebra:0,
geometry:0
}

function updateMastery(topic,correct){

if(correct){

mastery[topic] += 10

}else{

mastery[topic] -= 5

}

if(mastery[topic] > 100) mastery[topic] = 100
if(mastery[topic] < 0) mastery[topic] = 0

updateProgressBars()

}
function updateProgressBars(){

document.getElementById("pemdasBar").style.width =
mastery.pemdas + "%"

document.getElementById("algebraBar").style.width =
mastery.algebra + "%"

document.getElementById("geometryBar").style.width =
mastery.geometry + "%"

}

// =============================
// QUESTION BANK (Diagnostic)
// =============================

const questionBank = {

pemdas: [
{q:"8 + 6 ÷ 3", a:"10"},
{q:"7 × (5 + 3)", a:"56"},
{q:"20 − 4 × 2", a:"12"},
{q:"(9 − 5) + 6", a:"10"},
{q:"18 ÷ 3 + 4", a:"10"},
{q:"6 + 4 × (10 − 3)", a:"34"},
{q:"(12 − 4)² ÷ 4", a:"16"},
{q:"30 ÷ (5 + 1) + 7", a:"12"},
{q:"5² + 3 × 4", a:"37"},
{q:"(15 − 5) × 2 + 8 ÷ 4", a:"22"},
{q:"3² + 4 × (6 − 2)²", a:"73"},
{q:"(18 ÷ 3)² − 5 × 2", a:"26"},
{q:"50 − 4 × (6 + 3²)", a:"-10"},
{q:"(8 + 2)² ÷ (5 − 3)", a:"50"},
{q:"6 + 3 × (12 − 4)² ÷ 8", a:"30"}
],

algebra: [
{q:"Solve x + 7 = 15", a:"8"},
{q:"Solve 3x = 18", a:"6"},
{q:"Solve x − 5 = 9", a:"14"},
{q:"Solve 4x + 2 = 10", a:"2"},
{q:"Evaluate 2x + 3 if x = 4", a:"11"},
{q:"Solve 2x + 5 = 17", a:"6"},
{q:"Solve 5x − 3 = 2x + 9", a:"4"},
{q:"Solve x/3 + 4 = 10", a:"18"},
{q:"Expand 3(x + 5)", a:"3x+15"},
{q:"Factor x² + 5x", a:"x(x+5)"},
{q:"Solve 3x + 7 = 2x + 15", a:"8"},
{q:"Solve 4(x − 2) = 2x + 6", a:"5"},
{q:"Solve (2x + 3)/5 = 3", a:"6"},
{q:"Factor x² + 7x + 10", a:"(x+5)(x+2)"},
{q:"Solve x² − 9 = 0", a:"3,-3"}
],

geometry: [
{q:"Perimeter of rectangle L=8 W=5", a:"26"},
{q:"Area of square side=6", a:"36"},
{q:"Triangle angles 50° and 60°. Third angle?", a:"70"},
{q:"Area triangle base=10 height=4", a:"20"},
{q:"If sin²θ+cos²θ=1 and sinθ=0.6 find cos²θ", a:"0.64"},
{q:"Circumference circle r=7 (π=3.14)", a:"43.96"},
{q:"Area circle r=5", a:"78.5"},
{q:"Right triangle legs 6 and 8 hypotenuse?", a:"10"},
{q:"If sinθ=3/5 find cosθ", a:"4/5"},
{q:"Rectangle area=48 width=6 length?", a:"8"},
{q:"Right triangle hyp=13 leg=5 other leg?", a:"12"},
{q:"If cosθ=4/5 find sinθ", a:"3/5"},
{q:"Triangle base=12 height=9 area?", a:"54"},
{q:"Circle diameter=14 radius?", a:"7"},
{q:"Angles ratio 2:3:4", a:"40,60,80"}
]

}

// =============================
// RANDOMIZER
// =============================

function getRandomQuestions(array,count){
let shuffled=[...array].sort(()=>0.5-Math.random())
return shuffled.slice(0,count)
}

function rand(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}


// =============================
// START DIAGNOSTIC
// =============================

function startTest(){

let pemdasSet=getRandomQuestions(questionBank.pemdas,5)
let algebraSet=getRandomQuestions(questionBank.algebra,5)
let geometrySet=getRandomQuestions(questionBank.geometry,5)

diagnosticQuestions=[
...pemdasSet.map(q=>({...q,category:"pemdas"})),
...algebraSet.map(q=>({...q,category:"algebra"})),
...geometrySet.map(q=>({...q,category:"geometry"}))
]

diagnosticQuestions.sort(()=>0.5-Math.random())

document.getElementById("start").classList.add("hidden")
document.getElementById("test").classList.remove("hidden")

showQuestion()
}


// =============================
// SHOW DIAGNOSTIC QUESTION
// =============================

function showQuestion(){

let q=diagnosticQuestions[currentQuestionIndex]

document.getElementById("question").innerText=q.q

}


// =============================
// SUBMIT DIAGNOSTIC ANSWER
// =============================

function submitAnswer(){

let userAnswer=document.getElementById("answer").value.trim()
let correctAnswer=diagnosticQuestions[currentQuestionIndex].a

if(userAnswer===correctAnswer){

let category=diagnosticQuestions[currentQuestionIndex].category
categoryScores[category]++
preTestScore++

document.getElementById("feedback").innerText="Correct!"

}else{

document.getElementById("feedback").innerText="Incorrect"

}

currentQuestionIndex++

if(currentQuestionIndex<diagnosticQuestions.length){

setTimeout(()=>{
document.getElementById("answer").value=""
document.getElementById("feedback").innerText=""
showQuestion()
},800)

}else{

finishDiagnostic()

}

}


// =============================
// DETERMINE LEARNING PATH
// =============================

function finishDiagnostic(){

document.getElementById("test").classList.add("hidden")
document.getElementById("learningPath").classList.remove("hidden")

weakestTopic=Object.keys(categoryScores).reduce((a,b)=>
categoryScores[a]<categoryScores[b]?a:b
)

document.getElementById("topics").innerHTML=
`<li>Your learning path will focus on: <b>${weakestTopic}</b></li>`

}


// =============================
// START PRACTICE
// =============================

function startPractice(){

document.getElementById("learningPath").classList.add("hidden")
document.getElementById("practice").classList.remove("hidden")

practiceQuestions=generateLearningPath(weakestTopic)

showPractice()

}


// =============================
// ALGORITHMIC PROBLEM ENGINE
// =============================

function generateProblem(topic,difficulty){

if(topic==="pemdas"){

let type = rand(1,5)

let A = rand(2,12)
let B = rand(2,12)
let C = rand(2,12)
let D = rand(2,12)
let E = rand(2,10)

let question,answer

if(type===1){

question = `${A} + ${B} × (${C} + ${D})`
answer = A + B*(C+D)

}

if(type===2){

question = `${A} + ${B} × (${C} + ${D}) - ${E}`
answer = A + B*(C+D) - E

}

if(type===3){

question = `(${A} + ${B}) × (${C} + ${D})`
answer = (A+B)*(C+D)

}

if(type===4){

question = `${A} + ${B} × (${C} + ${D}²)`
answer = A + B*(C + D*D)

}

if(type===5){

question = `(${A} + ${B} × ${C}) + ${D}`
answer = (A + B*C) + D

}

return {question,answer}

}


if(topic==="algebra"){

let type = rand(1,5)

let x = rand(1,10)

let a = rand(2,8)
let b = rand(1,10)
let c = rand(1,10)
let d = rand(1,5)

let question,answer

if(type===1){

let result = a*x + b
question = `Solve for x: ${a}x + ${b} = ${result}`
answer = x

}

if(type===2){

let result = a*x + b
let right = c*x + d

question = `Solve for x: ${a}x + ${b} = ${c}x + ${result - c*x}`

answer = x

}

if(type===3){

let result = a*(x+b)

question = `Solve for x: ${a}(x + ${b}) = ${result}`

answer = x

}

if(type===4){

let result = a*x + b

question = `Solve for x: (${a}x + ${b}) / ${d} = ${(result/d)}`

answer = x

}

if(type===5){

let k = x*x

question = `Solve for x: x² - ${k} = 0`

answer = x

}

return {question,answer}

}


if(topic==="geometry"){

let type = rand(1,4)

let question,answer

if(type===1){

let base = rand(5,15)
let height = rand(5,15)

question = `Find the area of a triangle with base ${base} and height ${height}`

answer = 0.5 * base * height

}

if(type===2){

let r = rand(3,12)

question = `Find the circumference of a circle with radius ${r} (π=3.14)`

answer = Number((2*3.14*r).toFixed(2))

}

if(type===3){

let numerator = rand(3,12)
let denominator = rand(13,25)

question = `If sinθ = ${numerator}/${denominator}, find cosθ (right triangle)`

let cos = Math.sqrt(denominator*denominator - numerator*numerator)

answer = `${cos}/${denominator}`

}

if(type===4){

question = `Simplify: sin²θ + cos²θ`

answer = "1"

}

return {question,answer}

}

}


// =============================
// GENERATE 25 PROBLEMS
// =============================

function generateLearningPath(topic){

let questions=[]

for(let i=0;i<25;i++){

questions.push(generateProblem(topic,difficulty))

}

return questions

}


// =============================
// SHOW PRACTICE QUESTION
// =============================

function showPractice(){
document.getElementById("difficultyDisplay").innerText = difficulty
let problem=practiceQuestions[practiceIndex]

currentAnswer=problem.answer

document.getElementById("practiceQuestion").innerText=problem.question

}


// =============================
// CHECK PRACTICE ANSWER
// =============================

function checkPractice(){

let userAnswer=document.getElementById("practiceAnswer").value

let correct=Number(userAnswer)===Number(currentAnswer)

if(correct){

document.getElementById("practiceFeedback").innerText="Correct!"
correctStreak++
wrongStreak=0

}else{

document.getElementById("practiceFeedback").innerText="Incorrect"
wrongStreak++
correctStreak=0

}

updateDifficulty()

practiceIndex++

if(practiceIndex<practiceQuestions.length){

setTimeout(()=>{
document.getElementById("practiceAnswer").value=""
document.getElementById("practiceFeedback").innerText=""
showPractice()
},800)

}else{

document.getElementById("practiceQuestion").innerText="Practice complete!"
document.getElementById("postTestStart").classList.remove("hidden")
}

}
// =============================
// POST TEST GENERATION
// =============================
function generatePostTest(){

let pemdas = []
let algebra = []
let geometry = []

difficulty = "hard"

for(let i=0;i<5;i++){

pemdas.push(generateProblem("pemdas",difficulty))
algebra.push(generateProblem("algebra",difficulty))
geometry.push(generateProblem("geometry",difficulty))

}

postQuestions = [...pemdas,...algebra,...geometry]

postQuestions.sort(()=>0.5-Math.random())

}
// =============================
// POST TEST START
// =============================
function showPostQuestion(){

let q = postQuestions[postIndex]

document.getElementById("postQuestion").innerText = q.question

}
// =============================
// POST TEST SUMBIT
// =============================
function submitPostAnswer(){

let userAnswer = document.getElementById("postAnswer").value
let correctAnswer = postQuestions[postIndex].answer

if(String(userAnswer) === String(correctAnswer)){

postTestScore++

document.getElementById("postFeedback").innerText="Correct!"

}else{

document.getElementById("postFeedback").innerText="Incorrect"

}

postIndex++

if(postIndex < postQuestions.length){

setTimeout(()=>{

document.getElementById("postAnswer").value=""
document.getElementById("postFeedback").innerText=""

showPostQuestion()

},800)

}else{

showResults()

}

}
// =============================
// SHOW RESULTS
// =============================
function showResults(){

document.getElementById("postTest").classList.add("hidden")
document.getElementById("results").classList.remove("hidden")

document.getElementById("preScore").innerText =
`Pre-test Score: ${preTestScore} / 15`

document.getElementById("postScore").innerText =
`Post-test Score: ${postTestScore} / 15`

let improvement = postTestScore - preTestScore

document.getElementById("improvement").innerText =
`Improvement: ${improvement >=0 ? "+" : ""}${improvement}`

}
// =============================
// ADAPTIVE DIFFICULTY SYSTEM
// =============================

function updateDifficulty(){

if(correctStreak>=3){

if(difficulty==="easy") difficulty="medium"
else if(difficulty==="medium") difficulty="hard"

correctStreak=0

}

if(wrongStreak>=2){

if(difficulty==="hard") difficulty="medium"
else if(difficulty==="medium") difficulty="easy"

wrongStreak=0

}

}

// =============================
// CALCULATOR FUNCTIONS
// =============================

function insertCalc(value){

let input = document.getElementById("calcInput")

input.value += value

}

function clearCalc(){

document.getElementById("calcInput").value = ""
document.getElementById("calcResult").innerText = ""

}

function calculate(){

let expression = document.getElementById("calcInput").value

try{

expression = expression
.replace(/sin\(/g,"Math.sin(toRad(")
.replace(/cos\(/g,"Math.cos(toRad(")
.replace(/tan\(/g,"Math.tan(toRad(")
.replace(/asin\(/g,"toDeg(Math.asin(")
.replace(/acos\(/g,"toDeg(Math.acos(")
.replace(/atan\(/g,"toDeg(Math.atan(")
.replace(/sqrt\(/g,"Math.sqrt(")
.replace(/\^/g,"**")

let result = eval(expression)

document.getElementById("calcResult").innerText = "Result: " + result

}catch{

document.getElementById("calcResult").innerText = "Invalid Expression"

}

}

function toRad(angle){
return angle * (Math.PI / 180)
}

function toDeg(angle){
return angle * (180 / Math.PI)
}
// =============================
// RESTART POST TEST
// =============================
function restartPostTest(){

postIndex = 0
postTestScore = 0

generatePostTest()

document.getElementById("results").classList.add("hidden")
document.getElementById("postTest").classList.remove("hidden")

showPostQuestion()

}

function updateProgressBars(){

document.getElementById("pemdasBar").style.width = mastery.pemdas + "%"
document.getElementById("algebraBar").style.width = mastery.algebra + "%"
document.getElementById("geometryBar").style.width = mastery.geometry + "%"

document.getElementById("pemdasPercent").innerText = mastery.pemdas + "%"
document.getElementById("algebraPercent").innerText = mastery.algebra + "%"
document.getElementById("geometryPercent").innerText = mastery.geometry + "%"

}