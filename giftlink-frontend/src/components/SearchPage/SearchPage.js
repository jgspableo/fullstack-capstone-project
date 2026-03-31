import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [ageRange, setAgeRange] = useState(6);
    const [searchResults, setSearchResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${urlConfig.backendUrl}/api/gifts`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    const handleSearch = async () => {
        try {
            const params = new URLSearchParams();

            if (searchQuery.trim() !== '') {
                params.append('name', searchQuery.trim());
            }

            if (selectedCategory !== 'All') {
                params.append('category', selectedCategory);
            }

            if (selectedCondition !== 'All') {
                params.append('condition', selectedCondition);
            }

            params.append('age_years', ageRange);

            const url = `${urlConfig.backendUrl}/api/search?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data);
            setSearched(true);
        } catch (error) {
            console.log('Search error: ' + error.message);
            setSearchResults([]);
            setSearched(true);
        }
    };

    const goToDetailsPage = (productId) => {
        navigate(`/details/${productId}`);
    };

    return (
        <div className="container mt-5 search-page">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="filter-section mb-4 p-4 border rounded">
                        <h2 className="mb-4">Filters</h2>

                        <div className="mb-3">
                            <label className="form-label">Category</label>
                            <select
                                className="form-control dropdown-filter"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Condition</label>
                            <select
                                className="form-control dropdown-filter"
                                value={selectedCondition}
                                onChange={(e) => setSelectedCondition(e.target.value)}
                            >
                                <option value="All">All</option>
                                {conditions.map((condition) => (
                                    <option key={condition} value={condition}>
                                        {condition}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label d-block">
                                Less than {ageRange} years
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={ageRange}
                                onChange={(e) => setAgeRange(e.target.value)}
                                className="form-range age-range-slider"
                            />
                        </div>

                        <input
                            type="text"
                            className="form-control mb-3 search-input"
                            placeholder="Search by gift name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <button className="btn btn-primary search-button" onClick={handleSearch}>
                            Search
                        </button>
                    </div>

                    <div className="row">
                        {searchResults.length > 0 ? (
                            searchResults.map((gift) => (
                                <div key={gift.id} className="col-md-4 mb-4">
                                    <div
                                        className="card search-results-card h-100"
                                        onClick={() => goToDetailsPage(gift.id)}
                                    >
                                        {gift.image ? (
                                            <img
                                                src={gift.image}
                                                alt={gift.name}
                                                className="card-img-top result-image"
                                            />
                                        ) : (
                                            <div className="no-image-available">No Image Available</div>
                                        )}

                                        <div className="card-body">
                                            <h5 className="card-title">{gift.name}</h5>
                                            <p className="card-text">
                                                <strong>Category:</strong> {gift.category}
                                            </p>
                                            <p className="card-text">
                                                <strong>Condition:</strong> {gift.condition}
                                            </p>
                                            <p className="card-text">
                                                <strong>Age:</strong> {gift.age_years} years
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            searched && (
                                <div className="col-12">
                                    <div className="alert alert-warning no-products-alert">
                                        No products found
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
