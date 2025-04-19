'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouse = useRef(new THREE.Vector2())

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        struct Grid {
          vec3 id;
          float d;
        } gr;

        uniform vec2 u_mouse;
        uniform vec2 u_resolution;
        uniform float u_time;

        // Simplified hash function for better performance
        float hash(vec3 uv) {
          return fract(sin(dot(uv, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
        }

        void dogrid(vec3 ro, vec3 rd, float size) {
          gr.id = (floor(ro + rd * 1E-3) / size + 0.5) * size;
          vec3 src = -(ro - gr.id) / rd;
          vec3 dst = abs(0.5 * size) / abs(rd);
          vec3 bz = src + dst;
          gr.d = min(bz.x, min(bz.y, bz.z));
        }

        vec3 erot(vec3 p, vec3 ax, float t) {
          return mix(dot(ax, p) * ax, p, cos(t)) + cross(ax, p) * sin(t);
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 uv = (fragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
          vec2 mouse = u_mouse / u_resolution.xy;

          vec3 col = vec3(0.);
          vec3 ro = vec3(0.4 + mouse.x * 7.0, 0.4 + mouse.y * .0, -5.);
          vec3 rt = vec3(mouse.x * 2.0, mouse.y * 2.0, 0.);

          vec3 z = normalize(rt - ro);
          vec3 x = normalize(cross(z, vec3(0., -1., 0.)));
          vec3 y = cross(z, x);
          vec3 rd = mat3(x, y, z) * normalize(vec3(uv, 2.0));

          float i, e, g;
          float gridlen = 0.;

          // Light pink base color (#ffb6c1)
          vec3 baseColor = vec3(1.0, 0.7137, 0.7569); // RGB for #ffb6c1
          // Gold highlight color (#ffd700)
          vec3 highlightColor = vec3(1.0, 0.8431, 0.0); // RGB for #ffd700

          for(i = 0., e = 0.01, g = 0.; i++ < 50.;) { // Reduced iterations from 99 to 50
            vec3 p = ro + rd * g;
            p = erot(p, normalize(sin(u_time * 0.33 + vec3(-0.6, 0.4, 0.2))), u_time * 0.071);
            p.z += u_time * 0.7;

            if(gridlen <= g) {
              dogrid(p, rd, 1.);
              gridlen += gr.d;
            }
            p -= gr.id;
            float gy = dot(sin(gr.id * 2.), cos(gr.id.zxy * 5.));
            float rn = hash(gr.id + floor(u_time));
            p.x += sin(rn) * 0.25;

            float h = length(p) - 0.01 - gy * 0.05 + rn * 0.02;

            g += e = max(0.001, abs(h));

            // Holographic effect: Iridescent colors for bubbles
            float intensity = 0.025 + (0.02 * exp(3. * fract(gy + u_time))); // Reduced exp factor
            // Iridescent color shift
            vec3 holoColor = 0.5 + 0.5 * vec3(
              sin(u_time + gy + 0.0),
              sin(u_time + gy + 2.0),
              sin(u_time + gy + 4.0)
            );
            // Mix base color with holographic effect and gold highlights
            vec3 bubbleColor = mix(baseColor, holoColor, intensity);
            bubbleColor = mix(bubbleColor, highlightColor, intensity * 0.5);
            col += bubbleColor * intensity / exp(e * e * i);
          }

          col *= exp(-0.07 * g);
          fragColor = vec4(sqrt(col), 1.0);
        }

        void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
        }
      `
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      mouse.current.x = clientX
      mouse.current.y = window.innerHeight - clientY
      material.uniforms.u_mouse.value = mouse.current
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: true })

    const animate = (time: number) => {
      material.uniforms.u_time.value = time * 0.00008
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate(0)

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.remove()
      renderer.dispose()
    }
  }, [])

  return <div className="background" ref={containerRef}></div>
}