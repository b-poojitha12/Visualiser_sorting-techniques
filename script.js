// DOM Elements
const visualizationContainer = document.getElementById('visualization-container');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');
const customArrayInput = document.getElementById('custom-array-input');
const setCustomArrayBtn = document.getElementById('set-custom-array-btn');
const newArrayBtn = document.getElementById('new-array-btn');
const prevStepBtn = document.getElementById('prev-step-btn');
const nextStepBtn = document.getElementById('next-step-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const stepCounter = document.getElementById('step-counter');
const timeComplexityDisplay = document.getElementById('time-complexity');
const complexityExplanationDisplay = document.getElementById('complexity-explanation');

// State
let array = [];
let steps = []; 
let currentStepIndex = 0;
let isPlaying = false;
let playInterval = null;

// Configuration
const ARRAY_SIZE_MIN = 5;
const ARRAY_SIZE_MAX = 15;
const VALUE_MIN = 5;
const VALUE_MAX = 100;

// Time Complexities
const complexities = {
    bubble: "O(n²) [Worst] | O(n²) [Average] | O(n) [Best]",
    selection: "O(n²) [Worst] | O(n²) [Average] | O(n²) [Best]",
    insertion: "O(n²) [Worst] | O(n²) [Average] | O(n) [Best]"
};

const explanations = {
    bubble: "<strong>Bubble Sort:</strong> Continually steps through the list, swapping adjacent elements if they are in the wrong order. <br/>• <strong>Worst/Average O(n²):</strong> Requires nested loops traversing the entire array (e.g., heavily unsorted/reverse order list). <br/>• <strong>Best O(n):</strong> One sweep through an already sorted list with 0 swaps detected breaks the loop early.",
    selection: "<strong>Selection Sort:</strong> Divides the list into a sorted and unsorted section. Repeatedly selects the minimum element from the unsorted section and pushes it into the sorted section. <br/>• <strong>Worst/Average/Best O(n²):</strong> Irrespective of the list's initial order, both inner and outer loops constantly traverse the full unsorted remainder to guarantee finding the true minimum item.",
    insertion: "<strong>Insertion Sort:</strong> Builds a sorted list one item at a time by inserting each incoming element into its correct positional hierarchy. <br/>• <strong>Worst/Average O(n²):</strong> Inserting an element into a reverse-sorted array forces it to shift past all previously sorted elements. <br/>• <strong>Best O(n):</strong> Array is already sorted, resulting in exactly one check per inner loop."
};

// Initialization
function init() {
    generateRandomArray();
    updateTimeComplexity();
    
    // Event Listeners
    newArrayBtn.addEventListener('click', () => {
        pause();
        generateRandomArray();
    });

    setCustomArrayBtn.addEventListener('click', () => {
        pause();
        setCustomArray();
    });
    
    algorithmSelect.addEventListener('change', () => {
        pause();
        updateTimeComplexity();
        resetToInitial();
    });
    
    sizeSlider.addEventListener('input', () => {
        pause();
        generateRandomArray();
    });
    
    playPauseBtn.addEventListener('click', togglePlay);
    nextStepBtn.addEventListener('click', stepForward);
    prevStepBtn.addEventListener('click', stepBackward);
    resetBtn.addEventListener('click', () => {
        pause();
        resetToInitial();
    });
}

function generateRandomArray() {
    const size = parseInt(sizeSlider.value, 10);
    array = Array.from({ length: size }, () => Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN);
    resetToInitial();
}

function setCustomArray() {
    const input = customArrayInput.value.trim();
    if (!input) return;
    
    // Parse comma separated values, allow negative and positive numbers
    const parsedArray = input.split(',').map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
    
    if (parsedArray.length > 0) {
        // Limit array size to a reasonable amount
        array = parsedArray.slice(0, 30);
        resetToInitial();
    } else {
        alert("Please enter valid comma-separated numbers.");
    }
}

function resetToInitial() {
    currentStepIndex = 0;
    generateSteps();
    renderStep(0);
    updateControls();
}

function updateTimeComplexity() {
    timeComplexityDisplay.textContent = complexities[algorithmSelect.value];
    complexityExplanationDisplay.innerHTML = explanations[algorithmSelect.value];
}

function renderStep(index) {
    if (steps.length === 0) return;
    
    const step = steps[index];
    visualizationContainer.innerHTML = ''; 

    const maxValue = Math.max(...step.array);

    step.array.forEach((val, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';

        const valueText = document.createElement('div');
        valueText.className = 'bar-value';
        valueText.textContent = val;

        const bar = document.createElement('div');
        bar.className = 'bar';
        
        bar.style.height = `${(val / maxValue) * 85}%`;
        
        if (step.sorted.includes(i)) {
            bar.classList.add('sorted');
        } else if (step.swapping && step.swapping.includes(i)) {
            bar.classList.add('swapping');
        } else if (step.comparing && step.comparing.includes(i)) {
            bar.classList.add('comparing');
        }

        wrapper.appendChild(valueText);
        wrapper.appendChild(bar);
        visualizationContainer.appendChild(wrapper);
    });

    stepCounter.textContent = `${index} / ${Math.max(0, steps.length - 1)}`;
}

function togglePlay() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    if (currentStepIndex >= steps.length - 1) {
        currentStepIndex = 0;
    }
    
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.classList.replace('play', 'danger'); 

    animate();
}

