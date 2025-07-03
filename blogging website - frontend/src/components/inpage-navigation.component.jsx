import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'

export let activeTabLineRef
export let activeTabRef

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0,children }) => {
    activeTabLineRef = useRef()
    activeTabRef = useRef()
    let [InPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex)
    const changePageState = (btn, i) => {
        let { offsetWidth, offsetLeft } = btn
        activeTabLineRef.current.style.width = offsetWidth + "px"
        activeTabLineRef.current.style.left = offsetLeft + "px"
        setInPageNavIndex(i)

    }
    useEffect(() => {
        changePageState(activeTabRef.current, defaultActiveIndex)
    }, [])
    return (
        <>
            <div className='relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto'>
                {
                    routes.map((route, i) => {
                        return (
                            <button ref={(el) => {
                                if (i === defaultActiveIndex) activeTabRef.current = el;
                            }}

                                key={i} className={`p-4 px-5 capitalize ${InPageNavIndex === i ? 'text-black' : 'text-dark-grey'}` + (defaultHidden.includes(route) ? " md:hidden" : " ")}
                                onClick={(e) => { changePageState(e.currentTarget, i) }}>
                                {route}
                            </button>
                        )
                    })
                }
                <hr ref={activeTabLineRef} className='absolute bottom-0 duration-300' />
            </div>
            {Array.isArray(children)?children[InPageNavIndex]:children}
        </>
    )
}

export default InPageNavigation