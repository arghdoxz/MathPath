// ===========================
// STATE
// ===========================
const TOPICS = ['arithmetic', 'algebra', 'geometry']
let mastery = { arithmetic: 0, algebra: 0, geometry: 0 }
let diff = { arithmetic: 'medium', algebra: 'medium', geometry: 'medium' }
let streak = { arithmetic: { c: 0, w: 0 }, algebra: { c: 0, w: 0 }, geometry: { c: 0, w: 0 } }
let diagQs = [], diagIdx = 0, diagScores = {}
let hasDiag = false
let practiceTopic = null, currentAnswer = null

// ===========================
// ROUTING
// ===========================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'))
  document.getElementById(id).classList.remove('hidden')
}

function goHome() {
  showScreen('screen-home')
  renderDashboard()
}

// ===========================
// DASHBOARD
// ===========================
function renderDashboard() {
  TOPICS.forEach(t => {
    const val = mastery[t]
    const bar = document.getElementById('bar-' + t)
    const pct = document.getElementById('pct-' + t)
    if (bar) {
      bar.style.width = val + '%'
      bar.style.background = val >= 90
        ? 'linear-gradient(90deg,#00d4aa,#00b894)'
        : val >= 55
        ? 'linear-gradient(90deg,#ffd166,#f4a261)'
        : 'linear-gradient(90deg,#7c8fff,#5b6ef5)'
    }
    if (pct) pct.textContent = val + '%'
  })
  const btn = document.getElementById('diag-btn')
  if (btn) btn.textContent = hasDiag ? '↺  Retake Diagnostic' : '▶  Take Diagnostic Test'
}

// ===========================
// DIAGNOSTIC
// ===========================
function startDiagnostic() {
  const bank = getBank()
  diagScores = { arithmetic: 0, algebra: 0, geometry: 0 }
  diagIdx = 0
  const sets = TOPICS.map(t => shuffle([...bank[t]]).slice(0, 5).map(q => ({ ...q, topic: t })))
  diagQs = shuffle(sets.flat())
  showScreen('screen-diag')
  renderDiagQ()
}

function renderDiagQ() {
  const tot = diagQs.length
  document.getElementById('diag-counter').textContent = `${diagIdx + 1} / ${tot}`
  document.getElementById('diag-prog').style.width = (diagIdx / tot * 100) + '%'
  document.getElementById('diag-q').textContent = diagQs[diagIdx].q
  document.getElementById('diag-inp').value = ''
  setFeedback('diag-fb', '', '')
  document.getElementById('diag-inp').focus()
}

function submitDiag() {
  const ans = document.getElementById('diag-inp').value.trim()
  const q = diagQs[diagIdx]
  const ok = checkAns(ans, q.a)
  if (ok) diagScores[q.topic]++
  setFeedback('diag-fb', ok ? '✓  Correct!' : '✗  Answer: ' + q.a, ok ? 'correct' : 'incorrect')
  diagIdx++
  if (diagIdx < diagQs.length) setTimeout(renderDiagQ, 950)
  else setTimeout(finishDiag, 950)
}

function finishDiag() {
  hasDiag = true
  TOPICS.forEach(t => { mastery[t] = Math.round((diagScores[t] / 5) * 50) })
  goHome()
}

// ===========================
// PRACTICE
// ===========================
function goToPractice(topic) {
  practiceTopic = topic
  const labels = { arithmetic: 'Arithmetic', algebra: 'Algebra', geometry: 'Geometry' }
  document.getElementById('prac-title').textContent = labels[topic]
  updatePracticeMeta()
  nextQ()
  showScreen('screen-practice')
  // On mobile, hide calc by default
  if (window.innerWidth < 768) hideCalc()
  else showCalcPanel()
}

