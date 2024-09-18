let allCountries = [];
        const countriesPerPage = 20;
        let currentPage = 1;

        async function fetchCountries() {
            try {
                const response = await axios.get('https://restcountries.com/v3.1/all');
                allCountries = response.data;
                updateFilters();
                displayCountries();
                setupInfiniteScroll();
            } catch (error) {
                console.error('Erro ao buscar os dados dos países:', error);
            }
        }

        function updateFilters() {
            const subregions = [...new Set(allCountries.map(c => c.subregion).filter(Boolean))];
            const regions = [...new Set(allCountries.map(c => c.region).filter(Boolean))];

            const subregionFilter = document.getElementById('subregionFilter');
            const regionFilter = document.getElementById('regionFilter');

            subregions.forEach(subregion => {
                const option = document.createElement('option');
                option.value = subregion;
                option.textContent = subregion;
                subregionFilter.appendChild(option);
            });

            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionFilter.appendChild(option);
            });
        }

        function displayCountries() {
            const countriesContainer = document.getElementById('countries');
            countriesContainer.innerHTML = '';

            const filteredCountries = filterCountries();
            const sortedCountries = sortCountries(filteredCountries);
            const countriesToDisplay = sortedCountries.slice(0, currentPage * countriesPerPage);

            countriesToDisplay.forEach(country => {
                const countryElement = document.createElement('div');
                countryElement.classList.add('country');
                countryElement.innerHTML = `
                    <img src="${country.flags.png}" alt="${country.name.common} flag">
                    <h2>${country.name.common}</h2>
                    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
                    <p><strong>População:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Região:</strong> ${country.region}</p>
                `;
                countryElement.addEventListener('click', () => showCountryDetails(country));
                countriesContainer.appendChild(countryElement);
            });
        }

        function filterCountries() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const subregion = document.getElementById('subregionFilter').value;
            const region = document.getElementById('regionFilter').value;
            const populationRange = document.getElementById('populationFilter').value;

            return allCountries.filter(country => {
                const nameMatch = country.name.common.toLowerCase().includes(searchTerm);
                const subregionMatch = !subregion || country.subregion === subregion;
                const regionMatch = !region || country.region === region;
                const populationMatch = checkPopulationRange(country.population, populationRange);
                return nameMatch && subregionMatch && regionMatch && populationMatch;
            });
        }

        function checkPopulationRange(population, range) {
            if (!range) return true;
            const [min, max] = range.split('-').map(Number);
            return population >= min && (!max || population < max);
        }

        function sortCountries(countries) {
            const sortBy = document.getElementById('sortBy').value;
            if (!sortBy) return countries;

            return countries.sort((a, b) => {
                if (sortBy === 'name') return a.name.common.localeCompare(b.name.common);
                if (sortBy === 'population') return b.population - a.population;
                if (sortBy === 'area') return (b.area || 0) - (a.area || 0);
            });
        }

        function setupInfiniteScroll() {
            window.addEventListener('scroll', () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    currentPage++;
                    displayCountries();
                }
            });
        }

        function showCountryDetails(country) {
            const detailsContainer = document.getElementById('countryDetails');
            detailsContainer.innerHTML = `
                <div>
                    <span id="closeDetails">&times;</span>
                    <h2>${country.name.common}</h2>
                    <img src="${country.flags.png}" alt="${country.name.common} flag" class="flag-large">
                    <div class="info-grid">
                        <div class="info-item"><strong>Nome oficial:</strong> ${country.name.official}</div>
                        <div class="info-item"><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</div>
                        <div class="info-item"><strong>Região:</strong> ${country.region}</div>
                        <div class="info-item"><strong>Sub-região:</strong> ${country.subregion || 'N/A'}</div>
                        <div class="info-item"><strong>População:</strong> ${country.population.toLocaleString()}</div>
                        <div class="info-item"><strong>Área:</strong> ${country.area ? `${country.area.toLocaleString()} km²` : 'N/A'}</div>
                        <div class="info-item"><strong>Idiomas:</strong> ${Object.values(country.languages || {}).join(', ') || 'N/A'}</div>
                        <div class="info-item"><strong>Moedas:</strong> ${Object.values(country.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(', ') || 'N/A'}</div>
                        <div class="info-item"><strong>Fuso horário:</strong> ${country.timezones.join(', ')}</div>
                        <div class="info-item"><strong>Domínio de internet:</strong> ${country.tld ? country.tld.join(', ') : 'N/A'}</div>
                        <div class="info-item"><strong>Código de discagem:</strong> ${country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')}</div>
                    </div>
                </div>
            `;
            detailsContainer.style.display = 'block';
            document.getElementById('closeDetails').addEventListener('click', () => {
                detailsContainer.style.display = 'none';
            });
        }

        document.getElementById('searchInput').addEventListener('input', () => {
            currentPage = 1;
            displayCountries();
        });

        document.getElementById('subregionFilter').addEventListener('change', () => {
            currentPage = 1;
            displayCountries();
        });

        document.getElementById('regionFilter').addEventListener('change', () => {
            currentPage = 1;
            displayCountries();
        });

        document.getElementById('populationFilter').addEventListener('change', () => {
            currentPage = 1;
            displayCountries();
        });

        document.getElementById('sortBy').addEventListener('change', () => {
            currentPage = 1;
            displayCountries();
        });

        fetchCountries();
