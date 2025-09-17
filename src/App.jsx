import React, { useRef, useEffect, forwardRef, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import * as THREE from 'three';
import CircularGallery from './components/CircularGallery';
import ScrollReveal from './components/ScrollReveal/ScrollReveal';
import Plasma from './components/Plasma';
import './styles/globals.css';

const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2)); 
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  float f = pattern(uv);
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  vec3 col = mix(vec3(0.0), waveColor, f);
  gl_FragColor = vec4(col, 1.0);
}
`;

const ditherFragmentShader = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;
const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);

vec3 dither(vec2 uv, vec3 color) {
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  int x = int(mod(scaledCoord.x, 8.0));
  int y = int(mod(scaledCoord.y, 8.0));
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
  float step = 1.0 / (colorNum - 1.0);
  color += threshold * step;
  float bias = 0.2;
  color = clamp(color - bias, 0.0, 1.0);
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uv, color.rgb);
  outputColor = color;
}
`;

class RetroEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)]
    ]);
    super('RetroEffect', ditherFragmentShader, { uniforms });
    this.uniforms = uniforms;
  }
  set colorNum(v) {
    this.uniforms.get('colorNum').value = v;
  }
  get colorNum() {
    return this.uniforms.get('colorNum').value;
  }
  set pixelSize(v) {
    this.uniforms.get('pixelSize').value = v;
  }
  get pixelSize() {
    return this.uniforms.get('pixelSize').value;
  }
}

const WrappedRetro = wrapEffect(RetroEffectImpl);

const RetroEffect = forwardRef((props, ref) => {
  const { colorNum, pixelSize } = props;
  return <WrappedRetro ref={ref} colorNum={colorNum} pixelSize={pixelSize} />;
});
RetroEffect.displayName = 'RetroEffect';

