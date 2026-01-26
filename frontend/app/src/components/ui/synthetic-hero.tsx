"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal-animation";
import { GradientText } from "@/components/ui/gradient-text";
import { WordRotate } from "@/components/ui/word-rotate";

interface ShaderPlaneProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: { value: unknown } };
}

const ShaderPlane = ({ vertexShader, fragmentShader, uniforms }: ShaderPlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime * 0.5;
      material.uniforms.u_resolution.value.set(size.width, size.height, 1.0);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_resolution;

  vec2 toPolar(vec2 p) {
      float r = length(p);
      float a = atan(p.y, p.x);
      return vec2(r, a);
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 p = 6.0 * ((fragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);

      vec2 polar = toPolar(p);
      float r = polar.x;

      vec2 i = p;
      float c = 0.0;
      float rot = r + u_time + p.x * 0.100;
      for (float n = 0.0; n < 4.0; n++) {
          float rr = r + 0.15 * sin(u_time*0.7 + float(n) + r*2.0);
          p *= mat2(
              cos(rot - sin(u_time / 10.0)), sin(rot),
              -sin(cos(rot) - u_time / 10.0), cos(rot)
          ) * -0.25;

          float t = r - u_time / (n + 30.0);
          i -= p + sin(t - i.y) + rr;

          c += 2.2 / length(vec2(
              (sin(i.x + t) / 0.15),
              (cos(i.y + t) / 0.15)
          ));
      }

      c /= 8.0;

      // Cyan/blue color scheme
      vec3 baseColor = vec3(0.2, 0.5, 0.7);
      vec3 finalColor = baseColor * smoothstep(0.0, 1.0, c * 0.6);

      fragColor = vec4(finalColor, 1.0);
  }

  void main() {
      vec4 fragColor;
      vec2 fragCoord = vUv * u_resolution.xy;
      mainImage(fragColor, fragCoord);
      gl_FragColor = fragColor;
  }
`;

interface SyntheticHeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: Array<{ text: string; href?: string; primary?: boolean; isAnchor?: boolean }>;
  microDetails?: Array<string>;
}

export function SyntheticHero({
  title = "An experiment in light, motion, and the quiet chaos between.",
  description = "Experience a new dimension of interaction — fluid, tactile, and alive. Designed for creators who see beauty in motion.",
  badgeText = "React Three Fiber",
  badgeLabel = "Experience",
  ctaButtons = [
    { text: "Explore the Canvas", href: "#explore", primary: true },
    { text: "Learn More", href: "#learn-more" },
  ],
  microDetails = [],
}: SyntheticHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const shaderUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector3(1, 1, 1) },
    }),
    []
  );

  // Shader fade on scroll - fixed position parallax
  const { scrollY } = useScroll();
  const shaderOpacity = useTransform(scrollY, [0, 800, 2000], [1, 0.6, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden pt-0 pointer-events-none"
    >
      {/* Shader Background - Fixed position for Parallax Effect */}
      <motion.div 
        style={{ opacity: shaderOpacity, pointerEvents: 'none' }} 
        className="fixed inset-0 z-0 h-full w-full"
      >
        <Canvas style={{ pointerEvents: 'none' }} eventSource={undefined as unknown as HTMLElement}>
          <ShaderPlane
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={shaderUniforms}
          />
        </Canvas>
        
        {/* Atmosphere overlays - No hard bottom edge */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#020617_120%)] opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl mx-auto pointer-events-auto mt-[-5vh]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Badge className="mb-8 bg-white/10 hover:bg-white/15 text-cyan-300 backdrop-blur-md border border-white/20 uppercase tracking-wider font-medium flex items-center gap-2 px-5 py-2">
            <span className="text-[10px] font-light tracking-[0.18em] text-cyan-100/80">
              {badgeLabel}
            </span>
            <span className="h-1 w-1 rounded-full bg-cyan-200/60" />
            <span className="text-xs font-light tracking-tight text-cyan-200">
              {badgeText}
            </span>
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl max-w-5xl font-display font-semibold tracking-tight leading-tight overflow-visible">
            <GradientText className="!text-transparent pb-3">
              {title}
            </GradientText>
          </h1>
        </motion.div>

        {/* Rotating Words Section */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: false }}
           transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
           className="mb-8 flex flex-col md:flex-row items-center justify-center gap-0:gap-0 text-2xl md:text-3xl font-light text-slate-300"
        >
          <span>I&apos;m a passionate</span>
          <WordRotate
            words={["Full Stack Developer", "Problem Solver", "Creative Thinker", "Backend Engineer", "Data Scientist", "Frontend Developer"]}
            className="font-mono font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#38bdf8] to-[#818cf8] px-1"
            duration={3000}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          {ctaButtons.map((button, index) => {
            const isPrimary = button.primary ?? index === 0;
            const classes = isPrimary
              ? "px-10 py-4 rounded-xl text-lg font-medium backdrop-blur-lg bg-cyan-400/90 hover:bg-cyan-300/90 shadow-xl transition-all cursor-pointer text-slate-950"
              : "px-10 py-4 rounded-xl text-lg font-medium border-white/30 text-white hover:bg-white/10 backdrop-blur-lg transition-all cursor-pointer";

            if (button.href) {
              const href = button.href;
              // Check if it's an anchor link using the isAnchor flag
              if (button.isAnchor || href.startsWith("#")) {
                return (
                  <Button
                    key={index}
                    variant={isPrimary ? undefined : "outline"}
                    className={classes}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector(href);
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {button.text}
                  </Button>
                );
              }
              
              // Otherwise, it's a page navigation link (hero only on /; native <a> for nav)
              return (
                <Button key={index} variant={isPrimary ? undefined : "outline"} className={classes} asChild>
                  <a href={href}>{button.text}</a>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant={isPrimary ? undefined : "outline"}
                className={classes}
              >
                {button.text}
              </Button>
            );
          })}
        </motion.div>

        {microDetails.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            className="mt-10 flex flex-wrap justify-center gap-6 text-xs font-light tracking-tight text-cyan-100/70"
          >
            {microDetails.map((detail, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-200/60" />
                {detail}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
