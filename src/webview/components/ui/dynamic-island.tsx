import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState
} from 'react'
import { cn } from '@webview/utils/common'
import {
  AnimatePresence,
  motion,
  useWillChange,
  type HTMLMotionProps
} from 'framer-motion'

// Constants
const ANIMATION = {
  stiffness: 400,
  damping: 30
} as const

const DIMENSIONS = {
  MIN_WIDTH: 691,
  MAX_HEIGHT_MOBILE_ULTRA: 400,
  MAX_HEIGHT_MOBILE_MASSIVE: 700
} as const

// Types
export type SizePresets =
  | 'reset'
  | 'empty'
  | 'default'
  | 'compact'
  | 'compactLong'
  | 'large'
  | 'long'
  | 'minimalLeading'
  | 'minimalTrailing'
  | 'compactMedium'
  | 'medium'
  | 'tall'
  | 'ultra'
  | 'massive'

export const SIZE_PRESETS = {
  RESET: 'reset',
  EMPTY: 'empty',
  DEFAULT: 'default',
  COMPACT: 'compact',
  COMPACT_LONG: 'compactLong',
  LARGE: 'large',
  LONG: 'long',
  MINIMAL_LEADING: 'minimalLeading',
  MINIMAL_TRAILING: 'minimalTrailing',
  COMPACT_MEDIUM: 'compactMedium',
  MEDIUM: 'medium',
  TALL: 'tall',
  ULTRA: 'ultra',
  MASSIVE: 'massive'
} as const

interface Preset {
  width: number
  height?: number
  aspectRatio: number
  borderRadius: number
}

const DynamicIslandSizePresets: Record<SizePresets, Preset> = {
  [SIZE_PRESETS.RESET]: {
    width: 150,
    aspectRatio: 1,
    borderRadius: 20
  },
  [SIZE_PRESETS.EMPTY]: {
    width: 0,
    aspectRatio: 0,
    borderRadius: 0
  },
  [SIZE_PRESETS.DEFAULT]: {
    width: 150,
    aspectRatio: 44 / 150,
    borderRadius: 46
  },
  [SIZE_PRESETS.MINIMAL_LEADING]: {
    width: 52.33,
    aspectRatio: 44 / 52.33,
    borderRadius: 22
  },
  [SIZE_PRESETS.MINIMAL_TRAILING]: {
    width: 52.33,
    aspectRatio: 44 / 52.33,
    borderRadius: 22
  },
  [SIZE_PRESETS.COMPACT]: {
    width: 235,
    aspectRatio: 44 / 235,
    borderRadius: 46
  },
  [SIZE_PRESETS.COMPACT_LONG]: {
    width: 300,
    aspectRatio: 44 / 235,
    borderRadius: 46
  },
  [SIZE_PRESETS.COMPACT_MEDIUM]: {
    width: 351,
    aspectRatio: 64 / 371,
    borderRadius: 44
  },
  [SIZE_PRESETS.LONG]: {
    width: 371,
    aspectRatio: 84 / 371,
    borderRadius: 42
  },
  [SIZE_PRESETS.MEDIUM]: {
    width: 371,
    aspectRatio: 210 / 371,
    borderRadius: 22
  },
  [SIZE_PRESETS.LARGE]: {
    width: 371,
    aspectRatio: 84 / 371,
    borderRadius: 42
  },
  [SIZE_PRESETS.TALL]: {
    width: 371,
    aspectRatio: 210 / 371,
    borderRadius: 42
  },
  [SIZE_PRESETS.ULTRA]: {
    width: 630,
    aspectRatio: 630 / 800,
    borderRadius: 42
  },
  [SIZE_PRESETS.MASSIVE]: {
    width: 891,
    height: 1900,
    aspectRatio: 891 / 891,
    borderRadius: 42
  }
}

interface BlobStateType {
  size: SizePresets
  previousSize: SizePresets | undefined
  animationQueue: Array<AnimationStep>
  isAnimating: boolean
}

interface AnimationStep {
  size: SizePresets
  delay: number
}

type BlobAction =
  | { type: 'SET_SIZE'; newSize: SizePresets }
  | { type: 'INITIALIZE'; firstState: SizePresets }
  | { type: 'SCHEDULE_ANIMATION'; animationSteps: AnimationStep[] }
  | { type: 'ANIMATION_END' }

