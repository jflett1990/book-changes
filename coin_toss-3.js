// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('coinTossAnimation').appendChild(renderer.domElement);

let flipCount = 0;
let flipResults = [];

// Function to perform a single coin toss and return the value (2 or 3)
const singleCoinToss = () => {
  return Math.random() < 0.5 ? 2 : 3;
};

const loader = new THREE.GLTFLoader();
let coin;

loader.load('/mnt/data/komodo_coin_002_ts.glb', (gltf) => {
  coin = gltf.scene;

  // Apply the shining gold material
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 1, roughness: 0 });
  coin.traverse((child) => {
    if (child.isMesh) {
      child.material = goldMaterial;
    }
  });

  // Enable casting shadows
  coin.castShadow = true;

  scene.add(coin);
});

// Set up lighting to see the gold material and shadows
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
light.castShadow = true;
scene.add(light);

// Add ground to receive shadows
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

renderer.shadowMap.enabled = true;

// Function to perform a single flip
const flipCoin = () => {
  // Reset if already flipped six times
  if (flipCount >= 6) {
    flipCount = 0;
    flipResults = [];
  }

  // Animate the flip
  let angle = 0;
  const animation = setInterval(() => {
    angle += Math.PI / 30;
    coin.rotation.x += Math.PI / 30;

    if (angle >= 2 * Math.PI) {
      clearInterval(animation);
      const result = singleCoinToss();
      flipResults.push(result);
      flipCount++;

      if (flipCount < 6) {
        flipCoin();
      } else {
        calculateHexagram();
      }
    }
  }, 10);
};

// Function to calculate the hexagram based on flip results
const calculateHexagram = () => {
  let hexagramLines = [];
  let changingLines = [];
  
  flipResults.forEach(result => {
    let lineValue = result + result + result;
    if (lineValue === 6) {
      hexagramLines.push('broken');
      changingLines.push(hexagramLines.length);
    } else if (lineValue === 9) {
      hexagramLines.push('solid');
      changingLines.push(hexagramLines.length);
    } else {
      hexagramLines.push(lineValue === 8 ? 'broken' : 'solid');
    }
  });

  const originalHexagram = hexagramLines.join('');
  const newHexagram = originalHexagram; // Add logic for new hexagram if needed

  sendToChatGPT(userQuery.value, originalHexagram, changingLines, newHexagram);
};

// Function to send request to ChatGPT
const sendToChatGPT = async (userQuery, originalHexagram, changingLines, newHexagram) => {
  const prompt = `You are a wise sage who's talents and intuitive gifts have brought clarity and comfort to all who seek it. 
    Your primary method of divination is using the book of changes / the i ching using the coin toss method. 
    A seeker has come to you with a question: ${userQuery}
    The universe has chosen the following hexagram: ${originalHexagram}
    Changing lines at positions: ${changingLines.join(', ')}
    New hexagram after changes: ${newHexagram}
    Please provide your reading, including a main hexagram passage tailored to the individual query, 
    insights on the changing lines, and the meaning of the changing hexagram for the outcome of the reading.
  `;

  // Send HTTP request to the server
  fetch('/ask-gpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  .then(response => response.json())
  .then(data => {
    // Display the reading to the user
    document.getElementById('chatGptResponse').innerText = data.reading;
  })
  .catch(error => console.error('An error occurred:', error));
};

// Attach the flipCoin function to the "Coin Toss" button
document.getElementById('coinTossButton').addEventListener('click', flipCoin);

// Animation loop to render the scene
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Start the animation loop
animate();
