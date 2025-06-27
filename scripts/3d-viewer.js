// Script para visualização 3D da peça
document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const pieceImage = document.getElementById('pieceImage');
    const modal3D = document.getElementById('modal3D');
    const close3DModal = document.getElementById('close3DModal');
    const container3D = document.getElementById('container3D');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    
    // Variáveis para Three.js
    let scene, camera, renderer, controls, model;
    let isInitialized = false;
    
    // Configurações de zoom
    const ZOOM_STEP = 1.2;
    const MIN_ZOOM = 2;
    const MAX_ZOOM = 10;
    const DEFAULT_ZOOM = 5;
    
    // Adicionar evento de clique na imagem da peça
    pieceImage.addEventListener('click', function() {
        modal3D.style.display = 'block';
        
        // Inicializar a cena 3D apenas na primeira vez
        if (!isInitialized) {
            initThreeJS();
            isInitialized = true;
        }
        
        // Ajustar o tamanho do renderizador quando o modal é aberto
        onWindowResize();
    });
    
    // Fechar o modal
    close3DModal.addEventListener('click', function() {
        modal3D.style.display = 'none';
    });
    
    // Fechar o modal ao clicar fora do conteúdo
    window.addEventListener('click', function(event) {
        if (event.target === modal3D) {
            modal3D.style.display = 'none';
        }
    });
    
    // Ajustar o tamanho do renderizador quando a janela é redimensionada
    window.addEventListener('resize', onWindowResize);
    
    // Inicializar Three.js
    function initThreeJS() {
        // Criar cena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Criar câmera
        camera = new THREE.PerspectiveCamera(75, container3D.clientWidth / container3D.clientHeight, 0.1, 1000);
        camera.position.z = DEFAULT_ZOOM;
        
        // Criar renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container3D.clientWidth, container3D.clientHeight);
        container3D.appendChild(renderer.domElement);
        
        // Adicionar controles de órbita
        if (typeof OrbitControls !== 'undefined') {
            controls = new OrbitControls(camera, renderer.domElement);
        } else if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
        } else {
            alert('OrbitControls não foi carregado corretamente. A visualização 3D não funcionará.');
            return;
        }
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 1.5;
        controls.minDistance = MIN_ZOOM;
        controls.maxDistance = MAX_ZOOM;
        
        // Adicionar luzes
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Criar um modelo 3D simples (cubo colorido como placeholder)
        createPlaceholderModel();
        
        // Configurar eventos de botões de zoom
        setupZoomControls();
        
        // Iniciar loop de animação
        animate();
    }
    
    // Configurar controles de zoom
    function setupZoomControls() {
        // Botão de zoom in
        zoomInBtn.addEventListener('click', function() {
            zoomCamera(1 / ZOOM_STEP);
        });
        
        // Botão de zoom out
        zoomOutBtn.addEventListener('click', function() {
            zoomCamera(ZOOM_STEP);
        });
        
        // Botão de reset
        resetZoomBtn.addEventListener('click', function() {
            resetCamera();
        });
    }
    
    // Função para aplicar zoom
    function zoomCamera(factor) {
        const newDistance = camera.position.distanceTo(controls.target) * factor;
        
        // Verificar limites de zoom
        if (newDistance >= MIN_ZOOM && newDistance <= MAX_ZOOM) {
            // Calcular vetor de direção da câmera para o alvo
            const direction = new THREE.Vector3().subVectors(
                camera.position,
                controls.target
            ).normalize();
            
            // Aplicar nova distância
            camera.position.copy(
                direction.multiplyScalar(newDistance).add(controls.target)
            );
            
            // Atualizar controles
            controls.update();
        }
    }
    
    // Função para resetar a câmera
    function resetCamera() {
        camera.position.set(0, 0, DEFAULT_ZOOM);
        controls.target.set(0, 0, 0);
        controls.update();
    }
    
    // Criar um modelo 3D placeholder
    function createPlaceholderModel() {
        // Criar geometria baseada na forma da imagem (simplificada)
        const geometry = new THREE.BoxGeometry(3, 4, 0.5);
        
        // Criar material com cor azul similar à peça
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3366cc,
            specular: 0x111111,
            shininess: 30,
            flatShading: true
        });
        
        // Criar malha
        model = new THREE.Mesh(geometry, material);
        
        // Adicionar detalhes (cilindros para representar os furos)
        addHoles();
        
        // Adicionar à cena
        scene.add(model);
    }
    
    // Adicionar furos ao modelo
    function addHoles() {
        const holeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
        const holeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        
        // Posições dos furos (simplificado)
        const holePositions = [
            { x: -0.8, y: 1.5, z: 0 },
            { x: 0.8, y: 1.5, z: 0 },
            { x: -0.8, y: 0.5, z: 0 },
            { x: 0.8, y: 0.5, z: 0 },
            { x: -0.8, y: -0.5, z: 0 },
            { x: 0.8, y: -0.5, z: 0 },
            { x: -0.8, y: -1.5, z: 0 },
            { x: 0.8, y: -1.5, z: 0 }
        ];
        
        holePositions.forEach(pos => {
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.set(pos.x, pos.y, pos.z);
            hole.rotation.x = Math.PI / 2;
            model.add(hole);
        });
    }
    
    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Ajustar o tamanho do renderizador quando a janela é redimensionada
    function onWindowResize() {
        if (renderer) {
            camera.aspect = container3D.clientWidth / container3D.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container3D.clientWidth, container3D.clientHeight);
        }
    }
});

