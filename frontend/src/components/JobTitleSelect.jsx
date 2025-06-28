import React from 'react';
import Select from 'react-select';
import jobTitles from '../data/jobTitles';

const jobTitleOptions = jobTitles.map((title) => ({
  label: title,
  value: title,
}));

const JobTitleSelect = ({ onChange, defaultValue }) => {
  return (
    <Select
      options={jobTitleOptions}
      onChange={onChange}
      defaultValue={
        defaultValue
          ? { label: defaultValue, value: defaultValue }
          : null
      }
      placeholder="Search Job Titles"
      isClearable
      isSearchable
    />
  );
};

export default JobTitleSelect;
