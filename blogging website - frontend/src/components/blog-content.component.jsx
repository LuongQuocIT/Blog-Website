import React from 'react'

const Img = ({ url, caption }) => {
    return (
        <div>
            <img src={url} alt={caption} />
            {caption && <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey  ">{caption}</p>}
        </div>
    )
}

const Quote = ({quote,caption}) => {
 return(
    <div className='bg-purple/10 p-3 pl-5 border-l-4 border-purple my-5 md:my-10'>
        <p className='text-xl leading-10 md:text-2xl'>{quote}</p>
        {caption && <p className="w-full text-center text-purple  my-3 md:mb-12 text-base ">{caption}</p>}
    </div>
 )
}
const List= ({ style,items }) => {
    return (
        <ol className={`pl-5 ${style=== "ordered" ? "list-decimal" : "list-disc"}`}>
            {items.map((item, j) => {
               return <li className='my-4' key={j} dangerouslySetInnerHTML={{ __html: item }}></li>
})}
        </ol>
    )
}
const BlogContent = ({ block }) => {
    let { type, data } = block;
    if (type === "paragraph") {
        return <p className='text-lg leading-7' dangerouslySetInnerHTML={{ __html: data.text }}></p>
    } else if (type === "header") {
        if (data.level == 3) {
            return <h1 className='text-xl font-bold' dangerouslySetInnerHTML={{ __html: data.text }}></h1>
        }
        return <h1 className='text-2xl font-bold' dangerouslySetInnerHTML={{ __html: data.text }}></h1>
    }
    if (type === "image") {
        return <Img url={data.file.url} caption={data.caption} className="w-full" />
    }
    if (type === "list") {
        return <List style={data.style} items={data.items} />
    }
    if (type === "quote") {
        return <Quote quote={data.text} caption={data.caption} />
    }




}

export default BlogContent