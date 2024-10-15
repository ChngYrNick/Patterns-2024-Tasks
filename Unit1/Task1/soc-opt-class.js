'use strict';

// Tasks for rewriting:
//   - Apply optimizations of computing resources: processor, memory
//   - Minimize cognitive complexity
//   - Respect SRP and SoC
//   - Improve readability (understanding), reliability
//   - Optimize for maintainability, reusability, flexibility
//   - Make code testable
//   - Implement simple unittests without frameworks
//   - Try to implement in multiple paradigms: OOP, FP, procedural, mixed

const data = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`;

class CSV {
    static DEFAULT_OPTIONS = { headers: true, eol: '\n', separator: ',' };

    constructor(csv = '', options = CSV.DEFAULT_OPTIONS) {
        this.csv = csv;
        this.options = options;
    }

    #makeTable() {
        const lines = this.csv.split(this.options.eol);
        return lines.map((line) => line.split(this.options.separator));
    }

    static #createRecord(headers, row) {
        return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
    }

    static #withHeaders(table) {
        const [headers] = table;
        const body = table.slice(1);
        return body.map((row) => CSV.#createRecord(headers, row));
    }

    parse() {
        const table = this.#makeTable();
        return this.options.headers ? CSV.#withHeaders(table) : table;
    }

    static from(csv, options = {}) {
        return new CSV(csv, { ...CSV.DEFAULT_OPTIONS, ...options });
    }
}

class Region {
    constructor(city, population, area, density, country) {
        this.city = city;
        this.population = population;
        this.area = area;
        this.density = density;
        this.country = country;
    }

    densityRelativeTo(value) {
        return Math.round((this.density * 100) / value);
    }

    static from({ city, population, area, density, country }) {
        return new Region(city, parseInt(population, 10), parseInt(area, 10), parseInt(density, 10), country);
    }
}

class RegionCollection {
    constructor(regions) {
        this.regions = regions;
    }

    pop() {
        this.regions.pop();
    }

    size() {
        return this.regions.length;
    }

    at(index) {
        return this.regions.at(index);
    }

    maxDensity() {
        return Math.max(...this.regions.map((region) => region.density));
    }

    sortByRelativeDensity() {
        const maxDensity = this.maxDensity();
        this.regions.sort((a, b) => b.densityRelativeTo(maxDensity) - a.densityRelativeTo(maxDensity));
    }

    static from(data) {
        return new RegionCollection(data.map((item) => Region.from(item)));
    }
}

class RegionCollectionView {
    static DEFAULT_OPTIONS = { relativeDensity: true };

    constructor(collection) {
        this.collection = collection;
    }

    static #makeDefaultFragments({ city, population, area, density, country }) {
        return [
            city.padEnd(18),
            population.toString().padStart(10),
            area.toString().padStart(8),
            density.toString().padStart(8),
            country.padStart(18),
        ];
    }

    #makeRelativeDensityFragment(region) {
        const maxDensity = this.collection.maxDensity();
        const relativeDensity = region.densityRelativeTo(maxDensity);
        return relativeDensity.toString().padStart(6);
    }

    #composeLine(region, options) {
        const fragments = RegionCollectionView.#makeDefaultFragments(region);
        if (options.relativeDensity) {
            fragments.push(this.#makeRelativeDensityFragment(region));
        }
        return fragments.join('');
    }

    print(options = RegionCollectionView.DEFAULT_OPTIONS) {
        const lines = this.collection.regions.map((region) => this.#composeLine(region, options));
        console.log(lines.join('\n'));
    }

    static from(collection) {
        return new RegionCollectionView(collection);
    }
}

module.exports = { CSV, Region, RegionCollection, RegionCollectionView };

const collection = RegionCollection.from(CSV.from(data).parse());
collection.pop();
collection.sortByRelativeDensity();
RegionCollectionView.from(collection).print();
