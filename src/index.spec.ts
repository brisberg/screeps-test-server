import {name} from './index';

describe('Package Index', () => {
  it('should export a constant', () => {
    expect(name).toBe('typescript-pkg');
  });
});
