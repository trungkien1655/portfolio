/**
 * scene.js — Three.js: starfield, black hole, wormhole effects
 * ═══════════════════════════════════════════════════════════════
 * Tối ưu hóa khởi động nhanh:
 * - Dựng cảnh với số hạt ít và pixelRatio = 1 trước.
 * - Báo callback onFirstFrame ngay khi khung hình đầu tiên vừa render.
 * - Tăng dần độ phân giải và số lượng sao sau khi trang đã hiển thị.
 */
import * as THREE from 'three';

let renderer = null;
let scene = null;
let camera = null;
let microStars = null;
let twinkleStars = null;
let meteorManager = null;
let starTexture = null;
let blackHoleGroup = null;
let wormholeMesh = null;
let wormholeMaterial = null;
let animationId = null;
let isStatic = false;

// Trạng thái chuột cho hiệu ứng parallax nhẹ
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Trạng thái tiến độ cuộn trang cho camera flight
let scrollProgress = 0;
let targetScrollProgress = 0;
let currentWarp = 0;
let targetWarp = 0;
let warpTimeout = null;

export function setScrollProgress(progress) {
  targetScrollProgress = Math.max(0, Math.min(1, progress));
}

export function setWarpVelocity(velocityFactor) {
  if (isStatic) return;
  targetWarp = Math.max(targetWarp, Math.min(1.0, velocityFactor));
}

export function triggerWarp(strength = 0.85, durationMs = 800) {
  if (isStatic) return;
  targetWarp = Math.min(1.2, strength);
  if (warpTimeout) clearTimeout(warpTimeout);
  warpTimeout = setTimeout(() => {
    targetWarp = 0;
  }, durationMs * 0.45);
}

// ─── TRẠNG THÁI CINEMATIC INTRO ──────────────────
export const introState = {
  active: false,
  stage: 1, // 1: Tiếp cận, 2: Lao vào, 3: Wormhole, 4: Hero
  cameraZ: 22.0,
  cameraX: 0.0,
  cameraY: 0.0,
  cameraRoll: 0.0,
  lookAtX: 0.0,
  lookAtY: 0.0,
  blackHoleX: 0.0,
  blackHoleY: 0.0,
  blackHoleZ: 0.0,
  blackHoleScale: 0.28,
  warpFactor: 0.0,
  cameraShake: 0.0,
  wormholeAlpha: 0.0,
  wormholeSpeed: 6.0,
};

export function setIntroActive(active) {
  introState.active = !!active;
  if (!active) {
    if (wormholeMesh) wormholeMesh.visible = false;
    if (blackHoleGroup) blackHoleGroup.visible = true;
    if (camera) {
      camera.rotation.z = 0;
      camera.fov = 60;
      camera.updateProjectionMatrix();
    }
    updateBlackHoleLayout();
  }
}

export function setIntroParams(params) {
  Object.assign(introState, params);
  if (typeof window !== 'undefined') {
    window.__introStage = introState.stage;
  }
}

export function getHeroTargetLayout() {
  const isMobile = window.innerWidth < 768;
  const aspect = window.innerWidth / window.innerHeight;
  return {
    stage: 4,
    cameraZ: 8.0,
    cameraX: 0.0,
    cameraY: 0.0,
    cameraRoll: 0.0,
    lookAtX: 0.0,
    lookAtY: 0.0,
    blackHoleX: isMobile ? 0 : aspect * 1.35,
    blackHoleY: isMobile ? 2.1 : 0.0,
    blackHoleZ: 0.0,
    blackHoleScale: isMobile ? 0.55 : 1.0,
    warpFactor: 0.0,
    cameraShake: 0.0,
    wormholeAlpha: 0.0,
  };
}

/* ─── WEBGL DETECTION ─────────────────────── */
export function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}

/* ─── TẠO TEXTURE SAO DẠNG ĐĨA TRÒN PHÁT QUANG (OFFSCREEN CANVAS) ─ */
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(240, 246, 255, 0.85)');
  grad.addColorStop(0.55, 'rgba(200, 225, 255, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* ─── LỚP 1: TẬP HỢP SAO VI MÔ NỀN XA (DISTANT MICRO-STARS) ─── */
function createMicroStarfield(count, texture) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Bảng màu sao thiên văn học tinh tế: trắng ngà, xanh lam Sirius, vàng kim nhạt, cam Gargantua
  const colorPalette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xd6e5fb),
    new THREE.Color(0xfdebc9),
    new THREE.Color(0xf0ab58),
    new THREE.Color(0xd8f2f8),
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Phân bố không gian rộng, đặt ở hậu cảnh xa phía sau hố đen (z từ -650 đến -15)
    positions[i3] = (Math.random() - 0.5) * 900;
    positions[i3 + 1] = (Math.random() - 0.5) * 700;
    positions[i3 + 2] = -15 - Math.random() * 650;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const brightness = 0.65 + Math.random() * 0.45;
    colors[i3] = chosenColor.r * brightness;
    colors[i3 + 1] = chosenColor.g * brightness;
    colors[i3 + 2] = chosenColor.b * brightness;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.2,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

