import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BarState = 'default' | 'compare' | 'swap' | 'overwrite' | 'pivot' | 'sorted'

export interface BarProps {
  value: number
  maxValue: number
  state: BarState
  dimmed?: boolean
  elementId?: number
  showValue?: boolean
}

export function Bar({ value, maxValue, state, elementId, dimmed = false, showValue = true }: BarProps) {
  const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 5
  const h = Math.max(7, heightPercent)

  // Premium HSL-based color system
  const colorMap: Record<BarState, string> = {
    default:
      'bg-primary/25 dark:bg-primary/30 border-primary/20',
    compare:
      'bg-gradient-to-t from-primary to-blue-400 dark:from-primary dark:to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    swap: 'bg-gradient-to-t from-rose-500 to-rose-400 dark:from-rose-600 dark:to-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.35)]',
    overwrite:
      'bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500',
    pivot:
      'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    sorted:
      'bg-emerald-500/90 dark:bg-emerald-600/70 shadow-[0_4px_15px_rgba(16,185,129,0.15)]',
  }

  const isSpec = state !== 'default' && state !== 'sorted'

  return (
    <div
      className={`group relative flex h-full w-full flex-col items-center justify-end px-[1px] transition-all duration-500 sm:px-[2px] ${dimmed ? 'opacity-40 grayscale-[0.3]' : 'opacity-100'}`}
      style={{ zIndex: isSpec ? 20 : 1 }}
    >
      {/* Dynamic Glow Effect for Active Elements */}
      <AnimatePresence>
        {isSpec && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none absolute -inset-2 rounded-full bg-white/20 blur-xl dark:bg-white/5"
          />
        )}
      </AnimatePresence>

      {/* Floating Value Label */}
      {showValue && (
        <motion.div
          animate={{
            y: `-${h}%`, // Perfectly match bar height percentage
            opacity: 1,
            scale: isSpec ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none absolute z-30 flex flex-col items-center whitespace-nowrap`}
          style={{ marginBottom: '1.25rem' }} // Add fixed pixel gap above the bar
        >
          <span
            className={cn(
              'text-[10px] font-black font-mono tracking-tighter tabular-nums transition-colors duration-300 sm:text-[11px]',
              isSpec
                ? 'scale-110 text-foreground drop-shadow-md'
                : 'text-muted-foreground'
            )}
          >
            {value}
            {elementId !== undefined && <small className="block text-[9px]">#{elementId + 1}</small>}
          </span>
          {isSpec && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 8 }}
              className={cn(
                'mt-0.5 w-0.5 rounded-full shadow-sm',
                state === 'swap'
                  ? 'bg-rose-500'
                  : state === 'compare'
                    ? 'bg-primary'
                    : state === 'pivot'
                      ? 'bg-amber-500'
                      : 'bg-muted-foreground'
              )}
            />
          )}
        </motion.div>
      )}

      {/* The Bar Itself */}
      <motion.div
        layout
        initial={{ height: 0 }}
        animate={{
          height: `${h}%`,
          filter: isSpec ? 'brightness(1.1)' : 'brightness(1)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 0.5,
        }}
        className={`relative w-full rounded-t-xl transition-all duration-300 ${colorMap[state]} cursor-default overflow-hidden border-x border-t border-white/30 shadow-sm active:scale-95 dark:border-white/5`}
      >
        {/* Shine/Reflection effect */}
        <div className="pointer-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

        {/* Subtle pattern for texture */}
        <div className="pointer-none absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:4px_4px] opacity-[0.03] dark:opacity-[0.07]" />
      </motion.div>
    </div>
  )
}