interface BlobContextType {
  state: BlobStateType
  dispatch: React.Dispatch<BlobAction>
  setSize: (size: SizePresets) => void
  scheduleAnimation: (animationSteps: AnimationStep[]) => void
  presets: Record<SizePresets, Preset>
}

interface DynamicIslandProviderProps {
  children: ReactNode
  initialSize?: SizePresets
  initialAnimation?: AnimationStep[]
}

interface DynamicIslandProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
}

interface DynamicIslandContentProps extends DynamicIslandProps {
  willChange: ReturnType<typeof useWillChange>
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

// Context
const BlobContext = createContext<BlobContextType | undefined>(undefined)

// Reducer
const blobReducer = (
  state: BlobStateType,
  action: BlobAction
): BlobStateType => {
  switch (action.type) {
    case 'SET_SIZE':
      return {
        ...state,
        size: action.newSize,
        previousSize: state.size,
        isAnimating: false // Only set isAnimating to true if there are more steps
      }
    case 'SCHEDULE_ANIMATION':
      return {
        ...state,
        animationQueue: action.animationSteps,
        isAnimating: action.animationSteps.length > 0
      }
    case 'INITIALIZE':
      return {
        ...state,
        size: action.firstState,
        previousSize: SIZE_PRESETS.EMPTY,
        isAnimating: false
      }
    case 'ANIMATION_END':
      return {
        ...state,
        isAnimating: false
      }
    default:
      return state
  }
}

// Hooks
const useDynamicIslandSize = () => {
  const context = useContext(BlobContext)
  if (!context) {
    throw new Error(
      'useDynamicIslandSize must be used within a DynamicIslandProvider'
    )
  }
  return context
}

const useScheduledAnimations = (animations: AnimationStep[]) => {
  const { scheduleAnimation } = useDynamicIslandSize()
  const animationsRef = useRef(animations)

  useEffect(() => {
    scheduleAnimation(animationsRef.current)
  }, [scheduleAnimation])
}

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setScreenSize('mobile')
      } else if (window.innerWidth <= 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}

// Components
export const DynamicIslandProvider: React.FC<DynamicIslandProviderProps> = ({
  children,
  initialSize = SIZE_PRESETS.DEFAULT,
  initialAnimation = []
}) => {
  const initialState: BlobStateType = {
    size: initialSize,
    previousSize: SIZE_PRESETS.EMPTY,
    animationQueue: initialAnimation,
    isAnimating: initialAnimation.length > 0
  }

  const [state, dispatch] = useReducer(blobReducer, initialState)

  useEffect(() => {
    const processQueue = async () => {
      for (const step of state.animationQueue) {
        await new Promise(resolve => setTimeout(resolve, step.delay))
        dispatch({ type: 'SET_SIZE', newSize: step.size })
      }
      dispatch({ type: 'ANIMATION_END' })
    }

    if (state.animationQueue.length > 0) {
      processQueue()
    }
  }, [state.animationQueue])

  const setSize = useCallback(
    (newSize: SizePresets) => {
      if (state.previousSize !== newSize && newSize !== state.size) {
        dispatch({ type: 'SET_SIZE', newSize })
      }
    },
    [state.previousSize, state.size]
  )

  const scheduleAnimation = useCallback(
    (animationSteps: AnimationStep[]) => {
      dispatch({ type: 'SCHEDULE_ANIMATION', animationSteps })
    },
    [dispatch]
  )

  return (
    <BlobContext.Provider
      value={{
        state,
        dispatch,
        setSize,
        scheduleAnimation,
        presets: DynamicIslandSizePresets
      }}
    >
      {children}
    </BlobContext.Provider>
  )
}

const DynamicIslandContainer: React.FC<{ children: ReactNode }> = ({
  children
}) => (
  <div className="z-10 flex h-full w-full items-end justify-center bg-transparent">
    {children}
  </div>
)

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  children,
  className,
  ...props
}) => {
  const willChange = useWillChange()
  const screenSize = useScreenSize()
  const uniqueId = useId()

  return (
    <DynamicIslandContainer>
      <DynamicIslandContent
        id={uniqueId}
        willChange={willChange}
        screenSize={screenSize}
        className={className}
        {...props}
      >
        {children}
      </DynamicIslandContent>
    </DynamicIslandContainer>
  )
}

