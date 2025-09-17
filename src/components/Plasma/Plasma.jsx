import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './Plasma.css';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const plasmaVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const plasmaFragmentShader = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
varying vec2 vUv;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec2 C = gl_FragCoord.xy;
  vec4 o = vec4(0.0);
  mainImage(o, C);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

function PlasmaMesh({ color, speed, direction, scale, opacity, mouseInteractive }) {
  const mesh = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { viewport, size, gl } = useThree();

  const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;
  const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

  const plasmaUniformsRef = useRef({
    iTime: new THREE.Uniform(0),
    iResolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    uCustomColor: new THREE.Uniform(new THREE.Vector3(...customColorRgb)),
    uUseCustomColor: new THREE.Uniform(color ? 1.0 : 0.0),
    uSpeed: new THREE.Uniform(speed * 0.4),
    uDirection: new THREE.Uniform(directionMultiplier),
    uScale: new THREE.Uniform(scale),
    uOpacity: new THREE.Uniform(opacity),
    uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
    uMouseInteractive: new THREE.Uniform(mouseInteractive ? 1.0 : 0.0)
  });

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr),
      h = Math.floor(size.height * dpr);
    const res = plasmaUniformsRef.current.iResolution.value;
    if (res.x !== w || res.y !== h) {
      res.set(w, h);
    }
  }, [size, gl]);

  useFrame(({ clock }) => {
    const u = plasmaUniformsRef.current;
    u.iTime.value = clock.getElapsedTime();
  });

  const handlePointerMove = e => {
    if (!mouseInteractive) return;
    const rect = gl.domElement.getBoundingClientRect();
    const dpr = gl.getPixelRatio();
    mouseRef.current.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
    const mouseUniform = plasmaUniformsRef.current.uMouse.value;
    mouseUniform.set(mouseRef.current.x, mouseRef.current.y);
  };

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={plasmaVertexShader}
          fragmentShader={plasmaFragmentShader}
          uniforms={plasmaUniformsRef.current}
        />
      </mesh>
    </>
  );
}

export const Plasma = ({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true
}) => {
  return (
    <div className="plasma-container">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 6] }}
        dpr={window.devicePixelRatio}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <PlasmaMesh 
          color={color}
          speed={speed}
          direction={direction}
          scale={scale}
          opacity={opacity}
          mouseInteractive={mouseInteractive}
        />
      </Canvas>
    </div>
  );
};

export default Plasma;
