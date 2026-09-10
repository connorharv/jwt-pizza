jest.useFakeTimers();

const CatFact = require('./catFact');

test("Valid constructor", () => {
    const testCatFact = new CatFact();
    expect(testCatFact).toBeDefined();
})

test("Test add", async () => {
    const testCatFact = new CatFact();
    await testCatFact.add();
    expect(testCatFact.facts.length).toBe(1);
});

test("Fail add returns null on fetch error", async () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.reject(new Error("API Down")),
        })
    );

    const testCatFact = new CatFact();

    const result = await testCatFact.add();

    expect(result).toBeNull();
});


test("Get History", () => {
    const mockFn = jest.fn();

    const testCatFact = new CatFact();

    const res = testCatFact.history();

    expect(res).toEqual([]);
})

test("Call", async () => {
    const mockFn = jest.fn();
    const testCatFact = new CatFact();

    testCatFact.call(10, mockFn);

    expect(mockFn).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(100);

    expect(mockFn).toHaveBeenCalled();
});