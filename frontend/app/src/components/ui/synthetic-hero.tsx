"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useScroll, useTransform } from "framer-motion";

gsap.registerPlugin(SplitText, useGSAP, ScrollTrigger);

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
  const badgeWrapperRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const microRef = useRef<HTMLUListElement | null>(null);

  const shaderUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector3(1, 1, 1) },
    }),
    []
  );

  // Shader fade on scroll - extended fade for smoother transition
  const { scrollY } = useScroll();
  const shaderOpacity = useTransform(scrollY, [0, 2000], [1, 0]);

  useGSAP(
    () => {
      if (!headingRef.current || !sectionRef.current) return;

      document.fonts.ready.then(() => {
        const split = new SplitText(headingRef.current!, {
          type: "lines",
          linesClass: "hero-lines",
        });

        gsap.set(split.lines, {
          filter: "blur(16px)",
          yPercent: 24,
          autoAlpha: 0,
          scale: 1.04,
          transformOrigin: "50% 100%",
        });

        if (badgeWrapperRef.current) {
          gsap.set(badgeWrapperRef.current, { autoAlpha: 0, y: -8 });
        }
        if (paragraphRef.current) {
          gsap.set(paragraphRef.current, { autoAlpha: 0, y: 8 });
        }
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { autoAlpha: 0, y: 8 });
        }

        const microItems = microRef.current
          ? Array.from(microRef.current.querySelectorAll("li"))
          : [];
        if (microItems.length > 0) {
          gsap.set(microItems, { autoAlpha: 0, y: 6 });
        }

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play reverse play reverse",
          },
        });

        if (badgeWrapperRef.current) {
          tl.to(badgeWrapperRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
        }

        tl.to(
          split.lines,
          {
            filter: "blur(0px)",
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
          },
          0.1
        );

        if (paragraphRef.current) {
          tl.to(paragraphRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.55");
        }

        if (ctaRef.current) {
          tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35");
        }

        if (microItems.length > 0) {
          tl.to(microItems, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.25");
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden pt-24 md:pt-32 pointer-events-none"
    >
      {/* Only Shader Background - fades on scroll */}
      <motion.div style={{ opacity: shaderOpacity, pointerEvents: 'none' }} className="absolute inset-0 z-0">
        <Canvas style={{ pointerEvents: 'none' }} eventSource={undefined as unknown as HTMLElement}>
          <ShaderPlane
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={shaderUniforms}
          />
        </Canvas>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl mx-auto pointer-events-auto">
        <div ref={badgeWrapperRef}>
          <Badge className="mb-8 bg-white/10 hover:bg-white/15 text-cyan-300 backdrop-blur-md border border-white/20 uppercase tracking-wider font-medium flex items-center gap-2 px-5 py-2">
            <span className="text-[10px] font-light tracking-[0.18em] text-cyan-100/80">
              {badgeLabel}
            </span>
            <span className="h-1 w-1 rounded-full bg-cyan-200/60" />
            <span className="text-xs font-light tracking-tight text-cyan-200">
              {badgeText}
            </span>
          </Badge>
        </div>

        <h1
          ref={headingRef}
          className="text-6xl md:text-8xl lg:text-9xl max-w-5xl font-light tracking-tight text-white mb-8 overflow-hidden leading-tight"
        >
          {title}
        </h1>

        <p
          ref={paragraphRef}
          className="text-cyan-50/80 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-light leading-relaxed"
        >
          {description}
        </p>

        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-5">
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
        </div>

        {microDetails.length > 0 && (
          <ul
            ref={microRef}
            className="mt-10 flex flex-wrap justify-center gap-6 text-xs font-light tracking-tight text-cyan-100/70"
          >
            {microDetails.map((detail, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-200/60" />
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
