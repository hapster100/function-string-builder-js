declare module '*.pug' {
  import * as React from 'react'
  const template: (params?: { [key: string]: any }) => React.ReactElement
  export default template
}