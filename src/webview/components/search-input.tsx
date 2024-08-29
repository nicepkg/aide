import React from 'react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

import { Input } from './ui/input'

interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = props => (
  <div className="relative">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <Input
      {...props}
      className={`pl-10 bg-gray-800 text-white border-gray-700 ${props.className}`}
    />
  </div>
)
