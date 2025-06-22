import React from 'react'
import { AnimatePresence, motion } from "framer-motion"
export default function AnimationWrapper({ children, keyValue,className, initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 0.5 } }) {
    return (
        <AnimatePresence>
            <motion.div key={keyValue} initial={initial} animate={animate} transition={transition} className={className}>
                {children}
            </motion.div>
        </AnimatePresence>

    )
}