function updatePracticeMeta() {
  const t = practiceTopic, val = mastery[t]
  const bar = document.getElementById('prac-bar')
  const pct = document.getElementById('prac-pct')
  if (bar) {
    bar.style.width = val + '%'
    bar.style.background = val >= 90
      ? 'linear-gradient(90deg,#00d4aa,#00b894)'
      : val >= 55
      ? 'linear-gradient(90deg,#ffd166,#f4a261)'
      : 'linear-gradient(90deg,#7c8fff,#5b6ef5)'
  }
  if (pct) pct.textContent = val + '%'
  const badge = document.getElementById('diff-badge')
  if (badge) {
    const d = diff[t]
    badge.textContent = d[0].toUpperCase() + d.slice(1)
    badge.className = 'diff-badge badge-' + d
  }
}

function nextQ() {
  const prob = generateProblem(practiceTopic, diff[practiceTopic])
  currentAnswer = prob.answer
  document.getElementById('prac-q').textContent = prob.question
  document.getElementById('prac-inp').value = ''
  setFeedback('prac-fb', '', '')
  document.getElementById('prac-inp').focus()
}

function submitPractice() {
  const ans = document.getElementById('prac-inp').value.trim()
  const ok = checkAns(ans, currentAnswer)
  const t = practiceTopic

  setFeedback('prac-fb', ok ? '✓  Correct!' : '✗  Answer: ' + currentAnswer, ok ? 'correct' : 'incorrect')

  mastery[t] = ok ? Math.min(100, mastery[t] + 10) : Math.max(0, mastery[t] - 5)

  if (ok) { streak[t].c++; streak[t].w = 0 } else { streak[t].w++; streak[t].c = 0 }
  if (streak[t].c >= 3) {
    if (diff[t] === 'easy') diff[t] = 'medium'
    else if (diff[t] === 'medium') diff[t] = 'hard'
    streak[t].c = 0
  }
  if (streak[t].w >= 2) {
    if (diff[t] === 'hard') diff[t] = 'medium'
    else if (diff[t] === 'medium') diff[t] = 'easy'
    streak[t].w = 0
  }

  updatePracticeMeta()
  setTimeout(nextQ, 950)
}

// ===========================
// CALCULATOR TOGGLE
// ===========================
function hideCalc() {
  document.getElementById('calc-panel').classList.add('calc-off')
  document.getElementById('calc-tog').textContent = '🧮  Show Calculator'
}
function showCalcPanel() {
  document.getElementById('calc-panel').classList.remove('calc-off')
  document.getElementById('calc-tog').textContent = '✕  Hide Calculator'
}
function toggleCalc() {
  const panel = document.getElementById('calc-panel')
  if (panel.classList.contains('calc-off')) showCalcPanel()
  else hideCalc()
}

// ===========================
// ANSWER CHECK
// ===========================
function checkAns(user, correct) {
  const u = String(user).trim().toLowerCase().replace(/\s/g, '')
  const c = String(correct).trim().toLowerCase().replace(/\s/g, '')
  if (u === c) return true
  const un = parseFloat(u), cn = parseFloat(c)
  if (!isNaN(un) && !isNaN(cn)) return Math.abs(un - cn) < 0.02
  return false
}

function setFeedback(id, msg, cls) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.className = 'feedback' + (cls ? ' ' + cls : '')
}

// ===========================
// UTILS
// ===========================
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5) }
function fmt(n) { return Math.abs(n) >= 1000 ? n.toLocaleString() : String(n) }

