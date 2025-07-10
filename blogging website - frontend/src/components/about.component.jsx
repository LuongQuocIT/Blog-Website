import React from 'react'
import { Link } from 'react-router-dom';
import { getFullDay } from '../common/date';

const AboutUser = ({ className, bio, social_links, joinedAt }) => {
    console.log(joinedAt)
    return (
        <div className={'md:w-[90%] md:mt-7' + className}>
            <p className='text-xl leading-7'>{bio.length ? bio : "No bio"}</p>
            <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
                {
                    Object.keys(social_links).map((key) => {
                        const link = social_links[key];
                        return (!link ?
                            <Link
                                key={key}
                                to={link}
                                target="_blank"
                            ><i className={"fi " +(key !== "website" ? "fi-brands-" + key : "fi-rr-globe") +
                                " text-2xl hover:text-black"}></i></Link> : " "
                        );
                    })
                }


            </div>
            <p className='text-xl leading-7 text-dark-grey'>Tham gia vào: {getFullDay(joinedAt)}</p>
        </div>
    )
}

export default AboutUser
