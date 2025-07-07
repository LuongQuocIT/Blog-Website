import React from 'react'

function LoadMoreDataBtn({state, fetchDataFun}) {
    if(state!==null && state?.results?.length<state?.totalDocs){
        return (
            <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2' onClick={()=>fetchDataFun({page:state.page+1})}>Load More</button>
        )
    }
  
}

export default LoadMoreDataBtn