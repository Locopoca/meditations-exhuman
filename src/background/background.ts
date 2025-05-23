import * as THREE from 'three'

export function initBackground() {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  const backgroundDiv = document.getElementById('three-background')
  if (backgroundDiv) {
    backgroundDiv.appendChild(renderer.domElement)
  }

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

      #define FBI floatBitsToInt
      #define FFBI(a) FBI(cos(a))^FBI(a)

      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      uniform float u_time;

      float hash(vec3 uv){
        int x = FFBI(uv.x);
        int y = FFBI(uv.y);
        int z = FFBI(uv.z);
        return float((x*x+y)*(y*y-x)*(z*z+x))/2.14e9;
      }

      void dogrid(vec3 ro,vec3 rd,float size){
        gr.id = (floor(ro+rd*1E-3)/size+.5)*size;
        vec3 src = -(ro-gr.id)/rd;
        vec3 dst = abs(.5*size)/rd;
        vec3 bz = src+dst;
        gr.d = min(bz.x,min(bz.y,bz.z));
      }

      vec3 erot(vec3 p,vec3 ax,float t){
        return mix(dot(ax,p)*ax,p,cos(t))+cross(ax,p)*sin(t);
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord)
      {
        vec2 uv = (fragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        // Adjust UV to center with the container (80% width, max 1000px)
        float containerWidth = min(1000.0, u_resolution.x * 0.8); // Container width in pixels
        float offsetX = (u_resolution.x - containerWidth) / (2.0 * u_resolution.y); // Center offset
        uv.x -= offsetX;
        vec2 mouse = u_mouse / u_resolution.xy;
        
        vec3 col = vec3(0.);
        vec3 ro = vec3(0.4 + mouse.x * 7.0, 0.4 + mouse.y * 7.0, -5.);
        vec3 rt = vec3(mouse.x * 4.0, mouse.y * 4.0, 0.);
        
        vec3 z = normalize(rt-ro);
        vec3 x = normalize(cross(z,vec3(0.,-1.,0.)));
        vec3 y = cross(z,x);
        vec3 rd = mat3(x,y,z)*normalize(vec3(uv,2.+tanh(hash(uv.xyy+u_time)*.5+10.*sin(u_time))));
        
        float i,e,g;
        float gridlen = 0.;
        
        for(i=0.,e=.01,g=0.;i++<99.;){
          vec3 p = ro+rd*g;
          vec3 oop=p;
          p = erot(p,normalize(sin(u_time*.33+vec3(-.6,.4,.2))),u_time*.071);
          p.z+=u_time*.7;
          
          vec3 op=p;       
          if(gridlen <=g){
            dogrid(p,rd,1.);
            gridlen+=gr.d;
          }
          p-=gr.id;
          float gy = dot(sin(gr.id*2.),cos(gr.id.zxy*5.));
          float rn = hash(gr.id+floor(u_time));
          p.x +=sin(rn)*.25;
          
          float h = rn> .0 ? .5:length(p)-.01-gy*.05+rn*.02;
          
          g+=e= max(.001+op.z*.000002, abs(h));
          // Modified color to incorporate pink (base) and gold (highlight)
          col+=mix(vec3(1.0, 0.75, 0.8), vec3(1.0, 0.84, 0.0), abs(rn))*(0.025+(.02*exp(5.*fract(gy+u_time))))/exp(e*e*i);
        }
        
        col*=exp(-.07*g);
        fragColor = vec4(sqrt(col),1.0);
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `
  })

  const geometry = new THREE.PlaneGeometry(2, 2)
  const plane = new THREE.Mesh(geometry, material)
  scene.add(plane)

  let mouse = new THREE.Vector2()
  const handleMove = (event: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    mouse.x = clientX
    mouse.y = window.innerHeight - clientY
    material.uniforms.u_mouse.value = mouse
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove, { passive: true })

  function animate(time: number) {
    material.uniforms.u_time.value = time * 0.00008
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate(0)

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
  })

  return () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
  }
}