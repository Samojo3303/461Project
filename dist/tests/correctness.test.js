import { calculateCAD } from '../src/metrics/correctness'; // Updated path
jest.mock('isomorphic-git', () => ({
    log: jest.fn(() => Promise.resolve([
        { commit: { author: { timestamp: 1620000000 } } },
        { commit: { author: { timestamp: 1600000000 } } },
    ])),
}));
describe('Correctness Metric', () => {
    test('should calculate CAD for a valid repository', async () => {
        const result = await calculateCAD('somePath');
        expect(result).toBeGreaterThan(0);
    });
});