// ===========================
// DIAGNOSTIC BANK
// ===========================
function getBank() {
  return {
    arithmetic: [
      { q: 'Evaluate:   8 + 6 ÷ 3', a: '10' },
      { q: 'Evaluate:   7 × (5 + 3)', a: '56' },
      { q: 'Evaluate:   20 − 4 × 2', a: '12' },
      { q: 'Evaluate:   (9 − 5) + 6', a: '10' },
      { q: 'Evaluate:   18 ÷ 3 + 4', a: '10' },
      { q: 'Evaluate:   6 + 4 × (10 − 3)', a: '34' },
      { q: 'Evaluate:   (12 − 4)² ÷ 4', a: '16' },
      { q: 'Evaluate:   5² + 3 × 4', a: '37' },
      { q: 'Evaluate:   (15 − 5) × 2 + 8 ÷ 4', a: '22' },
      { q: 'Evaluate:   30 ÷ (5 + 1) + 7', a: '12' },
    ],
    algebra: [
      { q: 'Solve for x:   x + 7 = 15', a: '8' },
      { q: 'Solve for x:   3x = 18', a: '6' },
      { q: 'Solve for x:   x − 5 = 9', a: '14' },
      { q: 'Solve for x:   4x + 2 = 10', a: '2' },
      { q: 'Evaluate 2x + 3  when x = 4', a: '11' },
      { q: 'Solve for x:   2x + 5 = 17', a: '6' },
      { q: 'Solve for x:   5x − 3 = 2x + 9', a: '4' },
      { q: 'Solve for x:   x/3 + 4 = 10', a: '18' },
      { q: 'Expand:   3(x + 5)', a: '3x+15' },
      { q: 'Factor:   x² + 5x', a: 'x(x+5)' },
    ],
    geometry: [
      { q: 'Perimeter of a rectangle:   length = 8,  width = 5', a: '26' },
      { q: 'Area of a square with side 6', a: '36' },
      { q: 'A triangle has angles of 50° and 60°.  Find the third angle.', a: '70' },
      { q: 'Area of a triangle:   base = 10,  height = 4', a: '20' },
      { q: 'Circumference of a circle with radius 7  (π = 3.14)', a: '43.96' },
      { q: 'Area of a circle with radius 5  (π = 3.14)', a: '78.5' },
      { q: 'Right triangle legs: 6 and 8.  Find the hypotenuse.', a: '10' },
      { q: 'Rectangle:   area = 48,  width = 6.  Find the length.', a: '8' },
      { q: 'Right triangle:   hypotenuse = 13,  one leg = 5.  Find the other leg.', a: '12' },
      { q: 'Triangle:   base = 12,  height = 9.  Find the area.', a: '54' },
    ]
  }
}

// ===========================
// PROBLEM GENERATOR
// ===========================
function generateProblem(topic, difficulty) {
  if (topic === 'arithmetic') return genArith(difficulty)
  if (topic === 'algebra')    return genAlgebra(difficulty)
  if (topic === 'geometry')   return genGeo(difficulty)
}

function genArith(d) {
  const easy = [1, 2, 3], med = [2, 3, 4, 5], hard = [4, 5, 6, 7]
  const pool = d === 'easy' ? easy : d === 'medium' ? med : hard
  const type = pool[rand(0, pool.length - 1)]
  let A = rand(2, 15), B = rand(2, 15), C = rand(2, 10), D = rand(2, 8)

  if (type === 1) {
    const ops = [['+', A + B], ['−', A - B], ['×', A * B]]
    const [op, ans] = ops[rand(0, 2)]
    return { question: `Evaluate:   ${fmt(A)}  ${op}  ${fmt(B)}`, answer: ans }
  }
  if (type === 2) {
    const ans = A + B * C
    return { question: `Evaluate:   ${fmt(A)} + ${fmt(B)} × ${fmt(C)}`, answer: ans }
  }
  if (type === 3) {
    const ans = (A + B) * C
    return { question: `Evaluate:   (${fmt(A)} + ${fmt(B)}) × ${fmt(C)}`, answer: ans }
  }
  if (type === 4) {
    const ans = A + B * (C + D)
    return { question: `Evaluate:   ${fmt(A)} + ${fmt(B)} × (${fmt(C)} + ${fmt(D)})`, answer: ans }
  }
  if (type === 5) {
    const ans = (A + B) * (C - D < 1 ? C : C - D)
    const sub = C - D < 1 ? C : C - D
    return { question: `Evaluate:   (${fmt(A)} + ${fmt(B)}) × (${fmt(C)} − ${fmt(C - sub)})`, answer: (A + B) * sub }
  }
  if (type === 6) {
    const sq = rand(2, 8)
    const ans = A + B * (C + sq * sq)
    return { question: `Evaluate:   ${fmt(A)} + ${fmt(B)} × (${fmt(C)} + ${fmt(sq)}²)`, answer: ans }
  }
  if (type === 7) {
    const base = rand(2, 9)
    const ans = A * base * base - B * C
    return { question: `Evaluate:   ${fmt(A)} × ${fmt(base)}² − ${fmt(B)} × ${fmt(C)}`, answer: ans }
  }
}

