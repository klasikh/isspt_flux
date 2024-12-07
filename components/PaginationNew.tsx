// import React from "react";

export default function Pagination({
    postsPerPage,
    totalPosts,
    paginate,
    currentPage,
  }: {
      postsPerPage: any,
      totalPosts: any,
      paginate: any,
      currentPage: any,
    }) {
      const pageNumbers: any[] = [];
  
      for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
          pageNumbers.push(i);
      }
    
      return (
        <div className=''>
          <div>
            <p className='text-sm text-gray-700 ml-6 mt-3'>
              Affichage de
              <span className='font-medium'>
                {" "}
                {currentPage * postsPerPage - 10}{" "}
              </span>
              à
              <span className='font-medium'> {currentPage * postsPerPage} </span>
              dans
              <span className='font-medium'> {totalPosts} </span>
              résultats
            </p>
          </div> 
          <nav className="mb-4 flex justify-center space-x-1"
            aria-label="Pagination">
            <ul className='flex pl-0 rounded list-none flex-wrap'>
              <li>
                {pageNumbers.map((number) => (
                  <a
                    onClick={() => {
                      paginate(number);
                    }}
                    href='#'
                    className={
                      currentPage === number
                        ? "inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-black disabled"
                        : "bg-gray-300 border-gray-300 text-black hover:bg-blue-200 relative inline-flex items-center px-4 py-2 border text-sm font-medium mx-2 rounded-md"
                    }
                  >
                    {number}
                  </a>
                ))}
              </li>
            </ul>
          </nav>
        </div>
      );
    }