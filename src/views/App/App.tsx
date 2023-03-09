import { useState, useRef, useEffect, RefObject } from 'react'
import AppTemplate from './App.pug'
import store from '../../redux/store'
import Info from '../Info/Info'
import './App.styl'

const countOf = (str : string, sub : string) => {
  let count = 0
  for(let i = str.indexOf(sub); i !== -1; i = str.indexOf(sub, i + sub.length)) count++;
  return count
}

class Opeartion {
  private op : (a:number, b:number) => number 
  private order : number
  private opstr : string

  constructor(
    opstr : string, 
    order : number, 
    op : (a:number, b:number) => number
  ) {
    this.op = op
    this.order = order
    this.opstr = opstr
  }

  public getOrder() {
    return this.order
  }
  public getStr() : string {
    return this.opstr
  }
  public run(a, b) {
    return this.op(a, b)
  }
}

class Function {
  private func : (params : number[]) => number
  private name : string
  private paramNum : number

  constructor(name, func, paramNum) {
    this.name = name
    this.func = func
    this.paramNum = paramNum
  }

  getName() {
    return this.name
  }

  run(params : number[]) {
    return this.func(params)
  }

}

class Const {
  constructor(
    private name : string,
    private value : number
  ) {}

  public getValue() {
    return this.value
  }

  public getName() {
    return this.name
  }
}

class FunctionParser {

  private funcs : Function[]
  private ops : Opeartion[]
  private consts : Const[]

  constructor() {

    this.funcs = [
      new Function('sin', ([x]) => Math.sin(x), 1),
      new Function('cos', ([x]) => Math.cos(x), 1),
      new Function('sqrt', ([x]) => Math.sqrt(x), 1),
      new Function('log', ([x, y]) => Math.log(x)/Math.log(y), 1),
      new Function('abs', ([x]) => Math.abs(x), 1)
    ]

    this.ops = [
      new Opeartion('+', 2, (x, y) => x + y),
      new Opeartion('-', 2, (x, y) => x - y),
      new Opeartion('*', 3, (x, y) => x * y),
      new Opeartion('/', 3, (x, y) => x / y),
      new Opeartion('^', 4, (x, y) => x ** y),
    ]

    this.ops.sort((a, b) => a.getOrder() - b.getOrder())

    this.consts = [
      new Const('pi', Math.PI),
      new Const('e', Math.E)
    ]

  }

  private id(arg : string) {
    if(Number(arg) || arg === '0') {
      return () => Number(arg)
    }

    for(const c of this.consts) {
      if(arg === c.getName()) {
        return () => c.getValue()
      }
    }

    for(const f of this.funcs) {
      const fname = f.getName()

      if(arg.startsWith(fname + '(')) {
        const args = arg
          .slice(fname.length + 1, arg.length - 1)
          .split(',')
          .map(a => this.parse(a.trim()))
        return x => f.run(args.map(a => a(x)))
      }
    }
    
    return x => x[arg]
  }

  parse(inputString : string) {

    inputString = inputString.trim()
    if(inputString[0] == '(' && inputString[inputString.length - 1] == ')') {
      let counter = 1
      let i = 1;
      for(; i !== inputString.length && counter; i++) {
        if(inputString[i] == '(') {
          counter++
        } else if(inputString[i] == ')') {
          counter--
          if(!counter) break
        }
      }
      if(i === inputString.length - 1) {
        inputString = inputString.slice(1, inputString.length - 1)
      }
    }

    for(const op of this.ops) { 
      const opstr : string = op.getStr()

      for(
        let opIndex = inputString.lastIndexOf(opstr);
        opIndex !== -1; opIndex = inputString.lastIndexOf(opstr, opIndex - 1)
      ) {
        const left = inputString.slice(0, opIndex)
        const right = inputString.slice(opIndex + opstr.length)

        
        if(countOf(left, '(') > countOf(left, ')')) {
          continue
        }
  
        const lRes = this.parse(left)
        const rRes = this.parse(right)
        
        return x => {
          return op.run(lRes(x), rRes(x))
        }
      }
    } 

    const parsedId = this.id(inputString)

    return x => {
      return parsedId(x)
    }
  }

}

class FunctionRenderer {
  private canvas : RefObject<HTMLCanvasElement>
  private xRange : [number, number]
  private yRange : [number, number]
  private h : number
  private w : number
  
  constructor(canvas) {
    this.canvas = canvas
    this.h = this.canvas.current.height
    this.w = this.canvas.current.width
    this.xRange = [-10, 10]
    this.yRange = [-10 * this.h / this.w, 10 * this.h / this.w]
  }

  private drawLine(from, to, width = 1, style = '#000') {
    const ctx = this.canvas.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(from[0], from[1])
    ctx.lineTo(to[0], to[1])
    ctx.lineWidth = width
    ctx.strokeStyle = style
    ctx.stroke()

  }

  private renderAxis() {
    const ctx = this.canvas.current.getContext('2d')
    ctx.fillStyle = '#fafadf'
    ctx.fillRect(0, 0, this.w, this.h)
    this.drawLine([0, this.h/2], [this.w, this.h/2])
    this.drawLine([this.w/2, 0], [this.w/2, this.h])
    const [x1, y1] = this.canvasOne()
    for(let i = this.h/2; i < this.h; i += y1) {
      this.drawLine([0, i], [this.w, i], 0.5, '#AAA')
    }
    for(let i = this.h/2; i > 0; i -= y1) {
      this.drawLine([0, i], [this.w, i], 0.5, '#AAA')
    }
    for(let i = this.w/2; i < this.w; i += x1) {
      this.drawLine([i, 0], [i, this.h], 0.5, '#AAA')
    }
    for(let i = this.w/2; i > 0; i -=x1) {
      this.drawLine([i, 0], [i, this.h], 0.5, '#AAA')
    }
  }

  private toCanvasCoords([x, y]) {
    const cx = (x - this.xRange[0]) / (this.xRange[1] - this.xRange[0]) * this.w
    const cy = this.h - (y - this.yRange[0]) / (this.yRange[1] - this.yRange[0]) * this.h
    return [cx, cy]
  }

  private canvasOne() {
    const [x0, y0] = this.toCanvasCoords([0, 0])
    const [x1, y1] = this.toCanvasCoords([1, 1])
    return [x1 - x0, y0 - y1]
  }

  public render(func) {
    const ctx = this.canvas.current.getContext('2d')
    
    ctx.clearRect(0, 0, this.w, this.h)
    this.renderAxis()
    const step = (this.xRange[1] - this.xRange[0]) / this.w
    for(let i = this.xRange[0] + 0.0001; i < this.xRange[1]; i += step) {
       const from = this.toCanvasCoords([i, func(i)])
       const to = this.toCanvasCoords([i + step, func(i + step)])
       this.drawLine(from, to, 4)
    }
  }

}

const App = () => {
  const parser = new FunctionParser()
  
  const canvas = useRef<HTMLCanvasElement>(null)
  const [input, setInput] = useState('')
  
  useEffect(() => {
    const renderer = new FunctionRenderer(canvas)
    const func = parser.parse(input)

    renderer.render(x => func({x}))
  
  }, [input])

  return AppTemplate({
    Info,
    canvas, input, onInputChange: e => setInput(e.target.value),
    canvasSize: { h: document.body.clientHeight, w: document.body.clientWidth }

  })
}

export default store.connect([], App)
