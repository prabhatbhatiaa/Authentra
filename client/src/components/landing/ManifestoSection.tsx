import { useRef } from 'react';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import { SectionLabel } from './SectionLabel';

const statement =
  'Trust cannot be assumed. It has to be computed, verified and anchored — by mathematics anyone can check, not by a database only one party controls.';

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export function ManifestoSection() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 50%'] });
  const words = statement.split(' ');

  return (
    <section data-scene="sphere" data-x="0.66" data-y="0" data-scale="1" data-opacity="0.5" data-rx="0.5" className="relative">
      <SectionLabel index="01" label="Thesis" />
      <div className="gutter grid grid-cols-12 py-24 lg:py-40">
        <p
          ref={ref}
          className="col-span-12 font-serif text-[clamp(2.2rem,5.4vw,5.6rem)] leading-[1.02] tracking-[-0.025em] text-fg lg:col-span-10"
        >
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>
      </div>
    </section>
  );
}
