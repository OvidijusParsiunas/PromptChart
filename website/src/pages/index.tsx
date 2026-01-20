import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useState, useRef, useEffect, useCallback} from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import styles from './index.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({x: 0, y: 0});

  const createParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 15000);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      particlesRef.current = createParticles(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const particleColor = isDark ? '147, 155, 255' : '99, 91, 255';
      const lineColor = isDark ? '147, 155, 255' : '99, 91, 255';

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > rect.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > rect.height) particle.vy *= -1;

        // Keep in bounds
        particle.x = Math.max(0, Math.min(rect.width, particle.x));
        particle.y = Math.max(0, Math.min(rect.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
        ctx.fill();

        // Draw connections to nearby particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${0.04 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse interaction - subtle attraction
        const mx = mouseRef.current.x - particle.x;
        const my = mouseRef.current.y - particle.y;
        const mouseDist = Math.sqrt(mx * mx + my * my);
        if (mouseDist < 150 && mouseDist > 0) {
          particle.vx += (mx / mouseDist) * 0.01;
          particle.vy += (my / mouseDist) * 0.01;
          // Limit velocity
          const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
          if (speed > 0.8) {
            particle.vx = (particle.vx / speed) * 0.8;
            particle.vy = (particle.vy / speed) * 0.8;
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createParticles]);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

const EXAMPLE_PROMPTS = [
  'Monthly sales by region',
  'User signups trend this year',
  'Product revenue as a pie chart',
  'Orders by status',
  'Top 5 products by profit',
];

function DemoSectionContent() {
  const [prompt, setPrompt] = useState('User signups trend this year');
  const [isGenerating, setIsGenerating] = useState(false);
  const chartRef = useRef<any>(null);
  const [PromptChartComponent, setPromptChartComponent] = useState<any>(null);
  const {isDarkTheme} = useColorMode();
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    import('prompt-chart-react').then((mod) => {
      setPromptChartComponent(() => mod.PromptChart);
    });
  }, []);

  useEffect(() => {
    if (PromptChartComponent && chartRef.current && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setIsGenerating(true);
      chartRef.current.prompt = prompt;
      chartRef.current.fetchChart();
    }
  }, [PromptChartComponent]);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    chartElement.onChartLoaded = () => {
      setIsGenerating(false);
    };

    chartElement.onChartError = () => {
      setIsGenerating(false);
    };
  }, [PromptChartComponent]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.prompt = prompt;
      chartElement.fetchChart();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setIsGenerating(true);

    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.prompt = examplePrompt;
      chartElement.fetchChart();
    }
  };

  return (
    <>
      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the chart you want to see..."
            className={styles.promptInput}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={clsx('button button--primary button--lg', styles.generateButton)}
          >
            {isGenerating ? 'Generating...' : 'Generate Chart'}
          </button>
        </div>

        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Try these demo examples:</span>
          <div className={styles.examplePrompts}>
            {EXAMPLE_PROMPTS.map((example) => (
              <button key={example} className={styles.examplePrompt} onClick={() => handleExampleClick(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {PromptChartComponent ? (
          <PromptChartComponent
            ref={chartRef}
            demo={true}
            style={{backgroundColor: isDarkTheme ? '#1b1b1d80' : '#fafbfc80'}}
          />
        ) : (
          <div className={styles.chartLoading}>Loading chart component...</div>
        )}
      </div>
    </>
  );
}

function DemoSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <section className={styles.demoSection}>
      <BrowserOnly>{() => <ParticleBackground />}</BrowserOnly>
      <div className="container">
        <Heading as="h1" className={styles.demoTitle}>
          <img src="/img/logo.png" alt="" className={styles.titleLogo} />
          {siteConfig.title}
        </Heading>
        <p className={styles.demoSubtitle}>A framework-agnostic system that transforms natural language into charts</p>

        <BrowserOnly fallback={<div className={styles.chartLoading}>Loading...</div>}>
          {() => <DemoSectionContent />}
        </BrowserOnly>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: '🔌',
    title: 'Framework Agnostic',
    description: 'Works with React, Vue, Svelte, Angular, or vanilla JS. One component, any framework.',
  },
  {
    icon: '🧠',
    title: 'LLM-Powered Intent',
    description: 'Natural language is converted to a validated JSON spec. No SQL generation, no code execution.',
  },
  {
    icon: '🔒',
    title: 'Safe by Design',
    description: 'Schema-validated queries with allow-listed fields only. The LLM never touches your database.',
  },
  {
    icon: '📊',
    title: 'Flexible Rendering',
    description: 'Supports Chart.js, ECharts, or Vega. Bring your own charting library.',
    wide: true,
  },
  {
    icon: '🔧',
    title: 'Pluggable Adapters',
    description: 'Connect to SQL, REST APIs, CSV files, or custom data sources through a simple adapter interface.',
  },
];

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Heading as="h2" className={styles.featuresTitle}>
          Why PromptChart?
        </Heading>
        <p className={styles.featuresSubtitle}>A safe, extensible architecture for natural language data visualization</p>

        <div className={styles.bentoGrid}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={clsx(styles.bentoCard, feature.wide && styles.bentoCardWide)}>
              <div className={styles.bentoIcon}>{feature.icon}</div>
              <h3 className={styles.bentoCardTitle}>{feature.title}</h3>
              <p className={styles.bentoCardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <main>
        <DemoSection />
        <FeaturesSection />
      </main>
    </Layout>
  );
}
