import React from 'react'

function NoDataMessage({ message }) {
    return (
        <div className='text-center w-full p-4 rounded-full bg-grey/50 mt-4 '>
            <h1>{message}</h1>
             </div>
    )
}

export default NoDataMessage