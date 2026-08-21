import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
