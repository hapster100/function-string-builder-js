import { useState } from 'react'
import InfoTemplate from './Info.pug'
import './Info.styl'

const Info = () => {
  const [show, setShow] = useState(false)
  const handleShow = e => setShow(prev => !prev)
  const handleHide = () => show && setShow(false)

  return InfoTemplate({
    show,
    handleShow,
    handleHide,
  })
}

export default Info
