import React from "react";
import { FilterState } from "../types/accident";

interface FilterComponentProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalAccidents: number;
  filteredCount: number;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  filters,
  onFilterChange,
  totalAccidents,
  filteredCount,
}) => {
  const handleFilterChange = (filterType: keyof FilterState) => {
    onFilterChange({
      ...filters,
      [filterType]: !filters[filterType],
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Accident Filters</h3>
        <div className="accident-count">
          Showing {filteredCount.toLocaleString()} of{" "}
          {totalAccidents.toLocaleString()} accidents
        </div>
      </div>

      <div className="filter-controls">
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.showPedestrianAccidents}
            onChange={() => handleFilterChange("showPedestrianAccidents")}
          />
          <span className="checkbox-custom"></span>
          <span className="filter-label">
            <span className="color-indicator pedestrian"></span>
            Pedestrian Accidents
          </span>
        </label>

        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.showBicycleAccidents}
            onChange={() => handleFilterChange("showBicycleAccidents")}
          />
          <span className="checkbox-custom"></span>
          <span className="filter-label">
            <span className="color-indicator bicycle"></span>
            Bicycle Accidents
          </span>
        </label>

        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.showOtherAccidents}
            onChange={() => handleFilterChange("showOtherAccidents")}
          />
          <span className="checkbox-custom"></span>
          <span className="filter-label">
            <span className="color-indicator other"></span>
            Other Vehicle Accidents
          </span>
        </label>
      </div>

      <div className="legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color pedestrian"></span>
            <span>Pedestrian only</span>
          </div>
          <div className="legend-item">
            <span className="legend-color bicycle"></span>
            <span>Bicycle only</span>
          </div>
          <div className="legend-item">
            <span className="legend-color other"></span>
            <span>Other vehicles</span>
          </div>
          <div className="legend-item">
            <span className="legend-color mixed"></span>
            <span>Mixed (Pedestrian + Bicycle)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
