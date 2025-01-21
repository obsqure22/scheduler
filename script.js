// Variabili globali
let processes = [];
let queue = [];
let actual_time = 0;
let processes_data = [];
let temp = [];
let time_quantum = 2;
let interrupted = false;

// Aggiunge processi casuali alla tabella
function addProcesses() {
    const numeroProcessi = parseInt(document.getElementById("numeroProcessi").value);
    const durataMassima = parseInt(document.getElementById("durataMassima").value);
    const arrivoMassimo = parseInt(document.getElementById("arrivoMassimo").value);
    const prioritaMassima = parseInt(document.getElementById("prioritaMassima").value);

    processes = [];
    for (let i = 0; i < numeroProcessi; i++) {
        const process = {
            name: `P${i + 1}`,
            arrive: Math.floor(Math.random() * (arrivoMassimo + 1)),
            duration: Math.floor(Math.random() * (durataMassima + 1)) || 1,
            priority: Math.floor(Math.random() * (prioritaMassima + 1)) || 1
        };
        processes.push(process);
    }

    processes.sort((a, b) => a.arrive - b.arrive);
    renderProcesses();
}

// Mostra i processi nella tabella
function renderProcesses() {
    const tableBody = document.getElementById("tableProcesses").querySelector("tbody");
    tableBody.innerHTML = "";

    processes.forEach((process, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${process.arrive}</td>
            <td>${process.duration}</td>
            <td>${process.priority}</td>
            <td>
                <input type="number" min="0" value="${process.arrive}" onchange="updateProcess(${index}, 'arrive', this.value)">
            </td>
            <td>
                <input type="number" min="1" value="${process.duration}" onchange="updateProcess(${index}, 'duration', this.value)">
            </td>
            <td>
                <input type="number" min="1" value="${process.priority}" onchange="updateProcess(${index}, 'priority', this.value)">
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Aggiorna i dati di un processo
function updateProcess(index, field, value) {
    processes[index][field] = parseInt(value);
}

// Simula l'algoritmo selezionato
function simulate() {
    const algoritmoSelezionato = document.getElementById("Tipodialgoritmo").value;

    resetValues();

    if (algoritmoSelezionato === "round robin") {
        time_quantum = parseInt(document.getElementById("quantumValue").value);
        roundRobin();
    } else if (algoritmoSelezionato === "FCFS") {
        fcfs();
    } else if (algoritmoSelezionato === "priorità") {
        const preemptive = document.getElementById("preemptive").checked;
        priorityScheduling(preemptive);
    } else if (algoritmoSelezionato === "SRTF") {
        const preemptive = document.getElementById("preemptive").checked;
        srtf(preemptive);
    }
}

// Reset dei valori per una nuova simulazione
function resetValues() {
    actual_time = 0;
    queue = [];
    processes_data = [];
    temp.length = 0;

    const resultBody = document.getElementById("tableResults").querySelector("tbody");
    resultBody.innerHTML = "";
}

// Implementazione Round Robin
function roundRobin() {
    processes.forEach(process => queue.push({ ...process }));

    while (queue.length > 0 || temp.length > 0) {
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].arrive <= actual_time) {
                temp.push(queue[i]);
                queue.splice(i, 1);
                i--;
            }
        }

        if (temp.length > 0) {
            const currentProcess = temp.shift();
            const executionTime = Math.min(time_quantum, currentProcess.duration);

            processes_data.push({
                name: currentProcess.name,
                start: actual_time,
                end: actual_time + executionTime
            });

            actual_time += executionTime;
            currentProcess.duration -= executionTime;

            if (currentProcess.duration > 0) {
                temp.push(currentProcess);
            }
        } else {
            actual_time++;
        }
    }

    renderResults();
}

// Mostra i risultati della simulazione
function renderResults() {
    const resultBody = document.getElementById("tableResults").querySelector("tbody");
    resultBody.innerHTML = "";

    processes.forEach(process => {
        const startTimes = processes_data.filter(p => p.name === process.name).map(p => p.start);
        const endTimes = processes_data.filter(p => p.name === process.name).map(p => p.end);
        const waitingTime = Math.max(0, actual_time - process.arrive - process.duration);
        const turnaroundTime = waitingTime + process.duration;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${startTimes.join(", ")}</td>
            <td>${endTimes.join(", ")}</td>
            <td>${waitingTime}</td>
            <td>${turnaroundTime}</td>
        `;
        resultBody.appendChild(row);
    });
}