function DitheredWaves() {
  const mesh = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { viewport, size, gl } = useThree();

  const waveUniformsRef = useRef({
    time: new THREE.Uniform(0),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    waveSpeed: new THREE.Uniform(0.05),
    waveFrequency: new THREE.Uniform(3),
    waveAmplitude: new THREE.Uniform(0.3),
    waveColor: new THREE.Uniform(new THREE.Color(0.2, 0.2, 0.4)),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(0),
    mouseRadius: new THREE.Uniform(0.3)
  });

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr),
      h = Math.floor(size.height * dpr);
    const res = waveUniformsRef.current.resolution.value;
    if (res.x !== w || res.y !== h) {
      res.set(w, h);
    }
  }, [size, gl]);

  useFrame(({ clock }) => {
    const u = waveUniformsRef.current;
    u.time.value = clock.getElapsedTime();
  });

  const handlePointerMove = e => {
    const rect = gl.domElement.getBoundingClientRect();
    const dpr = gl.getPixelRatio();
    mouseRef.current.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
  };

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>

      <EffectComposer>
        <RetroEffect colorNum={4} pixelSize={2} />
      </EffectComposer>

    </>
  );
}

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [actionButtonsVisible, setActionButtonsVisible] = useState(false);
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const actionButtonsRef = useRef(null);

  useEffect(() => {
    // Délai pour l'effet fade-in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const buttonObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setButtonVisible(true);
          } else {
            // Reset l'animation quand on sort de la vue
            setButtonVisible(false);
          }
        });
      },
      { 
        threshold: 0.3, // Se déclenche quand 30% du bouton est visible
        rootMargin: '0px 0px -50px 0px' // Se déclenche 50px avant que le bouton soit complètement visible
      }
    );

    const textObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTextVisible(true);
          } else {
            setTextVisible(false);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const actionButtonsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActionButtonsVisible(true);
          } else {
            setActionButtonsVisible(false);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px 100px 0px'
      }
    );

    if (buttonRef.current) {
      buttonObserver.observe(buttonRef.current);
    }

    if (textRef.current) {
      textObserver.observe(textRef.current);
    }

    if (actionButtonsRef.current) {
      actionButtonsObserver.observe(actionButtonsRef.current);
    }

    return () => {
      if (buttonRef.current) {
        buttonObserver.unobserve(buttonRef.current);
      }
      if (textRef.current) {
        textObserver.unobserve(textRef.current);
      }
      if (actionButtonsRef.current) {
        actionButtonsObserver.unobserve(actionButtonsRef.current);
      }
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '10px 10px 0 10px'
    }}>
      {/* Container iPhone */}
      <div style={{
        width: 'calc(100vw - 20px)', // Responsive: pleine largeur avec marge
        maxWidth: '410px', // Taille max iPhone
        height: 'auto', // Hauteur adaptative au contenu
        minHeight: 'clamp(200px, 50vh, 600px)', // Hauteur min responsive réduite
        maxHeight: 'clamp(600px, 90vh, 800px)', // Hauteur max responsive
        background: '#111',
        borderRadius: 'clamp(15px, 4vw, 25px)', // Responsive border radius
        overflow: 'hidden',
        position: 'relative',
        border: '2px solid #333',
        marginTop: 'clamp(10px, 3vh, 50px)', // Responsive margin top réduite
        marginBottom: '0px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {/* Animation de fond */}
        <Canvas
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
          camera={{ position: [0, 0, 6] }}
          dpr={window.devicePixelRatio}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <DitheredWaves />
        </Canvas>

        {/* Contenu par-dessus */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(8px, 2vw, 15px)',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}>
          
          {/* Texte au-dessus */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '0 0 auto',
            padding: 'clamp(8px, 2vw, 20px) clamp(4px, 1.2vw, 12px)',
            boxSizing: 'border-box'
          }}>
            {/* Brand discret */}
            <p style={{ 
              fontSize: 'clamp(8px, 2.5vw, 16px)',
              fontWeight: '300',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'rgba(255, 255, 255, 0.6)',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              lineHeight: '1.2',
              margin: '0 0 clamp(8px, 2vw, 15px) 0',
              textAlign: 'center',
              width: '100%',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              -Marginal mouvement-
            </p>
            
            {/* Texte principal */}
            <p style={{ 
              fontSize: 'clamp(14px, 8vw, 40px)',
              fontWeight: '900',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'white',
              textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
              lineHeight: '1.2',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              letterSpacing: '-0.02em',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              Il cesse de suivre aveuglement une voie qu'il n'a pas choisie.
            </p>
          </div>

          {/* Image en dessous - carrée */}
          <div style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 'clamp(8px, 2.5vw, 15px)',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'clamp(10px, 2vw, 20px) auto'
          }}>
            <img 
              src="/src/assets/images/messages.png" 
              alt="Messages"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Texte en dessous de l'image */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            padding: '0 clamp(5px, 1.5vw, 12px) clamp(15px, 3vw, 25px) clamp(5px, 1.5vw, 12px)'
          }}>
            <p style={{ 
              fontSize: 'clamp(12px, 3.5vw, 18px)',
              fontWeight: '400',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
              lineHeight: '1.2',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              letterSpacing: '0.05em',
              fontStyle: 'italic'
            }}>
              Feeling the [dé]click.
            </p>
          </div>
          
        </div>
      </div>

      {/* Galerie circulaire */}
      <div style={{ 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        height: '400px', 
        position: 'relative',
        background: '#000',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}>
        <CircularGallery 
          bend={0.5} 
          textColor="#ffffff" 
          borderRadius={0.15} 
          scrollSpeed={2}
          scrollEase={0.06}
        />
      </div>

      {/* Conteneur regroupant bouton, texte et image */}
      <div
        style={{
          width: '100%',
          maxWidth: '450px', // Taille max sur grand écran
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderRadius: 'clamp(15px, 4vw, 25px)', // Responsive border radius
          overflow: 'hidden', // Pour que l'animation respecte les bords arrondis
          padding: 'clamp(15px, 3vw, 20px) 0', // Responsive padding
          margin: '50px auto 0 auto' // Centrage automatique avec margin top
        }}
      >
        {/* Fond avec motifs géométriques plus visibles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: `
            radial-gradient(circle at 20% 80%, rgba(60, 0, 255, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(60, 0, 255, 0.09) 0%, transparent 60%),
            radial-gradient(circle at 40% 40%, rgba(60, 0, 255, 0.06) 0%, transparent 50%),
            linear-gradient(45deg, transparent 45%, rgba(60, 0, 255, 0.04) 46%, rgba(60, 0, 255, 0.04) 48%, transparent 49%),
            linear-gradient(-45deg, transparent 45%, rgba(60, 0, 255, 0.03) 46%, rgba(60, 0, 255, 0.03) 48%, transparent 49%),
            #000000
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 30px 30px, 30px 30px, 100% 100%'
        }}></div>
        
        {/* Effets de fade sur tous les côtés */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: `
            linear-gradient(to bottom, rgba(17, 17, 17, 0.8) 0%, transparent 15%, transparent 85%, rgba(17, 17, 17, 0.8) 100%),
            linear-gradient(to right, rgba(17, 17, 17, 0.6) 0%, transparent 10%, transparent 90%, rgba(17, 17, 17, 0.6) 100%)
          `,
          pointerEvents: 'none'
        }} />
        {/* Bouton vers la boutique */}
        <div 
          ref={buttonRef}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 clamp(8px, 1.5vw, 20px) clamp(6px, 1.2vw, 15px) clamp(8px, 1.5vw, 20px)',
            opacity: buttonVisible ? 1 : 0,
            transform: buttonVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
            transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            zIndex: 2,
            boxSizing: 'border-box'
          }}
        >
          <a 
            href="https://marginalmouvement.com/collections/all"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: 'clamp(16px, 4vw, 30px) clamp(20px, 4.5vw, 40px)',
              background: 'transparent',
              border: '2px solid #ffffff',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 'clamp(14px, 4vw, 26px)',
              fontWeight: '600',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              borderRadius: '0',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
              boxSizing: 'border-box',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              lineHeight: '1.2'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ffffff';
            }}
          >
            Découvrir la boutique
          </a>
        </div>

        {/* Texte philosophique */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(8px, 2vw, 15px) clamp(15px, 3vw, 25px) clamp(40px, 8vw, 60px) clamp(15px, 3vw, 25px)',
            position: 'relative',
            zIndex: 2
          }}
        >
          <ScrollReveal
            baseOpacity={0}
            enableBlur={false}
            baseRotation={5}
            blurStrength={10}
            containerClassName=""
            textClassName=""
          >
            Etre Marginal c'est sortir des cases, c'est suivre son propre destin sans être prisonnier d'un monde qui nous contraint à faire taire nos différences et nos opinions.
          </ScrollReveal>

          {/* Image sérigraphie */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'clamp(15px, 3vw, 25px)'
            }}
          >
            <img
              src="/src/assets/images/insta.png"
              alt="Instagram"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1/1',
                objectFit: 'cover',
                borderRadius: 'clamp(10px, 2.5vw, 15px)'
              }}
            />
          </div>
          
          {/* Texte "sois marginal" */}
          <div 
            ref={textRef}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '30px',
              padding: '0 20px',
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <h1 style={{
              fontSize: 'clamp(24px, 8vw, 48px)',
              fontWeight: '900',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'white',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
              lineHeight: '1.2',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              sois marginal
            </h1>
          </div>
          
          {/* Boutons d'action */}
          <div 
            ref={actionButtonsRef}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'clamp(8px, 1.5vw, 15px)',
              marginTop: 'clamp(30px, 5vw, 50px)',
              padding: '0 clamp(15px, 3vw, 25px)',
              opacity: actionButtonsVisible ? 1 : 0,
              transform: actionButtonsVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.8)',
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Bouton Partager */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Marginal Mouvement',
                    text: 'Découvre le mouvement Marginal',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié dans le presse-papiers !');
                }
              }}
              style={{
                padding: 'clamp(12px, 2.5vw, 22px) clamp(15px, 3.5vw, 30px)',
                background: 'transparent',
                border: '2px solid #ffffff',
                color: '#ffffff',
                fontSize: 'clamp(12px, 3vw, 18px)',
                fontWeight: '600',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderRadius: '0',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                flex: '1',
                display: 'block',
                textAlign: 'center',
                boxSizing: 'border-box',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                lineHeight: '1.2'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#ffffff';
              }}
            >
              Partager
            </button>
            
            {/* Bouton À propos */}
            <a
              href="https://marginalmouvement.com/pages/histoire-du-fondateur"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: 'clamp(12px, 2.5vw, 22px) clamp(15px, 3.5vw, 30px)',
                background: 'transparent',
                border: '2px solid #ffffff',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 'clamp(12px, 3vw, 18px)',
                fontWeight: '600',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderRadius: '0',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                flex: '1',
                textAlign: 'center',
                boxSizing: 'border-box',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                lineHeight: '1.2'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#ffffff';
              }}
            >
              À propos
            </a>
          </div>
        </div>
        </div>
      </div>
  );
}

export default App;