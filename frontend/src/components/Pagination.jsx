import React from "react";
import ReactPaginate from "react-paginate";

const Pagination = ({ pageCount, onPageChange, currentPage = 0 }) => {
  return (
    <ReactPaginate
      breakLabel="..."
      nextLabel="Next →"
      previousLabel="← Prev"
      onPageChange={onPageChange}
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      pageCount={pageCount}
      forcePage={currentPage}
      containerClassName="flex justify-center mt-6 space-x-2"
      pageClassName="px-3 py-1 border rounded-md hover:bg-blue-100"
      pageLinkClassName="text-sm"
      activeClassName="bg-blue-500 text-white"
      previousClassName="px-3 py-1 border rounded-md hover:bg-blue-100"
      nextClassName="px-3 py-1 border rounded-md hover:bg-blue-100"
      breakClassName="px-3 py-1"
      disabledClassName="opacity-50 cursor-not-allowed"
    />
  );
};

export default Pagination;
