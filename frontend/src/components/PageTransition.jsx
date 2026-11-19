
import { motion } from 'framer-motion'

function PageTransition({ children, type = 'page' }) {
  const variants = {
    welcome: {
      initial: { opacity: 0, scale: 1.03 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.92, y: -20 },
    },
    dashboard: {
      initial: { opacity: 0, x: 70, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -25 },
    },
    page: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
  }

  return (
    <motion.div
      variants={variants[type] || variants.page}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
