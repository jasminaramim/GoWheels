import React, { useState, useEffect } from 'react';
import { ICar } from '../server/models/types.ts';
import { apiRequest } from '../lib/api.ts';
import { CarCard } from './CarCard.tsx';
import { Search, Filter, SlidersHorizontal, RotateCcw, Car } from 'lucide-react';

interface CarsCatalogProps {
  initialSearch?: string;
  initialCategory?: string;
  onSelectCar: (car: ICar) => void;
  onBookCar: (car: ICar) => void;
}

export const CarsCatalog: React.FC<CarsCatalogProps> = ({
  initialSearch = '',
  initialCategory = 'all',
  onSelectCar,
  onBookCar,
}) => {
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [transmission, setTransmission] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sort, setSort] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      if (transmission !== 'all') params.append('transmission', transmission);
      if (fuelType !== 'all') params.append('fuelType', fuelType);
      if (maxPrice < 20000) params.append('maxPrice', maxPrice.toString());
      if (sort) params.append('sort', sort);
      params.append('page', page.toString());
      params.append('limit', '9');

      const res = await apiRequest<ICar[]>(`/cars?${params.toString()}`);
      if (res.data) {
        setCars(res.data);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [search, category, transmission, fuelType, maxPrice, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setTransmission('all');
    setFuelType('all');
    setMaxPrice(20000);
    setSort('newest');
    setPage(1);
  };

  const categories = ['all', 'Sedan', 'SUV', 'Luxury', 'Van', 'Economy'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            Fleet Catalog
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">Available Vehicles</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {totalCount} verified vehicles ready for immediate reservation.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by brand, model, city..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden shadow-xs"
          />
        </div>
      </div>

      {/* Category Segmented Filter Tabs (Interactive Filter Buttons per Constitution) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 rounded-2xl mb-8 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap capitalize ${
              category.toLowerCase() === cat.toLowerCase()
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Transmission:</span>
            <select
              value={transmission}
              onChange={e => {
                setTransmission(e.target.value);
                setPage(1);
              }}
              className="p-1.5 border border-gray-200 rounded-lg text-xs"
            >
              <option value="all">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Fuel:</span>
            <select
              value={fuelType}
              onChange={e => {
                setFuelType(e.target.value);
                setPage(1);
              }}
              className="p-1.5 border border-gray-200 rounded-lg text-xs"
            >
              <option value="all">All Fuels</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Octane">Octane</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Max Daily Rate:</span>
            <span className="font-mono font-bold text-gray-900">৳{maxPrice.toLocaleString()}</span>
            <input
              type="range"
              min="3000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={e => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="accent-[#D71920] w-28 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Sort By:</span>
            <select
              value={sort}
              onChange={e => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold"
            >
              <option value="newest">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          {(search || category !== 'all' || transmission !== 'all' || fuelType !== 'all' || maxPrice < 20000) && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 text-gray-500 hover:text-[#D71920] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cars */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-pulse"
            >
              <div className="aspect-4/3 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-3 bg-gray-100 rounded-md w-1/2" />
              <div className="pt-4 border-t border-gray-100 flex justify-between">
                <div className="h-5 bg-gray-100 rounded-md w-1/3" />
                <div className="h-8 bg-gray-100 rounded-lg w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 my-8">
          <Car className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">No Vehicles Match Your Criteria</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try broadening your filters or resetting your search to see our full inventory.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-xs"
          >
            Clear Filters & Show All
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <CarCard
              key={car._id}
              car={car}
              onSelect={onSelectCar}
              onBook={onBookCar}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600 px-3 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
