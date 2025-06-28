import React from 'react';
import Select from 'react-select';
import indianCities from '../data/indianCities';

const cityOptions = indianCities.map((city) => ({
  label: city,
  value: city,
}));

const CitySelect = ({ onChange, defaultValue }) => {
  return (
    <Select
      options={cityOptions}
      onChange={onChange}
      defaultValue={
        defaultValue
          ? { label: defaultValue, value: defaultValue }
          : null
      }
      placeholder="Search Indian Cities"
      isClearable
      isSearchable
    />
  );
};

export default CitySelect;