function genAlgebra(d) {
  const easy = [1, 2], med = [1, 2, 3, 4], hard = [3, 4, 5, 6]
  const pool = d === 'easy' ? easy : d === 'medium' ? med : hard
  const type = pool[rand(0, pool.length - 1)]
  let x = rand(1, 12), a = rand(2, 9), b = rand(1, 15), c = rand(2, 6)

  if (type === 1) {
    const result = a * x + b
    return { question: `Solve for x:   ${a}x + ${fmt(b)} = ${fmt(result)}`, answer: x }
  }
  if (type === 2) {
    const result = x + b
    return { question: `Solve for x:   x + ${fmt(b)} = ${fmt(result)}`, answer: x }
  }
  if (type === 3) {
    // ax + b = cx + d
    const extra = rand(1, 8)
    const d = (a - c) * x + b
    if (a === c) return genAlgebra(d)
    return { question: `Solve for x:   ${a}x + ${fmt(b)} = ${c}x + ${fmt(d)}`, answer: x }
  }
  if (type === 4) {
    const result = a * (x + b)
    return { question: `Solve for x:   ${a}(x + ${b}) = ${fmt(result)}`, answer: x }
  }
  if (type === 5) {
    const result = (a * x + b)
    if (result % c !== 0) return genAlgebra(d)
    return { question: `Solve for x:   (${a}x + ${b}) ÷ ${c} = ${fmt(result / c)}`, answer: x }
  }
  if (type === 6) {
    const k = x * x
    return { question: `Solve for x:   x² = ${fmt(k)}   (positive root only)`, answer: x }
  }
}

function genGeo(d) {
  const easy = [1, 2, 3], med = [1, 2, 3, 4, 5], hard = [3, 4, 5, 6, 7]
  const pool = d === 'easy' ? easy : d === 'medium' ? med : hard
  const type = pool[rand(0, pool.length - 1)]

  if (type === 1) {
    const L = rand(3, 25), W = rand(3, 25)
    return { question: `Find the perimeter of a rectangle.\n  Length = ${L},   Width = ${W}`, answer: 2 * (L + W) }
  }
  if (type === 2) {
    const L = rand(3, 20), W = rand(3, 20)
    return { question: `Find the area of a rectangle.\n  Length = ${L},   Width = ${W}`, answer: L * W }
  }
  if (type === 3) {
    const base = rand(4, 24), height = rand(4, 20)
    return { question: `Find the area of a triangle.\n  Base = ${base},   Height = ${height}`, answer: 0.5 * base * height }
  }
  if (type === 4) {
    const r = rand(3, 15)
    return { question: `Find the circumference of a circle.\n  Radius = ${r}   (Use π = 3.14)`, answer: parseFloat((2 * 3.14 * r).toFixed(2)) }
  }
  if (type === 5) {
    const r = rand(3, 15)
    return { question: `Find the area of a circle.\n  Radius = ${r}   (Use π = 3.14)`, answer: parseFloat((3.14 * r * r).toFixed(2)) }
  }
  if (type === 6) {
    const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25]]
    const [a, b, c] = triples[rand(0, triples.length - 1)]
    return { question: `Right triangle with legs ${a} and ${b}.\n  Find the hypotenuse.`, answer: c }
  }
  if (type === 7) {
    const a1 = rand(30, 80), a2 = rand(30, 80)
    if (a1 + a2 >= 180) return genGeo(d)
    return { question: `A triangle has angles of ${a1}° and ${a2}°.\n  Find the third angle.`, answer: 180 - a1 - a2 }
  }
}

