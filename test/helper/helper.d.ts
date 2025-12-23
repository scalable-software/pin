// assertion library for testing
declare function given(description: string, fn: () => void): void;
declare function and(description: string, fn: () => void): void;
declare function when(description: string, fn: () => void): void;
declare function then(description: string, fn: () => void): void;

declare function configuration(configuration: string, fn: () => void): void;
declare function utility(utility: string, fn: () => void): void;
declare function composition(composition: string, fn: () => void): void;
declare function state(state: string, fn: () => void): void;
declare function operation(operation: string, fn: () => void): void;
declare function events(event: string, fn: () => void): void;
declare function gesture(gesture: string, fn: () => void): void;
declare function metadata(metadata: string, fn: () => void): void;

// utility functions for testing web components
declare function define(tag: string, component: any): void;
declare function add<T extends Element>(tag, attributes?: any): T;
declare function remove(id): void;
declare function hasSetter(obj: any, propName: string): boolean;
