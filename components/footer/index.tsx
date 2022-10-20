import React from 'react'

const Footer = () => {
    return (
        <div className='pt-10 pb-5 px-2 lg:px-10 text-xs lg:text-sm'>
            <div className='flex justify-center gap-1 flex-wrap'>
                © 2022 BBF Powered by
                <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>
                    Next.js
                </a>
                &
                <a href='https://www.prisma.io/' target='_blank' rel='noreferrer' className='text-teal-500'>
                    Prisma
                </a>
                &
                <a href='https://tailwindcss.com/' target='_blank' rel='noreferrer' className='text-rose-500'>
                    Tailwind.css
                </a>
            </div>
        </div>
    )
}

export default Footer