const calculateDimensions = (
  size: SizePresets,
  screenSize: string,
  currentSize: Preset
): { width: string; height: number } => {
  const isMassiveOnMobile = size === 'massive' && screenSize === 'mobile'
  const isUltraOnMobile = size === 'ultra' && screenSize === 'mobile'

  if (isMassiveOnMobile) {
    return { width: '350px', height: DIMENSIONS.MAX_HEIGHT_MOBILE_MASSIVE }
  }

  if (isUltraOnMobile) {
    return { width: '350px', height: DIMENSIONS.MAX_HEIGHT_MOBILE_ULTRA }
  }

  const width = Math.min(currentSize.width, DIMENSIONS.MIN_WIDTH)
  return { width: `${width}px`, height: currentSize.aspectRatio * width }
}

const DynamicIslandContent: React.FC<DynamicIslandContentProps> = ({
  children,
  id,
  willChange,
  screenSize,
  className,
  ...props
}) => {
  const { state, presets } = useDynamicIslandSize()
  const currentSize = presets[state.size]
  const dimensions = calculateDimensions(state.size, screenSize, currentSize)

  return (
    <motion.div
      id={id}
      className={cn(
        'mx-auto h-0 w-0 items-center justify-center border border-black/10 bg-black',
        'text-center text-black transition duration-300 ease-in-out',
        'focus-within:bg-neutral-900 hover:shadow-md',
        'dark:border dark:border-white/5 dark:focus-within:bg-black',
        className
      )}
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: currentSize.borderRadius,
        transition: {
          type: 'spring',
          stiffness: ANIMATION.stiffness,
          damping: ANIMATION.damping
        },
        clipPath: 'none',
        transitionEnd: {
          clipPath: `url(#squircle-${state.size})`
        }
      }}
      style={{ willChange }}
      {...props}
    >
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </motion.div>
  )
}

// Motion Components
interface DynamicMotionProps extends HTMLMotionProps<'div'> {
  children: ReactNode
}

export const DynamicContainer: React.FC<DynamicMotionProps> = ({
  className,
  children,
  ...props
}) => {
  const willChange = useWillChange()
  const { state } = useDynamicIslandSize()
  const { size, previousSize } = state

  const isSizeChanged = size !== previousSize

  return (
    <motion.div
      initial={{
        opacity: size === previousSize ? 1 : 0,
        scale: size === previousSize ? 1 : 0.9,
        y: size === previousSize ? 0 : 5
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: ANIMATION.stiffness,
          damping: ANIMATION.damping,
          duration: isSizeChanged ? 0.5 : 0.8
        }
      }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95, y: 20 }}
      style={{ willChange }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const DynamicDiv: React.FC<DynamicMotionProps> = ({
  className,
  children,
  ...props
}) => {
  const willChange = useWillChange()
  const { state } = useDynamicIslandSize()
  const { size, previousSize } = state

  return (
    <motion.div
      initial={{
        opacity: size === previousSize ? 1 : 0,
        scale: size === previousSize ? 1 : 0.9
      }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: {
          type: 'spring',
          stiffness: ANIMATION.stiffness,
          damping: ANIMATION.damping
        }
      }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 0 }}
      style={{ willChange }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const DynamicTitle: React.FC<DynamicMotionProps> = ({
  className,
  children,
  ...props
}) => {
  const willChange = useWillChange()
  const { state } = useDynamicIslandSize()
  const { size, previousSize } = state

  return (
    <motion.h3
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: {
          type: 'spring',
          stiffness: ANIMATION.stiffness,
          damping: ANIMATION.damping
        }
      }}
      style={{ willChange }}
      {...props}
    >
      {children}
    </motion.h3>
  )
}

export const DynamicDescription: React.FC<DynamicMotionProps> = ({
  className,
  children,
  ...props
}) => {
  const willChange = useWillChange()
  const { state } = useDynamicIslandSize()
  const { size, previousSize } = state

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: {
          type: 'spring',
          stiffness: ANIMATION.stiffness,
          damping: ANIMATION.damping
        }
      }}
      style={{ willChange }}
      {...props}
    >
      {children}
    </motion.p>
  )
}

export {
  useDynamicIslandSize,
  useScheduledAnimations,
  DynamicIslandSizePresets,
  BlobContext
}