// ===========================
// CALCULATOR
// ===========================
function cIns(v) {
  const inp = document.getElementById('calc-input')
  const pos = inp.selectionStart ?? inp.value.length
  inp.value = inp.value.slice(0, pos) + v + inp.value.slice(pos)
  inp.focus()
  inp.setSelectionRange(pos + v.length, pos + v.length)
}

function cClear() {
  document.getElementById('calc-input').value = ''
  document.getElementById('calc-result').textContent = ''
}

function cBack() {
  const inp = document.getElementById('calc-input')
  inp.value = inp.value.slice(0, -1)
  inp.focus()
}

function cCalc() {
  const inp = document.getElementById('calc-input')
  const raw = inp.value.trim()
  if (!raw) return
  try {
    let e = raw
      .replace(/sin\(/g, '_sin(').replace(/cos\(/g, '_cos(').replace(/tan\(/g, '_tan(')
      .replace(/asin\(/g, '_asin(').replace(/acos\(/g, '_acos(').replace(/atan\(/g, '_atan(')
      .replace(/sqrt\(/g, 'Math.sqrt(').replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(').replace(/abs\(/g, 'Math.abs(')
      .replace(/\^/g, '**').replace(/π/g, 'Math.PI').replace(/e(?!\d)/g, 'Math.E')
    // auto-close parens
    const opens = (e.match(/\(/g)||[]).length, closes = (e.match(/\)/g)||[]).length
    for (let i = 0; i < opens - closes; i++) e += ')'
    const res = eval(e)
    const rounded = Math.round(res * 1e10) / 1e10
    const hist = document.getElementById('calc-hist')
    if (hist) {
      const row = document.createElement('div')
      row.className = 'hist-row'
      row.innerHTML = `<span class="he">${raw}</span><span class="hr">= ${rounded}</span>`
      hist.prepend(row)
      while (hist.children.length > 5) hist.removeChild(hist.lastChild)
    }
    document.getElementById('calc-result').textContent = rounded
    inp.value = String(rounded)
  } catch { document.getElementById('calc-result').textContent = 'Error' }
}

function _sin(x) { return Math.sin(x * Math.PI / 180) }
function _cos(x) { return Math.cos(x * Math.PI / 180) }
function _tan(x) { return Math.tan(x * Math.PI / 180) }
function _asin(x) { return Math.asin(x) * 180 / Math.PI }
function _acos(x) { return Math.acos(x) * 180 / Math.PI }
function _atan(x) { return Math.atan(x) * 180 / Math.PI }

// ===========================
// DATA EXPORT / IMPORT
// ===========================
function exportData() {
  const state = {
    mastery,
    diff,
    streak,
    hasDiag,
    exportDate: new Date().toISOString()
  }
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mathpath-progress-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function importDataPrompt() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (data.mastery && data.diff && data.streak !== undefined) {
          mastery = data.mastery
          diff = data.diff
          streak = data.streak
          hasDiag = data.hasDiag || false
          renderDashboard()
          showNotification('✓ Progress imported successfully!')
        } else {
          showNotification('✗ Invalid save file format', true)
        }
      } catch {
        showNotification('✗ Failed to import file', true)
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

function showNotification(msg, isError = false) {
  const notif = document.createElement('div')
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? 'rgba(255, 107, 107, 0.9)' : 'rgba(0, 212, 170, 0.9)'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `
  notif.textContent = msg
  document.body.appendChild(notif)
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease'
    notif.style.opacity = '0'
    setTimeout(() => document.body.removeChild(notif), 300)
  }, 3000)
}

// Add animations
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`
document.head.appendChild(style)

// ===========================
// KEYBOARD
// ===========================
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return
  const id = document.activeElement?.id
  if (id === 'diag-inp') submitDiag()
  else if (id === 'prac-inp') submitPractice()
  else if (id === 'calc-input') cCalc()
})

window.addEventListener('load', () => {
  renderDashboard()
  showScreen('screen-home')
})