import { useState } from 'react'

export const useForceUpdate = () => {
  const [, setState] = useState({})
  return () => setState({})
}
