'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { CSV, Region, RegionCollection } = require('./soc-opt-class');

test('CSV class parses CSV data with headers', () => {
    const csvData = 'name,age,city\nAlice,30,New York\nBob,25,San Francisco';
    const csv = new CSV(csvData);
    const result = csv.parse();
    const expected = [
        { name: 'Alice', age: '30', city: 'New York' },
        { name: 'Bob', age: '25', city: 'San Francisco' },
    ];
    assert.deepStrictEqual(result, expected);
});

test('CSV class parses CSV data without headers', () => {
    const csvData = 'Alice,30,New York\nBob,25,San Francisco';
    const options = { headers: false, eol: '\n', separator: ',' };
    const csv = new CSV(csvData, options);
    const result = csv.parse();
    const expected = [
        ['Alice', '30', 'New York'],
        ['Bob', '25', 'San Francisco'],
    ];
    assert.deepStrictEqual(result, expected);
});

test('CSV class parses CSV data with custom separator and EOL', () => {
    const csvData = 'name;age;city\r\nAlice;30;New York\r\nBob;25;San Francisco';
    const options = { headers: true, eol: '\r\n', separator: ';' };
    const csv = new CSV(csvData, options);
    const result = csv.parse();
    const expected = [
        { name: 'Alice', age: '30', city: 'New York' },
        { name: 'Bob', age: '25', city: 'San Francisco' },
    ];
    assert.deepStrictEqual(result, expected);
});

test('Region class creates instance correctly', () => {
    const regionData = {
        city: 'New York',
        population: '8000000',
        area: '783.8',
        density: '10000',
        country: 'USA',
    };
    const region = Region.from(regionData);
    assert.strictEqual(region.city, 'New York');
    assert.strictEqual(region.population, 8000000);
    assert.strictEqual(region.area, 783);
    assert.strictEqual(region.density, 10000);
    assert.strictEqual(region.country, 'USA');
});

test('Region.densityRelativeTo computes correct relative density', () => {
    const region = new Region('City', 1000, 100, 200, 'Country');
    const relativeDensity = region.densityRelativeTo(400);
    assert.strictEqual(relativeDensity, 50); // 200 * 100 / 400 = 50
});

test('RegionCollection creates instance correctly', () => {
    const data = [
        { city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' },
        { city: 'CityB', population: '2000', area: '100', density: '30', country: 'CountryB' },
    ];
    const collection = RegionCollection.from(data);
    assert.strictEqual(collection.size(), 2);
    assert.strictEqual(collection.at(0).city, 'CityA');
    assert.strictEqual(collection.at(1).city, 'CityB');
});

test('RegionCollection.maxDensity returns correct maximum density', () => {
    const data = [
        { city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' },
        { city: 'CityB', population: '2000', area: '100', density: '30', country: 'CountryB' },
        { city: 'CityC', population: '3000', area: '150', density: '25', country: 'CountryC' },
    ];
    const collection = RegionCollection.from(data);
    assert.strictEqual(collection.maxDensity(), 30);
});

test('RegionCollection.sortByRelativeDensity sorts regions by relative density', () => {
    const data = [
        { city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' },
        { city: 'CityB', population: '2000', area: '100', density: '30', country: 'CountryB' },
        { city: 'CityC', population: '3000', area: '150', density: '25', country: 'CountryC' },
    ];
    const collection = RegionCollection.from(data);
    collection.sortByRelativeDensity();
    const sortedCities = collection.regions.map((region) => region.city);
    assert.deepStrictEqual(sortedCities, ['CityB', 'CityC', 'CityA']);
});

test('RegionCollection.pop removes the last region', () => {
    const data = [
        { city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' },
        { city: 'CityB', population: '2000', area: '100', density: '30', country: 'CountryB' },
    ];
    const collection = RegionCollection.from(data);
    collection.pop();
    assert.strictEqual(collection.size(), 1);
    assert.strictEqual(collection.at(0).city, 'CityA');
});

test('RegionCollection.at retrieves the correct region', () => {
    const data = [
        { city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' },
        { city: 'CityB', population: '2000', area: '100', density: '30', country: 'CountryB' },
    ];
    const collection = RegionCollection.from(data);
    const region = collection.at(1);
    assert.strictEqual(region.city, 'CityB');
});

test('CSV.from creates a CSV instance with default options', () => {
    const csvData = 'name,age\nAlice,30';
    const csv = CSV.from(csvData);
    assert.strictEqual(csv.options.headers, true);
    assert.strictEqual(csv.options.eol, '\n');
    assert.strictEqual(csv.options.separator, ',');
});

test('CSV.from allows overriding default options', () => {
    const csvData = 'name;age\r\nAlice;30';
    const options = { eol: '\r\n', separator: ';' };
    const csv = CSV.from(csvData, options);
    assert.strictEqual(csv.options.headers, true);
    assert.strictEqual(csv.options.eol, '\r\n');
    assert.strictEqual(csv.options.separator, ';');
});

test('RegionCollection.size returns the correct number of regions', () => {
    const data = [{ city: 'CityA', population: '1000', area: '50', density: '20', country: 'CountryA' }];
    const collection = RegionCollection.from(data);
    assert.strictEqual(collection.size(), 1);
});

test('CSV.parse returns an empty array for empty CSV data', () => {
    const csv = new CSV('');
    const result = csv.parse();
    assert.deepStrictEqual(result, []);
});

test('Region.densityRelativeTo handles zero correctly', () => {
    const region = new Region('City', 1000, 100, 200, 'Country');
    const relativeDensity = region.densityRelativeTo(0);
    assert.strictEqual(relativeDensity, Infinity);
});