/* ─── LỚP 2: SAO NHẤP NHÁY TIỀN CẢNH / TRUNG CẢNH (TWINKLING STARS) ─ */
const twinkleVertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    // Giao thoa hai sóng sin để tạo nhịp nhấp nháy sinh động, ngẫu nhiên tự nhiên
    float pulse = 0.5 + 0.35 * sin(uTime * aSpeed + aPhase) + 0.15 * sin(uTime * (aSpeed * 2.2) + aPhase * 1.6);
    vAlpha = clamp(pulse, 0.22, 1.0);

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (0.65 + 0.55 * pulse) * (360.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const twinkleFragmentShader = `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    // Điểm tâm sáng rực rỡ, viền ngoài mờ dần theo hàm Gauss tròn mượt
    float core = exp(-dist * dist * 16.0);
    gl_FragColor = vec4(vColor, vAlpha * core);
  }
`;

function createTwinkleStarfield(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const aColor = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);

  const colors = [
    [1.0, 1.0, 1.0],      // Trắng thuần khiết
    [0.82, 0.90, 1.0],    // Kim cương xanh
    [1.0, 0.88, 0.62],    // Vàng hoàng yến
    [0.96, 0.68, 0.35],   // Cam bồi tụ ấm
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Phân bố trung cảnh (z từ -450 đến -15, đều nằm sau z=0 của hố đen)
    positions[i3] = (Math.random() - 0.5) * 650;
    positions[i3 + 1] = (Math.random() - 0.5) * 500;
    positions[i3 + 2] = -15 - Math.random() * 450;

    const c = colors[Math.floor(Math.random() * colors.length)];
    aColor[i3] = c[0];
    aColor[i3 + 1] = c[1];
    aColor[i3 + 2] = c[2];

    aSize[i] = 3.2 + Math.random() * 2.8;
    aPhase[i] = Math.random() * Math.PI * 2.0;
    aSpeed[i] = 1.2 + Math.random() * 2.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: twinkleVertexShader,
    fragmentShader: twinkleFragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

/* ─── LỚP 3: HỆ THỐNG SAO BĂNG THI THOẢNG XUẤT HIỆN (METEOR SYSTEM) ─ */
class MeteorManager {
  constructor(sceneInstance) {
    this.scene = sceneInstance;
    this.active = false;
    this.startTime = 0;
    this.duration = 0.85;
    this.nextSpawnTime = performance.now() * 0.001 + 3.0; // Xuất hiện sau 3s

    const geo = new THREE.PlaneGeometry(0.08, 6.0);
    geo.translate(0, -3.0, 0); // Đỉnh đầu ở (0, 0, 0), đuôi kéo lùi theo trục -Y

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float tail = pow(vUv.y, 2.2);
          float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
          center = pow(max(0.0, center), 1.6);
          vec3 headCol = vec3(1.35, 1.28, 1.15);
          vec3 tailCol = vec3(0.95, 0.52, 0.15);
          vec3 col = mix(tailCol, headCol, vUv.y);
          gl_FragColor = vec4(col, clamp(tail * center * uOpacity, 0.0, 1.0));
        }
      `,
      uniforms: {
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    this.startPos = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
  }

  spawn() {
    this.active = true;
    this.startTime = performance.now() * 0.001;
    this.duration = 0.7 + Math.random() * 0.35;

    // Xuất hiện ngẫu nhiên ở phần trên bầu trời
    const side = Math.random() > 0.45 ? 1 : -1;
    const startX = side * (8 + Math.random() * 18);
    const startY = 8 + Math.random() * 12;
    const startZ = -15 - Math.random() * 15;
    this.startPos.set(startX, startY, startZ);
    this.mesh.position.copy(this.startPos);

    // Góc bay chéo hướng xuống
    const angleZ = side > 0 ? (-Math.PI * 0.65 - Math.random() * 0.2) : (-Math.PI * 0.35 + Math.random() * 0.2);
    this.mesh.rotation.z = angleZ + Math.PI * 0.5;

    const speed = 36 + Math.random() * 14;
    this.velocity.set(Math.cos(angleZ) * speed, Math.sin(angleZ) * speed, 0);

    this.mesh.visible = true;
    this.material.uniforms.uOpacity.value = 0;
  }

  update(nowSec) {
    if (!this.active) {
      if (nowSec >= this.nextSpawnTime) {
        this.spawn();
      }
      return;
    }

    const elapsed = nowSec - this.startTime;
    const progress = elapsed / this.duration;

    if (progress >= 1.0) {
      this.active = false;
      this.mesh.visible = false;
      this.material.uniforms.uOpacity.value = 0;
      // Chu kỳ sao băng tiếp theo sau 5.5 - 9.0 giây
      this.nextSpawnTime = nowSec + 5.5 + Math.random() * 3.5;
      return;
    }

    this.mesh.position.x = this.startPos.x + this.velocity.x * elapsed;
    this.mesh.position.y = this.startPos.y + this.velocity.y * elapsed;
    this.mesh.position.z = this.startPos.z + this.velocity.z * elapsed;

    let opacity = 0;
    if (progress < 0.15) {
      opacity = progress / 0.15;
    } else {
      opacity = Math.pow(1.0 - (progress - 0.15) / 0.85, 1.8);
    }
    this.material.uniforms.uOpacity.value = opacity * 1.1;
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.material) this.material.dispose();
    }
  }
}

/* ─── SHADER HỐ ĐEN GARGANTUA (GLSL CHUYÊN DỤNG) ──────────── */
const gargantuaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gargantuaFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uTilt;
  uniform float uWarp;
  varying vec2 vUv;

  // Hash & Noise 2D gọn nhẹ cho luồng plasma xoáy
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.5000 * noise2D(p); p *= 2.02;
    v += 0.2500 * noise2D(p); p *= 2.04;
    v += 0.1250 * noise2D(p);
    return v;
  }

  // Bảng màu đĩa bồi tụ theo nhiệt độ & Doppler
  vec3 getAccretionColor(float t, float doppler) {
    vec3 cWhiteHot = vec3(1.35, 1.28, 1.15);
    vec3 cAmber    = vec3(1.02, 0.74, 0.32);
    vec3 cOrange   = vec3(0.92, 0.44, 0.12);
    vec3 cDarkRust = vec3(0.40, 0.10, 0.02);

    vec3 col;
    if (t < 0.2) {
      col = mix(cWhiteHot, cAmber, t / 0.2);
    } else if (t < 0.6) {
      col = mix(cAmber, cOrange, (t - 0.2) / 0.4);
    } else {
      col = mix(cOrange, cDarkRust, (t - 0.6) / 0.4);
    }

    return col * doppler;
  }

  void main() {
    // Tọa độ chuẩn hóa p trong khoảng [-1.6, 1.6]
    vec2 p = (vUv - 0.5) * 3.2;

    // Phản ứng nhẹ và cực mượt với chuyển động chuột
    p.x += uMouse.x * 0.08;
    p.y += uMouse.y * 0.08;

    // Hiệu ứng Wormhole / Warp bẻ cong không thời gian khi tăng tốc cuộn
    float warpRipple = uWarp * 0.06 * sin(length(p) * 16.0 - uTime * 6.0);
    p += normalize(p + vec2(0.0001)) * warpRipple;

    float r = length(p);
    float phi = atan(p.y, p.x);

    // Thông số hình học duy nhất cho toàn bộ hố đen Gargantua
    const float R_SHADOW = 0.46;    // Chân trời sự kiện (Event Horizon)
    const float R_PHOTON = 0.478;   // Vòng photon sắc nét đồng tâm
    const float R_IN     = 0.478;   // Mép trong đĩa bồi tụ gắn liền vòng photon
    const float R_OUT    = 1.45;    // Mép ngoài đĩa bồi tụ

    // Hiệu ứng Doppler: Nhánh bên trái (p.x < 0) sáng rực hơn, nhánh phải tối màu hơn
    float doppler = clamp(1.0 - 0.55 * (p.x / (r + 0.08)), 0.35, 1.95);

    // ─── 1. ĐĨA BỒI TỤ PHÍA SAU (BỊ BẺ CONG LÊN TRÊN VÀ XUỐNG DƯỚI) ───
    vec3 colRear = vec3(0.0);
    float rearAlpha = 0.0;

    // Vòm cong phía trên (Lensed Top Arc)
    if (p.y > -0.06 && r > R_SHADOW * 0.98) {
      float arcR = R_IN + (r - R_SHADOW) * 1.30;
      if (arcR >= R_IN && arcR <= R_OUT) {
        float normR = (arcR - R_IN) / (R_OUT - R_IN);
        float density = smoothstep(0.0, 0.12, normR) * pow(1.0 - normR, 1.35);
        
        float omega = 0.65 / (arcR * sqrt(arcR) + 0.06);
        float rotPhi = phi - omega * uTime;
        float turb = fbm(vec2(arcR * 14.0, rotPhi * 4.0)) * 0.55 + 0.72;
        
        float topFalloff = smoothstep(-0.06, 0.24, p.y);
        float intensity = density * turb * doppler * topFalloff * 2.5;
        colRear += getAccretionColor(normR, doppler) * intensity;
        rearAlpha += intensity * 0.85;
      }
    }

    // Vòm cong phía dưới (Lensed Bottom Arc)
    if (p.y < -0.10 && r > R_SHADOW * 0.98 && r < 0.95) {
      float arcR = R_IN + (r - R_SHADOW) * 1.55;
      if (arcR >= R_IN && arcR <= R_OUT) {
        float normR = (arcR - R_IN) / (R_OUT - R_IN);
        float density = smoothstep(0.0, 0.16, normR) * pow(1.0 - normR, 1.7);
        float botFalloff = smoothstep(-0.10, -0.32, p.y) * 0.85;
        float intensity = density * doppler * botFalloff * 1.7;
        colRear += getAccretionColor(normR, doppler) * intensity;
        rearAlpha += intensity * 0.80;
      }
    }

    // ─── 2. BÓNG ĐEN CHÂN TRỜI SỰ KIỆN (EVENT HORIZON SHADOW) ───
    // Đúng tâm, tròn hoàn hảo, bán kính R_SHADOW
    float shadowMask = smoothstep(R_SHADOW - 0.005, R_SHADOW + 0.003, r);
    vec3 compositeCol = colRear * shadowMask;
    // Bên trong bóng đen (r <= R_SHADOW), độ chắn sáng tuyệt đối 100% (alpha = 1.0)
    float compositeAlpha = mix(1.0, clamp(rearAlpha, 0.0, 1.0), shadowMask);

    // ─── 3. VÒNG PHOTON ĐỒNG TÂM (PHOTON RING) ───
    float pRingDist = abs(r - R_PHOTON);
    float pRing = exp(-pRingDist * (180.0 - uWarp * 50.0)) * (3.6 + uWarp * 2.8);
    vec3 pRingCol = vec3(1.25, 1.15, 0.98) * pRing * doppler;
    compositeCol += pRingCol;
    compositeAlpha = max(compositeAlpha, clamp(pRing * 0.92, 0.0, 1.0));

    // ─── 4. ĐĨA BỒI TỤ PHÍA TRƯỚC (DẢI SÁNG MẢNH VẮT LIÊN TỤC QUA MẶT HỐ ĐEN) ───
    // Dải sáng phía trước vắt ngang qua mặt trước hố đen từ trái sang phải, không bị ngắt quãng
    float yCenter = -0.04 - 0.02 * (1.0 - pow(p.x / R_OUT, 2.0));
    float bandFalloff = exp(-pow((p.y - yCenter) / 0.038, 2.0));
    float horizFade = smoothstep(R_OUT, R_OUT * 0.78, abs(p.x));
    float frontDoppler = clamp(1.0 - 0.58 * (p.x / R_OUT), 0.35, 1.95);
    float frontTurb = fbm(vec2(p.x * 12.0, uTime * 1.4)) * 0.45 + 0.78;
    
    float normX = clamp(abs(p.x) / R_OUT, 0.0, 1.0);
    float frontIntensity = bandFalloff * horizFade * frontTurb * frontDoppler * 2.8;
    vec3 colFront = getAccretionColor(normX, frontDoppler) * frontIntensity;
    float frontAlpha = clamp(frontIntensity * 0.95, 0.0, 1.0);

    // Vẽ đè lên composite (không bị bóng đen che)
    compositeCol = compositeCol * (1.0 - frontAlpha * 0.7) + colFront;
    compositeAlpha = max(compositeAlpha, frontAlpha);

    // ─── 5. HÀO QUANG PHÁT SÁNG KHÔNG GIAN (BLOOM / GLOW AURA) ───
    // Chỉ tỏa ra không gian bên ngoài chân trời sự kiện, KHÔNG làm sáng bên trong bóng đen!
    float glow = (exp(-r * 2.6) * 0.48 + exp(-r * 4.8) * 0.82) * (0.85 + 0.15 * sin(uTime * 0.8) + uWarp * 0.75);
    vec3 glowCol = vec3(0.96, 0.58, 0.20) * glow * (0.75 + 0.45 * doppler) * shadowMask;
    compositeCol += glowCol;
    compositeAlpha = max(compositeAlpha, clamp(glow * 0.75 * shadowMask, 0.0, 1.0));

    gl_FragColor = vec4(compositeCol, clamp(compositeAlpha, 0.0, 1.0));
  }
`;

let blackHoleMaterial = null;

/* ─── CẬP NHẬT BỐ CỤC HỐ ĐEN (RESPONSIVE LAYOUT) ─ */
function updateBlackHoleLayout() {
  if (!blackHoleGroup || introState.active) return;
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    // Mobile: hố đen đặt ở nửa trên màn hình (Y = +2.1), tỉ lệ 0.55 vừa vặn với chiều ngang 390px
    blackHoleGroup.position.set(0, 2.1, 0);
    blackHoleGroup.scale.set(0.55, 0.55, 0.55);
  } else {
    // Desktop: hố đen lệch sang phải (~65% chiều ngang màn hình), chiếm ~60% chiều cao
    const aspect = window.innerWidth / window.innerHeight;
    const targetX = aspect * 1.35;
    blackHoleGroup.position.set(targetX, 0, 0);
    blackHoleGroup.scale.set(1.0, 1.0, 1.0);
  }
}

/* ─── TẠO HỐ ĐEN GARGANTUA CHUẨN ĐIỆN ẢNH (MỘT SHADER DUY NHẤT) ─ */
function createGargantuaBlackHole() {
  const group = new THREE.Group();

  // Tấm quad Shader Gargantua duy nhất (11x11, không dùng thêm mesh đen 3D nào)
  const planeGeo = new THREE.PlaneGeometry(11, 11);
  blackHoleMaterial = new THREE.ShaderMaterial({
    vertexShader: gargantuaVertexShader,
    fragmentShader: gargantuaFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0.32 }, // Góc nghiêng đĩa ~18 độ
      uWarp: { value: 0 },    // Hiệu ứng Wormhole/Warp biến dạng thấu kính
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const blackHoleMesh = new THREE.Mesh(planeGeo, blackHoleMaterial);
  group.add(blackHoleMesh);

  return group;
}

/* ─── SHADER ĐƯỜNG HẦM KHÔNG-THỜI GIAN (3D WORMHOLE VORTEX TUNNEL) ─ */
const wormholeVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wormholeFragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAlpha;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Thuật toán đường hầm không-thời gian xoắn ốc (Seamless 3D Wormhole Spacetime Vortex)
  void main() {
    // vUv.x: góc quay quanh chu vi ống (0 -> 1)
    // Dùng số nguyên bội của 2*PI để 100% không bị lộ đường ghép seam!
    float angle = vUv.x * 6.28318530718;
    float zStream = vUv.y * 36.0 - uTime * uSpeed;

    // Dải xoắn ốc không-thời gian (Spacetime spiral geodesics: chu kỳ nguyên 4.0 và -3.0)
    float sp1 = angle * 4.0 + vUv.y * 22.0 - uTime * (uSpeed * 0.85);
    float sp2 = -angle * 3.0 + vUv.y * 16.0 - uTime * (uSpeed * 0.55);

    // Lọc dải phát sáng bằng smoothstep hẹp: nền vũ trụ đen 80%, dải sáng mảnh và sắc nét 20%
    float rib1 = smoothstep(0.68, 0.98, sin(sp1) * 0.5 + 0.5);
    float rib2 = smoothstep(0.72, 0.98, cos(sp2) * 0.5 + 0.5);

    // Vệt sáng tốc độ siêu quang (Hyperspace filaments: chu kỳ nguyên 8.0)
    float streak = smoothstep(0.80, 0.99, sin(angle * 8.0 + sin(zStream * 0.4) * 3.0) * 0.5 + 0.5);

    // Sóng xung kích sóng hấp dẫn chạy dọc ống (Gravitational ripple waves)
    float ring = smoothstep(0.85, 0.99, sin(vUv.y * 60.0 - uTime * 22.0) * 0.5 + 0.5);

    // Nền vũ trụ sâu thẳm (đen tuyền)
    vec3 col = vec3(0.0);

    // Dải xoáy vàng kim & cam nhiệt Gargantua
    col += vec3(0.98, 0.58, 0.16) * rib1 * 1.35;
    col += vec3(1.15, 0.92, 0.50) * pow(rib1, 2.5) * 1.5;

    // Nhấn xanh lam & tím thấu kính không gian
    col += vec3(0.55, 0.15, 0.85) * rib2 * 0.95;
    col += vec3(0.18, 0.72, 1.00) * pow(rib2, 2.0) * 1.35;

    // Vệt sáng tốc độ ánh sáng trắng rực
    col += vec3(1.40, 1.35, 1.25) * streak * 2.2;

    // Sóng xung kích không-thời gian
    col += vec3(0.95, 0.72, 0.30) * ring * 0.95;

    // Độ suy giảm ở 2 đầu hình trụ để chuyển tiếp mềm mại (Depth Vignette)
    float depthFade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.76, vUv.y);
    float alpha = clamp(length(col) * 0.65, 0.0, 1.0) * depthFade * uAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`;

function createWormholeTunnel() {
  const radius = 4.8;
  const length = 90;
  const geo = new THREE.CylinderGeometry(radius, radius, length, 48, 1, true);
  // Định hướng hình trụ dọc theo trục Z (từ Z = +15 đến Z = -75)
  geo.rotateX(Math.PI / 2);
  geo.translate(0, 0, -35);

  wormholeMaterial = new THREE.ShaderMaterial({
    vertexShader: wormholeVertexShader,
    fragmentShader: wormholeFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 6.0 },
      uAlpha: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geo, wormholeMaterial);
  mesh.frustumCulled = false;
  mesh.visible = false;
  return mesh;
}

/* ─── KHỞI TẠO SCENE VỚI TỐC ĐỘ CAO (FAST FIRST FRAME) ─ */
export async function initScene(canvas, options = {}) {
  isStatic = !!options.static;
  const onFirstFrame = options.onFirstFrame || null;

  try {
    // 1. Renderer với độ phân giải thấp (1x) để khung hình đầu tiên sẵn sàng tức thì
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Kích hoạt ACES Filmic Tone Mapping để ánh sáng cam ấm và điểm sáng rực chuẩn điện ảnh
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1500
    );
    camera.position.z = 8;

    // 3. Khởi tạo hố đen Gargantua & Wormhole Tunnel bằng Shader GLSL
    blackHoleGroup = createGargantuaBlackHole();
    updateBlackHoleLayout();
    scene.add(blackHoleGroup);

    wormholeMesh = createWormholeTunnel();
    scene.add(wormholeMesh);

    const isMobile = window.innerWidth <= 768;
    const initMicro = isMobile ? 220 : 450;
    const initTwinkle = isMobile ? 60 : 120;
    starTexture = createStarTexture();
    microStars = createMicroStarfield(initMicro, starTexture);
    twinkleStars = createTwinkleStarfield(initTwinkle);
    scene.add(microStars);
    scene.add(twinkleStars);

    if (!isStatic) {
      meteorManager = new MeteorManager(scene);
    }

    // 4. RENDER KHUNG HÌNH ĐẦU TIÊN
    renderer.render(scene, camera);

    // 5. BÁO CALLBACK ĐỂ TẮT LOADER NGAY LẬP TỨC
    if (typeof onFirstFrame === 'function') {
      try {
        onFirstFrame();
      } catch (cbErr) {
        console.warn('onFirstFrame callback error:', cbErr);
      }
    }

    // 6. LẮNG NGHE SỰ KIỆN CHUỘT VÀ RESIZE
    window.addEventListener('resize', onResize, { passive: true });
    if (!isStatic) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      animate();
    }

    // 7. TĂNG DẦN TẢI SAU KHI TRANG ĐÃ HIỂN THỊ (PROGRESSIVE ENHANCEMENT)
    setTimeout(() => {
      upgradeSceneProgressively(isMobile);
    }, 120);

    return true;
  } catch (err) {
    console.error('Lỗi khởi tạo Three.js:', err);
    throw err;
  }
}

/* ─── TĂNG DẦN CHI TIẾT SAU KHI LOADER ĐÃ TẮT ─ */
function upgradeSceneProgressively(isMobile) {
  if (!renderer || !scene) return;

  try {
    // Nâng pixel ratio lên đúng độ phân giải màn hình (tối đa 2 để mượt)
    const targetDpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(targetDpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Thêm số hạt sao đầy đủ (desktop: 1100 micro, 300 twinkle; mobile: 450 micro, 130 twinkle)
    const fullMicro = isMobile ? 450 : 1100;
    const fullTwinkle = isMobile ? 130 : 300;

    if (microStars) {
      scene.remove(microStars);
      if (microStars.geometry) microStars.geometry.dispose();
      if (microStars.material) microStars.material.dispose();
    }
    if (twinkleStars) {
      scene.remove(twinkleStars);
      if (twinkleStars.geometry) twinkleStars.geometry.dispose();
      if (twinkleStars.material) twinkleStars.material.dispose();
    }

    if (!starTexture) starTexture = createStarTexture();
    microStars = createMicroStarfield(fullMicro, starTexture);
    twinkleStars = createTwinkleStarfield(fullTwinkle);

    scene.add(microStars);
    scene.add(twinkleStars);

    if (isStatic) {
      renderer.render(scene, camera);
    }
  } catch (err) {
    console.warn('Không thể nâng cấp scene:', err);
  }
}

/* ─── MOUSE MOVE (PARALLAX) ────────────────── */
function onMouseMove(e) {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

/* ─── RESIZE ──────────────────────────────── */
function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateBlackHoleLayout();
  if (isStatic) renderer.render(scene, camera);
}

/* ─── ANIMATION LOOP ──────────────────────── */
function animate() {
  animationId = requestAnimationFrame(animate);
  const nowSec = performance.now() * 0.001;

  // Chế độ Cinematic Intro
  if (introState.active) {
    // Rung camera ngẫu nhiên theo gia tốc tiến vào hố đen
    const shakeX = (Math.random() - 0.5) * introState.cameraShake;
    const shakeY = (Math.random() - 0.5) * introState.cameraShake;

    if (introState.stage === 3) {
      // ── GIAI ĐOẠN 3: ĐƯỜNG HẦM KHÔNG-THỜI GIAN (WORMHOLE TRANSIT) ──
      if (blackHoleGroup) blackHoleGroup.visible = false;
      if (wormholeMesh) {
        wormholeMesh.visible = true;
        if (wormholeMaterial && wormholeMaterial.uniforms) {
          wormholeMaterial.uniforms.uTime.value = nowSec;
          wormholeMaterial.uniforms.uSpeed.value = introState.wormholeSpeed || 6.0;
          wormholeMaterial.uniforms.uAlpha.value = (introState.wormholeAlpha !== undefined) ? introState.wormholeAlpha : 1.0;
        }
      }

      if (camera) {
        // Camera bay bên trong đường hầm, xoay quanh trục Z tạo cảm giác rơi tự do vào lỗ sâu
        camera.position.x = shakeX * 0.4;
        camera.position.y = shakeY * 0.4;
        camera.position.z = 4.0;
        camera.lookAt(0, 0, -40);

        // Camera roll xoay nhẹ quanh trục Z
        const roll = Math.sin(nowSec * 3.2) * 0.16 + (introState.cameraRoll || 0);
        camera.rotation.z = roll;

        const targetFov = 68.0;
        if (Math.abs(camera.fov - targetFov) > 0.08) {
          camera.fov = targetFov;
          camera.updateProjectionMatrix();
        }
      }

      // Sao trôi nhanh dọc trục Z tạo cảm giác tốc độ ánh sáng
      if (microStars) {
        microStars.rotation.z += 0.015;
        microStars.position.z = (nowSec * 50.0) % 70.0 - 35.0;
      }
      if (twinkleStars) {
        twinkleStars.rotation.z += 0.02;
        if (twinkleStars.material && twinkleStars.material.uniforms) {
          twinkleStars.material.uniforms.uTime.value = nowSec;
        }
      }

      renderer.render(scene, camera);
      return;
    }

    // Các giai đoạn khác: ẩn wormhole, hiện black hole
    if (wormholeMesh) wormholeMesh.visible = false;
    if (blackHoleGroup) blackHoleGroup.visible = true;

    if (camera) {
      camera.position.x = introState.cameraX + shakeX;
      camera.position.y = introState.cameraY + shakeY;
      camera.position.z = introState.cameraZ;
      camera.rotation.z = shakeX * 0.35 + (introState.cameraRoll || 0);
      camera.lookAt(introState.lookAtX, introState.lookAtY, 0);

      const targetFov = 60 + introState.warpFactor * 16.0;
      if (Math.abs(camera.fov - targetFov) > 0.08) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
    }

    if (blackHoleGroup) {
      blackHoleGroup.position.set(introState.blackHoleX, introState.blackHoleY, introState.blackHoleZ);
      blackHoleGroup.scale.set(introState.blackHoleScale, introState.blackHoleScale, introState.blackHoleScale);
      blackHoleGroup.rotation.y = nowSec * 0.06 + introState.warpFactor * 0.35;
      blackHoleGroup.rotation.x = shakeY * 0.35;
    }

    if (blackHoleMaterial && blackHoleMaterial.uniforms) {
      blackHoleMaterial.uniforms.uTime.value = nowSec;
      blackHoleMaterial.uniforms.uMouse.value.set(0, 0);
      blackHoleMaterial.uniforms.uWarp.value = introState.warpFactor;
    }

    if (microStars) {
      microStars.rotation.y += 0.00018 * (1.0 + introState.warpFactor * 5.0);
      microStars.position.z = introState.warpFactor * 3.5;
    }

    if (twinkleStars) {
      twinkleStars.rotation.y += 0.00022 * (1.0 + introState.warpFactor * 5.0);
      if (twinkleStars.material && twinkleStars.material.uniforms) {
        twinkleStars.material.uniforms.uTime.value = nowSec;
      }
    }

    if (meteorManager) {
      meteorManager.update(nowSec);
    }

    renderer.render(scene, camera);
    return;
  }

  // Mượt hóa chuyển động chuột (lerp)
  mouseX += (targetMouseX - mouseX) * 0.04;
  mouseY += (targetMouseY - mouseY) * 0.04;

  // Mượt hóa chuyển động cuộn không gian (lerp)
  scrollProgress += (targetScrollProgress - scrollProgress) * 0.06;

  // Mượt hóa hiệu ứng Wormhole / Warp gia tốc
  currentWarp += (targetWarp - currentWarp) * 0.1;
  if (targetWarp === 0 && currentWarp < 0.003) currentWarp = 0;

  const isMobile = window.innerWidth < 768;
  const aspect = window.innerWidth / window.innerHeight;
  const baseX = isMobile ? 0 : aspect * 1.35;
  const baseY = isMobile ? 2.1 : 0.0;
  const baseScale = isMobile ? 0.55 : 1.0;

  // Camera bay nhẹ về phía trước, trượt tọa độ Y và nghiêng nhẹ theo độ cong không thời gian
  if (camera) {
    const camZ = 8.0 - scrollProgress * 1.8 - currentWarp * 1.2;
    const camTilt = Math.sin(scrollProgress * Math.PI) * 0.035;
    camera.position.x = mouseX * 0.7;
    camera.position.y = -mouseY * 0.7 - scrollProgress * 1.4;
    camera.position.z = camZ;
    camera.rotation.z = camTilt;
    camera.lookAt(0, -scrollProgress * 1.4, 0);

    // Kéo giãn trường nhìn (FOV) tạo cảm giác vượt qua lỗ sâu / tăng tốc ánh sáng
    const targetFov = 60 + currentWarp * 14.0;
    if (Math.abs(camera.fov - targetFov) > 0.08) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  }

  // Xoay nhẹ lớp sao nền xa + trôi dạt gia tốc khi Warp
  if (microStars) {
    microStars.rotation.y += (0.00018 + scrollProgress * 0.0001) * (1.0 + currentWarp * 4.5);
    microStars.rotation.x += 0.00006 * (1.0 + currentWarp * 2.5);
    microStars.position.z = currentWarp * 0.5;
  }

  // Cập nhật lớp sao nhấp nháy
  if (twinkleStars) {
    twinkleStars.rotation.y += (0.00022 + scrollProgress * 0.00012) * (1.0 + currentWarp * 4.5);
    twinkleStars.rotation.x += 0.00008 * (1.0 + currentWarp * 2.5);
    if (twinkleStars.material && twinkleStars.material.uniforms) {
      twinkleStars.material.uniforms.uTime.value = nowSec;
    }
  }

  // Cập nhật sao băng
  if (meteorManager) {
    meteorManager.update(nowSec);
  }

  // Cập nhật uniform cho shader hố đen Gargantua
  if (blackHoleMaterial && blackHoleMaterial.uniforms) {
    blackHoleMaterial.uniforms.uTime.value = nowSec;
    blackHoleMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
    blackHoleMaterial.uniforms.uWarp.value = currentWarp;
  }

  // Hố đen lướt dần lên trên và lùi nhẹ vào không gian sâu khi cuộn xuống các section
  if (blackHoleGroup) {
    const shiftY = scrollProgress * 3.6;
    const shiftX = isMobile ? 0 : scrollProgress * 0.9;
    const scaleFactor = baseScale * Math.max(0.65, 1.0 - scrollProgress * 0.35);

    blackHoleGroup.position.set(baseX + shiftX, baseY + shiftY, -scrollProgress * 3.0);
    blackHoleGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    blackHoleGroup.rotation.x = -mouseY * 0.08;
    blackHoleGroup.rotation.y = mouseX * 0.08 + scrollProgress * 0.22;
  }

  renderer.render(scene, camera);
}

/* ─── CLEANUP ─────────────────────────────── */
export function dispose() {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('mousemove', onMouseMove);
  if (meteorManager) meteorManager.dispose();
  if (microStars) {
    if (microStars.geometry) microStars.geometry.dispose();
    if (microStars.material) microStars.material.dispose();
  }
  if (twinkleStars) {
    if (twinkleStars.geometry) twinkleStars.geometry.dispose();
    if (twinkleStars.material) twinkleStars.material.dispose();
  }
  if (wormholeMesh) {
    if (wormholeMesh.geometry) wormholeMesh.geometry.dispose();
    if (wormholeMesh.material) wormholeMesh.material.dispose();
  }
  if (starTexture) starTexture.dispose();
  if (renderer) renderer.dispose();
}