function pause() {
    isPlaying = false;
    clearTimeout(playInterval);
    playPauseBtn.textContent = 'Play';
    playPauseBtn.classList.replace('danger', 'play');
    
    updateControls();
}

function animate() {
    if (!isPlaying) return;
    
    if (currentStepIndex < steps.length - 1) {
        stepForward();
        
        const speedVal = parseInt(speedSlider.value);
        const maxVal = parseInt(speedSlider.max);
        const minVal = parseInt(speedSlider.min);
        const delay = maxVal - speedVal + minVal; 

        playInterval = setTimeout(animate, delay);
    } else {
        pause();
    }
}

function stepForward() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);
        updateControls();
    }
}

function stepBackward() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(currentStepIndex);
        updateControls();
    }
}

function updateControls() {
    prevStepBtn.disabled = currentStepIndex === 0 || isPlaying;
    nextStepBtn.disabled = currentStepIndex === Math.max(0, steps.length - 1) || isPlaying;
}

function pushStep(arr, comparing = [], swapping = [], sorted = []) {
    steps.push({
        array: [...arr],
        comparing: [...comparing],
        swapping: [...swapping],
        sorted: [...sorted]
    });
}

function generateSteps() {
    steps = [];
    const algo = algorithmSelect.value;
    const arrCopy = [...array];
    
    pushStep(arrCopy);

    switch(algo) {
        case 'bubble':
            bubbleSort(arrCopy);
            break;
        case 'selection':
            selectionSort(arrCopy);
            break;
        case 'insertion':
            insertionSort(arrCopy);
            break;
    }
}

function bubbleSort(arr) {
    const n = arr.length;
    let sortedIndices = [];
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            pushStep(arr, [j, j + 1], [], sortedIndices);
            
            if (arr[j] > arr[j + 1]) {
                pushStep(arr, [], [j, j + 1], sortedIndices);
                
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
                
                pushStep(arr, [], [j, j + 1], sortedIndices);
            }
        }
        sortedIndices.push(n - i - 1);
        pushStep(arr, [], [], sortedIndices);
        
        if (!swapped) {
            for (let k = 0; k <= n - i - 1; k++) {
                if (!sortedIndices.includes(k)) sortedIndices.push(k);
            }
            break;
        }
    }
    if (!sortedIndices.includes(0)) sortedIndices.push(0);
    pushStep(arr, [], [], sortedIndices);
}

function selectionSort(arr) {
    const n = arr.length;
    let sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        
        for (let j = i + 1; j < n; j++) {
            pushStep(arr, [min_idx, j], [], sortedIndices);
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }

        if (min_idx !== i) {
            pushStep(arr, [], [i, min_idx], sortedIndices);
            let temp = arr[min_idx];
            arr[min_idx] = arr[i];
            arr[i] = temp;
            pushStep(arr, [], [i, min_idx], sortedIndices);
        }
        
        sortedIndices.push(i);
        pushStep(arr, [], [], sortedIndices);
    }
    sortedIndices.push(n - 1);
    pushStep(arr, [], [], sortedIndices);
}

function insertionSort(arr) {
    const n = arr.length;
    let sortedIndices = [0]; 
    pushStep(arr, [], [], sortedIndices);
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        pushStep(arr, [i], [], sortedIndices);

        while (j >= 0 && arr[j] > key) {
            pushStep(arr, [j, j + 1], [], sortedIndices); 
            pushStep(arr, [], [j, j + 1], sortedIndices); 
            
            arr[j + 1] = arr[j];
            
            pushStep(arr, [], [j, j + 1], sortedIndices); 
            j = j - 1;
        }
        arr[j + 1] = key;
        
        for (let k = 0; k <= i; k++) {
            if (!sortedIndices.includes(k)) sortedIndices.push(k);
        }
        pushStep(arr, [], [], sortedIndices);
    }
}

// Start application
init();
