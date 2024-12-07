import React from 'react'
import  { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline"
import { button } from '@material-tailwind/react'

const Pagination = ({ totalPage= 5 }) => {
  return (
    <div className="flex my-5">
        <ArrowLeftCircleIcon className="w-10 h-10 cursor-pointer bg-gray-300 shadow-md rounded-lg hover:bg-white" />
        {[...Array(totalPage)].map((_ele, ind) => (
            <button
                className="p-2 px-3 mx-2 cursor-pointer bg-gray-300 shadow-md rounded-lg hover:bg-white"
                key={ind}
            >
                { ind + 1 }
            </button>
        ))}
        <ArrowRightCircleIcon className="w-10 h-10 cursor-pointer bg-gray-300 shadow-md rounded-lg hover:bg-white" />
    </div>
  )
}

export default Pagination;