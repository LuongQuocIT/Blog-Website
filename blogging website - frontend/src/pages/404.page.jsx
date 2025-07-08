import React from 'react'
import PageNotFoundImage from '../imgs/404.png'
const PageNotFound = () => {
  return (
    <section className='h-cover relative p-10 flex flex-col text-center gap-20 items-center'>
        <img src={PageNotFoundImage} alt="" className='select-none border-2 border-grey w-72 aspect-square object-cover rounded' />
        <h1 className="text-3xl font-gelasio leading-7">Page Not Found</h1>
    </section>
  )
}

export default PageNotFound