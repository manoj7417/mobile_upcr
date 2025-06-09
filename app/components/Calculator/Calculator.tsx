import React, { useState, useEffect } from 'react'
import { X, Delete, RotateCcw } from 'lucide-react'

interface CalculatorProps {
  isOpen: boolean
  onClose: () => void
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState('')
  const [operation, setOperation] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [memory, setMemory] = useState(0)
  const [isScientific, setIsScientific] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      const { key } = event
      if (/[0-9]/.test(key)) {
        inputNumber(key)
      } else if (['+', '-', '*', '/'].includes(key)) {
        inputOperation(key)
      } else if (key === 'Enter' || key === '=') {
        calculate()
      } else if (key === 'Escape') {
        clear()
      } else if (key === 'Backspace') {
        backspace()
      } else if (key === '.') {
        inputDecimal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, display, operation, previousValue, waitingForOperand])

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === '') {
      setPreviousValue(display)
    } else if (operation) {
      const currentValue = parseFloat(previousValue)
      const newValue = performCalculation(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue('')
    setOperation('')
    setWaitingForOperand(false)
  }

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  const calculate = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== '' && operation) {
      const currentValue = parseFloat(previousValue)
      const newValue = performCalculation(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue('')
      setOperation('')
      setWaitingForOperand(true)
    }
  }

  const performCalculation = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      case '^':
        return Math.pow(firstValue, secondValue)
      default:
        return secondValue
    }
  }

  const scientificFunction = (func: string) => {
    const value = parseFloat(display)
    let result: number

    switch (func) {
      case 'sin':
        result = Math.sin(value * Math.PI / 180)
        break
      case 'cos':
        result = Math.cos(value * Math.PI / 180)
        break
      case 'tan':
        result = Math.tan(value * Math.PI / 180)
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'ln':
        result = Math.log(value)
        break
      case 'sqrt':
        result = Math.sqrt(value)
        break
      case '1/x':
        result = 1 / value
        break
      case 'x²':
        result = value * value
        break
      case 'x³':
        result = value * value * value
        break
      case '±':
        result = -value
        break
      case '%':
        result = value / 100
        break
      default:
        return
    }

    setDisplay(String(result))
    setWaitingForOperand(true)
  }

  const memoryFunction = (func: string) => {
    const value = parseFloat(display)
    
    switch (func) {
      case 'MC':
        setMemory(0)
        break
      case 'MR':
        setDisplay(String(memory))
        setWaitingForOperand(true)
        break
      case 'M+':
        setMemory(memory + value)
        break
      case 'M-':
        setMemory(memory - value)
        break
      case 'MS':
        setMemory(value)
        break
    }
  }

  const insertConstant = (constant: string) => {
    switch (constant) {
      case 'π':
        setDisplay(String(Math.PI))
        break
      case 'e':
        setDisplay(String(Math.E))
        break
    }
    setWaitingForOperand(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className={`relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full mx-auto transition-all duration-300 ${
          isScientific ? 'max-w-sm sm:max-w-md lg:max-w-lg' : 'max-w-sm sm:max-w-md lg:max-w-lg'
        }`}>
          {/* Header */}
          <div className="bg-gray-800 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Calculator</h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close calculator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setIsScientific(false)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !isScientific 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setIsScientific(true)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isScientific 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Scientific
                </button>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="p-4 bg-gray-900">
            <div className="bg-black rounded-lg p-4 text-right">
              <div className="text-gray-400 text-sm min-h-[20px]">
                {previousValue} {operation}
              </div>
              <div className="text-white text-3xl font-mono overflow-hidden text-ellipsis">
                {display}
              </div>
            </div>
          </div>

          {/* Calculator Body */}
          <div className="p-4 bg-white rounded-b-2xl">
            {isScientific ? (
              // Scientific Layout
              <div className="grid grid-cols-6 gap-2">
                {/* Memory Functions */}
                <button onClick={() => memoryFunction('MC')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">MC</button>
                <button onClick={() => memoryFunction('MR')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">MR</button>
                <button onClick={() => memoryFunction('M+')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">M+</button>
                <button onClick={() => memoryFunction('M-')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">M-</button>
                <button onClick={() => memoryFunction('MS')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">MS</button>
                <button onClick={clear} className="col-span-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center">
                  <RotateCcw className="w-3 h-3" />
                </button>

                {/* Scientific Functions Row 1 */}
                <button onClick={() => scientificFunction('sin')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">sin</button>
                <button onClick={() => scientificFunction('cos')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">cos</button>
                <button onClick={() => scientificFunction('tan')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">tan</button>
                <button onClick={() => scientificFunction('log')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">log</button>
                <button onClick={() => scientificFunction('ln')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">ln</button>
                <button onClick={() => inputOperation('^')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">x^y</button>

                {/* Scientific Functions Row 2 */}
                <button onClick={() => insertConstant('π')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">π</button>
                <button onClick={() => insertConstant('e')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">e</button>
                <button onClick={() => scientificFunction('sqrt')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">√x</button>
                <button onClick={() => scientificFunction('x²')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">x²</button>
                <button onClick={() => scientificFunction('x³')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">x³</button>
                <button onClick={() => scientificFunction('1/x')} className="col-span-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">1/x</button>

                {/* Basic Functions */}
                <button onClick={() => scientificFunction('±')} className="col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors">±</button>
                <button onClick={() => scientificFunction('%')} className="col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors">%</button>
                <button onClick={backspace} className="col-span-1 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Delete className="w-4 h-4" />
                </button>
                <button onClick={() => inputOperation('/')} className="col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">÷</button>
                <button onClick={() => inputOperation('*')} className="col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">×</button>
                <button onClick={() => inputOperation('-')} className="col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">−</button>

                {/* Numbers */}
                <button onClick={() => inputNumber('7')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">7</button>
                <button onClick={() => inputNumber('8')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">8</button>
                <button onClick={() => inputNumber('9')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">9</button>
                <button onClick={() => inputNumber('4')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">4</button>
                <button onClick={() => inputNumber('5')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">5</button>
                <button onClick={() => inputNumber('6')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">6</button>

                <button onClick={() => inputNumber('1')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">1</button>
                <button onClick={() => inputNumber('2')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">2</button>
                <button onClick={() => inputNumber('3')} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">3</button>
                <button onClick={() => inputNumber('0')} className="col-span-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">0</button>
                <button onClick={inputDecimal} className="col-span-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">.</button>

                <button onClick={() => inputOperation('+')} className="col-span-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center">+</button>
                <button onClick={calculate} className="col-span-1 p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">=</button>
              </div>
            ) : (
              // Standard Layout
              <div className="grid grid-cols-4 gap-3">
                {/* Clear and Backspace */}
                <button onClick={clear} className="col-span-2 p-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors">Clear</button>
                <button onClick={backspace} className="col-span-1 p-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Delete className="w-4 h-4" />
                </button>
                <button onClick={() => inputOperation('/')} className="col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">÷</button>

                {/* Row 1 */}
                <button onClick={() => inputNumber('7')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">7</button>
                <button onClick={() => inputNumber('8')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">8</button>
                <button onClick={() => inputNumber('9')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">9</button>
                <button onClick={() => inputOperation('*')} className="col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">×</button>

                {/* Row 2 */}
                <button onClick={() => inputNumber('4')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">4</button>
                <button onClick={() => inputNumber('5')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">5</button>
                <button onClick={() => inputNumber('6')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">6</button>
                <button onClick={() => inputOperation('-')} className="col-span-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">−</button>

                {/* Row 3 */}
                <button onClick={() => inputNumber('1')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">1</button>
                <button onClick={() => inputNumber('2')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">2</button>
                <button onClick={() => inputNumber('3')} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">3</button>
                <button onClick={() => inputOperation('+')} className="col-span-1 row-span-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center">+</button>

                {/* Row 4 */}
                <button onClick={() => inputNumber('0')} className="col-span-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">0</button>
                <button onClick={inputDecimal} className="col-span-1 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">.</button>

                {/* Equals */}
                <button onClick={calculate} className="col-span-4 p-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors mt-2">=</button>
              </div>
            )}

            {/* Memory indicator */}
            {memory !== 0 && (
              <div className="mt-3 text-center text-xs text-gray-500">
                Memory: {memory}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 